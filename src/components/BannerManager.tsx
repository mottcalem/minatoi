import { useEffect, useState } from "react";
import { getBanners, saveBanners } from "@/data/bannerActions";
import type { Banner } from "@/data/banners";

async function readBanner(file: File): Promise<Banner> {
  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error("PNG, JPG veya WebP seçin. Her dosya en fazla 5 MB olabilir.");
  }
  const image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Dosya okunamadı."));
    reader.readAsDataURL(file);
  });
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Görsel açılamadı."));
    img.src = image;
  });
  return { id: crypto.randomUUID(), image, alt: file.name.replace(/\.[^.]+$/, ""), ...dimensions };
}

export function BannerManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    getBanners().then((items) => {
      if (active) { setBanners(items.filter((item) => item.image !== "/images/banners/banner-minatoi.png")); setReady(true); }
    }).catch(() => { if (active) setMessage("Bannerlar yüklenemedi. Sayfayı yenileyin."); });
    return () => { active = false; };
  }, []);

  function move(index: number, direction: number) {
    setBanners((items) => {
      const next = [...items];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
    setMessage("");
  }

  return (
    <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby="banner-heading">
      <h2 id="banner-heading" className="font-display text-xl font-bold">Anasayfa Sağ Slider</h2>
      <p className="mt-1 text-sm text-stone-500">Sağdaki görsel alanına en fazla 10 görsel ekleyebilirsiniz. Önerilen boyut: 1000 × 1000 px. Görseller alanı dolduracak şekilde kırpılır. Görsel eklenmezse ürünler otomatik gösterilir. Değişiklikleri kaydettiğinizde anasayfada yayınlanır.</p>
      <fieldset disabled={!ready || busy} className="mt-4 space-y-4 disabled:opacity-60">
        <label className="block text-sm font-medium">
          Banner yükle (PNG, JPG, WebP · en fazla 5 MB)
          <input type="file" accept="image/png,image/jpeg,image/webp" multiple className="mt-2 block w-full text-sm" onChange={async (event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (!files.length) return;
            setBusy(true); setMessage("");
            try {
              if (banners.length + files.length > 10) throw new Error("En fazla 10 banner ekleyebilirsiniz.");
              const additions = await Promise.all(files.map(readBanner));
              setBanners((items) => [...items, ...additions]);
            } catch (error) { setMessage(error instanceof Error ? error.message : "Yükleme başarısız."); }
            finally { setBusy(false); }
          }} />
        </label>
        {ready && !banners.length && <p className="text-sm text-stone-500">Özel görsel yok. Sağ sliderda ürün görselleri gösterilir.</p>}
        {banners.map((banner, index) => (
          <div key={banner.id} className="flex flex-col gap-3 rounded-xl border border-stone-200 p-3 sm:flex-row sm:items-center">
            <img src={banner.image} alt={banner.alt} className="h-24 w-full rounded-lg bg-stone-50 object-contain sm:w-48" />
            <label className="flex-1 text-sm font-medium">{index + 1}. banner açıklaması
              <input value={banner.alt} maxLength={500} required className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2" onChange={(event) => {
                setBanners((items) => items.map((item) => item.id === banner.id ? { ...item, alt: event.target.value } : item));
                setMessage("");
              }} />
            </label>
            <div className="flex gap-2 text-sm">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`${index + 1}. bannerı yukarı taşı`} className="rounded border p-2 disabled:opacity-30">↑</button>
              <button type="button" disabled={index === banners.length - 1} onClick={() => move(index, 1)} aria-label={`${index + 1}. bannerı aşağı taşı`} className="rounded border p-2 disabled:opacity-30">↓</button>
              <button type="button" onClick={() => { setBanners((items) => items.filter((item) => item.id !== banner.id)); setMessage(""); }} className="rounded border border-red-200 px-3 text-red-600">Sil</button>
            </div>
          </div>
        ))}
        <button type="button" className="rounded-full bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white" onClick={async () => {
          setBusy(true); setMessage("");
          try {
            if (banners.some((banner) => !banner.alt.trim())) throw new Error("Her banner için açıklama girin.");
            await saveBanners({ data: { token: localStorage.getItem("admin_token") ?? "", banners } });
            setMessage("Bannerlar kaydedildi.");
          } catch (error) { setMessage(error instanceof Error ? error.message : "Kaydetme başarısız."); }
          finally { setBusy(false); }
        }}>{busy ? "İşleniyor…" : "Bannerları Kaydet"}</button>
      </fieldset>
      <p role="status" className="mt-3 text-sm">{message || (!ready ? "Yükleniyor…" : "")}</p>
    </section>
  );
}
