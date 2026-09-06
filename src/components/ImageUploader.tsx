import { useEffect, useRef, useState } from "react";
import { uploadProductImages } from "@/data/uploadActions";

type ImageUploaderProps = {
  /** Yüklenmiş görsel URL'leri; sıraları galeri sırasıdır. */
  value: string[];
  onChange: (urls: string[]) => void;
  /** Yükleme klasörünü belirleyen ürün adresi; boşsa geçici anahtar kullanılır. */
  slug: string;
  /** Form kaydedilmeden yükleneni engellemek için üst bileşen bildirir. */
  onNotify?: (message: string, type: "ok" | "err") => void;
};

const MAX_FILES_PER_REQUEST = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolvePromise, rejectPromise) => {
    const reader = new FileReader();
    reader.onload = () => resolvePromise(String(reader.result));
    reader.onerror = () => rejectPromise(new Error(`${file.name} okunamadı.`));
    reader.readAsDataURL(file);
  });
}

type Preview = {
  /** Yerel object URL: önizleme her koşulda anında ve çevrimdışı çalışır. */
  local: string;
  /** Sunucuya yüklendikten sonraki kalıcı URL; yüklenmediyse boş. */
  remote?: string;
  name: string;
};

type Card = {
  src: string;
  remote: boolean;
  pending?: boolean;
};

