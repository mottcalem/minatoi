import type { MetadataRoute } from "next";
import { products } from "./data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.minatoi.com";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/kategori/cam-tablolar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/hikayemiz`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/kisiye-ozel`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/urun/dogrudan-baski`, changeFrequency: "monthly", priority: 0.8 },
    ...products.map((p) => ({
      url: `${base}/urun/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
