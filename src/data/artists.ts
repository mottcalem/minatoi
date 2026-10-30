import type { CategoryRecord } from "./categories";
import type { Product } from "./products";

export type ArtistWork = {
  slug: string;
  title: string;
  image: string;
  production: string;
  price?: number;
  sizes?: string[];
  sizePrices?: Product["sizePrices"];
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

/** Existing albums become editable product records without inventing prices. */
export function managedArtistProducts(products: Product[]): Product[] {
  const defaults = ARTISTS.flatMap((artist) =>
    artist.works.map((work) => ({
      slug: work.slug,
      name: work.title,
      category: artist.slug,
      image: work.image,
      images: [work.image],
      shortDescription: work.production,
      description: work.production,
      features: [],
      price: work.price ?? 0,
      badge: "Sınırlı sayıda",
    })),
  );
  return [...products, ...defaults.filter((work) => !products.some((p) => p.slug === work.slug))];
}

export function artistCollections(
  categories: CategoryRecord[],
  products: Product[],
): ArtistCollection[] {
  const artistCategories = [
    ...categories.filter((category) => category.slug.startsWith("ressam-")),
    ...ARTISTS.filter(
      (artist) => !categories.some((category) => category.slug === artist.slug),
    ).map((artist) => ({ slug: artist.slug, label: artist.name, description: artist.biography })),
  ];
  const items = managedArtistProducts(products);
  return artistCategories.flatMap((category) => {
    const works = items.filter((product) => product.category === category.slug);
    const cover = works.find((product) => product.featured) ?? works[0];
    if (!cover) return [];
    return [
      {
        slug: category.slug,
        name: category.label,
        biography: category.description || undefined,
        coverSlug: cover.slug,
        works: works.map((product) => ({
          slug: product.slug,
          title: product.name,
          image: product.image,
          production: product.shortDescription,
          price: product.price > 0 ? product.price : undefined,
          sizes: product.sizes,
          sizePrices: product.sizePrices,
        })),
      },
    ];
  });
}
