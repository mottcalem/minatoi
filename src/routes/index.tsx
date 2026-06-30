import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import craftImg from "@/assets/craft.jpg";
import { CATEGORIES, PRODUCTS } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TheBullsCraft — El Yapımı Deri Ürünler & Premium Gözlük" },
      { name: "description", content: "TheBullsCraft koleksiyonu: el yapımı deri gözlük kılıfları, cüzdanlar ve UV400 korumalı premium güneş gözlükleri. Kapıda ödeme ve WhatsApp destek." },
      { property: "og:title", content: "TheBullsCraft — El Yapımı Deri Ürünler" },
      { property: "og:description", content: "Premium gözlükler, el yapımı deri kılıflar ve cüzdanlar." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = PRODUCTS.slice(0, 8);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              El Yapımı Deri · Premium Gözlük
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl md:text-6xl">
              Tarzını <span className="text-gradient-gold">zanaatkârlıkla</span> tamamla.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              TheBullsCraft; el dikişli deri kılıflar ve klasik cüzdanları, UV400 korumalı premium güneş gözlükleriyle bir araya getiriyor. Deri ürünlerimiz tek tek elde işlenir; gözlüklerimiz ise özenle seçilmiş premium modellerdir.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/urunler"
                className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
              >
                Koleksiyonu Keşfet →
              </Link>
              <WhatsAppButton message="Merhaba, TheBullsCraft ürünleri hakkında bilgi almak istiyorum.">
                Hızlı Sipariş
              </WhatsAppButton>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-center sm:text-left">
              <div><dt className="text-xs text-muted-foreground">Ücretsiz Kargo</dt><dd className="font-display text-base font-semibold">500₺ üzeri</dd></div>
              <div><dt className="text-xs text-muted-foreground">Kapıda Ödeme</dt><dd className="font-display text-base font-semibold">Tüm Türkiye</dd></div>
              <div><dt className="text-xs text-muted-foreground">Garanti</dt><dd className="font-display text-base font-semibold">2 yıl</dd></div>
            </dl>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-gold opacity-20 blur-3xl" />
            <img
              src={heroImg}
              alt="Premium gözlük ve el yapımı deri kılıf"
              width={1600}
              height={1100}
              className="w-full rounded-3xl object-cover shadow-elegant"
            />
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Kategoriler</h2>
            <p className="mt-2 text-muted-foreground">Sana en yakışanı seç.</p>
          </div>
          <Link to="/urunler" className="hidden text-sm text-primary hover:underline sm:inline">Tümü →</Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              to="/kategori/$slug"
              params={{ slug: c.slug }}
              className="group relative overflow-hidden rounded-2xl border border-border"
            >
              <img src={c.image} alt={c.label} loading="lazy" width={800} height={800} className="h-72 w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <h3 className="font-display text-xl font-bold text-white drop-shadow">{c.label}</h3>
                <p className="text-sm text-white/85 drop-shadow">{c.description}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-white drop-shadow">Keşfet →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Öne Çıkanlar</h2>
            <p className="mt-2 text-muted-foreground">En çok sevilen modellerden bir seçki.</p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.slug} product={p} />)}
        </div>
        <div className="mt-10 text-center">
          <Link to="/urunler" className="inline-flex rounded-full border border-primary/40 px-6 py-3 text-sm font-semibold text-primary hover:bg-primary/10">
            Tüm Ürünleri Gör
          </Link>
        </div>
      </section>

      {/* CRAFT STORY */}
      <section className="bg-card/40 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-2">
          <img src={craftImg} alt="El yapımı zanaat" loading="lazy" width={1200} height={900} className="rounded-3xl object-cover shadow-elegant" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Atölyemiz</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Deri ürünlerimiz tek tek, elde üretilir.</h2>
            <p className="mt-4 text-muted-foreground">
              Birinci sınıf dana derisi, sabırlı el dikişi ve detaylara verilen özen — TheBullsCraft’in el yapımı deri koleksiyonunun farkı budur. Deri ürünlerimiz kullandıkça güzelleşir, sizinle bir hikâye biriktirir. Gözlük koleksiyonumuz ise özenle seçilmiş, UV400 korumalı premium modellerden oluşur.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "%100 hakiki deri, el dikişi",
                "UV400 korumalı premium lensler",
                "Türkiye geneli kapıda ödeme",
                "WhatsApp'tan birebir destek",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-xs">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-3xl border border-border bg-gradient-to-br from-card to-secondary p-10 text-center shadow-elegant md:p-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Aklındaki modeli bulamadın mı?</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            WhatsApp'tan yaz, sana özel öneri ve stok bilgisini hemen ileyelim. Kapıda ödeme ile risksiz alışveriş.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <WhatsAppButton size="lg" message="Merhaba, model önerisi almak istiyorum.">
              Hemen WhatsApp'tan Yaz
            </WhatsAppButton>
            <Link to="/urunler" className="inline-flex items-center rounded-full border border-border px-6 py-4 text-sm font-semibold hover:bg-secondary">
              Tüm Koleksiyon
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
