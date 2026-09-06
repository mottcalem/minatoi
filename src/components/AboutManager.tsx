import { useEffect, useRef, useState } from "react";
import { getAboutContent, saveAboutContent, uploadAboutImage } from "@/data/aboutActions";
import { DEFAULT_ABOUT_CONTENT, type AboutContent } from "@/data/about";
import { RichTextEditor } from "@/components/RichTextEditor";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "video/mp4"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-primary";

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    const reader = new FileReader();
    reader.onload = () => resolvePromise(String(reader.result));
    reader.onerror = () => rejectPromise(new Error(`${file.name} okunamadı.`));
    reader.readAsDataURL(file);
  });
}

/**
 * Anasayfadaki "Minatoi Cam Tablo" tanıtım bölümü yönetimi: görsel, başlık,
 * zengin metin ve buton tek formda; "Kaydet" ile toplu gönderilir.
 */
export function AboutManager() {
  const [content, setContent] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    getAboutContent()
      .then((data) => {
        if (active) {
          setContent(data);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setIsError(true);
          setReady(true);
          setMessage("İçerik yüklenemedi. Sayfayı yenileyin.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof AboutContent>(key: K, value: AboutContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
    setMessage("");
  }

  async function handleMedia(file: File | undefined) {
    if (!file) return;
    const maxSize = file.type === "video/mp4" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (!ACCEPTED.includes(file.type) || file.size > maxSize) {
      setIsError(true);
      setMessage(
        `${file.name}: PNG, JPG, WebP veya MP4 olmalı. Görseller en fazla 5 MB, videolar 50 MB olabilir.`,
      );
      return;
    }
    setUploading(true);
    setIsError(false);
    setMessage("");
    try {
      const dataUrl = await readAsDataUrl(file);
      const result = await uploadAboutImage({
        data: { token: localStorage.getItem("admin_token") ?? "", dataUrl },
      });
      setContent((current) =>
        file.type === "video/mp4"
          ? { ...current, imageUrl: "", videoUrl: result.url }
          : { ...current, imageUrl: result.url, videoUrl: "" },
      );
      setMessage("Dosya yüklendi. Kaydet'e basarak yayına alın.");
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Dosya yüklenemedi.");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function removeMedia() {
    setContent((current) => ({ ...current, imageUrl: "", videoUrl: "" }));
    setMessage("");
  }

  async function handleSave() {
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      await saveAboutContent({
        data: { token: localStorage.getItem("admin_token") ?? "", content },
      });
      setMessage("Tanıtım bölümü kaydedildi.");
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return <p className="text-sm text-stone-400">Yükleniyor…</p>;
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-stone-900">Tanıtım Bölümü</h2>
          <p className="mt-1 text-xs text-stone-500">
            Anasayfadaki "Minatoi Cam Tablo" bölümünün görseli, başlığı ve metni buradan düzenlenir.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="shrink-0 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:brightness-110 disabled:opacity-50"
        >
          {busy ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </div>

      {message && (
        <p
          className={`mb-4 rounded-xl px-3 py-2 text-xs font-medium ${
            isError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Görsel */}
        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-stone-500">Bölüm Medyası</span>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <label
              className={`group relative flex h-40 w-full shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-stone-50 sm:w-64 ${
                uploading ? "opacity-60" : ""
              }`}
              title="Bölüm görseli veya videosu yükle"
            >
              {content.videoUrl ? (
                <video
                  src={content.videoUrl}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : content.imageUrl ? (
                <img
                  src={content.imageUrl}
                  alt={content.imageAlt || "Bölüm görseli"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex flex-col items-center gap-1 text-stone-400">
                  <span className="text-2xl" aria-hidden="true">
                    🖼️
                  </span>
                  <span className="text-xs font-medium">
                    {uploading ? "Yükleniyor…" : "Görsel veya video yükle"}
                  </span>
                </span>
              )}
              <input
                ref={fileInput}
                type="file"
                accept={ACCEPTED.join(",")}
                className="sr-only"
                disabled={uploading}
                onChange={(event) => handleMedia(event.target.files?.[0])}
              />
            </label>
            <div className="flex-1 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-stone-500">
                  Görsel alternatif metni (alt)
                </span>
                <input
                  className={inputCls}
                  value={content.imageAlt}
                  onChange={(e) => set("imageAlt", e.target.value)}
                  placeholder="ör. El yapımı deri işçiliği"
                  maxLength={200}
                />
              </label>
              {(content.imageUrl || content.videoUrl) && (
                <button
                  type="button"
                  onClick={removeMedia}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                >
                  Medyayı Kaldır
                </button>
              )}
              <p className="text-xs text-stone-400">
                PNG, JPG veya WebP en fazla 5 MB; MP4 en fazla 50 MB. Medya kaldırılırsa varsayılan
                görsel kullanılır.
              </p>
            </div>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-500">
            Üst etiket (opsiyonel)
          </span>
          <input
            className={inputCls}
            value={content.eyebrow}
            onChange={(e) => set("eyebrow", e.target.value)}
            placeholder="ör. MinaToi"
            maxLength={60}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-500">Başlık</span>
          <input
            className={inputCls}
            value={content.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="ör. Minatoi Cam Tablo"
            maxLength={120}
          />
        </label>

        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-stone-500">Metin</span>
          <RichTextEditor
            value={content.bodyHtml}
            onChange={(html) => set("bodyHtml", html)}
            placeholder="Bölüm metni. Kalın, italik, başlık, liste ve bağlantı biçimlerini kullanabilirsiniz."
          />
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-500">
            Buton etiketi (opsiyonel)
          </span>
          <input
            className={inputCls}
            value={content.ctaLabel}
            onChange={(e) => set("ctaLabel", e.target.value)}
            placeholder="ör. Tüm Ürünleri Gör — boş bırakılırsa gizlenir"
            maxLength={60}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-500">
            Buton hedefi (dahili yol veya https)
          </span>
          <input
            className={inputCls}
            value={content.ctaHref}
            onChange={(e) => set("ctaHref", e.target.value)}
            placeholder="/urunler"
            maxLength={300}
          />
        </label>
      </div>
    </div>
  );
}
