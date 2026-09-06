import { CategoryCarousel } from "@/components/CategoryCarousel";
import { getBanners } from "@/data/bannerActions";
import { getHeroContent } from "@/data/heroActions";
import { createFileRoute, Link } from "@tanstack/react-router";
import craftImg from "@/assets/craft.jpg";
import glassesImg from "@/assets/cat-glasses.jpg";
import casesImg from "@/assets/cat-cases.jpg";
import walletsImg from "@/assets/cat-wallets.jpg";
import { getCategories } from "@/data/categoryActions";
import { fetchProductsServer } from "@/data/adminProducts";
import { ProductCarousel } from "@/components/ProductCarousel";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { HomeBannerSlider } from "@/components/HomeBannerSlider";

/** Bilinen kategorilerin varsayılan karusel görselleri; yüklenmiş görsel yoksa kullanılır. */
const CATEGORY_IMAGES: Record<string, string> = {
  cuzdan: walletsImg,
  kilif: casesImg,
  gozluk: glassesImg,
};

function categoryImage(slug: string, uploaded?: string): string {
  return uploaded ?? CATEGORY_IMAGES[slug] ?? craftImg;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "MinaToi — Cam Tablo Modelleri - Minatoi -Temperli cam duvar tabloları ve kişiye özel tasarımlar",
      },
      {
        name: "description",
        content:
          "Minatoi, yaşam alanlarınıza estetik ve modern bir dokunuş katmak için özenle hazırlanmış cam tablo koleksiyonları sunar.",
      },
      {
        name: "keywords",
        content: "cam tablo, minatoi, temperli cam, duvar tablosu, kişiye özel tablo",
      },
      {
        property: "og:title",
        content:
          "MinaToi — Cam Tablo Modelleri - Minatoi -Temperli cam duvar tabloları ve kişiye özel tasarımlar",
      },
      {
        property: "og:description",
        content:
          "Minatoi, yaşam alanlarınıza estetik ve modern bir dokunuş katmak için özenle hazırlanmış cam tablo koleksiyonları sunar.",
      },
      { property: "og:url", content: "https://minatoi.com/" },
      { property: "og:image", content: "https://minatoi.com/images/products/sokrates/man.jpg" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://minatoi.com/" }],
  }),
  loader: async () => {
    const [products, banners, categories, hero] = await Promise.all([
      fetchProductsServer(),
      getBanners(),
      getCategories(),
      getHeroContent(),
    ]);
    return { products, banners, categories, hero };
  },
  component: Index,
});

