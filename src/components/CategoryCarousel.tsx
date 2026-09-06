import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";

export type CategoryCard = {
  slug: string;
  label: string;
  description: string;
  image: string;
  comingSoon?: boolean;
};

export function CategoryCarousel({ categories }: { categories: CategoryCard[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [scrollable, setScrollable] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const section = useRef<HTMLElement>(null);
  // Keep three full-size cards visible while allowing a seamless loop for small catalogs.
  const slides = categories.length > 1 && categories.length <= 3
    ? [...categories, ...categories, ...categories]
    : categories;

  useEffect(() => {
    if (!api) return;
    const update = () => setScrollable(api.scrollSnapList().length > 1);
    update();
    api.on("reInit", update);
    return () => { api.off("reInit", update); };
  }, [api]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 });
    if (section.current) observer.observe(section.current);
    return () => { media.removeEventListener("change", update); observer.disconnect(); };
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
      if (api.canScrollNext()) api.scrollNext(); else api.scrollTo(0);
    } else {
      if (api.canScrollPrev()) api.scrollPrev(); else api.scrollTo(api.scrollSnapList().length - 1);
    }
  }

  const controlClass = "flex size-11 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-700 transition-colors hover:border-primary hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-default disabled:opacity-30";

  if (!categories.length) return null;

  return (
    <section ref={section} className="mx-auto max-w-7xl px-4 py-16" aria-labelledby="categories-title">
      <Carousel
        setApi={setApi}
        opts={{ align: "start", loop: true, slidesToScroll: 1 }}
        aria-label="Kategoriler"
        aria-roledescription="karusel"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}

      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Koleksiyon</p>
            <h2 id="categories-title" className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl">Kategoriler</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/urunler" className="mr-2 hidden text-sm font-medium text-primary hover:underline sm:inline">Tümünü Gör →</Link>
            <button type="button" aria-label="Önceki kategoriler" disabled={!scrollable} onClick={() => move("previous")} className={controlClass}><ChevronLeft className="size-5" /></button>
            <button type="button" aria-label="Sonraki kategoriler" disabled={!scrollable} onClick={() => move("next")} className={controlClass}><ChevronRight className="size-5" /></button>
          </div>
        </div>
        <CarouselContent className="-ml-4 pb-1">
          {slides.map((category, index) => (
            <CarouselItem key={`${category.slug}-${index}`} className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3" aria-roledescription="slayt" aria-label={`${index % categories.length + 1} / ${categories.length}`}>
              {category.comingSoon ? (
                <div className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-6 text-center">
                  <span className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-500">Yakında</span>
                  <h3 className="mt-3 font-display text-xl font-bold text-stone-400">{category.label}</h3>
                  <p className="mt-1 text-sm text-stone-400">{category.description}</p>
                </div>
              ) : (
                <Link to="/kategori/$slug" params={{ slug: category.slug }} className="group relative block h-64 overflow-hidden rounded-2xl border border-stone-100 bg-white shadow-sm transition-shadow hover:shadow-elegant focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
                  <img src={category.image} alt={category.label} loading="lazy" draggable={false} className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/75 via-stone-900/10 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <h3 className="font-display text-xl font-bold text-white">{category.label}</h3>
                    <p className="mt-1 text-sm text-white/80">{category.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white/90 transition-all group-hover:gap-2">Keşfet <span>→</span></span>
                  </div>
                </Link>
              )}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
