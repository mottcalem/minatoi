import { useEffect, useRef, useState } from "react";
import { getAnnouncements, saveAnnouncements } from "@/data/announcementActions";

/**
 * Kayan duyuru bandı yönetimi. Sunucu tam listeyi tek kayıtta değiştirir;
 * bu yüzden düzenlemeler "Kaydet" ile toplu gönderilir.
 */
export function AnnouncementManager() {
  const [items, setItems] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const newItem = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    getAnnouncements()
      .then((data) => {
        if (active) {
          setItems(data);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setReady(true);
          setMessage("Duyurular yüklenemedi. Sayfayı yenileyin.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  function move(index: number, direction: number) {
    setItems((current) => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
    setMessage("");
  }

  async function handleSave(list: string[]) {
    setBusy(true);
    setMessage("");
    setError(false);
    try {
      await saveAnnouncements({
        data: { token: localStorage.getItem("admin_token") ?? "", announcements: list },
      });
      setItems(list);
      setMessage("Duyurular kaydedildi. Kayan bant anında güncellenir.");
    } catch (err) {
      setError(true);
      setMessage(err instanceof Error ? err.message : "Kaydetme başarısız.");
    } finally {
      setBusy(false);
    }
  }

  function handleAdd() {
    const text = newItem.current?.value.trim() ?? "";
    if (!text) return;
    if (items.includes(text)) {
      setError(true);
      setMessage("Bu duyuru zaten listede.");
      return;
    }
    if (text.length > 200) {
      setError(true);
      setMessage("Duyuru metni 200 karakteri aşamaz.");
      return;
    }
    if (items.length >= 20) {
      setError(true);
      setMessage("En fazla 20 duyuru ekleyebilirsiniz.");
      return;
    }
    setItems((current) => [...current, text]);
    if (newItem.current) newItem.current.value = "";
    setMessage("");
  }

  return (
    <section
      className="mb-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6"
      aria-labelledby="announcement-heading"
    >
      <h2 id="announcement-heading" className="font-display text-xl font-bold">
        Kayan Duyuru Bandı
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Üst siyah bantta kayan duyuruları buradan yönetin. En fazla 20 duyuru; her metin en fazla
        200 karakter. Sıralama banttaki akışı belirler. Değişiklikler kaydedildiğinde tüm
        ziyaretçiler güncel listeyi görür.
      </p>
      <fieldset disabled={!ready || busy} className="mt-4 space-y-3 disabled:opacity-60">
        {ready && !items.length && (
          <p className="text-sm text-stone-500">
            Duyuru yok. Kayan bant gizlenir; aşağıdan ekleyin.
          </p>
        )}
        <ol className="space-y-2">
          {items.map((text, index) => (
            <li
              key={text}
              className="flex items-center gap-2 rounded-xl border border-stone-200 p-2"
            >
              <span className="w-6 text-center text-xs font-semibold text-stone-400">
                {index + 1}.
              </span>
              <input
                value={text}
                maxLength={200}
                onChange={(event) => {
                  setItems((current) =>
                    current.map((item, i) => (i === index ? event.target.value : item)),
                  );
                  setMessage("");
                }}
                className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                aria-label={`${index + 1}. duyuru metni`}
              />
              <div className="flex gap-1 text-sm">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  aria-label={`${index + 1}. duyuruyu yukarı taşı`}
                  className="rounded border border-stone-200 p-2 disabled:opacity-30 hover:bg-stone-50"
                >
                  ↑
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`${index + 1}. duyuruyu aşağı taşı`}
                  className="rounded border border-stone-200 p-2 disabled:opacity-30 hover:bg-stone-50"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItems((current) => current.filter((_, i) => i !== index));
                    setMessage("");
                  }}
                  aria-label={`${index + 1}. duyuruyu sil`}
                  className="rounded border border-red-200 px-3 text-red-600 hover:bg-red-50"
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ol>
        <div className="flex gap-2">
          <input
            ref={newItem}
            maxLength={200}
            placeholder="Yeni duyuru metni"
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAdd();
              }
            }}
            aria-label="Yeni duyuru metni"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Ekle
          </button>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleSave(items.filter((item) => item.trim()))}
            className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Kaydediliyor…" : "Duyuruları Kaydet"}
          </button>
          {items.length > 0 && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (confirm("Tüm duyurular silinecek ve kayan bant gizlenecek. Emin misiniz?")) {
                  handleSave([]);
                }
              }}
              className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              Tümünü Sil
            </button>
          )}
        </div>
      </fieldset>
      <p role="status" className={`mt-3 text-sm ${error ? "text-red-600" : "text-green-700"}`}>
        {message || (!ready ? "Yükleniyor…" : "")}
      </p>
    </section>
  );
}
