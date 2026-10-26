import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  cartReminderMessage,
  reminderLinks,
  reminderKey,
  captureHash,
  deliverNextCartReminder,
} from "./cartReminders.ts";
import { createCartReminderAPI } from "./cartReminderAPI.ts";
const secret = "test-reminder-secret-with-at-least-32-characters";
const cart = {
  id: randomUUID(),
  email: "buyer@example.com",
  items: [
    {
      slug: "one",
      name: "Cam <Tablo>",
      size: "25 × 35 cm",
      quantity: 2,
      image: "/one.jpg",
      unitAmount: 61000,
      discount: 0,
    },
  ],
  coupon_code: "",
  order_ids: [],
  test_mode: false,
};

test("reminder has recovery link, strong guarantee, safe content and separate unsubscribe capability", () => {
  const links = reminderLinks(cart.id, secret, "https://minatoi.com");
  const message = cartReminderMessage(cart, links);
  assert.match(message.html, /Hasarsız Teslimat Garantisi/);
  assert.match(message.text, /Hasarsız Teslimat Garantisi/);
  assert.match(message.html, /Cam &lt;Tablo&gt;/);
  assert.match(message.html, /Sepetimi tamamla/);
  assert.ok(!links.recover.includes(cart.email));
  assert.ok(links.recover.includes("/sepet#cart="));
  assert.notEqual(reminderKey(cart.id, secret), reminderKey(cart.id, secret, "unsubscribe"));
  assert.match(cartReminderMessage({ ...cart, test_mode: true }, links).subject, /^\[TEST\]/);
});

test("worker only takes due carts under lock, checks successful payment and optout, then sends once", async () => {
  const queries = [];
  const db = {
    query: async (sql, args) => {
      queries.push({ sql, args });
      if (sql.startsWith("SELECT *")) return { rows: [cart] };
      if (sql.includes("AS sendable")) return { rows: [{ sendable: true }] };
      return { rows: [] };
    },
  };
  let sent = 0;
  assert.equal(
    await deliverNextCartReminder(db, async (value) => {
      sent++;
      assert.equal(value.email, cart.email);
    }),
    true,
  );
  assert.equal(sent, 1);
  assert.match(queries[0].sql, /next_attempt_at<=now\(\)/);
  assert.match(queries[0].sql, /sent_at IS NULL AND cancelled_at IS NULL/);
  assert.match(queries[0].sql, /FOR UPDATE SKIP LOCKED/);
  assert.match(queries[1].sql, /pg_advisory_xact_lock/);
  assert.match(queries[2].sql, /status='paid'/);
  assert.match(queries[2].sql, /cart_reminder_optouts/);
  assert.match(queries[2].sql, /24 hours/);
  assert.match(queries.at(-1).sql, /sent_at=now\(\)/);
});

test("completed, opted-out, expired and recently reminded recipients are cancelled without sending", async () => {
  const queries = [];
  const db = {
    query: async (sql, args) => {
      queries.push({ sql, args });
      return {
        rows: sql.startsWith("SELECT *")
          ? [cart]
          : sql.includes("AS sendable")
            ? [{ sendable: false }]
            : [],
      };
    },
  };
  await deliverNextCartReminder(db, async () => assert.fail("must not send"));
  assert.match(queries.at(-1).sql, /cancelled_at=now\(\)/);
});

test("SMTP errors retry with a bounded attempt count and safe error codes", async () => {
  const queries = [];
  const db = {
    query: async (sql, args) => {
      queries.push({ sql, args });
      return {
        rows: sql.startsWith("SELECT *")
          ? [cart]
          : sql.includes("AS sendable")
            ? [{ sendable: true }]
            : [],
      };
    },
  };
  await deliverNextCartReminder(db, async () => {
    throw Object.assign(new Error("private message details"), { code: "ETIMEDOUT" });
  });
  assert.match(queries.at(-1).sql, /attempts>=4/);
  assert.equal(queries.at(-1).args[1], "ETIMEDOUT");
  assert.ok(!JSON.stringify(queries).includes("private message details"));
  assert.equal(
    await deliverNextCartReminder({ query: async () => ({ rows: [] }) }, async () => assert.fail()),
    false,
  );
});

