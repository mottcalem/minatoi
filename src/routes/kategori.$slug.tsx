import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CATEGORIES, type Category } from "@/data/products";
import { fetchProductsServer } from "@/data/adminProducts";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/kategori/$slug")({
  head: ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    const catLabels: Record<string, { title: string; desc: string; keywords: string }> = {
      cuzdan: {
        title: "Deri Cüzdan & Kartlık — El Yapımı Hakiki Deri | TheBullsCraft",
        desc: "El yapımı hakiki deri cüzdan ve kartlık modelleri. SOKRATES, FREGE ve PHILO. %100 hakiki deri, el dikişi, RFID koruma. Kapıda ödeme.",
        keywords: "deri cüzdan, hakiki deri cüzdan, el yapımı cüzdan, erkek deri cüzdan, deri kartlık, slim kartlık, RFID korumalı cüzdan",
      },
      kilif: {
        title: "Deri Gözlük Kılıfı — El Yapımı Hakiki Deri | TheBullsCraft",
        desc: "El yapımı hakiki deri gözlük kılıfları. Çıtçıt kapaklı, yumuşak iç astarlı, her boyut gözlüğe uygun. %100 hakiki deri.",
        keywords: "deri gözlük kılıfı, hakiki deri kılıf, el yapımı gözlük kılıfı, deri aksesuar",
      },
      gozluk: {
        title: "Güneş Gözlüğü — UV Korumalı | TheBullsCraft",
        desc: "EN ISO 12312-1:2013 standartlarına uygun, CE belgeli, UV korumalı gradient camlı güneş gözlükleri. Urban, Heritage ve Modern seriler.",
        keywords: "güneş gözlüğü, UV korumalı gözlük, CE belgeli gözlük, gradient cam gözlük",
      },
    };
    const info = catLabels[params.slug];
    const title = info?.title ?? (cat ? `${cat.label} — TheBullsCraft` : "Kategori — TheBullsCraft");
    const desc = info?.desc ?? (cat?.description ?? "TheBullsCraft kategori ürünleri.");
    const canonical = `https://thebullscraft.com/kategori/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { name: "keywords", content: info?.keywords ?? "deri ürünler, TheBullsCraft" },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: canonical },
        { name: "robots", content: "index, follow" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  loader: async ({ params }) => {
    const cat = CATEGORIES.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    const all = await fetchProductsServer();
    const products = [...all].reverse().filter((p) => p.category === (params.slug as Category));
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
