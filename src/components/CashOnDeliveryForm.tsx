import { useState } from "react";
import { z } from "zod";
import { waLink } from "@/data/site";
import type { Product } from "@/data/products";
import { formatTL } from "@/data/products";

const schema = z.object({
  name: z.string().trim().min(2, "İsim en az 2 karakter").max(80),
  phone: z.string().trim().regex(/^[0-9 +()-]{10,20}$/, "Geçerli bir telefon girin"),
  city: z.string().trim().min(2, "Şehir gerekli").max(60),
  address: z.string().trim().min(10, "Adresi tam yazın").max(400),
  qty: z.coerce.number().int().min(1).max(20),
  note: z.string().trim().max(300).optional(),
});

export function CashOnDeliveryForm({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] = issue.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    const v = parsed.data;
    const total = product.price * v.qty;
    const msg =
      `🛒 KAPIDA ÖDEME SİPARİŞİ\n\n` +
      `Ürün: ${product.name}\n` +
      `Adet: ${v.qty}\n` +
      `Birim: ${formatTL(product.price)}\n` +
      `Toplam: ${formatTL(total)}\n\n` +
      `Ad Soyad: ${v.name}\n` +
      `Telefon: ${v.phone}\n` +
      `Şehir: ${v.city}\n` +
      `Adres: ${v.address}\n` +
      (v.note ? `Not: ${v.note}\n` : "") +
      `\nLütfen siparişimi onaylayın.`;
    window.open(waLink(msg), "_blank");
    setSent(true);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-full border border-primary/40 px-6 py-3.5 text-sm font-semibold text-primary transition hover:bg-primary/10"
      >
        💵 Kapıda Ödeme ile Sipariş Ver
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold">Kapıda Ödeme Formu</h3>
          <p className="text-xs text-muted-foreground">Formu doldurun; sipariş WhatsApp üzerinden onaylanır.</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-xs text-muted-foreground hover:text-foreground">Kapat</button>
      </div>
      {sent && (
        <div className="mt-3 rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-primary">
          ✓ WhatsApp'a yönlendiriliyorsunuz. Mesajı gönderince siparişiniz oluşur.
        </div>
      )}
      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <Field label="Ad Soyad" name="name" error={errors.name} />
        <Field label="Telefon" name="phone" type="tel" placeholder="05XX XXX XX XX" error={errors.phone} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Şehir" name="city" error={errors.city} />
          <Field label="Adet" name="qty" type="number" defaultValue="1" error={errors.qty} />
        </div>
        <Field label="Adres" name="address" textarea error={errors.address} />
        <Field label="Not (opsiyonel)" name="note" textarea error={errors.note} />
        <button
          type="submit"
          className="mt-1 inline-flex items-center justify-center rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:brightness-110"
        >
          Siparişi WhatsApp ile Onayla
        </button>
        <p className="text-xs text-muted-foreground">
          Kargo ücreti adres ve hacme göre değişir, WhatsApp'tan onay sırasında bildirilir.
        </p>
      </form>
    </div>
  );
}

function Field({
  label, name, type = "text", placeholder, defaultValue, textarea, error,
}: {
  label: string; name: string; type?: string; placeholder?: string; defaultValue?: string; textarea?: boolean; error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          rows={3}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary"
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          defaultValue={defaultValue}
          className="w-full rounded-lg border border-border bg-input/40 px-3 py-2 text-sm outline-none focus:border-primary"
        />
      )}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}