function Index() {
  const { products, banners, categories, hero } = Route.useLoaderData();
  const cuzdanlar = products.filter((p) => p.category === "cuzdan");
  const kiliflar = products.filter((p) => p.category === "kilif");
  const sliderProducts = [...products]
    .sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    .slice(0, 5);
  const customSlides = banners.filter(
    (banner) => banner.image !== "/images/banners/banner-minatoi.png",
  );
  const heroSlides = customSlides.length
    ? customSlides
    : sliderProducts.map((product) => ({
        id: product.slug,
        image: product.images?.[8] ?? product.images?.[0] ?? product.image,
        alt: product.name,
        width: 800,
        height: 800,
        product,
      }));

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
            {hero.badge && (
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {hero.badge}
              </span>
            )}
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] text-stone-900 sm:text-5xl md:text-6xl">
              {hero.titleTop} <br />
              {hero.titleHighlight && (
                <>
                  <span className="text-gradient-gold">{hero.titleHighlight}</span> <br />
                </>
              )}
              {hero.titleBottom}
            </h1>
            {hero.description && (
              <p className="mt-5 max-w-lg text-base text-stone-500 sm:text-lg">
                {hero.description}
              </p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              {hero.ctaPrimaryHref.startsWith("http") ? (
                <a
                  href={hero.ctaPrimaryHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  {hero.ctaPrimaryLabel}
                </a>
              ) : (
                <Link
                  to={hero.ctaPrimaryHref}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  {hero.ctaPrimaryLabel}
                </Link>
              )}
              <WhatsAppButton
                message="Merhaba, ürünleriniz hakkında bilgi almak istiyorum."
                variant="outline"
              >
                {hero.ctaSecondaryLabel}
              </WhatsAppButton>
            </div>
            {hero.stats.length > 0 && (
              <dl className="mt-10 grid grid-cols-3 gap-3 border-t border-stone-100 pt-8">
                {hero.stats.map(({ label, value }) => (
                  <div key={label} className="text-center sm:text-left">
                    <dt className="text-xs text-stone-400">{label}</dt>
                    <dd className="font-display text-sm font-bold text-stone-800">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <HomeBannerSlider banners={heroSlides} />
        </div>
      </section>
      <CategoryCarousel
        categories={categories.map((category) => ({
          ...category,
          image: categoryImage(category.slug, category.image),
        }))}
      />
      {/* ─── CÜZDAN & KARTLIK ─────────────────────────────────────── */}
      <ProductCarousel
        products={cuzdanlar}
        eyebrow="El Yapımı"
        title="Cüzdan & Kartlık"
        description="Birinci sınıf hakiki deri, sabırlı el dikişi."
        viewAllSlug="cuzdan"
      />
      {/* ─── ZANAAT ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-amber-50 blur-2xl opacity-70" />
            <img
              src={craftImg}
              alt="El yapımı deri işçiliği"
              loading="lazy"
              className="w-full rounded-3xl object-cover shadow-elegant"
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">MinaToi</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
              Minatoi Cam Tablo
            </h2>
            <p className="mt-4 leading-relaxed text-stone-500">
Minatoi, yaşam alanlarına modern, estetik ve kişisel bir dokunuş katmak için hazırlanan dekoratif cam tablo koleksiyonları sunar. 4 mm temperli cam üzerine UV baskı teknolojisiyle hazırlanan cam tablolar; parlak yüzey etkisi, canlı renkleri ve dayanıklı yapısıyla ev, ofis ve hediye dekorasyonunda dikkat çekici bir seçenek oluşturur.


            </p>
            <p className="mt-4 leading-relaxed text-stone-500">
Koleksiyonlarımızda kedi temalı cam tablolar, göz ve nazar tasarımları, zen ve doğa esintili çalışmalar, sanatçı albümü seçkileri, afiş tarzı modern tasarımlar, gerçek üstü kompozisyonlar ve hayvan figürlü dekoratif tablolar yer alır. Ayrıca kişiye özel cam tablo seçenekleriyle kendi fotoğrafınızı ya da sevdiğiniz bir görseli cam yüzeye taşıyabilir; patili dostlara özel tasarımlarla kedi veya köpeğiniz için özel bir tablo hazırlatabilirsiniz.


            </p>
<p className="mt-4 leading-relaxed text-stone-500">
  Minatoi cam tablolar, çerçevesiz ve modern görünümüyle duvar dekorasyonunda sade ama güçlü bir etki oluşturur. Ürünlerimiz 4 mm temperli cam üzerine basılır, kolay temizlenebilir parlak yüzeyiyle uzun süre canlı görünümünü korur. Türkiye’nin her yerine ücretsiz kargo ve hasarsız teslimat garantisiyle hazırlanan koleksiyonlarımızı inceleyerek yaşam alanınıza uygun cam tablo modelini seçebilirsiniz.

            </p>
            <p className="mt-4 leading-relaxed text-stone-500">
Cam tablo hakkında daha ayrıntılı bilgi için Cam Tablo Nedir? Özellikleri, Avantajları ve Kullanım Alanları rehberimizi inceleyin.
            </p>
            <div className="mt-8">
              <Link
                to="/urunler"
                className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
              >
                Tüm Ürünleri Gör
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* ─── MÜŞTERİ YORUMLARI ───────────────────────────────────── */}
      <TestimonialsCarousel />
      {/* ─── GÖZLÜK KILIFLAR ──────────────────────────────────────── */}
      <ProductCarousel
        products={kiliflar}
        eyebrow="Aksesuar"
        title="Gözlük Kılıfları"
        description="Gözlüğünü hakiki deriyle koruyun."
        viewAllSlug="kilif"
      />
      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-3xl border border-stone-100 bg-gradient-to-br from-stone-50 to-amber-50/60 px-8 py-16 text-center shadow-sm md:px-16">
          <h2 className="font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            Aklındaki modeli bulamadın mı?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-500">
            WhatsApp'tan yaz, sana özel öneri ve stok bilgisini hemen ileteyim.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <WhatsAppButton size="lg" message="Merhaba, model önerisi almak istiyorum.">
              WhatsApp ile Yaz
            </WhatsAppButton>
            <Link
              to="/urunler"
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-7 py-4 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              Tüm Koleksiyon
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
