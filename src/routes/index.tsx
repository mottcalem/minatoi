import { productInCategory } from "@/data/productCategories";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import { getBanners } from "@/data/bannerActions";
import { getHeroContent } from "@/data/heroActions";
import { getAboutContent } from "@/data/aboutActions";
import { type AboutContent } from "@/data/about";
import craftImg from "@/assets/craft.jpg";
import glassesImg from "@/assets/cat-glasses.jpg";
import { createFileRoute, Link } from "@tanstack/react-router";
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
      { property: "og:url", content: "https://minatoi.ugurdogan.net/" },
      {
        property: "og:image",
        content: "https://minatoi.ugurdogan.net/images/products/sokrates/man.jpg",
      },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://minatoi.ugurdogan.net/" }],
  }),
  loader: async () => {
    const [products, banners, categories, hero, about] = await Promise.all([
      fetchProductsServer(),
      getBanners(),
      getCategories(),
      getHeroContent(),
      getAboutContent(),
    ]);
    return { products, banners, categories, hero, about };
  },
  component: Index,
});

function Index() {
  const { products, banners, categories, hero, about } = Route.useLoaderData();
  const featuredProducts = products.filter((product) => product.featured);
  const cuzdanlar = products.filter((p) => p.category === "cuzdan");
  const kiliflar = products.filter((p) => p.category === "kilif");
  const additionalCategorySections = categories
    .filter((category) => category.slug !== "cuzdan" && category.slug !== "kilif")
    .map((category) => ({
      category,
      products: products.filter((product) => productInCategory(product, category.slug)),
    }))
    .filter(({ products: categoryProducts }) => categoryProducts.length > 0);
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
      <ProductCarousel
        products={featuredProducts}
        eyebrow="Seçtiklerimiz"
        title="Öne Çıkan Ürünler"
        description="MinaToi koleksiyonundan öne çıkan tasarımlar."
      />
      {/* ─── CÜZDAN & KARTLIK ─────────────────────────────────────── */}
      <ProductCarousel
        products={cuzdanlar}
        eyebrow="El Yapımı"
        title="Cüzdan & Kartlık"
        description="Birinci sınıf hakiki deri, sabırlı el dikişi."
        viewAllSlug="cuzdan"
      />
      {/* ─── TANITIM BÖLÜMÜ ───────────────────────────────────────── */}
      <AboutSection content={about} />
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
      {additionalCategorySections.map(({ category, products: categoryProducts }) => (
        <ProductCarousel
          key={category.slug}
          products={categoryProducts}
          eyebrow="Koleksiyon"
          title={category.label}
          description={category.description}
          viewAllSlug={category.slug}
        />
      ))}
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

/**
 * Anasayfadaki tanıtım bölümü: görsel + başlık + zengin metin + buton.
 * İçerik yönetim panelindeki "Tanıtım Bölümü" sekmesinden düzenlenir.
 */
function AboutSection({ content }: { content: AboutContent }) {
  const image = content.imageUrl || craftImg;
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-amber-50 blur-2xl opacity-70" />
          {content.videoUrl ? (
            <video
              src={content.videoUrl}
              className="w-full rounded-3xl object-cover shadow-elegant"
              autoPlay
              muted
              loop
              playsInline
              controls
              aria-label={content.title}
            />
          ) : (
            <img
              src={image}
              alt={content.imageAlt || "Bölüm görseli"}
              loading="lazy"
              className="w-full rounded-3xl object-cover shadow-elegant"
            />
          )}
        </div>
        <div>
          {content.eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              {content.eyebrow}
            </p>
          )}
          <h2 className="mt-3 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
            {content.title}
          </h2>
          {content.bodyHtml && (
            <div
              className="blog-content mt-4 max-w-xl"
              dangerouslySetInnerHTML={{ __html: content.bodyHtml }}
            />
          )}
          {content.ctaLabel && (
            <div className="mt-8">
              {content.ctaHref.startsWith("http") ? (
                <a
                  href={content.ctaHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  {content.ctaLabel}
                </a>
              ) : (
                <Link
                  to={content.ctaHref}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
                >
                  {content.ctaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
