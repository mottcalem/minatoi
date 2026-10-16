import { DEFAULT_PROMOTIONS } from "../../src/data/promotions.ts";
import test from "node:test";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { createPaymentAPI } from "./api.ts";
import { sign } from "./core.ts";

function fixture(options = {}) {
  const rows = new Map();
  let calls = 0;
  let updates = 0;
  let sent;
  let lock = Promise.resolve();
  const env = {
    NODE_ENV: "production",
    PAYTR_ENABLED: "1",
    PAYTR_MERCHANT_ID: "123",
    PAYTR_MERCHANT_KEY: "fixture-key",
    PAYTR_MERCHANT_SALT: "fixture-salt",
    PAYTR_PUBLIC_URL: "https://shop.example",
    PAYTR_TEST_MODE: "0",
    PAYTR_TRUST_PROXY: "1",
    ADMIN_PASS_HASH: createHash("sha256").update("fixture-password").digest("hex"),
    ...options.env,
  };
  const db = {
    async query(sql, args = []) {
      const found = (list) => ({ rows: list, rowCount: list.length });
      if (sql.startsWith("INSERT INTO orders")) {
        if ([...rows.values()].some((r) => r.request_id === args[1])) return found([]);
        const bankTransfer = sql.includes("'awaiting_transfer'");
        const r = {
          id: args[0],
          request_id: args[1],
          request_hash: args[2],
          access_hash: args[3],
          customer: JSON.parse(args[4]),
          items: JSON.parse(args[5]),
          amount: args[6],
          test_mode: bankTransfer ? false : args[7],
          discount: bankTransfer ? args[7] : args[8],
          status: bankTransfer ? "awaiting_transfer" : "pending",
          payment_method: bankTransfer ? "bank_transfer" : "card",
        };
        rows.set(r.id, r);
        return found([r]);
      }
      if (sql.includes("WHERE request_id=$1"))
        return found([...rows.values()].filter((r) => r.request_id === args[0]));
      if (sql.startsWith("SELECT")) {
        let r = rows.get(args[0]);
        if (sql.includes("access_hash=$2") && r?.access_hash !== args[1]) r = undefined;
        if (sql.startsWith("SELECT id,status"))
          return found(
            r ? [{ id: r.id, status: r.status, amount: r.amount, test_mode: r.test_mode }] : [],
          );
        return found(r ? [r] : []);
      }
      const r = rows.get(args[0]);
      if (sql.startsWith("UPDATE orders SET iframe_token")) {
        if (r?.status === "pending") {
          r.iframe_token = args[1];
          r.token_created_at = new Date();
        }
        return found([]);
      }
      if (sql.startsWith("UPDATE orders SET status='failed'")) {
        if (r?.status === "pending") r.status = "failed";
        return found([]);
      }
      if (sql.includes("payment_method='bank_transfer'")) {
        if (r?.payment_method !== "bank_transfer" || r.status !== "awaiting_transfer")
          return found([]);
        r.status = args[1];
        return found([{ id: r.id }]);
      }
      if (sql.startsWith("UPDATE orders SET status=$2")) {
        updates++;
        r.status = args[1];
        r.iframe_token = null;
        return found([]);
      }
      throw new Error("Unexpected SQL in fixture");
    },
  };
  const api = createPaymentAPI({
    queueOrderEmails: options.queueOrderEmails,
    authorizeAdmin: options.authorizeAdmin,
    env,
    readPromotions: async () =>
      options.promotions ?? { ...DEFAULT_PROMOTIONS, secondProductEnabled: true },
    getPool: () => db,
    withTransaction: async (fn) => {
      const before = lock;
      let release;
      lock = new Promise((resolve) => (release = resolve));
      await before;
      try {
        return await fn(db);
      } finally {
        release();
      }
    },
    readProducts: async () => [
      { slug: "one", name: "Ürün", price: 610, image: "/product.jpg", sizes: ["S"] },
    ],
    fetch: async (url, init) => {
      calls++;
      assert.equal(url, "https://www.paytr.com/odeme/api/get-token");
      sent = new URLSearchParams(init.body);
      if (options.timeout) throw new Error("Simulated timeout");
      return Response.json(
        options.reject
          ? { status: "failed" }
          : { status: "success", token: options.providerToken ?? "fixtureToken123" },
      );
    },
  });
  const input = () => ({
    items: [{ slug: "one", size: "S", quantity: 2 }],
    customer: {
      name: "Örnek Müşteri",
      email: "fixture@example.com",
      phone: "05555555555",
      city: "İstanbul",
      district: "Kadıköy",
      address: "Örnek Mahallesi Örnek Sokak No 1",
    },
    consent: true,
    requestId: randomUUID(),
    expectedAmount: 106750,
  });
  const request = (path, body, headers = {}) =>
    api(
      new Request("https://shop.example" + path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://shop.example",
          "x-real-ip": "203.0.113.10",
          ...headers,
        },
        body: JSON.stringify(body),
      }),
    );
  const callback = (id, status = "success", amount = "106750", path = "/api/paytr/callback") => {
    const data = {
      merchant_oid: id,
      status,
      total_amount: amount,
      hash: sign(id + env.PAYTR_MERCHANT_SALT + status + amount, env.PAYTR_MERCHANT_KEY),
    };
    return api(
      new Request("https://shop.example" + path, {
        method: "POST",
        body: new URLSearchParams(data),
      }),
    );
  };
  return {
    api,
    request,
    input,
    callback,
    rows,
    env,
    get calls() {
      return calls;
    },
    get updates() {
      return updates;
    },
    get sent() {
      return sent;
    },
  };
}
test("full mocked flow signs discounted basket, persists pending, and confirms through legacy URL", async () => {
  const f = fixture();
  const payload = f.input();
  const response = await f.request("/api/checkout/start", payload);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(f.calls, 1);
  assert.equal(f.rows.get(result.id).status, "pending");
  const p = f.sent;
  assert.equal(p.get("no_installment"), "1");
  assert.equal(p.get("test_mode"), "0");
  assert.equal(p.get("payment_amount"), "106750");
  const signature = [
    "merchant_id",
    "user_ip",
    "merchant_oid",
    "email",
    "payment_amount",
    "user_basket",
    "no_installment",
    "max_installment",
    "currency",
    "test_mode",
  ]
    .map((k) => p.get(k))
    .join("");
  assert.equal(p.get("paytr_token"), sign(signature + "fixture-salt", "fixture-key"));
  const basket = JSON.parse(Buffer.from(p.get("user_basket"), "base64").toString());
  assert.equal(
    basket.reduce((sum, [, price, qty]) => sum + Math.round(Number(price) * 100) * qty, 0),
    106750,
  );
  assert.ok(p.get("merchant_ok_url").startsWith("https://shop.example/odeme-sonucu#"));
  assert.equal(p.get("merchant_ok_url"), p.get("merchant_fail_url"));
  const again = await (await f.request("/api/checkout/start", payload)).json();
  assert.equal(again.id, result.id);
  assert.equal(f.calls, 1);
  assert.equal(
    (await f.request("/api/checkout/status", { id: result.id, access: "0".repeat(64) })).status,
    404,
  );
  const before = await (await f.request("/api/checkout/status", result)).json();
  assert.equal(before.status, "pending");
  assert.equal(before.customer, undefined);
  const done = await f.callback(
    result.id,
    "success",
    "106750",
    "/index.php?wc-api=wc_gateway_paytrcheckout",
  );
  assert.equal(await done.text(), "OK");
  const after = await (await f.request("/api/checkout/status", result)).json();
  assert.equal(after.status, "paid");
});
test("concurrent duplicate callbacks and later failure do not fulfill or downgrade twice", async () => {
  const f = fixture();
  const order = await (await f.request("/api/checkout/start", f.input())).json();
  const replies = await Promise.all([f.callback(order.id), f.callback(order.id)]);
  assert.deepEqual(await Promise.all(replies.map((r) => r.text())), ["OK", "OK"]);
  assert.equal(await (await f.callback(order.id, "failed", "0")).text(), "OK");
  assert.equal(f.rows.get(order.id).status, "paid");
  assert.equal(f.updates, 1);
});
test("tampered signature, wrong amount, and unknown orders cannot approve payments", async () => {
  const f = fixture();
  const order = await (await f.request("/api/checkout/start", f.input())).json();
  const invalid = await f.api(
    new Request("https://shop.example/api/paytr/callback", {
      method: "POST",
      body: new URLSearchParams({
        merchant_oid: order.id,
        status: "success",
        total_amount: "106750",
        hash: "invalid",
      }),
    }),
  );
  assert.equal(invalid.status, 400);
  assert.equal((await f.callback(order.id, "success", "106749")).status, 400);
  assert.equal((await f.callback("MTunknown")).status, 404);
  assert.equal(f.rows.get(order.id).status, "pending");
  assert.equal(f.updates, 0);
});
test("callback failure keeps order unpaid and does not require payment enablement", async () => {
  const f = fixture();
  const order = await (await f.request("/api/checkout/start", f.input())).json();
  f.env.PAYTR_ENABLED = "0";
  assert.equal(await (await f.callback(order.id, "failed", "0")).text(), "OK");
  assert.equal(f.rows.get(order.id).status, "failed");
});
test("validation, price change and disabled mode never call PayTR", async () => {
  const f = fixture();
  const input = f.input();
  assert.equal((await f.request("/api/checkout/start", { ...input, consent: false })).status, 400);
  assert.equal(
    (await f.request("/api/checkout/start", { ...input, expectedAmount: 1 })).status,
    409,
  );
  assert.equal(
    (await f.request("/api/checkout/start", input, { Origin: "https://attacker.example" })).status,
    403,
  );
  f.env.PAYTR_ENABLED = "0";
  assert.equal((await f.request("/api/checkout/start", input)).status, 503);
  assert.equal(f.calls, 0);
  assert.equal(f.rows.size, 0);
});
test("production ignores local IP overrides and requires trusted proxy", async () => {
  const f = fixture({ env: { PAYTR_LOCAL_IP: "203.0.113.20", PAYTR_TRUST_PROXY: "0" } });
  assert.equal((await f.request("/api/checkout/start", f.input())).status, 503);
  assert.equal(f.calls, 0);
});
test("request id reuse with changed customer is rejected", async () => {
  const f = fixture();
  const input = f.input();
  await f.request("/api/checkout/start", input);
  assert.equal(
    (
      await f.request("/api/checkout/start", {
        ...input,
        customer: { ...input.customer, name: "Başka Müşteri" },
      })
    ).status,
    409,
  );
  assert.equal(f.calls, 1);
});
test("provider rejection never returns an iframe or confirms an order", async () => {
  const f = fixture({ reject: true });
  assert.equal((await f.request("/api/checkout/start", f.input())).status, 502);
  assert.equal([...f.rows.values()][0].status, "failed");
});
test("provider timeout returns a recoverable order reference without a second token attempt", async () => {
  const f = fixture({ timeout: true });
  const input = f.input();
  const first = await (await f.request("/api/checkout/start", input)).json();
  assert.ok(first.id && first.access);
  assert.equal(first.token, undefined);
  const retry = await f.request("/api/checkout/start", input);
  assert.equal(retry.status, 409);
  assert.equal((await retry.json()).id, first.id);
  assert.equal(f.calls, 1);
});
test("bank transfer is rejected even when old environment settings enable it", async () => {
  const f = fixture({
    env: {
      BANK_TRANSFER_ENABLED: "1",
      BANK_TRANSFER_BANK_NAME: "Örnek Banka",
      BANK_TRANSFER_ACCOUNT_HOLDER: "MinaToi",
      BANK_TRANSFER_IBAN: "TR000000000000000000000000",
    },
  });
  const result = await f.request("/api/checkout/bank-transfer", f.input());
  assert.equal(result.status, 410);
  assert.equal(f.rows.size, 0);
  assert.equal(f.calls, 0);
  const quote = await (await f.request("/api/checkout/quote", { items: f.input().items })).json();
  assert.equal(quote.bankTransferAvailable, false);
});
test("admin session token lists orders without asking for plaintext password", async () => {
  const f = fixture();
  const denied = await f.request("/api/checkout/admin", { token: "0".repeat(64), page: 0 });
  assert.equal(denied.status, 401);
  const allowed = await f.request("/api/checkout/admin", {
    token: f.env.ADMIN_PASS_HASH,
    page: 0,
  });
  assert.equal(allowed.status, 200);
});
test("admin can mark only an awaiting bank transfer as paid", async () => {
  const f = fixture({
    env: {
      BANK_TRANSFER_ENABLED: "1",
      BANK_TRANSFER_BANK_NAME: "Örnek Banka",
      BANK_TRANSFER_ACCOUNT_HOLDER: "MinaToi",
      BANK_TRANSFER_IBAN: "TR000000000000000000000000",
    },
  });
  const order = { id: "MT" + "a".repeat(32) };
  f.rows.set(order.id, { ...order, payment_method: "bank_transfer", status: "awaiting_transfer" });
  const changed = await f.request("/api/checkout/admin-order-status", {
    token: f.env.ADMIN_PASS_HASH,
    id: order.id,
    status: "paid",
  });
  assert.equal(changed.status, 200);
  assert.equal(f.rows.get(order.id).status, "paid");
  assert.equal(
    (
      await f.request("/api/checkout/admin-order-status", {
        token: f.env.ADMIN_PASS_HASH,
        id: order.id,
        status: "failed",
      })
    ).status,
    409,
  );
});

