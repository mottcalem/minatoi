export type SizePrice = { size: string; price: number; oldPrice?: number };
export type PricedProduct = { price: number; oldPrice?: number; sizePrices?: SizePrice[] };

/** Shared by the product page and authoritative server checkout pricing. */
export function priceForSize(product: PricedProduct, size: string) {
  if (!product.sizePrices?.length) return { price: product.price, oldPrice: product.oldPrice };
  const variant = product.sizePrices.find((entry) => entry.size === size);
  if (!variant) throw new Error("Ürün ölçüsü için fiyat bulunamadı.");
  return { price: variant.price, oldPrice: variant.oldPrice };
}
