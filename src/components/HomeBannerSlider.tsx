import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { type Banner } from "@/data/banners";
import { type Product } from "@/data/products";

export function HomeBannerSlider({ banners }: { banners: (Banner & { product?: Product })[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const hasMultiple = banners.length > 1;

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
    </Carousel>
  );
}
