import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { type Banner } from "@/data/banners";
import { Link } from "@tanstack/react-router";
import { formatTL, type Product } from "@/data/products";

export function HomeBannerSlider({ banners }: { banners: (Banner & { product?: Product })[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const activeProduct = banners[selected]?.product;
  const hasMultiple = banners.length > 1;

  useEffect(() => {
    if (!api) return;
    const updateSelected = () => setSelected(api.selectedScrollSnap());
    updateSelected();
    api.on("select", updateSelected);
    api.on("reInit", updateSelected);
    return () => {
      api.off("select", updateSelected);
      api.off("reInit", updateSelected);
    };
  }, [api]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!api || !hasMultiple || hovered || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) api.scrollNext();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [api, hasMultiple, hovered, reducedMotion]);

  if (!banners.length) return null;

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: hasMultiple }}
      aria-label="MinaToi tanıtım bannerları"
      aria-roledescription="slayt gösterisi"
      className="relative min-w-0 w-full rounded-[2rem] bg-stone-100 shadow-elegant"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}

    >
      <div className="overflow-hidden rounded-[2rem]">
      <CarouselContent className="ml-0">
        {banners.map((banner, index) => (
          <CarouselItem
            key={banner.id}
            className="pl-0"
            aria-roledescription="slayt"
            aria-label={`${index + 1} / ${banners.length}`}
          >
            <img
              src={banner.image}
              alt={banner.alt}
              width={banner.width}
              height={banner.height}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              draggable={false}
              className="block aspect-square max-h-[560px] w-full object-cover object-center"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      </div>
      <button
        type="button"
        onClick={() => api?.scrollPrev()}
        disabled={!hasMultiple}
        aria-label="Önceki banner"
        className="absolute left-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 text-stone-900 shadow-md backdrop-blur-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-default disabled:opacity-50 sm:left-6"
      >
        <ChevronLeft className="size-6" />
      </button>
      <button
        type="button"
        onClick={() => api?.scrollNext()}
        disabled={!hasMultiple}
        aria-label="Sonraki banner"
        className="absolute right-3 top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/85 text-stone-900 shadow-md backdrop-blur-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 disabled:cursor-default disabled:opacity-50 sm:right-6"
      >
        <ChevronRight className="size-6" />
      </button>
      {activeProduct && (
        <Link to="/urun/$slug" params={{ slug: activeProduct.slug }} className="absolute -bottom-5 left-3 z-10 max-w-[75%] rounded-2xl bg-white px-5 py-3.5 shadow-elegant sm:-left-6">
          <p className="text-xs text-stone-400">{activeProduct.badge ?? "Öne Çıkan"}</p>
          <p className="mt-0.5 font-display text-sm font-bold text-stone-900">{activeProduct.name.split("—")[0].trim()}</p>
          <p className="text-sm font-semibold text-primary">{formatTL(activeProduct.price)}</p>
        </Link>
      )}
    </Carousel>
  );
}
