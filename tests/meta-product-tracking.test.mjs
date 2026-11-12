import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import { trackMetaProduct } from "../src/lib/meta-product-tracking.ts";
const product = {
  slug: "ornek-tablo", name: "Örnek tablo", category: "manzara", price: 710,
  sizePrices: [{ size: "25*35 cm", price: 710 }, { size: "60*90 cm", price: 1890 }],
  customization: { photoUrl: "private-photo", uploadId: "private-upload" },
};
afterEach(() => { delete globalThis.window; });
function setup() {
  const calls = [];
  globalThis.window = { location: { pathname: "/urun/ornek-tablo" }, fbq: (...args) => calls.push(args) };
  return calls;
}
test("ViewContent identifies the product with the initial variant price", () => {
  const calls = setup();
  trackMetaProduct("ViewContent", product, "25 × 35 cm");
  assert.deepEqual(calls[0], ["track", "ViewContent", {
    content_ids: [product.slug], content_type: "product", content_name: product.name,
    content_category: product.category, contents: [{ id: product.slug, quantity: 1, item_price: 710 }],
    value: 710, currency: "TRY",
  }]);
  assert.ok(!JSON.stringify(calls).includes("private"));
});
test("AddToCart sends the added quantity and selected size price on every separate addition", () => {
  const calls = setup();
  trackMetaProduct("AddToCart", product, "60*90 cm", 2);
  trackMetaProduct("AddToCart", product, "25*35 cm", 1);
  assert.equal(calls.length, 2);
  assert.equal(calls[0][1], "AddToCart");
  assert.equal(calls[0][2].value, 3780);
  assert.equal(calls[0][2].num_items, 2);
  assert.equal(calls[0][2].contents[0].item_price, 1890);
  assert.equal(calls[1][2].value, 710);
});
test("admin, server rendering, invalid quantities and unknown variants emit nothing", () => {
  trackMetaProduct("ViewContent", product, "25*35 cm");
  const calls = setup();
  for (const quantity of [0, -1, 1.5, NaN]) trackMetaProduct("AddToCart", product, "25*35 cm", quantity);
  trackMetaProduct("ViewContent", product, "missing");
  window.location.pathname = "/admin";
  trackMetaProduct("AddToCart", product, "25*35 cm");
  assert.equal(calls.length, 0);
});
test("delayed Pixel initialization queues one event and tracking failures do not escape", () => {
  const calls = setup(); const timers = [];
  delete window.fbq;
  window.setTimeout = (fn) => timers.push(fn);
  trackMetaProduct("ViewContent", product, "25*35 cm");
  assert.equal(timers.length, 1);
  window.fbq = (...args) => calls.push(args);
  timers.shift()();
  assert.equal(calls.length, 1);
  assert.equal(timers.length, 0);
  window.fbq = () => { throw new Error("blocked"); };
  assert.doesNotThrow(() => trackMetaProduct("AddToCart", product, "25*35 cm"));
});
