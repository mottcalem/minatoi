import { createFileRoute } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/patili-dosyalara-ozel")({
  head: () => ({
    meta: [
      { title: "Patili Dosyalara Özel — MinaToi" },
      {
        name: "description",
        content:
          "Patili dosyalara özel MinaToi koleksiyonu: pati motifi işlenmiş el yapımı deri ürünler ve kurumsal siparişler.",
      },
    ],
  }),
  component: PatiliDosyalaraOzel,
});

function PatiliDosyalaraOzel() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        MinaToi Koleksiyon
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold">Patili Dosyalara Özel</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Pati temalı koleksiyonumuz: deri ürünlerine işlenen pati motifleri ve dilediğin isim veya
        logo ile tamamen sana özel parçalar. Kurumsal ve toplu siparişlerde logo işleme de
        yapıyoruz.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-3xl" aria-hidden="true">
            🐾
          </div>
          <h2 className="mt-3 font-display text-xl font-bold">Pati Motifli Ürünler</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cüzdan, kartlık, anahtarlık ve gözlük kılıflarında el işi pati motifi seçenekleri.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-3xl" aria-hidden="true">
            🏷️
          </div>
          <h2 className="mt-3 font-display text-xl font-bold">Kurumsal & Toplu Sipariş</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Veteriner klinikleri, pati otelleri ve hayvansever markalar için logolu üretim.
          </p>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card/40 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 className="font-display text-xl font-bold">Talep bildir</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Koleksiyon ve toplu sipariş detayları için bize yaz; hızlıca dönüş yapıyoruz.
          </p>
        </div>
        <WhatsAppButton
          className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto"
          message="Merhaba, Patili Dosyalara Özel koleksiyonu hakkında bilgi almak istiyorum."
        >
          WhatsApp'tan Yaz
        </WhatsAppButton>
      </div>
    </section>
  );
}
