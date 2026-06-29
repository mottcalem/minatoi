import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/urunler")({
  head: () => ({
    meta: [
      { title: "Tüm Ürünler — TheBullsCraft" },
      { name: "description", content: "TheBullsCraft tüm ürünleri: premium gözlükler, el yapımı deri kılıflar ve cüzdanlar." },
    ],
  }),
  component: AllProducts,
});

function AllProducts() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Tüm Ürünler</h1>
        <p className="mt-2 text-muted-foreground">{PRODUCTS.length} ürün listeleniyor.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Tümü</span>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/kategori/$slug"
              params={{ slug: c.slug }}
              className="rounded-full border border-border px-4 py-1.5 text-xs hover:bg-secondary"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {PRODUCTS.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </section>
  );
}