/** Ürün görselleri için çoklu yükleme alanı; URL listesini üst bileşene verir. */
export function ImageUploader({ value, onChange, slug, onNotify }: ImageUploaderProps) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  /** Sunucu yanıtı gelmemiş öğeler; önizlemeleri yerel object URL'den gelir. */
  const [previews, setPreviews] = useState<Preview[]>([]);
  /** Kalıcı URL → yerel önizleme eşleşmesi: gösterim her zaman yerelden yapılır. */
  const localByRemote = useRef(new Map<string, string>());
  /** Yüklenemeyen görsel URL'leri; kartta açık hata gösterilir. */
  const [failed, setFailed] = useState<Record<string, number>>({});
  const dragIndex = useRef<number | null>(null);

  // Üst bileşenden kaldırılan görsellerin önizleme kaydını da temizle;
  // aksi halde tamamlanan yükleme "bekliyor" gibi yeniden görünür (spinner takılır).
  useEffect(() => {
    const removedUrls: string[] = [];
    for (const url of [...localByRemote.current.keys()]) {
      if (!value.includes(url)) {
        removedUrls.push(url);
        const local = localByRemote.current.get(url);
        if (local) URL.revokeObjectURL(local);
        localByRemote.current.delete(url);
      }
    }
    if (removedUrls.length > 0) {
      setPreviews((current) =>
        current.filter((item) => !item.remote || !removedUrls.includes(item.remote)),
      );
      setFailed((current) => {
        const next = { ...current };
        for (const url of removedUrls) {
          const local = next[url];
          delete next[url];
          // Kart yerel URL ile gösteriliyorsa o anahtar da temizlensin.
          if (local) delete next[local];
        }
        return next;
      });
    }
  }, [value]);

  // Bileşen kaldırıldığında kalan tüm yerel URL'leri serbest bırak.
  useEffect(() => {
    const map = localByRemote.current;
    return () => {
      for (const local of map.values()) URL.revokeObjectURL(local);
      map.clear();
    };
  }, []);

  function notify(message: string, type: "ok" | "err" = "err") {
    setError(type === "err" ? message : "");
    onNotify?.(message, type);
  }

  async function handleFiles(files: File[]) {
    if (!files.length) return;
    if (value.length + files.length > 15) {
      notify("En fazla 15 görsel ekleyebilirsiniz.");
      return;
    }
    const invalid = files.find((file) => !ACCEPTED.includes(file.type) || file.size > MAX_SIZE);
    if (invalid) {
      notify(`${invalid.name}: PNG, JPG veya WebP ve en fazla 5 MB olmalı.`);
      return;
    }
    setBusy(true);
    setError("");
    // Anında önizleme: dosya seçilir seçilmez yerel URL ile gösterilir.
    const batch = files.slice(0, MAX_FILES_PER_REQUEST).map((file) => ({
      file,
      local: URL.createObjectURL(file),
      name: file.name,
    }));
    setPreviews((current) => [...current, ...batch.map(({ local, name }) => ({ local, name }))]);
    try {
      const uploads = await Promise.all(
        batch.map(async (item) => ({
          name: item.name,
          dataUrl: await readAsDataUrl(item.file),
        })),
      );
      const result = await uploadProductImages({
        data: {
          token: localStorage.getItem("admin_token") ?? "",
          slug: slug || "gecici",
          files: uploads,
        },
      });
      // Sunucu URL'lerini yerel önizlemelere eşle (aynı sırada): gösterim
      // yerel URL'den sürer, kalıcı URL yalnızca kayıt verisinde kullanılır.
      result.urls.forEach((url, index) => {
        const local = batch[index]?.local;
        if (local) localByRemote.current.set(url, local);
      });
      setPreviews((current) =>
        current.map((item) => {
          const index = batch.findIndex((b) => b.local === item.local);
          return index >= 0 && result.urls[index] && !item.remote
            ? { ...item, remote: result.urls[index] }
            : item;
        }),
      );
      onChange([...value, ...result.urls]);
      notify(`${result.urls.length} görsel yüklendi.`, "ok");
    } catch (err) {
      // Yükleme başarısız: bu grubun yerel önizlemelerini kaldır.
      setPreviews((current) =>
        current.filter((item) => !batch.some((b) => b.local === item.local)),
      );
      batch.forEach((item) => URL.revokeObjectURL(item.local));
      notify(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  function move(index: number, direction: number) {
    const next = [...value];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setDragOver(false);
    if (dragIndex.current !== null) {
      // Görsel kartının kart üstüne sürüklenmesi sıralama değiştirir.
      const target = Number(
        (event.target as HTMLElement).closest("[data-index]")?.getAttribute("data-index") ??
          dragIndex.current,
      );
      const from = dragIndex.current;
      if (target !== from) {
        const next = [...value];
        const [moved] = next.splice(from, 1);
        next.splice(target, 0, moved);
        onChange(next);
      }
      dragIndex.current = null;
      return;
    }
    handleFiles(Array.from(event.dataTransfer.files));
  }

  function retry(src: string) {
    setFailed((current) => ({ ...current, [src]: (current[src] ?? 0) + 1 }));
  }

  // Görsel kartları: kalıcı URL'ler (varsa yerel önizlemesiyle) + bekleyenler.
  const remoteCards: Card[] = value.map((url) => ({
    src: localByRemote.current.get(url) ?? url,
    remote: true,
  }));
  // Yalnızca sunucu yanıtı gelmemiş öğeler "bekliyor" sayılır; remote'u
  // dolu öğeler ya value'de gösterilir ya da üstteki effect ile silinir.
  const pendingCards: Card[] = previews
    .filter((item) => !item.remote)
    .map((item) => ({ src: item.local, remote: false, pending: true }));
  const cards: Card[] = [...remoteCards, ...pendingCards];

  return (
    <div>
      <label
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragOver
            ? "border-primary bg-primary/5"
            : "border-stone-300 hover:border-primary hover:bg-stone-50"
        }`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <span className="text-2xl" aria-hidden="true">
          🖼️
        </span>
        <span className="text-sm font-medium text-stone-700">
          {busy ? "Yükleniyor…" : "Görselleri sürükleyin veya seçin"}
        </span>
        <span className="text-xs text-stone-400">
          PNG, JPG, WebP · en fazla 5 MB · ilk görsel ana görsel olur
        </span>
        <input
          ref={input}
          type="file"
          accept={ACCEPTED.join(",")}
          multiple
          className="sr-only"
          disabled={busy}
          onChange={(event) => handleFiles(Array.from(event.target.files ?? []))}
        />
      </label>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {cards.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {cards.map((card, index) => {
            const failCount = failed[card.src] ?? 0;
            return (
              <li
                key={`${card.src}-${index}`}
                data-index={index}
                draggable={card.remote}
                onDragStart={() => {
                  dragIndex.current = index;
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className={`group relative overflow-hidden rounded-xl border bg-white ${
                  card.pending ? "border-dashed border-stone-300 opacity-70" : "border-stone-200"
                }`}
              >
                <img
                  key={`${card.src}#${failCount}`}
                  src={card.src}
                  alt={`${index + 1}. görsel`}
                  className="aspect-square w-full bg-stone-50 object-cover"
                  onError={() => setFailed((current) => ({ ...current, [card.src]: 0 }))}
                  onLoad={() =>
                    setFailed((current) => {
                      if (!(card.src in current)) return current;
                      const next = { ...current };
                      delete next[card.src];
                      return next;
                    })
                  }
                />
                {card.src in failed && !card.pending && (
                  <div className="absolute inset-0 grid place-items-center gap-1 bg-red-50/95 p-2 text-center">
                    <span className="text-[10px] font-semibold text-red-700">
                      Görsel yüklenmedi
                    </span>
                    <button
                      type="button"
                      onClick={() => retry(card.src)}
                      className="rounded-md border border-red-300 bg-white px-2 py-0.5 text-[10px] font-medium text-red-700 hover:bg-red-100"
                    >
                      Yeniden dene
                    </button>
                  </div>
                )}
                {index === 0 && (
                  <span className="absolute left-1 top-1 rounded-md bg-stone-900/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    Kapak
                  </span>
                )}
                {card.pending && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </span>
                )}
                {!card.pending && !(card.src in failed) && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                      aria-label="Öne taşı"
                      className="rounded bg-white/90 px-1.5 text-sm disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={index === remoteCards.length - 1}
                      onClick={() => move(index, 1)}
                      aria-label="Sona taşı"
                      className="rounded bg-white/90 px-1.5 text-sm disabled:opacity-30"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label="Görseli kaldır"
                      className="rounded bg-red-600 px-1.5 text-sm text-white"
                    >
                      ×
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
