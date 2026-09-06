import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { TESTIMONIALS, type Testimonial } from "@/data/testimonials";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={`${rating} üzerinden 5 yıldız`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
          }`}
        />
      ))}
    </div>
  );
}

/** Yorum kartı: avatar baş harf + isim + yıldızlar + metin. */
function TestimonialCard({ item }: { item: Testimonial }) {
  const initials = item.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary"
        >
          {initials || "?"}
        </span>
        <div>
          <figcaption className="text-sm font-semibold text-stone-900">{item.name}</figcaption>
          <Stars rating={item.rating} />
        </div>
      </div>
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-stone-600">
        "{item.text}"
      </blockquote>
    </figure>
  );
}

/**
 * Anasayfa müşteri yorumları karuseli — ProductCarousel ile aynı Embla altyapısı.
 * 4 saniyede bir otomatik geçer; hover'da durur, ekran dışında ve sekme gizliyken çalışmaz.
 */
export function TestimonialsCarousel({ items = TESTIMONIALS }: { items?: Testimonial[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [scrollable, setScrollable] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const section = useRef<HTMLElement>(null);
  const titleId = useId();
  // Sonsuz döngü için küçük listeleri çoğalt (ProductCarousel deseni).
  const slides = items.length > 1 && items.length <= 3 ? [...items, ...items, ...items] : items;

  useEffect(() => {
    if (!api) return;
    const update = () => setScrollable(api.scrollSnapList().length > 1);
    update();
    api.on("reInit", update);
    return () => {
      api.off("reInit", update);
    };
  }, [api]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    if (section.current) observer.observe(section.current);
    return () => {
      media.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!api || !scrollable || hovered || !inView || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) {
        if (api.canScrollNext()) api.scrollNext();
        else api.scrollTo(0);
      }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [api, scrollable, hovered, inView, reducedMotion]);

  function move(direction: "previous" | "next") {
    if (!api) return;
    if (direction === "next") {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    } else {
      if (api.canScrollPrev()) api.scrollPrev();
      else api.scrollTo(api.scrollSnapList().length - 1);
    }
  }

  const controlClass =
    "flex size-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:opacity-30";

  if (!items.length) return null;

  return (
    <section ref={section} className="py-20" aria-labelledby={titleId}>
      <div className="mx-auto max-w-7xl px-4">
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true, slidesToScroll: 1 }}
          aria-label="Müşteri yorumları"
          aria-roledescription="karusel"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                Referanslar
              </p>
              <h2
                id={titleId}
                className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl"
              >
                Mutlu Müşterilerimiz
              </h2>
              <p className="mt-2 max-w-xl text-stone-500">
                MinaToi ürünlerini kullanan müşterilerimizin deneyimleri.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Önceki yorumlar"
                disabled={!scrollable}
                onClick={() => move("previous")}
                className={controlClass}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Sonraki yorumlar"
                disabled={!scrollable}
                onClick={() => move("next")}
                className={controlClass}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
          <CarouselContent className="-ml-4 pb-1">
            {slides.map((item, index) => (
              <CarouselItem
                key={`${item.name}-${index}`}
                className="basis-[90%] pl-4 sm:basis-1/2 lg:basis-1/3"
                aria-roledescription="slayt"
                aria-label={`${(index % items.length) + 1} / ${items.length}`}
              >
                <TestimonialCard item={item} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
