import { Link } from "@tanstack/react-router";
import { type Product, formatTL } from "@/data/products";
import { isCustomProduct } from "@/data/customProducts";

export function ProductCard({
  product,
  artist,
}: {
  product: Product;
  artist?: { slug: string; label: string; image?: string };
}) {
  return (
    <Link
      to={artist ? "/kategori/$slug" : "/urun/$slug"}
      params={{ slug: artist?.slug ?? product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white transition hover:border-primary/30 hover:shadow-elegant"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img
          src={artist?.image ?? product.image}
          alt={product.name}
          loading="lazy"
          width={600}
          height={600}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.badge && !artist && (
            <span className="rounded-full bg-gradient-gold px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
              {product.badge}
            </span>
          )}
          {/* {product.oldPrice && product.oldPrice > product.price && (
            <span className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-extrabold text-white shadow-md ring-2 ring-white/40 drop-shadow-lg">
              %{Math.round((1 - product.price / product.oldPrice) * 100)} İndirim
            </span>
          )} */}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold leading-tight text-stone-900">
          {artist?.label ?? product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs text-stone-500">{product.shortDescription}</p>
        {artist && product.badge && (
          <p className="mt-2 text-sm font-semibold text-stone-700">{product.badge}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {isCustomProduct(product)
                ? `${formatTL(product.price)}'den başlayan`
                : formatTL(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                {formatTL(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
