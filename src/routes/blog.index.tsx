import { createFileRoute, Link } from "@tanstack/react-router";
import { BLOG_POSTS } from "@/data/blog";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Deri Cüzdan & Aksesuar Rehberleri | MinaToi" },
      {
        name: "description",
        content:
          "Hakiki deri cüzdan, kartlık ve deri aksesuar hakkında uzman rehberler. Deri seçimi, bakım, el yapımı üretim ve toptan satın alma konularında kapsamlı makaleler.",
      },
      {
        name: "keywords",
        content: "cam tablo blog, kişiye özel tasarım, duvar dekorasyonu, MinaToi",
      },
      { property: "og:title", content: "Blog — MinaToi" },
      {
        property: "og:description",
        content: "MinaToi cam tablo ve kişiye özel tasarım dünyasından yazılar.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://minatoi.com/blog" },
      { name: "robots", content: "index, follow" },
    ],
    links: [{ rel: "canonical", href: "https://minatoi.com/blog" }],
  }),
  component: BlogIndex,
});

const TAG_COLORS: Record<string, string> = {
  "hakiki deri cüzdan": "bg-amber-50 text-amber-700 border-amber-200",
  "deri kartlık": "bg-stone-100 text-stone-700 border-stone-200",
  "el yapımı deri cüzdan": "bg-orange-50 text-orange-700 border-orange-200",
  "toptan deri cüzdan": "bg-blue-50 text-blue-700 border-blue-200",
  "deri cüzdan bakımı": "bg-green-50 text-green-700 border-green-200",
};

function TagBadge({ tag }: { tag: string }) {
  const cls = TAG_COLORS[tag] ?? "bg-stone-100 text-stone-600 border-stone-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      {tag}
    </span>
  );
}

function BlogCard({
  post,
  featured = false,
}: {
  post: (typeof BLOG_POSTS)[0];
  featured?: boolean;
}) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition hover:shadow-elegant ${
        featured ? "lg:flex-row" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "lg:w-1/2" : ""}`}>
        <img
          src={post.coverImage}
          alt={post.title}
          loading="lazy"
          className={`w-full object-cover transition duration-500 group-hover:scale-105 ${
            featured ? "h-64 lg:h-full" : "h-52"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className={`flex flex-col justify-between p-6 ${featured ? "lg:w-1/2 lg:p-8" : ""}`}>
        <div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 2).map((t) => (
              <TagBadge key={t} tag={t} />
            ))}
          </div>
          <h2
            className={`font-display font-bold text-stone-900 group-hover:text-primary transition-colors leading-snug ${
              featured ? "text-2xl lg:text-3xl" : "text-lg"
            }`}
          >
            {post.title}
          </h2>
          <p className="mt-3 text-sm text-stone-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-stone-400">
            <span>
              {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span>·</span>
            <span>{post.readingTime} dk okuma</span>
          </div>
          <span className="text-sm font-semibold text-primary group-hover:gap-2 flex items-center gap-1 transition-all">
            Oku <span>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function BlogIndex() {
  const sorted = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const [featured, ...rest] = sorted;

  // JSON-LD: Blog structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "MinaToi Blog",
    description: "MinaToi cam tablo ve kişiye özel tasarım dünyasından yazılar",
    url: "https://minatoi.com/blog",
    publisher: {
      "@type": "Organization",
      name: "MinaToi",
      url: "https://minatoi.com",
    },
    blogPost: BLOG_POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `https://minatoi.com/blog/${p.slug}`,
      datePublished: p.publishedAt,
      dateModified: p.updatedAt,
      description: p.metaDescription,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Başlık ── */}
      <section className="bg-stone-50 border-b border-stone-100 py-14">
        <div className="mx-auto max-w-7xl px-4">
          <nav
            className="mb-4 flex items-center gap-2 text-xs text-stone-400"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-stone-600 transition-colors">
              Anasayfa
            </Link>
            <span>/</span>
            <span className="text-stone-600">Blog</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            MinaToi Blog
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-stone-900 sm:text-5xl">
            Yeni yazılar
            <br className="hidden sm:block" /> yakında burada.
          </h1>
          <p className="mt-4 max-w-2xl text-stone-500 text-base leading-relaxed">
            Cam tablo modelleri, kişiye özel tasarımlar ve yaşam alanlarınıza ilham verecek
            içerikler üzerinde çalışıyoruz.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        {featured ? (
          <div className="mb-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
              Öne Çıkan
            </p>
            <BlogCard post={featured} featured />
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-100 bg-stone-50 px-6 py-12 text-center">
            <h2 className="font-display text-2xl font-bold text-stone-900">Henüz yazı yok</h2>
            <p className="mx-auto mt-3 max-w-xl text-stone-500">
              MinaToi blogunda yeni yazılar yayınlandığında burada bulabilirsiniz.
            </p>
          </div>
        )}

        {rest.length > 0 && (
          <>
            <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-stone-400">
              Tüm Yazılar
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
              {rest.map((p) => (
                <BlogCard key={p.slug} post={p} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="rounded-3xl border border-stone-100 bg-gradient-to-br from-stone-50 to-amber-50/60 px-8 py-12 text-center">
          <h2 className="font-display text-2xl font-bold text-stone-900 sm:text-3xl">
            Sorularınız mı var?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-stone-500">
            Ürünler, siparişler veya özel talepler için WhatsApp üzerinden bize yazın.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="https://wa.me/905382120458?text=Merhaba%2C%20bilgi%20almak%20istiyorum."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
            >
              WhatsApp ile Yaz
            </a>
            <Link
              to="/urunler"
              className="inline-flex items-center rounded-full border border-stone-200 bg-white px-7 py-3.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
            >
              Ürünleri Gör
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
