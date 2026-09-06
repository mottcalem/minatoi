import { createFileRoute } from "@tanstack/react-router";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/kisiye-ozel")({
  head: () => ({
    meta: [
      { title: "Kişiye Özel — MinaToi" },
      {
        name: "description",
        content:
          "MinaToi kişiye özel deri ürünler: isim yazma, monogram, özel ölçü ve renk seçenekleri. Tasarımını birlikte oluşturalım.",
      },
    ],
  }),
  component: KisiyeOzel,
});

const STEPS = [
  {
    icon: "💬",
    title: "1. Yaz",
    text: "WhatsApp'tan aklındaki tasarımı anlat: ürün, renk, isim veya monogram.",
  },
  {
    icon: "✏️",
    title: "2. Tasarla",
    text: "Tasarımı birlikte netleştiriyoruz; üretim öncesi onayın alınır.",
  },
  {
    icon: "🧵",
    title: "3. Üret",
    text: "Atölyede elde üretilir, kargo ile kapına gelir.",
  },
];

function KisiyeOzel() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        MinaToi Atölye
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold">Kişiye Özel</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        El yapımı deri ürünlerini tamamen sana özel tasarlıyoruz: cüzdan, kartlık, gözlük kılıfı ve
        daha fazlasına isim, monogram veya istediğin bir motif işlenir. Özel ölçü ve renk talepleri
        için de buradayız.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
            <div className="text-3xl" aria-hidden="true">
              {step.icon}
            </div>
            <h2 className="mt-3 font-display text-lg font-bold">{step.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card/40 p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 className="font-display text-xl font-bold">Özel siparişini başlat</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fiyat ve teslim süresi tasarıma göre değişir; genellikle aynı gün dönüş yapıyoruz.
          </p>
        </div>
        <WhatsAppButton
          className="mt-4 w-full shrink-0 sm:mt-0 sm:w-auto"
          message="Merhaba, kişiye özel bir ürün siparişi vermek istiyorum."
        >
          WhatsApp'tan Yaz
        </WhatsAppButton>
      </div>
    </section>
  );
}
