import { formatTL, type Product } from "@/data/products";
import { priceForSize } from "@/data/productPricing";

export function CustomDesignPrice({ product, size }: { product: Product; size: string }) {
  const { price, oldPrice } = priceForSize(product, size);

  return (
    <div
      className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5"
      aria-live="polite"
      aria-atomic="true"
    >
      <p className="text-sm font-semibold text-stone-700">Seçili ölçü: {size}</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          {formatTL(price)}
        </span>
        {oldPrice != null && oldPrice > price && (
          <span className="text-lg text-muted-foreground line-through">
            <span className="sr-only">Önceki fiyat: </span>
            {formatTL(oldPrice)}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-stone-600">Kargo ücretsiz</p>
    </div>
  );
}
