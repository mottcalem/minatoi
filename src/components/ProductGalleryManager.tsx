import { useEffect, useState } from "react";
import {
  getProductGallerySettings,
  saveProductGallerySettings,
} from "@/data/productGalleryActions";
import { uploadProductImages } from "@/data/uploadActions";

export function ProductGalleryManager() {
  const [image, setImage] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getProductGallerySettings()
      .then((settings) => {
        if (active) {
          setImage(settings.image);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) setError("Ayarlar yüklenemedi. Sayfayı yenileyin.");
      });
    return () => {
      active = false;
    };
  }, []);

  async function save(file?: File, remove = false) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const token = localStorage.getItem("admin_token") ?? "";
      let next = remove ? "" : image;
      if (file) {
        if (
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 5 * 1024 * 1024
        ) {
          throw new Error("En fazla 5 MB boyutunda JPG, PNG veya WebP seçin.");
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Görsel okunamadı."));
          reader.readAsDataURL(file);
        });
        const result = await uploadProductImages({
          data: { token, slug: "ortak-galeri", files: [{ name: file.name, dataUrl }] },
        });
        next = result.urls[0];
      }
      await saveProductGallerySettings({ data: { token, settings: { image: next } } });
      const saved = await getProductGallerySettings();
      if (saved.image !== next) throw new Error("Kayıt doğrulanamadı. Tekrar deneyin.");
      setImage(saved.image);
      setMessage(
        remove
          ? "Ortak görsel tüm ürünlerden kaldırıldı."
          : "Ortak görsel tüm ürünler için güncellendi.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="font-display text-xl font-bold">Ortak Ürün Görseli — Askı Aparatı</h2>
      <p className="mt-2 text-sm text-stone-600">
        Tüm ürünlerin küçük görsellerinin sonuna eklenir. Askı aparatı fotoğrafını buradan
        değiştirebilir veya tüm ürünlerden kaldırabilirsiniz. Bu görsel ürünün kendi görsellerinden
        ayrı yönetilir. Buradaki değişiklikler ürünün kaydet düğmesini beklemeden tüm ürünlere
        uygulanır.
      </p>
      {ready && (
        <div className="mt-5 space-y-4">
          {image ? (
            <img
              src={image}
              alt="Ortak ürün görseli"
              className="h-56 w-56 rounded-xl border object-contain"
            />
          ) : (
            <p className="text-sm text-stone-500">Ortak görsel eklenmemiş.</p>
          )}
          <label className="block text-sm font-semibold">
            Görsel yükle / değiştir
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={busy}
              className="mt-2 block w-full text-sm"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void save(file);
                event.target.value = "";
              }}
            />
          </label>
          <p className="text-xs text-stone-500">
            JPG, PNG veya WebP · en fazla 5 MB. Seçtiğiniz görsel otomatik kaydedilir.
          </p>
          {image && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void save(undefined, true)}
              className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700 disabled:opacity-50"
            >
              Ortak görseli kaldır
            </button>
          )}
        </div>
      )}
      {busy && (
        <p role="status" className="mt-3 text-sm">
          Kaydediliyor…
        </p>
      )}
      {message && (
        <p role="status" className="mt-3 text-sm text-green-700">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </section>
  );
}
