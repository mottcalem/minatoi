export type SizePrice = { size: string; price: number; oldPrice?: number };
export type PricedProduct = { price: number; oldPrice?: number; sizePrices?: SizePrice[] };

/** Normalize only dimension notation; distinct named variants stay distinct. */
export function normalizeSize(size: string) {
  const dimensions = /^\s*(\d+(?:[.,]\d+)?)\s*[×xX*]\s*(\d+(?:[.,]\d+)?)\s*(cm)?\s*$/i.exec(size);
  return dimensions
    ? `${dimensions[1].replace(",", ".")}*${dimensions[2].replace(",", ".")}${dimensions[3] ? "cm" : ""}`
    : size;
}

/** Shared by the product page and authoritative server checkout pricing. */
export function priceForSize(product: PricedProduct, size: string) {
  if (!product.sizePrices?.length) return { price: product.price, oldPrice: product.oldPrice };
  const variant = product.sizePrices.find(
    (entry) => normalizeSize(entry.size) === normalizeSize(size),
  );
  if (!variant) throw new Error("Ürün ölçüsü için fiyat bulunamadı.");
  return { price: variant.price, oldPrice: variant.oldPrice };
}
