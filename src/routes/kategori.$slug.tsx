import type { Product } from "@/data/products";
import { ArtistGallery } from "@/components/ArtistGallery";
import { ArtistCard } from "@/components/ArtistAlbum";
import { ARTISTS, artistCollections, type ArtistCollection } from "@/data/artists";
import { visibleCategories, type CategoryRecord } from "@/data/categories";
import { productInCategory } from "@/data/productCategories";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { fetchProductsServer } from "@/data/adminProducts";
import { getCategories } from "@/data/categoryActions";
import { mixProducts } from "@/data/productOrder";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/kategori/$slug")({
  head: ({ params }) => {
    const canonical = `https://minatoi.ugurdogan.net/kategori/${params.slug}`;
    const artist = ARTISTS.find((item) => item.slug === params.slug);
    const label =
      artist?.name ??
      (params.slug === "ressamlar"
        ? "Ressamlar"
        : params.slug === "sanatci-albumu"
          ? "Sanatçının Albümü"
          : params.slug);
    return {
      meta: [{ title: `${label} — MinaToi` }, { name: "robots", content: "index, follow" }],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  loader: async ({
    params,
  }): Promise<{
    cat: CategoryRecord;
    categories: CategoryRecord[];
    products: Product[];
    artists: ArtistCollection[];
    artist: ArtistCollection | undefined;
  }> => {
    const categories = await getCategories();
    const categorySlug = params.slug;
    const cat = categories.find((c) => c.slug === categorySlug);
    if (!cat) throw notFound();
    const all = await fetchProductsServer();
    const products = mixProducts(all.filter((p) => productInCategory(p, categorySlug)));
    const artists = artistCollections(categories, all);
    return {
      cat,
      categories,
      products,
      artists,
      artist: artists.find((artist) => artist.slug === categorySlug),
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Kategori bulunamadı</h1>
      <Link to="/urunler" className="mt-6 inline-block text-primary hover:underline">
        Tüm ürünlere dön
      </Link>
    </div>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { cat, categories, products, artists, artist } = Route.useLoaderData();

  if (artist) return <ArtistGallery key={artist.slug} artist={artist} />;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <nav className="mb-6 text-xs text-stone-400">
        <Link to="/" className="hover:text-primary transition-colors">
          Anasayfa
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-700">{cat.label}</span>
      </nav>
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Kategori</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
          {cat.label}
        </h1>
        {cat.description && <p className="mt-2 max-w-2xl text-stone-500">{cat.description}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/urunler"
            className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-medium text-stone-600 hover:border-primary hover:text-primary transition-colors"
          >
            Tümü
          </Link>
          {visibleCategories(categories)
            .filter((c) => c.slug !== cat.slug)
            .map((c) => (
              <Link
                key={c.slug}
                to="/kategori/$slug"
                params={{ slug: c.slug }}
                className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-medium text-stone-600 hover:border-primary hover:text-primary transition-colors"
              >
                {c.label}
              </Link>
            ))}
        </div>
      </header>
      {cat.slug === "sanatci-albumu" && artists.length > 0 && (
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {artists.map((artist) => (
            <ArtistCard key={artist.slug} artist={artist} />
          ))}
        </div>
      )}
      {products.length === 0 && !(cat.slug === "sanatci-albumu" && artists.length > 0) ? (
        <div className="py-20 text-center text-stone-400">Bu kategoride henüz ürün eklenmemiş.</div>
      ) : (
        <div>
          {cat.slug === "sanatci-albumu" &&
            products.some((product) => !product.category.startsWith("ressam-")) && (
              <h2 className="mb-5 font-display text-2xl font-bold text-stone-900">
                Diğer seçili eserler
              </h2>
            )}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products
              .filter(
                (product) =>
                  cat.slug !== "sanatci-albumu" || !product.category.startsWith("ressam-"),
              )
              .map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