function fixture() {
  const rows = new Map();
  const queries = [];
  const optouts = new Set();
  const db = {
    query: async (sql, args = []) => {
      queries.push({ sql, args });
      if (sql.startsWith("INSERT INTO cart_reminders(")) {
        if (!rows.has(args[0]))
          rows.set(args[0], {
            id: args[0],
            capture_hash: args[1],
            email: args[2],
            items: JSON.parse(args[3]),
            coupon_code: args[4],
            order_ids: [],
          });
        return { rows: [] };
      }
      if (sql.startsWith("SELECT * FROM cart_reminders"))
        return { rows: rows.has(args[0]) ? [rows.get(args[0])] : [] };
      if (sql.startsWith("SELECT email FROM cart_reminders"))
        return { rows: rows.has(args[0]) ? [rows.get(args[0])] : [] };
      if (sql.startsWith("UPDATE cart_reminders SET email=")) {
        const row = rows.get(args[0]);
        if (!row.sent_at && !row.cancelled_at)
          Object.assign(row, { email: args[1], items: JSON.parse(args[2]), coupon_code: args[3] });
        return { rows: [] };
      }
      if (sql.startsWith("INSERT INTO cart_reminder_optouts")) {
        optouts.add(args[0]);
        return { rows: [] };
      }
      if (sql.startsWith("UPDATE cart_reminders SET cancelled_at")) {
        for (const row of rows.values())
          if (row.id === args[0] || row.email === args[0]) row.cancelled_at = true;
        return { rows: [] };
      }
      if (sql.startsWith("SELECT id FROM orders"))
        return { rows: args[1] === captureHash("b".repeat(64)) ? [{ id: args[0] }] : [] };
      if (sql.startsWith("UPDATE cart_reminders SET order_ids")) {
        rows.get(args[0]).order_ids.push(args[1]);
        return { rows: [] };
      }
      throw new Error("Unexpected query");
    },
  };
  const env = {
    NODE_ENV: "production",
    PAYTR_PUBLIC_URL: "https://minatoi.com",
    CART_REMINDER_ENABLED: "1",
    CART_REMINDER_SECRET: secret,
  };
  const api = createCartReminderAPI({
    env,
    getPool: () => db,
    withTransaction: async (fn) => fn(db),
    priceItems: async (items) => {
      if (items.some((i) => i.slug !== "one")) throw new Error("bad cart");
      return items.map((item) => ({ ...cart.items[0], quantity: item.quantity }));
    },
  });
  const id = randomUUID(),
    access = "a".repeat(64);
  const request = (action, data, origin = "https://minatoi.com") =>
    api(
      new Request("https://minatoi.com/api/cart-reminders/" + action, {
        method: "POST",
        headers: { origin, "content-type": "application/json" },
        body: JSON.stringify({ id, access, ...data }),
      }),
    );
  return { api, request, id, access, rows, queries, optouts };
}
const snapshot = {
  email: "Buyer@EXAMPLE.com",
  items: [{ slug: "one", size: "25 × 35 cm", quantity: 2 }],
  couponCode: "",
};
test("capture validates email and cart, schedules one hour and ignores client product display data", async () => {
  const f = fixture();
  assert.equal((await f.request("capture", snapshot)).status, 200);
  assert.equal(f.rows.get(f.id).email, "buyer@example.com");
  assert.equal(f.rows.get(f.id).items[0].name, "Cam <Tablo>");
  assert.match(
    f.queries.find((q) => q.sql.startsWith("UPDATE cart_reminders SET email=")).sql,
    /interval '1 hour'/,
  );
  assert.match(
    f.queries.find((q) => q.sql.startsWith("UPDATE cart_reminders SET email=")).sql,
    /IS DISTINCT FROM/,
  );
  assert.equal((await f.request("capture", { ...snapshot, email: "invalid" })).status, 400);
  assert.equal(
    (await f.request("capture", { ...snapshot, items: [{ slug: "unknown" }] })).status,
    400,
  );
  assert.equal((await f.request("capture", snapshot, "https://evil.example")).status, 403);
});

test("recovery preserves saved items and requires a private capability; forged updates cannot overwrite cart", async () => {
  const f = fixture();
  await f.request("capture", snapshot);
  assert.equal((await f.request("restore", { access: "c".repeat(64) })).status, 404);
  assert.equal(
    (
      await f.request("capture", {
        ...snapshot,
        email: "attacker@example.com",
        access: "c".repeat(64),
      })
    ).status,
    404,
  );
  assert.equal(f.rows.get(f.id).email, "buyer@example.com");
  const restored = await (await f.request("restore", { access: reminderKey(f.id, secret) })).json();
  assert.equal(restored.email, "buyer@example.com");
  assert.equal(restored.items[0].quantity, 2);
  assert.equal(
    (await f.request("link", { orderId: "MT" + "1".repeat(32), orderAccess: "b".repeat(64) }))
      .status,
    200,
  );
  assert.equal(f.rows.get(f.id).order_ids.length, 1);
  assert.equal(
    (await f.request("link", { orderId: "MT" + "2".repeat(32), orderAccess: "c".repeat(64) }))
      .status,
    404,
  );
});

test("empty cart cancels pending reminder; unsubscribe suppresses recipient and has separate key", async () => {
  const f = fixture();
  await f.request("capture", snapshot);
  assert.equal((await f.request("capture", { ...snapshot, items: [] })).status, 200);
  assert.equal(f.rows.get(f.id).cancelled_at, true);
  assert.equal((await f.request("unsubscribe", { access: reminderKey(f.id, secret) })).status, 404);
  assert.equal(
    (await f.request("unsubscribe", { access: reminderKey(f.id, secret, "unsubscribe") })).status,
    200,
  );
  assert.ok(f.optouts.has("buyer@example.com"));
});

test("clearing email/cart before a delayed capture prevents the old cart from being reactivated", async () => {
  const f = fixture();
  assert.equal((await f.request("capture", { ...snapshot, items: [] })).status, 200);
  assert.equal((await f.request("capture", snapshot)).status, 200);
  assert.equal(f.rows.get(f.id).cancelled_at, true);
});
