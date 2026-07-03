import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CATEGORIES, type Category } from "@/data/products";
import { fetchProductsServer } from "@/data/adminProducts";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/kategori/$slug")({
  head: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    const title = cat ? `${cat.label} — The Bulls` : "Kategori — The Bulls";
    return {
      meta: [
        { title },
        { name: "description", content: cat?.description ?? "The Bulls kategori ürünleri." },
      ],
    };
  },
  loader: async ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    const all = await fetchProductsServer();
    const products = all.filter((p) => p.category === (params.slug as Category));
    return { cat, products };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Kategori bulunamadı</h1>
      <Link to="/urunler" className="mt-6 inline-block text-primary hover:underline">Tüm ürünlere dön</Link>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, products } = Route.useLoaderData();
  const { slug } = Route.useParams();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <nav className="mb-6 text-xs text-stone-400">
        <Link to="/" className="hover:text-primary transition-colors">Anasayfa</Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{cat.label}</span>
      </nav>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Kategori</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">{cat.label}</h1>
        <p className="mt-2 max-w-2xl text-stone-500">{cat.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/urunler" className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-medium text-stone-600 hover:border-primary hover:text-primary transition-colors">
            Tümü
          </Link>
          {CATEGORIES.filter((c) => c.slug !== slug).map((c) => (
            <Link
              key={c.slug}
              to="/kategori/$slug"
              params={{ slug: c.slug }}
              className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-medium text-stone-600 hover:border-primary hover:text-primary transition-colors"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </header>
      {products.length === 0 ? (
        <div className="py-20 text-center text-stone-400">Bu kategoride henüz ürün eklenmemiş.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </section>
  );
}
