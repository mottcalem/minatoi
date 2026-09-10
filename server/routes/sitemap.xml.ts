/**
 * GET /sitemap.xml
 * Ürün ve blog slug'larını dinamik olarak okuyarak güncel bir sitemap üretir.
 */
import { defineEventHandler, setResponseHeader } from "h3";
import { readProducts } from "../utils/productStore";

const SITE = "https://minatoi.ugurdogan.net";
const TODAY = new Date().toISOString().split("T")[0];

const BLOG_SLUGS = [
  "hakiki-deri-cuzdan-rehberi",
  "deri-kartlik-nasil-secilir",
  "el-yapimi-deri-cuzdan-vs-makine-uretimi",
  "toptan-deri-cuzdan-tedarikci-rehberi",
  "deri-cuzdan-bakim-rehberi",
];

function urlEntry(
  loc: string,
  opts: { lastmod?: string; changefreq?: string; priority?: number } = {}
): string {
  return [
    "  <url>",
    `    <loc>${SITE}${loc}</loc>`,
    `    <lastmod>${opts.lastmod ?? TODAY}</lastmod>`,
    `    <changefreq>${opts.changefreq ?? "monthly"}</changefreq>`,
    `    <priority>${(opts.priority ?? 0.7).toFixed(1)}</priority>`,
    "  </url>",
  ].join("\n");
}

export default defineEventHandler(async (event) => {
  const productSlugs = (await readProducts()).map((product) => product.slug).filter(Boolean);

  const entries = [
    urlEntry("/",                    { changefreq: "weekly",  priority: 1.0  }),
    urlEntry("/urunler",             { changefreq: "weekly",  priority: 0.9  }),
    urlEntry("/kategori/cuzdan",     { changefreq: "weekly",  priority: 0.85 }),
    urlEntry("/kategori/kilif",      { changefreq: "weekly",  priority: 0.85 }),
    urlEntry("/kategori/gozluk",     { changefreq: "monthly", priority: 0.7  }),
    urlEntry("/blog",                { changefreq: "weekly",  priority: 0.8  }),
    urlEntry("/iletisim",            { changefreq: "yearly",  priority: 0.6  }),
    urlEntry("/kvkk",                { changefreq: "yearly",  priority: 0.3  }),
    urlEntry("/gizlilik-politikasi", { changefreq: "yearly",  priority: 0.3  }),
    urlEntry("/kullanici-sozlesmesi",      { changefreq: "yearly",  priority: 0.3  }),
    urlEntry("/mesafeli-satis-sozlesmesi", { changefreq: "yearly",  priority: 0.3  }),
    urlEntry("/iptal-iade",                { changefreq: "yearly",  priority: 0.3  }),
    ...productSlugs.map((s) => urlEntry(`/urun/${s}`,  { changefreq: "monthly", priority: 0.8  })),
    ...BLOG_SLUGS.map((s)   => urlEntry(`/blog/${s}`,  { changefreq: "monthly", priority: 0.75 })),
  ];

  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n\n' +
    entries.join("\n\n") +
    "\n\n</urlset>";

  setResponseHeader(event, "Content-Type", "application/xml; charset=utf-8");
  return xml;
});
