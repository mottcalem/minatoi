import { useEffect, useRef, useState } from "react";
import { getCategories, saveCategories } from "@/data/categoryActions";
import { uploadCategoryImage } from "@/data/uploadActions";
import { generateCategorySlug, type CategoryRecord } from "@/data/categories";

const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    const reader = new FileReader();
    reader.onload = () => resolvePromise(String(reader.result));
    reader.onerror = () => rejectPromise(new Error(`${file.name} okunamadı.`));
    reader.readAsDataURL(file);
  });
}

/**
 * Ürün kategorileri yönetimi. Sunucu tam listeyi tek kayıtta değiştirir;
 * bu yüzden düzenlemeler "Kaydet" ile toplu gönderilir. Kategori görseli
 * anında sunucuya yüklenir ve public yol satıra işlenir.
 */
export function CategoryManager({ onSaved }: { onSaved?: () => void }) {
  const [items, setItems] = useState<CategoryRecord[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadingSlug, setUploadingSlug] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [newLabel, setNewLabel] = useState("");

  useEffect(() => {
    let active = true;
    getCategories()
      .then((data) => {
        if (active) {
          setItems(data);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setIsError(true);
          setReady(true);
          setMessage("Kategoriler yüklenemedi. Sayfayı yenileyin.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function update(slug: string, patch: Partial<CategoryRecord>) {
    setItems((current) =>
      current.map((item) => (item.slug === slug ? { ...item, ...patch } : item)),
    );
    setMessage("");
  }

  function move(index: number, direction: number) {
    setItems((current) => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
    setMessage("");
  }

  function handleAdd() {
    const label = newLabel.trim();
    if (!label) return;
    const slug = generateCategorySlug(label);
    if (!slug) {
      setIsError(true);
      setMessage("Geçerli bir kategori adı girin.");
      return;
    }
    if (items.some((item) => item.slug === slug)) {
      setIsError(true);
      setMessage("Bu kategori zaten listede.");
      return;
    }
    if (items.length >= 30) {
      setIsError(true);
      setMessage("En fazla 30 kategori ekleyebilirsiniz.");
      return;
    }
    setItems((current) => [...current, { slug, label, description: "" }]);
    setNewLabel("");
    setIsError(false);
    setMessage("");
  }

  async function handleImage(slug: string, file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type) || file.size > MAX_SIZE) {
      setIsError(true);
      setMessage(`${file.name}: PNG, JPG veya WebP ve en fazla 5 MB olmalı.`);
      return;
    }
    setUploadingSlug(slug);
    setIsError(false);
    setMessage("");
    try {
      const dataUrl = await readAsDataUrl(file);
      const result = await uploadCategoryImage({
        data: { token: localStorage.getItem("admin_token") ?? "", slug, dataUrl },
      });
      update(slug, { image: result.url });
      setMessage("Görsel yüklendi. Kaydet'e basarak yayına alın.");
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Görsel yüklenemedi.");
    } finally {
      setUploadingSlug(null);
    }
  }

  async function handleSave(list: CategoryRecord[]) {
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      await saveCategories({
        data: { token: localStorage.getItem("admin_token") ?? "", categories: list },
      });
      setItems(list);
      onSaved?.();
      setMessage("Kategoriler kaydedildi. Ürün formu ve site menüsü güncellenir.");
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : "Kaydetme başarısız.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="mb-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      aria-labelledby="category-heading"
    >
      <h2 id="category-heading" className="font-display text-xl font-bold">
        Ürün Kategorileri
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Kategori adı girildiğinde adres (slug) otomatik üretilir. Sıralama, sitedeki görünme
        sırasıdır. Görsel yükledikten sonra değişiklikleri kaydedin; görsel yoksa anasayfa
        karuselinde varsayılan görsel kullanılır. En fazla 30 kategori.
      </p>
      <fieldset disabled={!ready || busy} className="mt-4 space-y-3 disabled:opacity-60">
        <ol className="space-y-2">
          {items.map((item, index) => (
            <li key={item.slug} className="rounded-xl border border-stone-200 p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                {/* Görsel yükleme alanı */}
                <label
                  className="group relative block h-20 w-full shrink-0 cursor-pointer overflow-hidden rounded-lg border border-stone-200 bg-stone-50 sm:w-32"
                  title="Kategori görseli yükle"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={`${item.label} görseli`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-stone-400">
                      <span className="text-xl" aria-hidden="true">
                        🖼️
                      </span>
                      <span className="text-[10px] font-medium">Görsel yükle</span>
                    </span>
                  )}
                  {uploadingSlug === item.slug && (
                    <span className="absolute inset-0 grid place-items-center bg-white/70">
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </span>
                  )}
                  <input
                    type="file"
                    accept={ACCEPTED.join(",")}
                    className="sr-only"
                    disabled={uploadingSlug !== null}
                    onChange={(event) => {
                      handleImage(item.slug, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <label className="flex-1 text-xs font-medium text-stone-500">
                      Kategori adı
                      <input
                        value={item.label}
                        maxLength={100}
                        onChange={(event) => update(item.slug, { label: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        aria-label={`${index + 1}. kategori adı`}
                      />
                    </label>
                    <label className="flex-[2] text-xs font-medium text-stone-500">
                      Açıklama
                      <input
                        value={item.description}
                        maxLength={300}
                        onChange={(event) => update(item.slug, { description: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        aria-label={`${index + 1}. kategori açıklaması`}
                      />
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-mono text-stone-300">/kategori/{item.slug}</p>
                    {item.image && (
                      <button
                        type="button"
                        onClick={() => update(item.slug, { image: undefined })}
                        className="text-[11px] font-medium text-stone-400 hover:text-red-600"
                      >
                        Görseli kaldır
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 text-sm lg:self-center">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    aria-label={`${index + 1}. kategoriyi yukarı taşı`}
                    className="rounded border border-stone-200 p-2 disabled:opacity-30 hover:bg-stone-50"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                    aria-label={`${index + 1}. kategoriyi aşağı taşı`}
                    className="rounded border border-stone-200 p-2 disabled:opacity-30 hover:bg-stone-50"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItems((current) => current.filter((entry) => entry.slug !== item.slug));
                      setMessage("");
                    }}
                    aria-label={`${index + 1}. kategoriyi sil`}
                    className="rounded border border-red-200 px-3 text-red-600 hover:bg-red-50"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex gap-2">
          <input
            value={newLabel}
            maxLength={100}
            placeholder="Yeni kategori adı (ör. Kemer)"
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            onChange={(event) => setNewLabel(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            aria-label="Yeni kategori adı"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Ekle
          </button>
        </div>
        <div className="pt-1">
          <button
            type="button"
            onClick={() => handleSave(items.filter((item) => item.label.trim()))}
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Kaydediliyor…" : "Kategorileri Kaydet"}
          </button>
        </div>
      </fieldset>
      <p role="status" className={`mt-3 text-sm ${isError ? "text-red-600" : "text-green-700"}`}>
        {message || (!ready ? "Yükleniyor…" : "")}
      </p>
    </section>
  );
}
