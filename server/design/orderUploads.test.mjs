import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createOrderUploadAPI, createUploadStore } from "./orderUploads.ts";
import { priceCart } from "../payments/core.ts";
import { cartPayload } from "../../src/data/orderCustomization.ts";
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  "base64",
);
const product = {
  slug: "personal",
  name: "Özel tablo",
  category: "kisiye-ozel",
  price: 1290,
  image: "/sample.jpg",
  sizes: ["25 × 35 cm", "35 × 50 cm"],
  sizePrices: [
    { size: "25 × 35 cm", price: 1290 },
    { size: "35 × 50 cm", price: 1790 },
  ],
};
const input = {
  slug: product.slug,
  size: product.sizes[0],
  orientation: "Yatay",
  style: "Sulu boya",
};
function request(overrides = {}, origin = "https://minatoi.com") {
  const form = new FormData();
  for (const [key, value] of Object.entries({ ...input, ...overrides })) form.set(key, value);
  if (!form.has("photo")) form.set("photo", new Blob([png], { type: "image/png" }), "foto.png");
  return new Request("https://minatoi.com/api/custom-order-uploads", {
    method: "POST",
    headers: { origin },
    body: form,
  });
}

test("uploaded photo survives cart serialization, server pricing and hydration without mixing designs", async () => {
  const dir = await mkdtemp(join(tmpdir(), "minatoi-uploads-"));
  try {
    const store = createUploadStore(dir);
    const api = createOrderUploadAPI(
      { NODE_ENV: "production", PAYTR_PUBLIC_URL: "https://minatoi.com" },
      async () => [product],
      store,
    );
    const first = await api(request());
    assert.equal(first.status, 200);
    const { customization } = await first.json();
    const second = await (await api(request({ style: "Karakalem" }))).json();
    const cart = cartPayload([
      { ...input, quantity: 1, customization },
      { ...input, quantity: 2, customization: second.customization },
    ]);
    const quote = priceCart(JSON.parse(JSON.stringify(cart)), [product]);
    assert.equal(quote.amount, 387000);
    const items = await store.hydrate(quote.items);
    assert.equal(items[0].customization.style, "Sulu boya");
    assert.equal(items[1].customization.style, "Karakalem");
    assert.notEqual(items[0].image, items[1].image);
    const image = await api(new Request("https://minatoi.com" + items[0].image));
    assert.equal(image.status, 200);
    assert.equal(image.headers.get("Cache-Control"), "private, no-store");
    assert.deepEqual(Buffer.from(await image.arrayBuffer()), png);
    await assert.rejects(store.hydrate([{ ...quote.items[0], slug: "other" }]));
    await assert.rejects(store.hydrate([{ ...quote.items[0], size: product.sizes[1] }]));
    await assert.rejects(store.read("../../.env"));
    assert.throws(
      () => priceCart([{ slug: product.slug, size: product.sizes[0], quantity: 1 }], [product]),
      /fotoğraf/,
    );
    assert.throws(() => priceCart([...cart, cart[0]], [product]), /tekrarlanan/);
    assert.throws(() => priceCart([{ ...cart[0], price: 1 }], [product]));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("upload rejects wrong origins, forged images, unsupported sizes and ordinary products", async () => {
  const dir = await mkdtemp(join(tmpdir(), "minatoi-uploads-"));
  try {
    const api = createOrderUploadAPI(
      { NODE_ENV: "production", PAYTR_PUBLIC_URL: "https://minatoi.com" },
      async () => [product, { ...product, slug: "ordinary", category: "glass" }],
      createUploadStore(dir),
    );
    assert.equal((await api(request({}, "https://evil.example"))).status, 403);
    assert.equal(
      (await api(request({ photo: new Blob(["fake"], { type: "image/png" }) }))).status,
      400,
    );
    assert.equal((await api(request({ size: "99 × 99 cm" }))).status, 400);
    assert.equal((await api(request({ slug: "ordinary" }))).status, 400);
    assert.equal(
      (await api(new Request("https://minatoi.com/api/custom-order-images/not-a-uuid"))).status,
      404,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
