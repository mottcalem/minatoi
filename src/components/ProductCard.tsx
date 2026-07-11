import { Link } from "@tanstack/react-router";
import { type Product, formatTL } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/urun/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white transition hover:border-primary/30 hover:shadow-elegant"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={600}
          height={600}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span className="rounded-full bg-gradient-gold px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
              {product.badge}
            </span>
          )}
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
              %{Math.round((1 - product.price / product.oldPrice) * 100)} İndirim
            </span>
          )}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold leading-tight text-stone-900">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-stone-500">{product.shortDescription}</p>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">{formatTL(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-stone-400 line-through">{formatTL(product.oldPrice)}</span>
            )}
          </div>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            Kapıda Ödeme
          </span>
        </div>
      </div>
    </Link>
  );
}