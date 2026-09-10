import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  priceCart,
  verifyCallback,
  checkoutSchema,
  paymentTransition,
  paymentBasket,
} from "./core.ts";
const products = [
  { slug: "wallet", name: "Cüzdan", price: 129.95, image: "/a.jpg", sizes: ["S", "M"] },
  { slug: "case", name: "Kılıf", price: 10.1, image: "/b.jpg" },
];
test("server pricing includes quantities, exact kuruş and free shipping", () => {
  const q = priceCart(
    [
      { slug: "wallet", size: "M", quantity: 3 },
      { slug: "case", quantity: 2 },
    ],
    products,
  );
  assert.equal(q.subtotal, 41005);
  assert.equal(q.discount, 253);
  assert.equal(q.amount, 40752);
  assert.equal(q.shipping, 0);
});
test("rejects client prices, invalid quantities, unknown products and variants", () => {
  for (const item of [
    { slug: "wallet", size: "M", quantity: 1, price: 1 },
    { slug: "wallet", size: "L", quantity: 1 },
    { slug: "wallet", quantity: 1 },
    { slug: "case", size: "S", quantity: 1 },
    { slug: "missing", quantity: 1 },
    { slug: "case", quantity: 0 },
    { slug: "case", quantity: 1.5 },
    { slug: "case", quantity: 21 },
  ])
    assert.throws(() => priceCart([item], products));
});
test("duplicate variant and empty carts rejected", () => {
  assert.throws(() => priceCart([], products));
  assert.throws(() =>
    priceCart(
      [
        { slug: "case", quantity: 1 },
        { slug: "case", quantity: 1 },
      ],
      products,
    ),
  );
});
test("valid callback verified, altered amount/status/signature rejected", () => {
  const data = { merchant_oid: "MT12345", status: "success", total_amount: "12995" };
  data.hash = createHmac("sha256", "test-key")
    .update("MT12345test-saltsuccess12995")
    .digest("base64");
  assert.equal(verifyCallback(data, "test-key", "test-salt"), true);
  for (const changed of [
    { total_amount: "1" },
    { status: "failed" },
    { hash: "x" },
    { merchant_oid: "other" },
    { status: "other" },
  ])
    assert.equal(verifyCallback({ ...data, ...changed }, "test-key", "test-salt"), false);
});
test("checkout requires consent and expected amount", () => {
  assert.equal(checkoutSchema.safeParse({ items: [{ slug: "case", quantity: 1 }] }).success, false);
});

test("paid orders are not fulfilled twice or downgraded", () => {
  const order = { amount: 100, status: "paid", test_mode: false };
  assert.equal(paymentTransition(order, { status: "success", total_amount: "100" }), null);
  assert.equal(paymentTransition(order, { status: "failed", total_amount: "0" }), null);
});
test("successful callbacks require exact amount and matching test mode", () => {
  const order = { amount: 100, status: "pending", test_mode: false };
  assert.throws(() => paymentTransition(order, { status: "success", total_amount: "99" }));
  assert.throws(() =>
    paymentTransition(order, { status: "success", total_amount: "100", test_mode: "1" }),
  );
  assert.equal(
    paymentTransition(order, { status: "success", total_amount: "100", test_mode: "0" }),
    "paid",
  );
});
test("failed callback terminates pending order without fulfillment", () => {
  assert.equal(
    paymentTransition(
      { amount: 100, status: "pending", test_mode: false },
      { status: "failed", total_amount: "0" },
    ),
    "failed",
  );
});

test("discount applies once to cheapest single unit, including repeated quantities", () => {
  const q = priceCart(
    [
      { slug: "wallet", size: "M", quantity: 2 },
      { slug: "case", quantity: 2 },
    ],
    products,
  );
  assert.equal(q.discount, 253);
  assert.equal(q.amount, 27757);
  const basket = paymentBasket(q.items);
  assert.equal(
    basket.reduce((sum, [, price, qty]) => sum + Math.round(Number(price) * 100) * qty, 0),
    q.amount,
  );
  assert.equal(basket.filter(([name]) => name.includes("%25")).length, 1);
});
test("one item has no discount; two of the same product get one discount", () => {
  assert.equal(priceCart([{ slug: "case", quantity: 1 }], products).discount, 0);
  const q = priceCart([{ slug: "case", quantity: 2 }], products);
  assert.equal(q.discount, 253);
  assert.equal(q.amount, 1767);
});
test("cart order does not affect discount and displayed total", () => {
  const items = [
    { slug: "wallet", size: "M", quantity: 1 },
    { slug: "case", quantity: 1 },
  ];
  assert.equal(priceCart(items, products).amount, priceCart([...items].reverse(), products).amount);
});
