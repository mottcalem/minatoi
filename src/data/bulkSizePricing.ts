import type { Product } from "./products";

/** Accept the dimension separators used by both the catalogue and CMS. */
export function sizeKey(size: string) {
  return size.toLowerCase().replace(/cm/g, "").replace(/\s/g, "").replace(/[×x/]/g, "*");
}

export function updateSizePrices(products: Product[], updates: { size: string; price: number }[]) {
  const prices = new Map<string, number>();
  for (const update of updates) {
    if (
      !/^\d+(?:[.,]\d+)?\*\d+(?:[.,]\d+)?$/.test(sizeKey(update.size)) ||
      !Number.isFinite(update.price) ||
      update.price <= 0
    ) {
      throw new Error("Geçerli bir ölçü ve sıfırdan büyük fiyat giriniz.");
    }
    if (prices.has(sizeKey(update.size))) throw new Error("Aynı ölçüyü bir kez giriniz.");
    prices.set(sizeKey(update.size), update.price);
  }
  let count = 0;
  const result = products.map((product) => {
    if (!product.sizes?.some((size) => prices.has(sizeKey(size)))) return product;
    const variants = product.sizes.map((size) => {
      const current = product.sizePrices?.find(
        (entry) => sizeKey(entry.size) === sizeKey(size),
      ) ?? { size, price: product.price, oldPrice: product.oldPrice };
      const price = prices.get(sizeKey(size));
      if (price === undefined) return current;
      return {
        ...current,
        price,
        oldPrice:
          current.oldPrice !== undefined && current.oldPrice >= price
            ? current.oldPrice
            : undefined,
      };
    });
    count++;
    return {
      ...product,
      sizePrices: variants,
      price: variants[0].price,
      oldPrice: variants[0].oldPrice,
    };
  });
  return { products: result, count };
}
