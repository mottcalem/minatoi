import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CATEGORIES, productsByCategory, type Category } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/kategori/$slug")({
  head: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    const title = cat ? `${cat.label} — TheBullsCraft` : "Kategori — TheBullsCraft";
    return {
      meta: [
        { title },
        { name: "description", content: cat?.description ?? "TheBullsCraft kategori ürünleri." },
        { property: "og:title", content: title },
      ],
    };
  },
  loader: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Kategori bulunamadı</h1>
      <Link to="/urunler" className="mt-6 inline-block text-primary hover:underline">Tüm ürünlere dön</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Bir şeyler ters gitti</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const cat = CATEGORIES.find((c) => c.slug === (slug as Category))!;
  const items = productsByCategory(cat.slug);
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Kategori</p>
        <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{cat.label}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{cat.description}</p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </section>
  );
}