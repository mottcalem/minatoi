import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useCart } from "@/components/CartProvider";
import { useState } from "react";
import { SERIES, formatTL } from "@/data/products";
import type { Product, GlassesDetails, WalletDetails } from "@/data/products";
import { getCategories } from "@/data/categoryActions";
import { getHeroContent } from "@/data/heroActions";
import { fetchProductsServer } from "@/data/adminProducts";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ProductCarousel } from "@/components/ProductCarousel";
import { TestimonialsCarousel } from "@/components/TestimonialsCarousel";

export const Route = createFileRoute("/urun/$slug")({
  head: ({ loaderData, params }) => {
    const product = loaderData?.product;
    const SITE = "https://minatoi.ugurdogan.net";
    const canonical = `${SITE}/urun/${params.slug}`;

    if (!product) {
      return {
        meta: [
          { title: "Ürün Bulunamadı — MinaToi" },
          { name: "robots", content: "noindex, follow" },
        ],
        links: [{ rel: "canonical", href: canonical }],
      };
    }

    const catLabel = loaderData?.categories?.find((c) => c.slug === product.category)?.label ?? "";
    const title = `${product.name} | MinaToi`;
    const desc = product.shortDescription
      ? `${product.shortDescription} ${formatTL(product.price)}. Kapıda ödeme, Türkiye geneli kargo.`
      : `${catLabel} — ${formatTL(product.price)}. Kapıda ödeme, Türkiye geneli kargo.`;
    const image = product.images?.[0] ? `${SITE}${product.images[0]}` : `${SITE}${product.image}`;

    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "product" },
        { property: "og:url", content: canonical },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: image },
        { name: "robots", content: "index, follow" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  loader: async ({ params }) => {
    const [all, categories, hero] = await Promise.all([
      fetchProductsServer(),
      getCategories(),
      getHeroContent(),
    ]);
    const product = all.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return {
      product: product as Product,
      categories,
      hero,
      related: all
        .filter((p) => p.category === product.category && p.slug !== params.slug)
        .slice(0, 10),
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Ürün bulunamadı</h1>
      <Link to="/urunler" className="mt-6 inline-block text-primary hover:underline">
        Tüm ürünlere dön
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Bir hata oluştu</h1>
      <p className="mt-2 text-stone-500">{error.message}</p>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { add, ready } = useCart();
  const [added, setAdded] = useState(false);
  const { product, categories, related, hero } = Route.useLoaderData();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] ?? "");
  const cat = categories.find((c) => c.slug === product.category) ?? {
    slug: product.category,
    label: product.category,
  };
  const waMsg =
    `Merhaba 👋\n"${product.name}" ürünü (${formatTL(product.price)}${
      selectedSize ? `, ölçü: ${selectedSize}` : ""
    }) hakkında bilgi almak istiyorum.\n` +
    `Stok durumu ve kargo süreci hakkında bilgi verir misiniz?`;

  return (
    <article className="mx-auto max-w-7xl px-4 py-10 overflow-x-hidden">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-stone-400 overflow-hidden">
        <Link to="/" className="hover:text-primary transition-colors">
          Anasayfa
        </Link>
        <span className="mx-2">/</span>
        <Link
          to="/kategori/$slug"
          params={{ slug: cat.slug }}
          className="hover:text-primary transition-colors"
        >
          {cat.label}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700 break-words">{product.name}</span>
      </nav>
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image gallery */}
        <div className="relative min-w-0">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-gold opacity-15 blur-2xl" />
          <ProductGallery product={product} />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {cat.label}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl break-words">
            {product.name}
          </h1>
          {product.glasses && (
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-accent">
              {SERIES[product.glasses.series].label}
            </p>
          )}
          <p className="mt-3 text-muted-foreground">{product.shortDescription}</p>

          {/* Ölçü varyasyonları — admin panelden tanımlanır */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-stone-700">
                Ölçü: <span className="font-normal text-stone-500">{selectedSize}</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Ölçü seçimi">
                {product.sizes.map((size: string) => (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={selectedSize === size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      selectedSize === size
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:border-stone-500"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary">
              {formatTL(product.price)}
            </span>
            {product.oldPrice && (
              <>
                <span className="text-base text-muted-foreground line-through">
                  {formatTL(product.oldPrice)}
                </span>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                  %{Math.round((1 - product.price / product.oldPrice) * 100)} indirim
                </span>
              </>
            )}
          </div>

          <div className="mt-7 space-y-3">
            <button
              type="button"
              disabled={!ready}
              onClick={() => { add(product, selectedSize); setAdded(true); }}
              className="block w-full rounded-full bg-gradient-gold px-6 py-4 text-center text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
            >
              {added ? "✓ Sepete eklendi — Tekrar ekle" : "Sepete ekle"}
            </button>
            {added && <a href="/sepet" className="block text-center text-sm underline">Sepetime git →</a>}
            <WhatsAppButton message={waMsg} size="lg" className="w-full">
              WhatsApp'tan Bu Ürünü Sor
            </WhatsAppButton>
          </div>

          {/* Features */}
          <div className="mt-8 rounded-2xl border border-stone-100 bg-stone-50 p-5">
            <h3 className="font-display text-base font-semibold text-stone-900">
              Ürün Özellikleri
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {product.features.map((f: string) => (
                <li key={f} className="flex items-start gap-3 text-stone-700">
                  <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          {hero.stats.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
              {hero.stats.slice(0, 3).map((stat, index) => (
                <div
                  key={`${stat.label}-${index}`}
                  className="rounded-xl border border-stone-100 bg-white p-3 shadow-sm"
                >
                  <div className="text-lg">{["🚚", "🛡️", "💵"][index]}</div>
                  <div className="mt-1 font-semibold text-stone-800">{stat.label}</div>
                  <div className="text-stone-400">{stat.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description — rich text (sunucuda sanitize edilir) */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">Ürün Açıklaması</h2>
        <div
          className="blog-content mt-3 max-w-3xl"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      </section>

      <TestimonialsCarousel />

      {related.length > 0 && (
        <ProductCarousel
          products={related}
          eyebrow="Koleksiyondan"
          title="Bunlar da ilginizi çekebilir"
          description="Aynı kategoriden diğer ürünlerimizi keşfedin."
          viewAllSlug={product.category}
        />
      )}

      {/* Glasses details */}
      {product.glasses && <GlassesInfo details={product.glasses} />}

      {/* Wallet details */}
      {product.wallet && <WalletInfo details={product.wallet} />}
    </article>
  );
}

function GlassesInfo({ details }: { details: GlassesDetails }) {
  return (
    <div className="mt-12 space-y-12">
      {/* Tech specs table */}
      <section>
        <h2 className="font-display text-2xl font-bold">Teknik Özellikler</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <tbody>
              {details.techSpecs.map((s, i) => (
                <tr key={s.label} className={i % 2 === 0 ? "bg-card/50" : ""}>
                  <th className="w-1/3 border-b border-border px-4 py-3 text-left font-medium text-foreground">
                    {s.label}
                  </th>
                  <td className="border-b border-border px-4 py-3 text-muted-foreground">
                    {s.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Filter info */}
      <section>
        <h2 className="font-display text-2xl font-bold">Filtre Bilgisi</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-base font-semibold">
              Filtre Tipi: {details.filterInfo.type}
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {details.filterInfo.notes.map((n, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-base font-semibold">
              Filtre Kategorisi: {details.filterInfo.category}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Işık geçirgenliği:{" "}
              <strong className="text-foreground">{details.filterInfo.lightTransmission}</strong>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Güçlü güneş ışığında, yaz aylarında sahil, şehir ve açık hava aktivitelerinde ideal
              koruma sağlar.
            </p>
          </div>
        </div>
      </section>

      {/* Materials */}
      <section>
        <h2 className="font-display text-2xl font-bold">Malzeme Özellikleri</h2>
        <p className="mt-2 text-sm text-muted-foreground">Üründe kullanılan malzemeler:</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {details.materials.map((m, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">
                ✓
              </span>
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* Care & Usage */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-bold">Bakım ve Temizlik</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gözlüğünüzün uzun ömürlü olması için aşağıdaki önerilere dikkat ediniz.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {details.care.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                {c}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl font-bold">Kullanım Önerileri</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {details.usage.map((u, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1 text-primary">•</span>
                {u}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Safety */}
      <section>
        <h2 className="font-display text-2xl font-bold">Güvenlik Bilgileri</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          {details.safety.map((s, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              {s}
            </li>
          ))}
        </ul>
      </section>

      {/* Box contents */}
      <section>
        <h2 className="font-display text-2xl font-bold">Kutu İçeriği</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {details.boxContents.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* Summary */}
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <h2 className="font-display text-xl font-bold">Kısa Teknik Özellikler</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {details.summary.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">
                ✓
              </span>
              {s}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function WalletInfo({ details }: { details: WalletDetails }) {
  return (
    <div className="mt-12 space-y-12">
      {/* Tech specs table */}
      <section>
        <h2 className="font-display text-2xl font-bold">Teknik Özellikler</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <tbody>
              {details.techSpecs.map((s, i) => (
                <tr key={s.label} className={i % 2 === 0 ? "bg-card/50" : ""}>
                  <th className="w-1/3 border-b border-border px-4 py-3 text-left font-medium text-foreground">
                    {s.label}
                  </th>
                  <td className="border-b border-border px-4 py-3 text-muted-foreground">
                    {s.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Materials */}
      <section>
        <h2 className="font-display text-2xl font-bold">Malzeme Özellikleri</h2>
        <p className="mt-2 text-sm text-muted-foreground">Üründe kullanılan malzemeler:</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {details.materials.map((m, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">
                ✓
              </span>
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* Care */}
      <section>
        <h2 className="font-display text-2xl font-bold">Bakım ve Temizlik</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cüzdanınızın uzun ömürlü olması için aşağıdaki önerilere dikkat ediniz.
        </p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          {details.care.map((c, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 text-primary">•</span>
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* Box contents */}
      <section>
        <h2 className="font-display text-2xl font-bold">Kutu İçeriği</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {details.boxContents.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
              <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                ✓
              </span>
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* Summary */}
      <section className="rounded-2xl border border-primary/20 bg-amber-50/60 p-6">
        <h2 className="font-display text-xl font-bold">Kısa Teknik Özellikler</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {details.summary.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
              <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                ✓
              </span>
              {s}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ProductGallery({ product }: { product: Product }) {
  const images = product.images?.length ? product.images : [product.image];
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {/* Ana görsel */}
      <div className="relative overflow-hidden rounded-3xl bg-stone-100 shadow-elegant">
        <img
          src={images[active]}
          alt={product.name}
          width={800}
          height={800}
          className="w-full object-cover aspect-square"
        />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-gradient-gold px-3 py-1 text-xs font-semibold text-white shadow-sm">
            {product.badge}
          </span>
        )}
        {/* Prev/Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive((a) => (a - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow hover:bg-white transition"
              aria-label="Önceki"
            >
              ‹
            </button>
            <button
              onClick={() => setActive((a) => (a + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow hover:bg-white transition"
              aria-label="Sonraki"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnail şeridi */}
      {images.length > 1 && (
        <div
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition ${i === active ? "border-primary" : "border-transparent hover:border-stone-300"}`}
            >
              <img
                src={img}
                alt={`${product.name} ${i + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
