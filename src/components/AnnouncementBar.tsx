import { useCart } from "./CartProvider";
import { useEffect, useRef, useState } from "react";
import { getAnnouncements } from "@/data/announcementActions";

/** Sunucudan duyurular okunana kadar ilk render'da gösterilen varsayılan liste. */
const INITIAL_ANNOUNCEMENTS = [
  "Kapıda Ödeme · Tüm Türkiye",
  "Türkiye'nin Her Yerine Ücretsiz Kargo",
  "4mm Temperli Cam",
  "Solmaz Ömürlük Renkler",
  "Hasarsız Teslimat Garantisi",
];

export function AnnouncementBar() {
  const { promotions } = useCart();
  const [announcements, setAnnouncements] = useState<string[]>(INITIAL_ANNOUNCEMENTS);

  useEffect(() => {
    let active = true;
    getAnnouncements()
      .then((items) => {
        if (active) setAnnouncements(items);
      })
      .catch(() => {
        /* Bağlantı hatasında varsayılan liste gösterilmeye devam eder. */
      });
    return () => {
      active = false;
    };
  }, []);

  const visible = announcements.filter((text) => !/indirim|kampanya|%/i.test(text));
  if (promotions.secondProductEnabled)
    visible.push(`2. Üründe %${promotions.secondProductPercent} İndirim`);
  if (!visible.length) return null;

  return <AnnouncementTicker key={JSON.stringify(visible)} messages={visible} />;
}

function AnnouncementTicker({ messages }: { messages: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sequenceRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ copies: 1, duration: 30 });

  useEffect(() => {
    const container = containerRef.current;
    const sequence = sequenceRef.current;
    if (!container || !sequence) return;
    // Each of the two identical halves must cover the whole viewport.
    // Observe the original sequence too: loaded fonts can change its width.
    const measure = () => {
      const width = sequence.getBoundingClientRect().width;
      if (!width) return;
      const copies = Math.max(1, Math.ceil(container.clientWidth / width));
      const duration = (copies * width) / 45;
      setLayout((previous) =>
        previous.copies === copies && previous.duration === duration
          ? previous
          : { copies, duration },
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(sequence);
    measure();
    return () => observer.disconnect();
  }, []);

  const group = (duplicate: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={duplicate || undefined}>
      {Array.from({ length: layout.copies }, (_, copy) => (
        <div
          key={copy}
          ref={!duplicate && copy === 0 ? sequenceRef : undefined}
          className="flex shrink-0 items-center"
          aria-hidden={copy > 0 || undefined}
        >
          {messages.map((text, index) => (
            <span key={index} className="flex shrink-0 items-center whitespace-nowrap">
              <span className="px-6 text-sm font-medium tracking-normal text-stone-100">
                {text}
              </span>
              <span className="text-sm text-amber-300/80" aria-hidden="true">
                ✦
              </span>
            </span>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden bg-stone-700 py-1.5"
      role="region"
      aria-label="Duyurular"
    >
      <div
        className="flex w-max animate-marquee motion-reduce:animate-none"
        style={{ animationDuration: `${layout.duration}s` }}
      >
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}