test("default quote and checkout charge full price without a campaign", async () => {
  const f = fixture({ promotions: DEFAULT_PROMOTIONS });
  const input = { ...f.input(), expectedAmount: 122000 };
  const quote = await (await f.request("/api/checkout/quote", { items: input.items })).json();
  assert.equal(quote.discount, 0);
  assert.equal(quote.amount, 122000);
  assert.equal((await f.request("/api/checkout/start", input)).status, 200);
  assert.equal(f.sent.get("payment_amount"), "122000");
});
test("coupon revalidated for card payments and rejected after deactivation", async () => {
  const promotions = {
    ...DEFAULT_PROMOTIONS,
    codes: [{ code: "SAVE", percent: 20, active: true }],
  };
  const f = fixture({
    promotions,
    env: {
      BANK_TRANSFER_ENABLED: "1",
      BANK_TRANSFER_IBAN: "TR330006100519786457841326",
      BANK_TRANSFER_ACCOUNT_HOLDER: "Test",
      BANK_TRANSFER_BANK_NAME: "Test",
    },
  });
  const input = { ...f.input(), couponCode: "save", expectedAmount: 97600 };
  const quote = await (
    await f.request("/api/checkout/quote", { items: input.items, couponCode: "save" })
  ).json();
  assert.equal(quote.amount, 97600);
  assert.equal((await f.request("/api/checkout/start", input)).status, 200);
  assert.equal(f.sent.get("payment_amount"), "97600");
  const bank = await f.request("/api/checkout/bank-transfer", {
    ...input,
    requestId: randomUUID(),
  });
  assert.equal(bank.status, 410);
  promotions.codes[0].active = false;
  assert.equal(
    (await f.request("/api/checkout/bank-transfer", { ...input, requestId: randomUUID() })).status,
    410,
  );
  assert.equal(
    (await f.request("/api/checkout/start", { ...input, requestId: randomUUID() })).status,
    400,
  );
  assert.equal(
    (await f.request("/api/checkout/quote", { items: input.items, couponCode: "SAVE" })).status,
    400,
  );
});

