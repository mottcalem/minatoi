import { createFileRoute, Link } from "@tanstack/react-router";
import craftImg from "@/assets/craft.jpg";
import { CATEGORIES, type Product } from "@/data/products";
import { fetchProductsServer } from "@/data/adminProducts";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { formatTL } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Bulls — El Yapımı Hakiki Deri Ürünler" },
      { name: "description", content: "El yapımı hakiki deri cüzdan, kartlık ve gözlük kılıfları. Kapıda ödeme, hızlı kargo. The Bulls — Handcrafted Leather Goods." },
      { property: "og:title", content: "The Bulls — El Yapımı Hakiki Deri Ürünler" },
    ],
  }),
  loader: async () => {
    const products = await fetchProductsServer();
    return { products };
  },
  component: Index,
});

function Index() {
  const { products } = Route.useLoaderData();
  const cuzdanlar = products.filter((p) => p.category === "cuzdan");
  const kiliflar  = products.filter((p) => p.category === "kilif");

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-amber-100/60 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-stone-200/50 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 md:py-28 lg:grid-cols-2 relative z-10">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              El Yapımı · Hakiki Deri · Türkiye
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] text-stone-900 sm:text-5xl md:text-6xl">
              Derinin <br />
              <span className="text-gradient-gold">zamansız</span> <br />
              şıklığı.
            </h1>
            <p className="mt-5 max-w-lg text-base text-stone-500 sm:text-lg">
              Her cüzdan, her kartlık, her kılıf — sabırlı el işçiliğiyle, birinci sınıf hakiki deriden. Kullandıkça güzelleşir, sizinle birlikte yaşlanır.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/urunler" className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
                Koleksiyonu Keşfet
              </Link>
              <WhatsAppButton message="Merhaba, ürünleriniz hakkında bilgi almak istiyorum." variant="outline">
                Hızlı Sipariş
              </WhatsAppButton>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-stone-100 pt-8">
              {[
                { dt: "Ücretsiz Kargo", dd: "500₺ üzeri" },
                { dt: "Kapıda Ödeme", dd: "Tüm Türkiye" },
                { dt: "Kalite Garantisi", dd: "2 yıl" },
              ].map(({ dt, dd }) => (
                <div key={dt} className="text-center sm:text-left">
                  <dt className="text-xs text-stone-400">{dt}</dt>
                  <dd className="font-display text-sm font-bold text-stone-800">{dd}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero görsel */}
          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-gold opacity-10 blur-3xl" />
            {cuzdanlar[0] ? (
              <div className="relative">
                <img
                  src={cuzdanlar[0].images?.[8] ?? cuzdanlar[0].image}
                  alt="El yapımı deri cüzdan"
                  className="w-full rounded-[2rem] object-cover shadow-elegant max-h-[560px]"
                />
                <div className="absolute -bottom-5 -left-6 rounded-2xl bg-white px-5 py-3.5 shadow-elegant">
                  <p className="text-xs text-stone-400">En Çok Satan</p>
                  <p className="mt-0.5 font-display text-sm font-bold text-stone-900">{cuzdanlar[0].name.split("—")[0].trim()}</p>
                  <p className="text-sm font-semibold text-primary">{formatTL(cuzdanlar[0].price)}</p>
                </div>
              </div>
            ) : (
              <div className="w-full rounded-[2rem] bg-stone-100 shadow-elegant aspect-[4/5]" />
            )}
          </div>
        </div>
      </section>

      {/* ─── KATEGORİLER ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Koleksiyon</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">Kategoriler</h2>
          </div>
          <Link to="/urunler" className="hidden text-sm font-medium text-primary hover:underline sm:inline">Tümünü Gör →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.filter((c) => c.slug !== "gozluk").map((c) => (
            <Link key={c.slug} to="/kategori/$slug" params={{ slug: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm hover:shadow-elegant transition-shadow">
              <img src={c.image} alt={c.label} loading="lazy" className="h-64 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-stone-900/10 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <h3 className="font-display text-xl font-bold text-white">{c.label}</h3>
                <p className="mt-1 text-sm text-white/80">{c.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/90 group-hover:gap-2 transition-all">Keşfet <span>→</span></span>
              </div>
            </Link>
          ))}
          <div className="group relative overflow-hidden rounded-2xl border border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center py-16 text-center px-6">
            <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-500">Yakında</span>
            <h3 className="mt-3 font-display text-xl font-bold text-stone-400">Gözlük</h3>
            <p className="mt-1 text-sm text-stone-400">Premium güneş gözlükleri çok yakında.</p>
          </div>
        </div>
      </section>

      {/* ─── CÜZDAN & KARTLIK ─────────────────────────────────────── */}
      {cuzdanlar.length > 0 && (
        <section className="bg-stone-50 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">El Yapımı</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">Cüzdan & Kartlık</h2>
                <p className="mt-2 max-w-xl text-stone-500">Birinci sınıf hakiki deri, sabırlı el dikişi.</p>
              </div>
              <Link to="/kategori/$slug" params={{ slug: "cuzdan" }} className="hidden text-sm font-medium text-primary hover:underline sm:inline">Tümünü Gör →</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cuzdanlar.slice(0, 3).map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── ZANAAT ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-amber-50 blur-2xl opacity-70" />
            <img src={craftImg} alt="El yapımı deri işçiliği" loading="lazy" className="w-full rounded-3xl object-cover shadow-elegant" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Atölyemiz</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-stone-900 sm:text-4xl">Her ürün tek tek, elle üretilir.</h2>
            <p className="mt-4 text-stone-500 leading-relaxed">
              Birinci sınıf dana derisi, sabırlı el dikişi ve detaylara verilen özen — The Bulls el yapımı deri koleksiyonunun farkı budur.
            </p>
            <ul className="mt-6 space-y-3">
              {["%100 hakiki deri, el dikişi", "Kenar perdahı elle yapılır", "Türkiye geneli kapıda ödeme", "WhatsApp'tan birebir destek"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-stone-700">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">✓</span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link to="/urunler" className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110">
                Tüm Ürünleri Gör
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GÖZLÜK KILIFLAR ──────────────────────────────────────── */}
      {kiliflar.length > 0 && (
        <section className="bg-stone-50 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Aksesuar</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">Gözlük Kılıfları</h2>
                <p className="mt-2 max-w-lg text-stone-500">Gözlüğünü hakiki deriyle koruyun.</p>
              </div>
              <Link to="/kategori/$slug" params={{ slug: "kilif" }} className="hidden text-sm font-medium text-primary hover:underline sm:inline">Tümünü Gör →</Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {kiliflar.slice(0, 3).map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-3xl border border-stone-100 bg-gradient-to-br from-stone-50 to-amber-50/60 px-8 py-16 text-center shadow-sm md:px-16">
          <h2 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">Aklındaki modeli bulamadın mı?</h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-500">WhatsApp'tan yaz, sana özel öneri ve stok bilgisini hemen ileteyim.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <WhatsAppButton size="lg" message="Merhaba, model önerisi almak istiyorum.">WhatsApp ile Yaz</WhatsAppButton>
            <Link to="/urunler" className="inline-flex items-center rounded-full border border-stone-200 bg-white px-7 py-4 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition">
              Tüm Koleksiyon
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
