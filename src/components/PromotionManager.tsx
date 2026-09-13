import { useEffect, useState } from "react";
import { getAdminPromotions, savePromotions } from "@/data/promotionActions";
import { DEFAULT_PROMOTIONS, type Promotions } from "@/data/promotions";
export function PromotionManager() {
  const [content, setContent] = useState<Promotions>(DEFAULT_PROMOTIONS);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    getAdminPromotions({ data: { token: localStorage.getItem("admin_token") ?? "" } })
      .then((data) => {
        setContent(data);
        setReady(true);
      })
      .catch((e) => setMessage(e.message));
  }, []);
  return (
    <form
      className="max-w-3xl space-y-6 rounded-2xl border bg-white p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        try {
          await savePromotions({
            data: { token: localStorage.getItem("admin_token") ?? "", content },
          });
          setMessage("Kampanya ayarları kaydedildi.");
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Kaydedilemedi.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="font-display text-2xl font-bold">Kampanyalar ve indirim kodları</h2>
      <fieldset disabled={!ready || busy} className="space-y-5 disabled:opacity-50">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={content.showOldPrices}
            onChange={(e) => setContent({ ...content, showOldPrices: e.target.checked })}
          />
          Ürünlerde eski fiyat ve indirim rozetlerini göster
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={content.secondProductEnabled}
            onChange={(e) => setContent({ ...content, secondProductEnabled: e.target.checked })}
          />
          İkinci ürün kampanyasını etkinleştir
        </label>
        <label className="block">
          İkinci ürün indirim oranı (%){" "}
          <input
            aria-label="İkinci ürün indirim oranı"
            type="number"
            min="1"
            max="99"
            required
            value={content.secondProductPercent}
            onChange={(e) =>
              setContent({ ...content, secondProductPercent: Number(e.target.value) })
            }
            className="ml-3 w-20 rounded border p-2"
          />
        </label>
        <p className="text-sm text-stone-500">
          Kampanya en az iki ürün içeren sepette en ucuz ürünün bir adedine uygulanır. Kod
          kullanıldığında kod indirimi uygulanır; indirimler birleşmez.
        </p>
        <h3 className="text-lg font-semibold">İndirim kodları</h3>
        {!content.codes.length && (
          <p className="text-sm text-stone-500">Henüz indirim kodu tanımlanmadı.</p>
        )}
        {content.codes.map((row, index) => (
          <div key={index} className="flex flex-wrap items-end gap-3 rounded-xl border p-3">
            <label className="min-w-0 flex-1 text-sm">
              Kod
              <input
                required
                minLength={2}
                maxLength={40}
                pattern="[A-Za-z0-9_-]+"
                value={row.code}
                onChange={(e) =>
                  setContent({
                    ...content,
                    codes: content.codes.map((r, i) =>
                      i === index ? { ...r, code: e.target.value.toUpperCase() } : r,
                    ),
                  })
                }
                className="mt-1 block w-full rounded border p-2"
              />
            </label>
            <label className="text-sm">
              İndirim (%)
              <input
                required
                type="number"
                min="1"
                max="99"
                value={row.percent}
                onChange={(e) =>
                  setContent({
                    ...content,
                    codes: content.codes.map((r, i) =>
                      i === index ? { ...r, percent: Number(e.target.value) } : r,
                    ),
                  })
                }
                className="mt-1 block w-24 rounded border p-2"
              />
            </label>
            <label className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                checked={row.active}
                onChange={(e) =>
                  setContent({
                    ...content,
                    codes: content.codes.map((r, i) =>
                      i === index ? { ...r, active: e.target.checked } : r,
                    ),
                  })
                }
              />
              Aktif
            </label>
            <button
              type="button"
              className="p-2 text-red-700"
              onClick={() =>
                setContent({ ...content, codes: content.codes.filter((_, i) => i !== index) })
              }
            >
              Sil
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={content.codes.length >= 100}
          className="rounded-xl border px-4 py-2"
          onClick={() =>
            setContent({
              ...content,
              codes: [...content.codes, { code: "", percent: 10, active: false }],
            })
          }
        >
          Kod ekle
        </button>
        <button className="ml-3 rounded-xl bg-primary px-5 py-2 text-white">
          {busy ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </fieldset>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
