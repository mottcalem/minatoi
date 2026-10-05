/** New arrivals remain in their primary collection and also appear in this curated category. */
export function productInCategory(product: { category: string; badge?: string }, category: string) {
  return (
    product.category === category ||
    (category === "ressamlar" &&
      (product.category === "sanatci-albumu" || product.category.startsWith("ressam-"))) ||
    (category === "yeni-gelenler" && product.badge === "Yeni Gelenler")
  );
}
