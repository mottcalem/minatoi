/** Yönetim panelinden yönetilen ürün kategorileri. Sıra, sitede görünme sırasıdır. */
export type CategoryRecord = {
  slug: string;
  label: string;
  description: string;
  /** Sunucuya yüklenmiş görselin public yolu; yoksa varsayılan karusel görseli kullanılır. */
  image?: string;
};

export const DEFAULT_CATEGORIES: CategoryRecord[] = [
  {
    slug: "cuzdan",
    label: "Cüzdan & Kartlık",
    description: "El yapımı hakiki deri cüzdan ve kartlık modelleri",
  },
  { slug: "kilif", label: "Gözlük Kılıfı", description: "Tam deri, el yapımı gözlük kılıfları" },
  {
    slug: "gozluk",
    label: "Gözlük",
    description: "UV korumalı, EN ISO 12312-1:2013 standart güneş gözlükleri",
  },
];

/** Türkçe karakterleri sadeleştirip URL adresi üretir. */
export function generateCategorySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
