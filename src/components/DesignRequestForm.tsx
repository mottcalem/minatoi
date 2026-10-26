import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useCart } from "./CartProvider";
import { formatTL, type Product } from "@/data/products";
import { priceForSize } from "@/data/productPricing";

export function DesignRequestForm({
  file,
  product,
  size,
  orientation = "Dikey",
  style,
  quantity = 1,
}: {
  file: File | null;
  product: Product;
  size: string;
  orientation?: string;
  style: string;
  quantity?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { add, ready, items } = useCart();
  const navigate = useNavigate();
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !ready) return;
    setError("");
    if (items.length >= 50) {
      setError("Sepetiniz dolu. Yeni tasarım eklemek için bir ürünü kaldırın.");
      return;
    }
    if (
      !file ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      !file.size ||
      file.size > 12 * 1024 * 1024
    ) {
      setError("Lütfen JPG, PNG veya WebP formatında, en fazla 12 MB bir görsel seçin.");
      return;
    }
    const data = new FormData();
    for (const [key, value] of Object.entries({ slug: product.slug, size, orientation, style }))
      data.set(key, value);
    data.set("photo", file);
    setBusy(true);
    try {
      const response = await fetch("/api/custom-order-uploads", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok || !result.customization)
        throw new Error(result.error || "Görsel yüklenemedi. Lütfen tekrar deneyin.");
      add(product, size, quantity, result.customization);
      await navigate({ to: "/sepet" });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Görsel yüklenemedi. Lütfen tekrar deneyin.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h3 className="font-semibold">Siparişinizi tamamlayın</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Fotoğrafınız ve tasarım seçimleriniz sepetinize eklenecek. Teslimat bilgilerinizi girip
          güvenli ödeme ile siparişinizi tamamlayabilirsiniz.
        </p>
      </div>
      <p className="text-lg font-semibold">
        {formatTL(priceForSize(product, size).price * quantity)}{" "}
        <span className="text-sm font-normal text-muted-foreground">· Kargo ücretsiz</span>
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy || !ready}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-elegant transition hover:brightness-110 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShoppingBag className="h-5 w-5" />}
        {busy ? "Görseliniz yükleniyor…" : "Sepete ekle ve devam et"}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Görseliniz siparişinizle birlikte saklanır. İllüstrasyon tasarımı üretim öncesi onayınıza
        sunulur.
      </p>
    </form>
  );
}
