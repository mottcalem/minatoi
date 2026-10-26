import test from "node:test";
import assert from "node:assert/strict";
import { orderMessage } from "./messages.ts";
import { deliverNextEmail, queueOrderEmails } from "./queue.ts";
const order = {
  id: "MTtest",
  customer: {
    name: '<script>"Müşteri"</script>',
    email: "buyer@example.com",
    phone: "05555555555",
    address: "Test adres",
    district: "Kadıköy",
    city: "İstanbul",
  },
  items: [{ name: "Cam <Tablo>", size: "25×35", quantity: 2, unitAmount: 61000, discount: 10000 }],
  amount: 112000,
  discount: 10000,
  test_mode: false,
};
test("separate Turkish customer/admin templates escape customer content and mark tests", () => {
  const buyer = orderMessage(order, "customer");
  const admin = orderMessage(order, "admin");
  assert.match(buyer.subject, /Siparişiniz alındı/);
  assert.match(admin.subject, /Yeni sipariş geldi/);
  assert.ok(!buyer.html.includes("<script>"));
  assert.match(buyer.html, /&lt;script&gt;/);
  assert.match(buyer.text, /1.120,00/);
  assert.match(buyer.text, /100,00/);
  assert.match(orderMessage(order, "customer", true).subject, /^\[TEST\]/);
  assert.match(orderMessage({ ...order, test_mode: true }, "admin").subject, /^\[TEST\]/);
});
test("outbox queues both audiences with database uniqueness", async () => {
  let sql, args;
  await queueOrderEmails(
    {
      query: async (q, a) => {
        sql = q;
        args = a;
      },
    },
    order.id,
  );
  assert.match(sql, /'customer'.*'admin'/);
  assert.match(sql, /ON CONFLICT DO NOTHING/);
  assert.deepEqual(args, [order.id]);
});
test("SMTP failure schedules retry; successful delivery marks only its own audience", async () => {
  for (const fail of [true, false]) {
    const queries = [];
    const client = {
      query: async (sql, args) => {
        queries.push({ sql, args });
        return { rows: [{ ...order, order_id: order.id, audience: "customer" }] };
      },
    };
    assert.equal(
      await deliverNextEmail(client, async (sent, audience) => {
        assert.equal(sent.id, order.id);
        assert.equal(audience, "customer");
        if (fail) throw Object.assign(new Error("private SMTP details"), { code: "ETIMEDOUT" });
      }),
      true,
    );
    assert.match(queries[0].sql, /FOR UPDATE OF q SKIP LOCKED/);
    assert.match(queries[0].sql, /o.status='paid'/);
    assert.match(queries[1].sql, fail ? /next_attempt_at=now\(\)/ : /sent_at=now\(\)/);
    assert.deepEqual(
      queries[1].args,
      fail ? [order.id, "customer", "ETIMEDOUT"] : [order.id, "customer"],
    );
  }
});
test("empty outbox sends no email", async () => {
  assert.equal(
    await deliverNextEmail({ query: async () => ({ rows: [] }) }, async () =>
      assert.fail("unexpected send"),
    ),
    false,
  );
});

test("existing Notifiva credentials support order delivery without duplicate secrets", async () => {
  const { orderSmtpConfig } = await import("./smtp.ts");
  assert.deepEqual(orderSmtpConfig({ NOTIFIVA_SMTP_PASSWORD: "test-secret" }), {
    host: "smtp.notifiva.com",
    port: 587,
    user: "notifiva",
    pass: "test-secret",
    from: "no-reply@e.dijitalpanter.com",
    admin: "info@minatoi.com",
  });
  const custom = orderSmtpConfig({
    SMTP_HOST: "smtp.example.com",
    SMTP_PORT: "465",
    SMTP_USER: "user",
    SMTP_PASS: "custom",
    SMTP_FROM: "shop@example.com",
    ORDER_ADMIN_EMAIL: "admin@example.com",
    NOTIFIVA_SMTP_PASSWORD: "other",
  });
  assert.equal(custom.host, "smtp.example.com");
  assert.equal(custom.pass, "custom");
  assert.equal(custom.port, 465);
  assert.throws(() =>
    orderSmtpConfig({ SMTP_HOST: "smtp.example.com", NOTIFIVA_SMTP_PASSWORD: "other" }),
  );
});

test("order summary shows item pricing, discount, delivery and contact information", () => {
  const message = orderMessage(order, "customer");
  for (const value of [
    "Sipariş özeti",
    "Birim:",
    "Ara toplam",
    "1.220,00",
    "1.120,00",
    "Ücretsiz",
    "Kadıköy",
    "buyer@example.com",
  ])
    assert.ok(message.html.includes(value), value);
  assert.match(message.html, /bu e-postayı yanıtlayabilirsiniz/);
});

test("personalized order emails retain style, orientation and photo link for both audiences", () => {
  const custom = {
    ...order,
    items: [
      {
        ...order.items[0],
        customization: {
          uploadId: "12345678-1234-4234-8234-123456789012",
          style: "Sulu <boya>",
          orientation: "Yatay",
          filename: "pet.png",
          photoUrl: "/api/custom-order-images/12345678-1234-4234-8234-123456789012",
        },
      },
    ],
  };
  for (const audience of ["customer", "admin"]) {
    const message = orderMessage(custom, audience, false, "https://shop.example");
    assert.match(message.text, /Sulu <boya> · Yatay/);
    assert.match(message.html, /Sulu &lt;boya&gt;/);
    assert.match(message.html, /https:\/\/shop.example\/api\/custom-order-images\//);
  }
});