test("checkout quote accepts explicitly configured www origin and rejects other origins", async () => {
  const f = fixture({ env: { CHECKOUT_ALLOWED_ORIGINS: "https://www.shop.example" } });
  const input = { items: f.input().items };
  for (const origin of ["https://shop.example", "https://www.shop.example"]) {
    const response = await f.request("/api/checkout/quote", input, { Origin: origin });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).amount, 106750);
  }
  for (const origin of [
    "https://evil.example",
    "https://www.shop.example.evil.example",
    "http://www.shop.example",
    "null",
    "",
  ]) {
    assert.equal((await f.request("/api/checkout/quote", input, { Origin: origin })).status, 403);
  }
});

test("checkout quote rejects unconfigured www origin", async () => {
  const f = fixture();
  assert.equal(
    (
      await f.request(
        "/api/checkout/quote",
        { items: f.input().items },
        { Origin: "https://www.shop.example" },
      )
    ).status,
    403,
  );
});

test("successful payment queues email once; failed and invalid callbacks never queue", async () => {
  const queued = [];
  const f = fixture({ queueOrderEmails: async (_client, id) => queued.push(id) });
  const started = await (await f.request("/api/checkout/start", f.input())).json();
  assert.equal((await f.callback(started.id)).status, 200);
  assert.equal((await f.callback(started.id)).status, 200);
  assert.deepEqual(queued, [started.id]);
  const failed = await (await f.request("/api/checkout/start", f.input())).json();
  assert.equal((await f.callback(failed.id, "failed")).status, 200);
  assert.deepEqual(queued, [started.id]);
  const mismatch = await (await f.request("/api/checkout/start", f.input())).json();
  assert.equal((await f.callback(mismatch.id, "success", "1")).status, 400);
  assert.deepEqual(queued, [started.id]);
});

test("PayTR URL-safe tokens containing hyphens are accepted and reused", async () => {
  const token = "fixture-Token_123-" + "a".repeat(57);
  const f = fixture({ providerToken: token });
  const input = f.input();
  const response = await f.request("/api/checkout/start", input);
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.token, token);
  assert.equal(f.rows.get(result.id).status, "pending");
  assert.equal((await (await f.request("/api/checkout/start", input)).json()).token, token);
  assert.equal(f.calls, 1);
});

test("unsafe and oversized provider tokens never become iframe URLs", async () => {
  for (const token of ["../path", "x?redirect=bad", "<script>", "", "a".repeat(513)]) {
    const f = fixture({ providerToken: token });
    const response = await f.request("/api/checkout/start", f.input());
    assert.equal(response.status, 502);
    assert.equal((await response.json()).token, undefined);
  }
});

test("admin order endpoints accept centrally verified sessions rather than password hashes", async () => {
  const session = "f".repeat(64);
  const f = fixture({ authorizeAdmin: async (token) => token === session });
  assert.equal((await f.request("/api/checkout/admin", { token: session })).status, 200);
  assert.equal((await f.request("/api/checkout/admin", { token: "invalid" })).status, 401);
});
