import { createFileRoute } from "@tanstack/react-router";
import { SITE, waLink } from "@/data/site";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const Route = createFileRoute("/iletisim")({
  head: () => ({
    meta: [
      { title: "İletişim — TheBullsCraft" },
      { name: "description", content: "TheBullsCraft ile iletişime geçin: WhatsApp, e-posta ve sosyal medya." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold">İletişim</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Soruların, özel sipariş talepleri veya toptan alışveriş için en hızlı yol WhatsApp. Genellikle aynı gün dönüş yapıyoruz.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-3xl">💬</div>
          <h2 className="mt-3 font-display text-xl font-bold">WhatsApp</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.phone}</p>
          <WhatsAppButton className="mt-4 w-full" message="Merhaba, iletişim sayfasından yazıyorum.">Mesaj Gönder</WhatsAppButton>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-3xl">✉️</div>
          <h2 className="mt-3 font-display text-xl font-bold">E-posta</h2>
          <p className="mt-1 text-sm text-muted-foreground">{SITE.email}</p>
          <a href={`mailto:${SITE.email}`} className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary">
            E-posta Gönder
          </a>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-3xl">📷</div>
          <h2 className="mt-3 font-display text-xl font-bold">Instagram</h2>
          <p className="mt-1 text-sm text-muted-foreground">Yeni ürünler ve atölye anları</p>
          <a href={SITE.instagram} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold hover:bg-secondary">
            Takip Et
          </a>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="text-3xl">🛍️</div>
          <h2 className="mt-3 font-display text-xl font-bold">Shopier Mağaza</h2>
          <p className="mt-1 text-sm text-muted-foreground">Güvenli ödeme & hızlı kargo</p>
          <a href={SITE.shopierStore} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-gradient-gold px-5 py-3 text-sm font-semibold text-primary-foreground hover:brightness-110">
            Mağazaya Git
          </a>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-border bg-card/40 p-6 text-sm text-muted-foreground">
        <h2 className="font-display text-base font-semibold text-foreground">Firma Bilgileri</h2>
        <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
          <div><dt className="inline font-medium text-foreground">Yetkili: </dt><dd className="inline">{SITE.owner}</dd></div>
          <div><dt className="inline font-medium text-foreground">Şirket Türü: </dt><dd className="inline">{SITE.companyType}</dd></div>
          <div><dt className="inline font-medium text-foreground">Vergi Dairesi: </dt><dd className="inline">{SITE.taxOffice}</dd></div>
          <div><dt className="inline font-medium text-foreground">VKN: </dt><dd className="inline">{SITE.taxNumber}</dd></div>
          <div><dt className="inline font-medium text-foreground">E-posta: </dt><dd className="inline">{SITE.email}</dd></div>
          <div><dt className="inline font-medium text-foreground">Telefon: </dt><dd className="inline">{SITE.phone}</dd></div>
        </dl>
        <div className="mt-4 border-t border-border pt-4">
          <strong className="text-foreground">Çalışma saatleri:</strong> Hafta içi 09:00 – 19:00 · Cumartesi 10:00 – 17:00<br />
          <strong className="text-foreground">Kargo:</strong> Aynı gün kargolama (saat 15:00'e kadar olan siparişler).<br />
          Hızlı yanıt için <a href={waLink("Merhaba!")} target="_blank" rel="noreferrer" className="text-whatsapp hover:underline">WhatsApp</a> tercih edin.
        </div>
      </div>
    </section>
  );
}
