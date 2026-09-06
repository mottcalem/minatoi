import { useEffect, useRef, useState } from "react";
import { getHeroContent, saveHeroContent } from "@/data/heroActions";
import { DEFAULT_HERO_CONTENT, type HeroContent, type HeroStat } from "@/data/hero";

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none transition focus:border-primary";

/**
 * Anasayfa hero bölümü yönetimi. Tüm metin ve butonlar tek formda;
 * "Kaydet" ile toplu gönderilir.
 */
export function HeroManager() {
  const [content, setContent] = useState<HeroContent>(DEFAULT_HERO_CONTENT);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getHeroContent()
      .then((data) => {
        if (active) {
          setContent(data);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setReady(true);
          setMessage("İçerik yüklenemedi. Sayfayı yenileyin.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof HeroContent>(key: K, value: HeroContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function setStat(index: number, patch: Partial<HeroStat>) {
    setContent((current) => ({
      ...current,
      stats: current.stats.map((stat, i) => (i === index ? { ...stat, ...patch } : stat)),
    }));
  }

  function addStat() {
    setContent((current) =>
      current.stats.length >= 4
        ? current
        : { ...current, stats: [...current.stats, { label: "", value: "" }] },
    );
  }

  function removeStat(index: number) {
    setContent((current) => ({
      ...current,
      stats: current.stats.filter((_, i) => i !== index),
    }));
  }

  async function handleSave() {
    setBusy(true);
    setMessage("");
    try {
      await saveHeroContent({
        data: { token: localStorage.getItem("admin_token") ?? "", content },
      });
      setMessage("Hero içeriği kaydedildi.");
      setError(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Kaydedilemedi.");
      setError(true);
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
          <h2 className="font-display text-xl font-bold text-stone-900">Anasayfa Hero</h2>
          <p className="mt-1 text-xs text-stone-500">
            Başlık, açıklama, butonlar ve alt bilgi şeridi anasayfada anında güncellenir.
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
            error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-stone-500">Rozet (opsiyonel)</span>
          <input
            className={inputCls}
            value={content.badge}
            onChange={(e) => set("badge", e.target.value)}
            placeholder="ör. El Yapımı · Hakiki Deri — boş bırakılırsa gizlenir"
            maxLength={80}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-500">Başlık — 1. satır</span>
          <input
            className={inputCls}
            value={content.titleTop}
            onChange={(e) => set("titleTop", e.target.value)}
            maxLength={80}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-500">
            Başlık — 2. satır (altın vurgu)
          </span>
          <input
            className={inputCls}
            value={content.titleHighlight}
            onChange={(e) => set("titleHighlight", e.target.value)}
            maxLength={80}
            placeholder="boş bırakılırsa bu satır gizlenir"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-500">Başlık — 3. satır</span>
          <input
            className={inputCls}
            value={content.titleBottom}
            onChange={(e) => set("titleBottom", e.target.value)}
            maxLength={80}
            placeholder="boş bırakılırsa bu satır gizlenir"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-stone-500">Açıklama</span>
          <textarea
            className={inputCls}
            rows={3}
            value={content.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={500}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-500">Buton 1 — etiket</span>
          <input
            className={inputCls}
            value={content.ctaPrimaryLabel}
            onChange={(e) => set("ctaPrimaryLabel", e.target.value)}
            maxLength={60}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-stone-500">
            Buton 1 — hedef (dahili yol veya https)
          </span>
          <input
            className={inputCls}
            value={content.ctaPrimaryHref}
            onChange={(e) => set("ctaPrimaryHref", e.target.value)}
            placeholder="/urunler"
            maxLength={300}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-stone-500">
            Buton 2 — WhatsApp etiketi
          </span>
          <input
            className={inputCls}
            value={content.ctaSecondaryLabel}
            onChange={(e) => set("ctaSecondaryLabel", e.target.value)}
            maxLength={60}
          />
        </label>
      </div>

      {/* Alt bilgi şeridi */}
      <div className="mt-6 border-t border-stone-100 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-500">
            Alt bilgi şeridi (en fazla 4 madde)
          </span>
          <button
            type="button"
            onClick={addStat}
            disabled={content.stats.length >= 4}
            className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 disabled:opacity-40"
          >
            + Madde Ekle
          </button>
        </div>
        <div className="space-y-2">
          {content.stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                className={`${inputCls} flex-1`}
                value={stat.label}
                onChange={(e) => setStat(index, { label: e.target.value })}
                placeholder="Başlık (ör. Ücretsiz Kargo)"
                maxLength={60}
              />
              <input
                className={`${inputCls} flex-1`}
                value={stat.value}
                onChange={(e) => setStat(index, { value: e.target.value })}
                placeholder="Değer (ör. 999₺ üzeri)"
                maxLength={60}
              />
              <button
                type="button"
                onClick={() => removeStat(index)}
                aria-label="Maddeyi kaldır"
                className="shrink-0 rounded-lg bg-red-600 px-2.5 py-1.5 text-sm text-white transition hover:brightness-110"
              >
                ×
              </button>
            </div>
          ))}
          {content.stats.length === 0 && (
            <p className="text-xs text-stone-400">Madde eklenmedi; şerit gizlenir.</p>
          )}
        </div>
      </div>
    </div>
  );
}
