import { Link } from "@tanstack/react-router";
import { useId } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { ArtistCollection } from "@/data/artists";
import { formatTL } from "@/data/products";

export function ArtistCard({ artist }: { artist: ArtistCollection }) {
  const cover = artist.works.find((work) => work.slug === artist.coverSlug) ?? artist.works[0];
  if (!cover) return null;
  return (
    <Link
      to="/kategori/$slug"
      params={{ slug: artist.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white transition hover:border-primary/30 hover:shadow-elegant"
    >
      <div className="aspect-square overflow-hidden bg-white">
        <img
          src={cover.image}
          alt={`${artist.name} — ${cover.title}`}
          width={1080}
          height={1080}
          loading="lazy"
          className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold text-stone-900">{artist.name}</h3>
        <p className="mt-1 text-xs text-stone-500">{cover.production}</p>
        <p className="mt-3 text-lg font-bold text-primary">
          {cover.price === undefined ? "Fiyat için bilgi alın" : formatTL(cover.price)}
        </p>
        <p className="mt-1 text-xs text-stone-500">
          {cover.stockLabel ?? "Stok ve adet bilgisi için iletişime geçin"}
        </p>
        <span className="mt-4 text-sm font-semibold text-stone-700">
          {artist.works.length} eseri incele →
        </span>
      </div>
    </Link>
  );
}

export function ArtistAlbum({ artists }: { artists: ArtistCollection[] }) {
  const titleId = useId();
  if (!artists.length) return null;
  return (
    <section className="bg-stone-50 py-20" aria-labelledby={titleId}>
      <div className="mx-auto max-w-7xl px-4">
        <Carousel opts={{ align: "start", loop: false }} aria-label="Sanatçı Albümü">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Sanatçılar
              </p>
              <h2
                id={titleId}
                className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl"
              >
                Sanatçının Albümü
              </h2>
              <p className="mt-2 max-w-xl text-stone-500">
                Bir sanatçı seçin, eserlerinden oluşan albümünü keşfedin.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/kategori/$slug"
                params={{ slug: "sanatci-albumu" }}
                className="mr-2 text-sm font-medium text-primary hover:underline"
              >
                Tümünü Gör →
              </Link>
              <CarouselPrevious
                aria-label="Önceki sanatçı"
                className="static size-11 translate-y-0"
              />
              <CarouselNext aria-label="Sonraki sanatçı" className="static size-11 translate-y-0" />
            </div>
          </div>
          <CarouselContent className="-ml-4 pb-1">
            {artists.map((artist) => (
              <CarouselItem
                key={artist.slug}
                className="basis-[72%] pl-4 sm:basis-1/2 lg:basis-1/4"
              >
                <ArtistCard artist={artist} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
