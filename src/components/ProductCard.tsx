import { Link } from "@tanstack/react-router";
import { type Product, formatTL } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to="/urun/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/50 hover:shadow-elegant"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-gradient-gold px-3 py-1 text-xs font-semibold text-primary-foreground">
            {product.badge}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold leading-tight">{product.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.shortDescription}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{formatTL(product.price)}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatTL(product.oldPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}