import test from "node:test";
import assert from "node:assert/strict";
import { updateSizePrices } from "../src/data/bulkSizePricing.ts";
const product = {
  slug: "example",
  price: 610,
  oldPrice: 920,
  sizes: ["25*35 cm", "35 × 50 cm", "60*90 cm"],
  sizePrices: [
    { size: "25*35 cm", price: 610, oldPrice: 920 },
    { size: "35 × 50 cm", price: 990, oldPrice: 1250 },
    { size: "60*90 cm", price: 1750, oldPrice: 2250 },
  ],
};
test("updates matching dimensions and starting price while preserving other prices", () => {
  const result = updateSizePrices(
    [product, { slug: "single", price: 500 }],
    [
      { size: "25/35", price: 710 },
      { size: "60/90", price: 1890 },
    ],
  );
  assert.equal(result.count, 1);
  assert.equal(result.products[0].price, 710);
  assert.deepEqual(
    result.products[0].sizePrices.map((v) => v.price),
    [710, 990, 1890],
  );
  assert.deepEqual(
    result.products[0].sizePrices.map((v) => v.oldPrice),
    [920, 1250, 2250],
  );
  assert.equal(result.products[1].price, 500);
  assert.equal(product.price, 610);
});
test("removes old prices below new sale price and rejects invalid or duplicate inputs", () => {
  const result = updateSizePrices([product], [{ size: "25/35", price: 1000 }]);
  assert.equal(result.products[0].oldPrice, undefined);
  for (const updates of [
    [{ size: "25/35", price: 0 }],
    [{ size: "oops", price: 1 }],
    [
      { size: "25/35", price: 710 },
      { size: "25 × 35 cm", price: 800 },
    ],
  ])
    assert.throws(() => updateSizePrices([product], updates));
});
