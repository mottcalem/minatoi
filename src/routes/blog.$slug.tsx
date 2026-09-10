import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { BlogPost } from "@/data/blog";
import { getBlogPost, getLatestPosts, BLOG_POSTS } from "@/data/blog";

export const Route = createFileRoute("/blog/$slug")({
  head: ({ params }) => {
    const post = getBlogPost(params.slug);
    if (!post) {
      return {
        meta: [
          { title: "Yazı Bulunamadı | MinaToi Blog" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    return {
      meta: [
        { title: post.metaTitle },
        { name: "description", content: post.metaDescription },
        { name: "keywords", content: post.tags.join(", ") },
        { name: "author", content: "MinaToi" },
        { name: "robots", content: "index, follow" },
        { property: "og:title", content: post.metaTitle },
        { property: "og:description", content: post.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `https://minatoi.dijitalpanter.com/blog/${post.slug}` },
        { property: "og:image", content: `https://minatoi.dijitalpanter.com${post.coverImage}` },
        { property: "article:published_time", content: post.publishedAt },
        { property: "article:modified_time", content: post.updatedAt },
        { property: "article:author", content: "MinaToi" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.metaTitle },
        { name: "twitter:description", content: post.metaDescription },
        { name: "twitter:image", content: `https://minatoi.dijitalpanter.com${post.coverImage}` },
      ],
      links: [
        { rel: "canonical", href: `https://minatoi.dijitalpanter.com/blog/${post.slug}` },
      ],
    };
  },
  loader: ({ params }): { post: BlogPost; related: BlogPost[] } => {
    const post = getBlogPost(params.slug);
    if (!post) throw notFound();
    const related = getLatestPosts().filter((p) => p.slug !== post.slug).slice(0, 2);
    return { post, related };
  },
  component: BlogDetail,
  notFoundComponent: BlogNotFound,
});

function BlogNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-stone-900">Yazı bulunamadı</h1>
        <p className="mt-3 text-stone-500">Aradığınız blog yazısı mevcut değil veya taşınmış olabilir.</p>
        <Link
          to="/blog"
          className="mt-6 inline-flex items-center rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:brightness-110"
        >
          Tüm Yazılara Dön
        </Link>
      </div>
    </div>
  );
}

function BlogDetail() {
  const loaderData = Route.useLoaderData() as { post: BlogPost; related: BlogPost[] };
  const { post, related } = loaderData;

  // JSON-LD: Article structured data
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    image: `https://minatoi.dijitalpanter.com${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "MinaToi",
      url: "https://minatoi.dijitalpanter.com",
    },
    publisher: {
      "@type": "Organization",
      name: "MinaToi",
      url: "https://minatoi.dijitalpanter.com",
      logo: {
        "@type": "ImageObject",
        url: "https://minatoi.dijitalpanter.com/images/logo-minatoi.jpg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://minatoi.dijitalpanter.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    inLanguage: "tr-TR",
    url: `https://minatoi.dijitalpanter.com/blog/${post.slug}`,
  };

  // JSON-LD: BreadcrumbList
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Anasayfa", item: "https://minatoi.dijitalpanter.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://minatoi.dijitalpanter.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://minatoi.dijitalpanter.com/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* ── Hero Görseli ── */}
      <div className="relative h-72 w-full overflow-hidden sm:h-96 lg:h-[28rem]">
        <img
          src={post.coverImage}
          alt={post.title}
          className="h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-stone-900/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 mx-auto max-w-4xl">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {post.tags.slice(0, 3).map((t: string) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-2.5 py-0.5 text-xs font-medium text-white"
              >
                {t}
              </span>
            ))}
          </div>
          <h1 className="font-display text-2xl font-bold text-white leading-snug sm:text-3xl lg:text-4xl">
            {post.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-stone-400" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-stone-600 transition-colors">Anasayfa</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-stone-600 transition-colors">Blog</Link>
          <span>/</span>
          <span className="text-stone-600 truncate max-w-[200px]">{post.title}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1fr_280px]">
          {/* ── Makale İçeriği ── */}
          <div>
            {/* Meta bilgiler */}
            <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-stone-400 border-b border-stone-100 pb-6">
              <span>
                {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span>·</span>
              <span>{post.readingTime} dakika okuma</span>
              {post.updatedAt !== post.publishedAt && (
                <>
                  <span>·</span>
                  <span>
                    Güncellendi:{" "}
                    {new Date(post.updatedAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </>
              )}
            </div>

            {/* Özet */}
            <p className="mb-8 text-lg text-stone-600 leading-relaxed border-l-4 border-primary/30 pl-4 italic">
              {post.excerpt}
            </p>

            {/* HTML İçerik */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Etiketler */}
            <div className="mt-10 pt-6 border-t border-stone-100">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">Etiketler</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((t: string) => (
                  <span
                    key={t}
                    className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="space-y-8">
            {/* İlgili ürünler */}
            <div className="rounded-2xl border border-stone-100 bg-stone-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                Öne Çıkan Ürünler
              </p>
              <div className="space-y-4">
                <Link
                  to="/urun/$slug"
                  params={{ slug: "sokrates-klasik-cuzdan" }}
                  className="group flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-3 hover:shadow-sm transition"
                >
                  <img
                    src="/images/products/sokrates/man.jpg"
                    alt="SOKRATES Deri Cüzdan"
                    className="h-14 w-14 rounded-lg object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-800 group-hover:text-primary transition-colors">SOKRATES</p>
                    <p className="text-xs text-stone-400">Hakiki Deri Erkek Cüzdanı</p>
                    <p className="mt-1 text-sm font-bold text-primary">749 ₺</p>
                  </div>
                </Link>
                <Link
                  to="/urun/$slug"
                  params={{ slug: "frege-kartlik" }}
                  className="group flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-3 hover:shadow-sm transition"
                >
                  <img
                    src="/images/products/frege-kartlik/in-hand.jpg"
                    alt="FREGE Deri Kartlık"
                    className="h-14 w-14 rounded-lg object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm font-semibold text-stone-800 group-hover:text-primary transition-colors">FREGE</p>
                    <p className="text-xs text-stone-400">Slim Hakiki Deri Kartlık</p>
                    <p className="mt-1 text-sm font-bold text-primary">449 ₺</p>
                  </div>
                </Link>
              </div>
              <Link
                to="/urunler"
                className="mt-4 flex items-center justify-center rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                Tüm Ürünler →
              </Link>
            </div>

            {/* Diğer yazılar */}
            {related.length > 0 && (
              <div className="rounded-2xl border border-stone-100 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-4">
                  Diğer Yazılar
                </p>
                <div className="space-y-4">
                  {related.map((r: (typeof BLOG_POSTS)[0]) => (
                    <Link
                      key={r.slug}
                      to="/blog/$slug"
                      params={{ slug: r.slug }}
                      className="group block"
                    >
                      <img
                        src={r.coverImage}
                        alt={r.title}
                        className="w-full h-28 object-cover rounded-xl mb-2"
                      />
                      <p className="text-sm font-semibold text-stone-800 group-hover:text-primary transition-colors leading-snug line-clamp-2">
                        {r.title}
                      </p>
                      <p className="mt-1 text-xs text-stone-400">{r.readingTime} dk okuma</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp CTA */}
            <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700 p-5 text-white">
              <p className="font-semibold">Sorunuz mu var?</p>
              <p className="mt-1 text-sm text-white/70">WhatsApp üzerinden bize yazın.</p>
              <a
                href="https://wa.me/905382120458?text=Merhaba%2C%20bilgi%20almak%20istiyorum."
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#20ba58] transition"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp ile Yaz
              </a>
            </div>
          </aside>
        </div>

        {/* Geri dön */}
        <div className="mt-12 pt-8 border-t border-stone-100">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-primary transition-colors"
          >
            ← Tüm Blog Yazıları
          </Link>
        </div>
      </div>
    </>
  );
}
