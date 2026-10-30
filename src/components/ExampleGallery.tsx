import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
export function ExampleGallery({ examples }: { examples: { label: string; image: string }[] }) {
  if (!examples.length) return null;
  return (
    <section className="mt-8 border-t border-stone-100 pt-6" aria-label="Örnek çalışmalar">
      <h3 className="text-center font-display text-xl font-bold">Örnek Çalışmalar</h3>
      <Carousel opts={{ align: "start", loop: examples.length > 1 }} className="mt-4 w-full">
        <CarouselContent className="-ml-3">
          {examples.map((example, index) => (
            <CarouselItem
              key={`${example.image}-${index}`}
              className="basis-1/2 pl-3 sm:basis-1/4 lg:basis-1/5"
            >
              <figure>
                <img
                  src={example.image}
                  alt={example.label}
                  loading="lazy"
                  className="aspect-[3/4] w-full rounded-xl object-cover"
                />
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
