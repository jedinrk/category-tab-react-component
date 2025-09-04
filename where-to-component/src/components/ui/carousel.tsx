'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import type {
  EmblaCarouselType,
  EmblaOptionsType,
  EmblaPluginType,
} from 'embla-carousel';

type CarouselContextValue = {
  api: EmblaCarouselType | null;
  selectedIndex: number;
  scrollSnaps: number[];
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollTo: (index: number) => void;
  scrollPrev: () => void;
  scrollNext: () => void;
};

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

export function useCarousel() {
  const ctx = React.useContext(CarouselContext);
  if (!ctx) throw new Error('useCarousel must be used within <Carousel />');
  return ctx;
}

export type CarouselProps = {
  className?: string;
  children: React.ReactNode;
  opts?: EmblaOptionsType;
  plugins?: EmblaPluginType[];
  setApi?: (api: EmblaCarouselType) => void;
};

export function Carousel({
  className,
  children,
  opts,
  plugins,
  setApi,
}: CarouselProps) {
  const [viewportRef, api] = useEmblaCarousel(
    { loop: true, align: 'start', ...opts },
    plugins
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback(() => {
    if (!api) return;
    setSelectedIndex(api.selectedScrollSnap());
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, [api]);

  React.useEffect(() => {
    if (!api) return;
    setScrollSnaps(api.scrollSnapList());
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', () => {
      setScrollSnaps(api.scrollSnapList());
      onSelect();
    });
    if (api) setApi?.(api);
    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect, setApi]);

  const scrollTo = React.useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api]);
  const scrollNext = React.useCallback(() => api?.scrollNext(), [api]);

  return (
    <CarouselContext.Provider
      value={{
        api: api ?? null,
        selectedIndex,
        scrollSnaps,
        canScrollPrev,
        canScrollNext,
        scrollTo,
        scrollPrev,
        scrollNext,
      }}
    >
      <div className={cn('relative', className)}>
        <div ref={viewportRef} className="overflow-hidden">
          {children}
        </div>
      </div>
    </CarouselContext.Provider>
  );
}

export type CarouselContentProps = {
  className?: string;
  children: React.ReactNode;
};

export function CarouselContent({ className, children }: CarouselContentProps) {
  // Embla expects the first child of viewport to be the container with flex children
  return (
    <div
      className={cn(
        // -ml-? can be used if you want to counter custom gap padding patterns
        'flex touch-pan-y select-none',
        className
      )}
    >
      {children}
    </div>
  );
}

export type CarouselItemProps = {
  className?: string;
  children: React.ReactNode;
};

export function CarouselItem({ className, children }: CarouselItemProps) {
  return (
    <div className={cn('min-w-0 shrink-0 grow-0', className)}>{children}</div>
  );
}

export type CarouselButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  disabledClassName?: string;
};

export function CarouselPrevious({
  className,
  disabledClassName,
  ...props
}: CarouselButtonProps) {
  const { canScrollPrev, scrollPrev } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Previous slide"
      onClick={scrollPrev}
      disabled={!canScrollPrev}
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-transparent bg-black/60 text-white hover:bg-black/70 disabled:opacity-40 disabled:cursor-not-allowed',
        'h-9 w-9',
        className,
        !canScrollPrev && disabledClassName
      )}
      {...props}
    >
      <span aria-hidden>‹</span>
    </button>
  );
}

export function CarouselNext({
  className,
  disabledClassName,
  ...props
}: CarouselButtonProps) {
  const { canScrollNext, scrollNext } = useCarousel();
  return (
    <button
      type="button"
      aria-label="Next slide"
      onClick={scrollNext}
      disabled={!canScrollNext}
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-transparent bg-black/60 text-white hover:bg-black/70 disabled:opacity-40 disabled:cursor-not-allowed',
        'h-9 w-9',
        className,
        !canScrollNext && disabledClassName
      )}
      {...props}
    >
      <span aria-hidden>›</span>
    </button>
  );
}

export type CarouselDotsProps = {
  className?: string;
  dotClassName?: string;
  activeClassName?: string;
};

export function CarouselDots({
  className,
  dotClassName,
  activeClassName,
}: CarouselDotsProps) {
  const { scrollSnaps, selectedIndex, scrollTo } = useCarousel();
  if (!scrollSnaps.length) return null;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {scrollSnaps.map((_, i) => {
        const active = i === selectedIndex;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active ? 'true' : 'false'}
            onClick={() => scrollTo(i)}
            className={cn(
              'h-1.5 w-1.5 rounded-full bg-neutral-400/50',
              active && 'bg-neutral-800',
              dotClassName,
              active && activeClassName
            )}
          />
        );
      })}
    </div>
  );
}
