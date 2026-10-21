import test from "node:test";
import assert from "node:assert/strict";
import { catalogProducts, isCostumeProduct } from "../src/data/catalog.ts";
import { CUSTOM_PRODUCTS } from "../src/data/customProducts.ts";
import { validateProducts, writeProductRows } from "../server/utils/productRepository.ts";
import { customContentSchema } from "../src/data/customContentSchema.ts";
import { DEFAULT_CUSTOM_CONTENT } from "../src/data/customContent.ts";

const { customization, ...product } = CUSTOM_PRODUCTS[0];
test("virtual customization templates never enter the managed catalog save", async () => {
  const stored = [
    { ...product, slug: "regular" },
    { ...product, slug: "hidden-wallet", category: "cuzdan" },
  ];
  const catalog = catalogProducts(stored, CUSTOM_PRODUCTS);
  assert.throws(() => validateProducts(catalog.storefront), /Desteklenmeyen/);
  assert.doesNotThrow(() => validateProducts(catalog.managed));
  assert.equal(catalog.managed.length, 2); // hidden rows must survive full-list updates
  const queries = [];
  const db = {
    query: async (sql, params) => {
      queries.push({ sql, params });
      return { rows: [{ id: 1 }] };
    },
  };
  const updated = catalog.managed.filter((item) => item.slug !== "regular");
  updated[0] = {
    ...updated[0],
    image: "/images/new.jpg",
    images: ["/images/new.jpg", "/images/old.jpg"],
  };
  await writeProductRows(db, updated);
  assert.deepEqual(
    queries.find((q) => q.sql.includes("unnest($2::text[])")).params[1],
    updated[0].images,
  );
  assert.deepEqual(queries.at(-1).params, [["hidden-wallet"]]);
});
test("saved catalog records override templates without duplicate product slugs", () => {
  const stored = [{ ...product, image: "/images/edited.jpg" }];
  const result = catalogProducts(stored, CUSTOM_PRODUCTS).storefront;
  assert.equal(result.filter((item) => item.slug === product.slug).length, 1);
  assert.equal(result.find((item) => item.slug === product.slug).image, "/images/edited.jpg");
});
test("costume collection excludes category cards while retaining costume products", () => {
  const items = ["i-llustrasyonlu-portre", "kostumlu-portre", "korsan", "prenses"].map((slug) => ({
    ...product,
    slug,
    category: "patili-dostalara-ozel",
  }));
  assert.deepEqual(
    items.filter(isCostumeProduct).map((item) => item.slug),
    ["korsan", "prenses"],
  );
});
test("custom content preserves configurable galleries and three combined personal styles", () => {
  assert.deepEqual(customContentSchema.parse(DEFAULT_CUSTOM_CONTENT), DEFAULT_CUSTOM_CONTENT);
  assert.deepEqual(DEFAULT_CUSTOM_CONTENT.styles, ["Kara kalem", "Sulu boya", "Mozaik yağlıboya"]);
  const edited = structuredClone(DEFAULT_CUSTOM_CONTENT);
  edited.styles.push("Yeni tarz");
  edited.examples.petCostume.reverse();
  edited.examples.petIllustration.push({
    label: "Yeni örnek",
    image: "/images/uploads/products/example/test.jpg",
  });
  edited.covers.personalPrint = "/images/uploads/products/example/cover.jpg";
  assert.deepEqual(customContentSchema.parse(edited), edited);
  edited.covers.personalPrint = "//external.example/image.jpg";
  assert.equal(customContentSchema.safeParse(edited).success, false);
  edited.styles = [];
  assert.equal(customContentSchema.safeParse(edited).success, false);
});
