import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { ArtistCollection, ArtistWork } from "@/data/artists";
import { formatTL } from "@/data/products";

export function ArtistGallery({ artist }: { artist: ArtistCollection }) {
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const selectedSize = (work: ArtistWork) => sizes[work.slug] ?? work.sizes?.[0];
  const selectedPrice = (work: ArtistWork) =>
    work.sizePrices?.find((variant) => variant.size === selectedSize(work))?.price ?? work.price;
  const [selected, setSelected] = useState<ArtistWork | null>(null);
  const inquiry = (work: ArtistWork) =>
    `Merhaba, ${artist.name} sanatçısının ${work.title} çalışması hakkında ölçü ve sipariş bilgisi almak istiyorum.\nEser: ${work.slug}${selectedSize(work) ? `\nÖlçü: ${selectedSize(work)}` : ""}`;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <nav aria-label="İçerik yolu" className="mb-6 flex flex-wrap gap-2 text-xs text-stone-400">
        <Link to="/">Anasayfa</Link>
        <span>/</span>
        <Link to="/kategori/$slug" params={{ slug: "sanatci-albumu" }}>
          Sanatçının Albümü
        </Link>
        <span>/</span>
        <span className="text-stone-700">{artist.name}</span>
      </nav>
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Sanatçı Albümü</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">
        {artist.name}
      </h1>
      <p className="mt-3 text-stone-500">
        Sanatçının {artist.works.length} çalışmasını keşfedin. Eserlere tıklayarak yakından
        inceleyebilirsiniz.
      </p>
      {artist.biography && (
        <aside className="mt-6 max-w-3xl rounded-2xl border border-stone-100 bg-stone-50 p-6">
          <h2 className="font-display text-xl font-semibold">Sanatçı hakkında</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-7 text-stone-600">
            {artist.biography}
          </p>
        </aside>
      )}
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {artist.works.map((work) => (
          <article
            key={work.slug}
            className="flex flex-col overflow-hidden rounded-2xl border border-stone-100 bg-white"
          >
            <button
              type="button"
              onClick={() => setSelected(work)}
              aria-label={`${artist.name} — ${work.title} eserini büyüt`}
              className="group aspect-square overflow-hidden bg-white"
            >
              <img
                src={work.image}
                alt={`${artist.name} — ${work.title}`}
                width={1080}
                height={1080}
                loading="lazy"
                className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
              />
            </button>
            <div className="flex flex-1 flex-col p-4">
              <h2 className="font-display font-semibold text-stone-900">{work.title}</h2>
              <p className="mt-1 text-xs text-stone-500">{work.production}</p>
              {work.sizes && work.sizes.length > 0 && (
                <label className="mt-3 text-sm text-stone-600">
                  Tablo ölçüsü
                  <select
                    className="mt-1 w-full rounded-lg border border-stone-300 bg-white p-2"
                    value={selectedSize(work)}
                    onChange={(event) =>
                      setSizes((current) => ({ ...current, [work.slug]: event.target.value }))
                    }
                  >
                    {work.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {selectedPrice(work) !== undefined && (
                <p className="mt-3 text-xl font-bold text-primary" aria-live="polite">
                  {formatTL(selectedPrice(work)!)}
                </p>
              )}
              <p className="mt-2 text-sm font-semibold text-stone-600">Sınırlı sayıda</p>
              <WhatsAppButton message={inquiry(work)} variant="outline" className="mt-4">
                Bu eser için bilgi alın
              </WhatsAppButton>
            </div>
          </article>
        ))}
      </div>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-w-3xl max-h-[95dvh] overflow-y-auto bg-white">
          <DialogTitle>
            {artist.name} — {selected?.title}
          </DialogTitle>
          <DialogDescription>{selected?.production}</DialogDescription>
          {selected && (
            <>
              <img
                src={selected.image}
                alt={`${artist.name} — ${selected.title}`}
                width={1080}
                height={1080}
                className="max-h-[65dvh] w-full object-contain"
              />
              <WhatsAppButton message={inquiry(selected)}>Bu eser için bilgi alın</WhatsAppButton>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
