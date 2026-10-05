import type { CategoryRecord } from "./categories";
import type { Product } from "./products";

export type ArtistWork = {
  slug: string;
  title: string;
  image: string;
  production: string;
  price?: number;
  stockLabel?: string;
};

export type ArtistCollection = {
  slug: string;
  name: string;
  biography?: string;
  coverSlug: string;
  works: ArtistWork[];
};

const production = "4 mm temperli cam üzerine UV baskı";

function works(folder: string, first: number, count: number): ArtistWork[] {
  return Array.from({ length: count }, (_, index) => ({
    slug: `${folder}-eser-${index + 1}`,
    title: `Eser ${String(index + 1).padStart(2, "0")}`,
    image: `/images/${folder}/image${String(first + index).padStart(5, "0")}.jpeg`,
    production,
  }));
}

/** Yeni sanatçılar aynı yapıya eklenebilir. Fiyat/adet yalnızca kesinleştiğinde doldurulur. */
export const ARTISTS: ArtistCollection[] = [
  {
    slug: "ressam-cem-uzunoglu",
    name: "Cem Uzunoğlu",
    coverSlug: "cem-uzunoglu-eser-1",
    works: works("cem-uzunoglu", 16, 8),
  },
  {
    slug: "ressam-ayten-yetis-dogu",
    name: "Ayten Yetiş Doğu",
    coverSlug: "ayten-yetis-eser-1",
    works: works("ayten-yetis", 1, 18),
  },
];

/** Yönetim panelindeki yeni sanatçı kategorileri de aynı albümde görünür. */
export function artistCollections(
  categories: CategoryRecord[],
  products: Product[],
): ArtistCollection[] {
  const collections = ARTISTS.map((artist) => ({
    ...artist,
    biography:
      categories.find((category) => category.slug === artist.slug)?.description || artist.biography,
  }));
  const additional = categories
    .filter(
      (category) =>
        category.slug.startsWith("ressam-") &&
        !ARTISTS.some((artist) => artist.slug === category.slug),
    )
    .flatMap((category) => {
      const items = products.filter((product) => product.category === category.slug);
      const cover = items.find((product) => product.featured) ?? items[0];
      if (!cover) return [];
      return [
        {
          slug: category.slug,
          name: category.label,
          biography: category.description || undefined,
          coverSlug: cover.slug,
          works: items.map((product) => ({
            slug: product.slug,
            title: product.name,
            image: product.image,
            production: product.shortDescription,
            price: product.price,
            stockLabel:
              product.badge && /adet|stok/i.test(product.badge) ? product.badge : undefined,
          })),
        },
      ];
    });
  return [...collections, ...additional];
}
