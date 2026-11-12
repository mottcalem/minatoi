import { isArtistCategory, type CategoryRecord } from "./categories.ts";

/** New arrivals remain in their primary collection and also appear in this curated category. */
export function productInCategory(
  product: { category: string; badge?: string },
  category: string,
  categories: CategoryRecord[] = [],
) {
  return (
    product.category === category ||
    (category === "sanatci-albumu" &&
      isArtistCategory(
        categories.find((item) => item.slug === product.category) ?? { slug: product.category },
      )) ||
    (category === "yeni-gelenler" && product.badge === "Yeni Gelenler")
  );
}
