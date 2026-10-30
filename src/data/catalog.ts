import type { Product } from "./products";

/** Keep editable database rows separate from virtual order templates. */
export function catalogProducts(stored: Product[], templates: Product[]) {
  return {
    managed: stored,
    storefront: [
      ...stored
        .filter((product) => product.category !== "cuzdan")
        .map((product) => {
          const template = templates.find((item) => item.slug === product.slug);
          return template && "customization" in template
            ? { ...product, customization: template.customization }
            : product;
        }),
      ...templates.filter((template) => !stored.some((product) => product.slug === template.slug)),
    ],
  };
}

export function isCostumeProduct(product: Product) {
  return (
    product.category === "patili-dostalara-ozel" &&
    !["i-llustrasyonlu-portre", "illustrasyonlu-portre", "kostumlu-portre"].includes(product.slug)
  );
}
