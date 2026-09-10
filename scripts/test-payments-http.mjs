// Integration smoke checks: no token request and no real order/payment is created.
import assert from "node:assert/strict";
const base = process.env.SMOKE_BASE_URL ?? "http://localhost:8080";
const allowedOrigin = process.env.SMOKE_ORIGIN ?? base;
async function post(path, data, origin = allowedOrigin) {
  return fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(10000),
  });
}
const item = { slug: "karakalem-kara-kedi-cam-tablo-kd123", size: "25x35cm", quantity: 1 };
const first = await post("/api/checkout/quote", { items: [item] });
assert.equal(first.status, 200);
const quote = await first.json();
for (const quantity of [2, 4]) {
  const response = await post("/api/checkout/quote", { items: [{ ...item, quantity }] });
  assert.equal(response.status, 200);
  const q = await response.json();
  assert.equal(q.discount, Math.round(quote.amount / 4));
  assert.equal(q.amount, quote.amount * quantity - q.discount);
  assert.equal(q.shipping, 0);
}
assert.equal(
  (await post("/api/checkout/quote", { items: [item] }, "https://untrusted.example")).status,
  403,
);
assert.equal((await post("/api/checkout/start", {})).status, 503);
assert.equal((await post("/api/checkout/admin", { password: "invalid-smoke-check" })).status, 401);
// Always localhost; never send test notifications to the live WooCommerce installation.
for (const path of ["/api/paytr/callback", "/index.php?wc-api=wc_gateway_paytrcheckout"]) {
  const callback = await fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "merchant_oid=MT12345&status=success&total_amount=100&hash=invalid",
    signal: AbortSignal.timeout(10000),
  });
  assert.equal(callback.status, 400);
  assert.equal(await callback.text(), "Invalid signature");
}
console.log("Yerel HTTP kontrolleri geçti. Canlı siteye veya PayTR servisine istek gönderilmedi.");
