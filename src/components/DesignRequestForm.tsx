import { useId, useState } from "react";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

export function DesignRequestForm({ file, details }: { file: File | null; details: string }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (
      !file ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      !file.size ||
      file.size > 12 * 1024 * 1024
    ) {
      setError("Lütfen JPG, PNG veya WebP formatında, en fazla 12 MB bir görsel seçin.");
      return;
    }
    const data = new FormData(event.currentTarget);
    data.set("details", details);
    data.set("photo", file);
    setBusy(true);
    try {
      const response = await fetch("/api/design-requests", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok || !result.ok)
        throw new Error(result.error || "Talebiniz gönderilemedi. Lütfen tekrar deneyin.");
      setSent(result.id);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Talebiniz gönderilemedi. Lütfen tekrar deneyin.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (sent)
    return (
      <div
        role="status"
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900"
      >
        <CheckCircle2 className="mb-2 h-6 w-6" />
        <p className="font-semibold">Tasarım talebiniz alındı.</p>
        <p className="mt-2 text-sm">
          Görseliniz ve tasarım tercihleriniz ekibimize e-posta ile iletildi. Size iletişim
          bilgileriniz üzerinden dönüş yapacağız.
        </p>
        <p className="mt-2 break-all text-xs">Talep no: {sent}</p>
        <button
          type="button"
          onClick={() => setSent("")}
          className="mt-4 text-sm font-semibold underline"
        >
          Yeni talep oluştur
        </button>
      </div>
    );
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h3 className="font-semibold">İletişim bilgileriniz</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tasarım talebiniz ve görseliniz info@minatoi.com adresine gönderilir.
        </p>
      </div>
      <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-name`} className="text-sm font-medium">
            Ad soyad *
          </label>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            className="mt-1 w-full rounded-xl border px-3 py-3"
          />
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="text-sm font-medium">
            E-posta *
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className="mt-1 w-full rounded-xl border px-3 py-3"
          />
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className="text-sm font-medium">
            Telefon (isteğe bağlı)
          </label>
          <input
            id={`${id}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            className="mt-1 w-full rounded-xl border px-3 py-3"
          />
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-elegant transition hover:brightness-110 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
        {busy ? "Talebiniz gönderiliyor…" : "Tasarım talebini gönder"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Görseliniz e-postaya dosya olarak eklenir. İletişim bilgileriniz talebinize dönüş yapmak
        için kullanılır.
      </p>
    </form>
  );
}
