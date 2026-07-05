import { createFileRoute, Link } from "@tanstack/react-router";
import { CATEGORIES } from "@/data/products";
import { fetchProductsServer } from "@/data/adminProducts";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/urunler")({
  head: () => ({
    meta: [
      { title: "Tüm Ürünler — El Yapımı Hakiki Deri Cüzdan & Kartlık | TheBullsCraft" },
      {
        name: "description",
        content:
          "TheBullsCraft el yapımı hakiki deri cüzdan, kartlık ve gözlük kılıfları koleksiyonu. %100 hakiki deri, el dikişi, Türkiye geneli kapıda ödeme.",
      },
      { name: "keywords", content: "deri cüzdan, hakiki deri kartlık, el yapımı deri, deri gözlük kılıfı, TheBullsCraft ürünler" },
      { property: "og:title", content: "Tüm Ürünler — TheBullsCraft El Yapımı Deri" },
      { property: "og:description", content: "El yapımı hakiki deri cüzdan, kartlık ve gözlük kılıfları koleksiyonu." },
      { property: "og:url", content: "https://thebullscraft.com/urunler" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://thebullscraft.com/urunler" }],
  }),
  loader: async () => {
    const products = await fetchProductsServer();
    return { products };
  },
  component: AllProducts,
});

function AllProducts() {
  const { products } = Route.useLoaderData();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Koleksiyon</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">Tüm Ürünler</h1>
        <p className="mt-2 text-stone-500">{products.length} ürün listeleniyor.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link to="/urunler" className="rounded-full bg-stone-900 px-4 py-1.5 text-xs font-semibold text-white">
            Tümü
          </Link>
          {CATEGORIES.map((c) => (
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
        <div className="py-20 text-center text-stone-400">Henüz ürün eklenmemiş.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
      )}
    </section>
  );
}
