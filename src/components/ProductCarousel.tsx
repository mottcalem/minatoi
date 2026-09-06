import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ProductCard } from "@/components/ProductCard";
import { type Product } from "@/data/products";

type ProductCarouselProps = {
  products: Product[];
  eyebrow: string;
  title: string;
  description?: string;
  /** Category slug for the "Tümünü Gör" link; omit to hide the link. */
  viewAllSlug?: string;
};

export function ProductCarousel({
  products,
  eyebrow,
  title,
  description,
  viewAllSlug,
}: ProductCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [scrollable, setScrollable] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const section = useRef<HTMLElement>(null);
  const titleId = useId();
  // Duplicate small catalogs so the seamless loop still works on desktop.
  const slides =
    products.length > 1 && products.length <= 3
      ? [...products, ...products, ...products]
      : products;

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

  if (!products.length) return null;

  return (
    <section ref={section} className="bg-stone-50 py-20" aria-labelledby={titleId}>
      <div className="mx-auto max-w-7xl px-4">
        <Carousel
          setApi={setApi}
          opts={{ align: "start", loop: true, slidesToScroll: 1 }}
          aria-label={title}
          aria-roledescription="karusel"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                {eyebrow}
              </p>
              <h2
                id={titleId}
                className="mt-2 font-display text-3xl font-bold text-stone-900 sm:text-4xl"
              >
                {title}
              </h2>
              {description && <p className="mt-2 max-w-xl text-stone-500">{description}</p>}
            </div>
            <div className="flex items-center gap-2">
              {viewAllSlug && (
                <Link
                  to="/kategori/$slug"
                  params={{ slug: viewAllSlug }}
                  className="mr-2 hidden text-sm font-medium text-primary hover:underline sm:inline"
                >
                  Tümünü Gör →
                </Link>
              )}
              <button
                type="button"
                aria-label="Önceki ürünler"
                disabled={!scrollable}
                onClick={() => move("previous")}
                className={controlClass}
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Sonraki ürünler"
                disabled={!scrollable}
                onClick={() => move("next")}
                className={controlClass}
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
          <CarouselContent className="-ml-4 pb-1">
            {slides.map((product, index) => (
              <CarouselItem
                key={`${product.slug}-${index}`}
                className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3"
                aria-roledescription="slayt"
                aria-label={`${(index % products.length) + 1} / ${products.length}`}
              >
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
