import { useEffect, useState } from "react";
import { getAnnouncements } from "@/data/announcementActions";

/** Sunucudan duyurular okunana kadar ilk render'da gösterilen varsayılan liste. */
const INITIAL_ANNOUNCEMENTS = [
  "Kapıda Ödeme · Tüm Türkiye",
  "2. Üründe %25 İndirim",
  "Türkiye'nin Her Yerine Ücretsiz Kargo",
  "4mm Temperli Cam",
  "Solmaz Ömürlük Renkler",
  "Hasarsız Teslimat Garantisi",
];

export function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<string[]>(INITIAL_ANNOUNCEMENTS);

  useEffect(() => {
    let active = true;
    getAnnouncements()
      .then((items) => {
        if (active && items.length) setAnnouncements(items);
      })
      .catch(() => {
        /* Bağlantı hatasında varsayılan liste gösterilmeye devam eder. */
      });
    return () => {
      active = false;
    };
  }, []);

  if (!announcements.length) return null;

  // Two identical groups back-to-back; animating the track by -50% loops seamlessly.
  const group = (ariaHidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden || undefined}>
      {announcements.map((text, index) => (
        <span key={index} className="flex items-center whitespace-nowrap">
          <span className="px-6 text-sm font-semibold tracking-wide text-white">{text}</span>
          <span className="text-sm text-amber-400" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="w-full overflow-hidden bg-stone-900 py-2" role="region" aria-label="Duyurular">
      <div className="flex w-max animate-marquee motion-reduce:animate-none">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
