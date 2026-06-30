import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CATEGORIES, PRODUCTS, SERIES, formatTL, getProduct } from "@/data/products";
import type { Product, GlassesDetails } from "@/data/products";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CashOnDeliveryForm } from "@/components/CashOnDeliveryForm";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/urun/$slug")({
  head: ({ params }) => {
    const p = getProduct(params.slug);
    const title = p ? `${p.name} — TheBullsCraft` : "Ürün — TheBullsCraft";
    return {
      meta: [
        { title },
        { name: "description", content: p?.shortDescription ?? "TheBullsCraft ürün detayı." },
        { property: "og:title", content: title },
        { property: "og:description", content: p?.shortDescription ?? "" },
        { property: "og:image", content: p?.image ?? "" },
      ],
    };
  },
  loader: ({ params }) => {
    const product: Product | undefined = getProduct(params.slug);
    if (!product) throw notFound();
    return { product: product as Product };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Ürün bulunamadı</h1>
      <Link to="/urunler" className="mt-6 inline-block text-primary hover:underline">Tüm ürünlere dön</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Bir hata oluştu</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const cat = CATEGORIES.find((c) => c.slug === product.category)!;
  const related = PRODUCTS.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const waMsg =
    `Merhaba 👋\n"${product.name}" ürünü (${formatTL(product.price)}) hakkında bilgi almak istiyorum.\n` +
    `Stok durumu ve kargo süreci hakkında bilgi verir misiniz?`;

  return (
    <article className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Anasayfa</Link>
        <span className="mx-2">/</span>
        <Link to="/kategori/$slug" params={{ slug: cat.slug }} className="hover:text-primary">{cat.label}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-gold opacity-15 blur-2xl" />
          <img
            src={product.image}
            alt={product.name}
            width={800}
            height={800}
            className="w-full rounded-3xl object-cover shadow-elegant"
          />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-gradient-gold px-3 py-1 text-xs font-semibold text-primary-foreground">
              {product.badge}
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">{cat.label}</p>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{product.name}</h1>
          {product.glasses && (
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-accent">
              {SERIES[product.glasses.series].label}
            </p>
          )}
          <p className="mt-3 text-muted-foreground">{product.shortDescription}</p>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-bold text-primary">{formatTL(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-base text-muted-foreground line-through">{formatTL(product.oldPrice)}</span>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-semibold text-accent">
                  %{Math.round((1 - product.price / product.oldPrice) * 100)} indirim
                </span>
              </>
            )}
          </div>

          <div className="mt-7 space-y-3">
            <a
              href={product.shopierUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full rounded-full bg-gradient-gold px-6 py-4 text-center text-sm font-semibold text-primary-foreground shadow-glow transition hover:brightness-110"
            >
              🛍️ Shopier ile Hemen Satın Al
            </a>
            <WhatsAppButton message={waMsg} size="lg" className="w-full">
              WhatsApp'tan Bu Ürünü Sor
            </WhatsAppButton>
            <CashOnDeliveryForm product={product} />
          </div>

          {/* Features */}
          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display text-base font-semibold">Ürün Özellikleri</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {product.features.map((f: string) => (
                <li key={f} className="flex items-start gap-3">
                  <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Trust */}
          <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="rounded-xl border border-border bg-card/50 p-3">
              <div className="text-lg">🚚</div>
              <div className="mt-1 font-semibold">Hızlı Kargo</div>
              <div className="text-muted-foreground">1-3 iş günü</div>
            </div>
            <div className="rounded-xl border border-border bg-card/50 p-3">
              <div className="text-lg">🛡️</div>
              <div className="mt-1 font-semibold">Güvenli Ödeme</div>
              <div className="text-muted-foreground">Shopier</div>
            </div>
            <div className="rounded-xl border border-border bg-card/50 p-3">
              <div className="text-lg">💵</div>
              <div className="mt-1 font-semibold">Kapıda Ödeme</div>
              <div className="text-muted-foreground">Tüm Türkiye</div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold">Ürün Açıklaması</h2>
        <div className="mt-3 max-w-3xl space-y-4 text-muted-foreground">
          {product.description.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </section>

      {/* Glasses details */}
      {product.glasses && <GlassesInfo details={product.glasses} />}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold">Benzer Ürünler</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
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
                  <th className="w-1/3 border-b border-border px-4 py-3 text-left font-medium text-foreground">{s.label}</th>
                  <td className="border-b border-border px-4 py-3 text-muted-foreground">{s.value}</td>
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
            <h3 className="font-display text-base font-semibold">Filtre Tipi: {details.filterInfo.type}</h3>
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
            <h3 className="font-display text-base font-semibold">Filtre Kategorisi: {details.filterInfo.category}</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Işık geçirgenliği: <strong className="text-foreground">{details.filterInfo.lightTransmission}</strong>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Güçlü güneş ışığında, yaz aylarında sahil, şehir ve açık hava aktivitelerinde ideal koruma sağlar.
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
              <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">✓</span>
              {m}
            </li>
          ))}
        </ul>
      </section>

      {/* Care & Usage */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl font-bold">Bakım ve Temizlik</h2>
          <p className="mt-2 text-sm text-muted-foreground">Gözlüğünüzün uzun ömürlü olması için aşağıdaki önerilere dikkat ediniz.</p>
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
              <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">✓</span>
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
              <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-[10px]">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}