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

test("existing artist works are editable and saved prices override album defaults", async () => {
  const { ARTISTS, managedArtistProducts, artistCollections } = await import("../src/data/artists.ts");
  const managed = managedArtistProducts([]);
  assert.equal(managed.length, 26);
  assert.doesNotThrow(() => validateProducts(managed));
  const edited = {
    ...managed[0],
    name: "Özel eser",
    price: 2500,
    sizes: ["42 × 61 cm", "80 × 115 cm"],
    sizePrices: [
      { size: "42 × 61 cm", price: 2500 },
      { size: "80 × 115 cm", price: 4900 },
    ],
  };
  assert.doesNotThrow(() => validateProducts([edited]));
  assert.equal(managedArtistProducts([edited]).length, 26);
  const albums = artistCollections([], [edited]);
  const work = albums.find((a) => a.slug === ARTISTS[0].slug).works[0];
  assert.equal(work.title, "Özel eser");
  assert.deepEqual(work.sizePrices, edited.sizePrices);
  assert.equal(albums[1].works[0].price, undefined);
});

test("new artist categories publish their own works and arbitrary size prices", async () => {
  const { artistCollections } = await import("../src/data/artists.ts");
  const artist = { slug: "ressam-yeni-sanatci", label: "Yeni Sanatçı", description: "Biyografi" };
  const work = {
    ...product,
    slug: "yeni-eser",
    category: artist.slug,
    sizes: ["33 × 47 cm", "Daire 60 cm"],
    sizePrices: [{ size: "33 × 47 cm", price: 1500 }, { size: "Daire 60 cm", price: 2300 }],
  };
  assert.doesNotThrow(() => validateProducts([work]));
  const album = artistCollections([artist], [work]).find((a) => a.slug === artist.slug);
  assert.equal(album.name, artist.label);
  assert.equal(album.biography, artist.description);
  assert.deepEqual(album.works[0].sizePrices, work.sizePrices);
});

test("personal designs match product detail prices and remain editable without losing uploads", async () => {
  const { managedPersonalProducts } = await import("../src/data/customProducts.ts");
  const { priceForSize } = await import("../src/data/productPricing.ts");
  const managed = managedPersonalProducts([]);
  assert.equal(managed.length, 4);
  assert.doesNotThrow(() => validateProducts(managed));
  for (const item of managed) {
    assert.deepEqual(item.sizes, ["25*35 cm", "35*50 cm", "50*70 cm", "60*90 cm"]);
    assert.deepEqual(item.sizes.map((size) => priceForSize(item, size).price), [610, 990, 1450, 1750]);
  }
  const edited = { ...managed[0], price: 700, sizePrices: managed[0].sizePrices.map((v, i) => i ? v : { ...v, price: 700 }) };
  assert.equal(managedPersonalProducts([edited]).length, 4);
  const storefront = catalogProducts([edited], CUSTOM_PRODUCTS).storefront;
  const result = storefront.find((p) => p.slug === edited.slug);
  assert.equal(priceForSize(result, "25*35 cm").price, 700);
  assert.equal(result.customization.group, "personal");
  assert.equal(storefront.filter((p) => p.slug === edited.slug).length, 1);
});
