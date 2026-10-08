/** Yönetim panelinden yönetilen ürün kategorileri. Sıra, sitede görünme sırasıdır. */
export type CategoryRecord = {
  slug: string;
  label: string;
  description: string;
  /** Sunucuya yüklenmiş görselin public yolu; yoksa varsayılan karusel görseli kullanılır. */
  image?: string;
};

export const PAINTERS_CATEGORY: CategoryRecord = {
  slug: "ressamlar",
  label: "Ressamlar",
  description: "Sanatçıların seçili eserlerinden cam tablo koleksiyonları",
};

export const ARTIST_ALBUM_CATEGORY: CategoryRecord = {
  slug: "sanatci-albumu",
  label: "Sanatçının Albümü",
  description: "Bir sanatçı seçin, eserlerinden oluşan albümünü keşfedin.",
};

export function isArtistCategory(category: { slug: string }) {
  return category.slug.startsWith("ressam-");
}

export function visibleCategories(categories: CategoryRecord[]) {
  const visible = categories.filter((category) => !isArtistCategory(category));
  return visible.some((category) => category.slug === ARTIST_ALBUM_CATEGORY.slug)
    ? visible
    : [...visible, ARTIST_ALBUM_CATEGORY];
}

export function normalizeCategories(categories: CategoryRecord[]) {
  const filtered = categories.filter(
    (category) =>
      !["cuzdan", "genel"].includes(category.slug) &&
      category.label.trim().toLocaleLowerCase("tr-TR") !== "genel",
  );
  return [PAINTERS_CATEGORY, ARTIST_ALBUM_CATEGORY].reduce(
    (items, category) =>
      items.some((item) => item.slug === category.slug) ? items : [...items, category],
    filtered,
  );
}

export const DEFAULT_CATEGORIES: CategoryRecord[] = [
  PAINTERS_CATEGORY,
  ARTIST_ALBUM_CATEGORY,
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
