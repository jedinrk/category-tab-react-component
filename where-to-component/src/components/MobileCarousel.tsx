'use client';

import * as React from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import type { EmblaCarouselType } from 'embla-carousel';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

type Item = {
  id: string;
  image: string;
  alt: string;
  title: string;
  description: string;
};

export type MobileCarouselProps = {
  items: Item[];
  autoplayDelay?: number;
  pauseOnHover?: boolean;
  className?: string;
};

const MobileCarousel = React.forwardRef<HTMLDivElement, MobileCarouselProps>(({
  items,
  autoplayDelay = 4000,
  pauseOnHover = true,
  className,
}, ref) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const prefersReducedMotion =
    mounted &&
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Configure autoplay plugin conditionally
  const autoplay = React.useMemo(() => {
    if (!mounted || prefersReducedMotion) return undefined;
    return Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: true,
      stopOnMouseEnter: pauseOnHover,
      playOnInit: true,
    });
  }, [autoplayDelay, pauseOnHover, prefersReducedMotion, mounted]);

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [length, setLength] = React.useState(items.length);

  const emblaApiRef = React.useRef<EmblaCarouselType | null>(null);

  const setApi = React.useCallback((api: EmblaCarouselType) => {
    if (!api) return;
    emblaApiRef.current = api;
    setLength(api.scrollSnapList().length);
    const onSelect = () => setSelectedIndex(api.selectedScrollSnap());
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', () => {
      setLength(api.scrollSnapList().length);
      onSelect();
    });
  }, []);

  // Keyboard controls
  const containerRef = React.useRef<HTMLDivElement>(null);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      emblaApiRef.current?.scrollNext();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      emblaApiRef.current?.scrollPrev();
    } else if (event.key === ' ') {
      event.preventDefault();
      if (autoplay) {
        // @ts-ignore - plugin instance provides play/stop
        // Toggle play/pause
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anyAuto: any = autoplay;
        try {
          if (anyAuto.isPlaying?.()) {
            anyAuto.stop();
          } else {
            anyAuto.play();
          }
        } catch {
          // no-op if plugin API shape differs
        }
      }
    }
  };

  // Progress percentage
  const progressPct = length > 0 ? ((selectedIndex + 1) / length) * 100 : 0;

  return (
    <div
      ref={ref}
      className={cn('where-to__carousel-container', className)}
      tabIndex={0}
      role="region"
      aria-label="Carousel navigation"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={containerRef}
        className="where-to__carousel-inner"
      >
        <div className="where-to__carousel-viewport">
          <Carousel
            className="w-full"
            opts={{ loop: true, align: 'start' }}
            // Pass plugin only if not reduced motion
            plugins={autoplay ? [autoplay] : []}
            setApi={setApi}
          >
            <CarouselContent className="flex -mx-[1vw]">
              {items.map((item) => (
                <CarouselItem
                  key={item.id}
                  className="px-[1vw] basis-[85vw] shrink-0"
                >
                  <div className="where-to__carousel-content">
                    <div className="where-to__carousel-image">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        width={364}
                        height={418}
                        className="w-full h-64 object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="where-to__carousel-text p-6">
                      <h3 className="where-to__carousel-title text-xl font-medium text-where-active mb-3">
                        {item.title}
                      </h3>
                      <p className="where-to__carousel-desc text-sm leading-relaxed text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Progress Bar */}
        <div className="where-to__carousel-progress mt-6 px-4">
          <div
            className="where-to__progress-bar w-full h-[1px] rounded-full overflow-hidden"
            style={{
              backgroundColor: 'rgba(138,108,96,.2)',
              ['--tw-bg-opacity' as any]: '1',
            }}
            role="progressbar"
            aria-valuenow={selectedIndex + 1}
            aria-valuemin={1}
            aria-valuemax={length}
            aria-label={`Item ${selectedIndex + 1} of ${length}`}
          >
            <div
              className="where-to__progress-fill h-full transition-all duration-300 ease-out"
              style={{
                width: `${progressPct}%`,
                backgroundColor: 'rgba(138,108,96,var(--tw-bg-opacity))',
                ['--tw-bg-opacity' as any]: '1',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

MobileCarousel.displayName = 'MobileCarousel';

export default MobileCarousel;
