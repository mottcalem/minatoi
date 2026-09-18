import type { Product } from "./products";

/**
 * Ürünleri eklenme sırasına bağlı kalmadan, fakat her ziyaretçide aynı kalan
 * bir sırada gösterir. Bu sayede yeni eklenen benzer ürünler listenin başında
 * kümelenmez ve SSR/client hydrate sırasında sıra değişmez.
 */
export function mixProducts(products: Product[]): Product[] {
  const mixed = [...products];
  let seed = mixed.reduce((value, product) => hash(`${value}:${product.slug}`), 0x811c9dc5);

  for (let index = mixed.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const target = seed % (index + 1);
    [mixed[index], mixed[target]] = [mixed[target], mixed[index]];
  }

  return mixed;
}

function hash(value: string): number {
  let result = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 0x01000193);
  }
  return result >>> 0;
}
