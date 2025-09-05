'use client';

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useWhereToStore } from '@/lib/store';
import { venueData } from '@/data/venues';
import { TabId } from '@/types';
import { cn } from '@/lib/utils';
import MobileCarousel from '@/components/MobileCarousel';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// Define the ref interface for external access
export interface WhereToComponentRef {
  nextTab: () => void;
  prevTab: () => void;
  goToTab: (tabId: TabId) => void;
}

const WhereToComponent = forwardRef<WhereToComponentRef>((props, ref) => {
  const { activeTab, setActiveTab } = useWhereToStore();
  const panelRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const tabSliderRef = useRef<HTMLDivElement>(null);
  const tabViewportRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const mobileCarouselRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const tabWidths = useRef<{ [key: string]: number }>({});
  
  // Use the new useMediaQuery hook for responsive detection
  const { isMobile } = useMediaQuery();
  
  // Track if component has mounted to prevent hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const activeCategory = venueData.find(category => category.id === activeTab);
  const activeCategoryItems = activeCategory?.items || [];

  // Calculate tab widths and positions
  const calculateTabWidths = useCallback(() => {
    venueData.forEach((category) => {
      const tabElement = tabRefs.current[category.id];
      if (tabElement) {
        tabWidths.current[category.id] = tabElement.offsetWidth;
      }
    });
  }, []);

  // Calculate the translation needed to position active tab on the left with circular support
  const calculateTabTranslation = useCallback((targetTabId: TabId, useSet: 'main' | 'prev' | 'next' = 'main') => {
    const targetIndex = venueData.findIndex(cat => cat.id === targetTabId);
    let translateX = 0;
    const alignmentGuard = 2; // small right shift to avoid glyph clipping on the left edge
    
    // Calculate cumulative width of tabs before the target tab
    for (let i = 0; i < targetIndex; i++) {
      const tabId = venueData[i].id;
      const tabWidth = tabWidths.current[tabId] || 0;
      const marginRight = window.innerWidth >= 1024 ? 60 : window.innerWidth >= 768 ? 40 : 32;
      translateX += tabWidth + marginRight;
    }
    
    // Calculate total width of one complete set of tabs
    let oneSetWidth = 0;
    for (let i = 0; i < venueData.length; i++) {
      const tabId = venueData[i].id;
      const tabWidth = tabWidths.current[tabId] || 0;
      const marginRight = window.innerWidth >= 1024 ? 60 : window.innerWidth >= 768 ? 40 : 32;
      oneSetWidth += tabWidth + marginRight;
    }
    
    // Adjust based on which set we're targeting
    switch (useSet) {
      case 'prev':
        return -translateX + alignmentGuard; // First duplicate set (no offset)
      case 'main':
        return -(translateX + oneSetWidth) + alignmentGuard; // Main set (offset by one set)
      case 'next':
        return -(translateX + (oneSetWidth * 2)) + alignmentGuard; // Last duplicate set (offset by two sets)
      default:
        return -(translateX + oneSetWidth) + alignmentGuard;
    }
  }, []);

  // Handle tab activation with seamless infinite scroll animation
  const handleTabClick = useCallback((tabId: TabId) => {
    if (tabId === activeTab || isTransitioning.current) return;
    
    isTransitioning.current = true;
    const currentPanel = panelRefs.current[activeTab];
    const nextPanel = panelRefs.current[tabId];
    
    if (containerRef.current) {
      containerRef.current.setAttribute('aria-busy', 'true');
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const currentIndex = venueData.findIndex(cat => cat.id === activeTab);
    const targetIndex = venueData.findIndex(cat => cat.id === tabId);
    
    // Detect if this is a circular transition (last to first or first to last)
    const isLastToFirst = currentIndex === venueData.length - 1 && targetIndex === 0;
    const isFirstToLast = currentIndex === 0 && targetIndex === venueData.length - 1;
    const isCircularTransition = isLastToFirst || isFirstToLast;

    // Create timeline for both tab scroll and content transition
    const tl = gsap.timeline({
      onComplete: () => {
        setActiveTab(tabId);
        isTransitioning.current = false;
        if (containerRef.current) {
          containerRef.current.removeAttribute('aria-busy');
        }
      }
    });

    if (tabSliderRef.current && isCircularTransition) {
      // Handle seamless infinite scroll for circular transitions
      let intermediateTranslateX: number;
      let finalTranslateX: number;

      if (isLastToFirst) {
        // Animate to the duplicate "DINE + SIP" in the next set (smooth forward scroll)
        intermediateTranslateX = Math.round(calculateTabTranslation(tabId, 'next'));
        finalTranslateX = Math.round(calculateTabTranslation(tabId, 'main'));
      } else {
        // isFirstToLast - Animate to the duplicate "MOVE + PLAY" in the prev set (smooth backward scroll)
        intermediateTranslateX = Math.round(calculateTabTranslation(tabId, 'prev'));
        finalTranslateX = Math.round(calculateTabTranslation(tabId, 'main'));
      }

      // Step 1: Animate to the duplicate tab (visible smooth transition)
      tl.to(tabSliderRef.current, {
        x: intermediateTranslateX,
        duration: prefersReducedMotion ? 0.2 : 0.6,
        ease: "power2.out"
      }, 0);

      // Step 2: Instantly reset to the main tab position (invisible)
      tl.set(tabSliderRef.current, {
        x: finalTranslateX
      }, prefersReducedMotion ? 0.2 : 0.6);

    } else {
      // Normal tab transition (non-circular)
      const translateX = Math.round(calculateTabTranslation(tabId, 'main'));
      tl.to(tabSliderRef.current, {
        x: translateX,
        duration: prefersReducedMotion ? 0.2 : 0.6,
        ease: "power2.out"
      }, 0);
    }

    // Animate content panels (desktop) or mobile carousel
    // Check if we're on mobile and the carousel ref is available
    const shouldUseMobileAnimation = isMobile && mobileCarouselRef.current;
    
    if (shouldUseMobileAnimation) {
      // Mobile carousel animation
      if (prefersReducedMotion) {
        tl.to(mobileCarouselRef.current, { opacity: 0, duration: 0.14 }, 0)
          .call(() => setActiveTab(tabId), [], 0.14)
          .set(mobileCarouselRef.current, { opacity: 0 }, 0.14)
          .to(mobileCarouselRef.current, { opacity: 1, duration: 0.14 }, 0.14);
      } else {
        tl.to(mobileCarouselRef.current, { opacity: 0, y: -8, duration: 0.28, ease: "power2.out" }, 0)
          .call(() => setActiveTab(tabId), [], 0.28)
          .set(mobileCarouselRef.current, { opacity: 0, y: 8 }, 0.28)
          .to(mobileCarouselRef.current, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }, 0.32);
      }
    } else if (!isMobile && currentPanel && nextPanel) {
      // Desktop panel animation
      if (prefersReducedMotion) {
        tl.to(currentPanel, { opacity: 0, duration: 0.14 }, 0)
          .set(nextPanel, { opacity: 0 }, 0.14)
          .to(nextPanel, { opacity: 1, duration: 0.14 }, 0.14);
      } else {
        tl.to(currentPanel, { opacity: 0, y: -8, duration: 0.28, ease: "power2.out" }, 0)
          .set(nextPanel, { opacity: 0, y: 8 }, 0.28)
          .to(nextPanel, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" }, 0.32);
      }
    } else {
      // Fallback: just update the state after tab animation
      tl.call(() => {
        setActiveTab(tabId);
      }, [], prefersReducedMotion ? 0.2 : 0.6);
    }
  }, [activeTab, calculateTabTranslation, setActiveTab, isMobile]);

  // Animate tabs horizontally
  const animateTabsHorizontally = useCallback((targetTabId: TabId) => {
    if (!tabSliderRef.current) return;
    
    const translateX = Math.round(calculateTabTranslation(targetTabId));
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    gsap.to(tabSliderRef.current, {
      x: translateX,
      duration: prefersReducedMotion ? 0.2 : 0.6,
      ease: "power2.out"
    });
  }, [calculateTabTranslation]);

  // Touch/swipe support for mobile tabs
  const addTouchSupport = useCallback(() => {
    if (!tabViewportRef.current) return;

    let startX = 0;
    let startY = 0;
    let isScrolling = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isScrolling = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const diffX = startX - e.touches[0].clientX;
      const diffY = startY - e.touches[0].clientY;

      if (!isScrolling) {
        isScrolling = Math.abs(diffX) > Math.abs(diffY);
      }

      if (isScrolling) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !isScrolling || isTransitioning.current) return;

      const diffX = startX - e.changedTouches[0].clientX;
      const threshold = 50;

      if (Math.abs(diffX) > threshold) {
        const currentIndex = venueData.findIndex(cat => cat.id === activeTab);
        let targetIndex;

        if (diffX > 0) {
          // Swipe left - go to next tab
          targetIndex = (currentIndex + 1) % venueData.length;
        } else {
          // Swipe right - go to previous tab
          targetIndex = (currentIndex - 1 + venueData.length) % venueData.length;
        }

        const targetTabId = venueData[targetIndex].id as TabId;
        handleTabClick(targetTabId);
      }

      startX = 0;
      startY = 0;
      isScrolling = false;
    };

    const viewport = tabViewportRef.current;
    viewport.addEventListener('touchstart', handleTouchStart, { passive: true });
    viewport.addEventListener('touchmove', handleTouchMove, { passive: false });
    viewport.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      viewport.removeEventListener('touchstart', handleTouchStart);
      viewport.removeEventListener('touchmove', handleTouchMove);
      viewport.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTab, handleTabClick]);

  // Initialize tab positions on mount and resize
  useEffect(() => {
    const initializeTabs = () => {
      calculateTabWidths();
      if (tabSliderRef.current) {
        // Set initial position without animation to prevent visual jump
        const initialTranslation = Math.round(calculateTabTranslation(activeTab));
        gsap.set(tabSliderRef.current, { 
          x: initialTranslation,
          willChange: 'transform'
        });
      }
    };

    // Initialize immediately, then with a small delay to ensure DOM measurements are accurate
    initializeTabs();
    const timer = setTimeout(initializeTabs, 50);
    
    const handleResize = () => {
      calculateTabWidths();
      animateTabsHorizontally(activeTab);
    };

    window.addEventListener('resize', handleResize);
    
    // Add touch support
    const cleanupTouch = addTouchSupport();
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      cleanupTouch?.();
    };
  }, [activeTab, calculateTabWidths, calculateTabTranslation, animateTabsHorizontally, addTouchSupport]);

  // Circular navigation methods
  const nextTab = useCallback(() => {
    if (isTransitioning.current) return;
    
    const currentIndex = venueData.findIndex(cat => cat.id === activeTab);
    const nextIndex = (currentIndex + 1) % venueData.length;
    const nextTabId = venueData[nextIndex].id as TabId;
    
    handleTabClick(nextTabId);
  }, [activeTab, handleTabClick]);

  const prevTab = useCallback(() => {
    if (isTransitioning.current) return;
    
    const currentIndex = venueData.findIndex(cat => cat.id === activeTab);
    const prevIndex = (currentIndex - 1 + venueData.length) % venueData.length;
    const prevTabId = venueData[prevIndex].id as TabId;
    
    handleTabClick(prevTabId);
  }, [activeTab, handleTabClick]);

  const goToTab = useCallback((tabId: TabId) => {
    handleTabClick(tabId);
  }, [handleTabClick]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    nextTab,
    prevTab,
    goToTab
  }), [nextTab, prevTab, goToTab]);

  // Handle keyboard navigation for tabs
  const handleKeyDown = (event: React.KeyboardEvent, tabId: TabId) => {
    const tabs = venueData.map(cat => cat.id);
    const currentIndex = tabs.indexOf(activeTab);
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % tabs.length;
        const nextTab = document.getElementById(`tab-${tabs[nextIndex]}`);
        nextTab?.focus();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        const prevTab = document.getElementById(`tab-${tabs[prevIndex]}`);
        prevTab?.focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleTabClick(tabId);
        break;
    }
  };

  return (
    <section 
      className={cn(
        "where-to py-12 lg:py-16",
        isMobile && "where-to--mobile"
      )}
      aria-labelledby="where-to-heading"
      style={{
        '--where-color-active': '#8B4513',
        '--where-color-inactive': 'rgba(139, 69, 19, 0.4)',
        '--where-color-body': '#333333',
        '--where-divider': 'rgba(0, 0, 0, 0.12)',
        '--where-heading-size-d': '7rem',
        '--where-heading-size-t': '5.5rem',
        '--where-heading-size-m': '3rem',
        '--where-title-size': '1.25rem',
        '--where-body-size': '1rem',
        '--where-gutter-d': '48px',
        '--where-gutter-t': '32px',
        '--where-gutter-m': '24px',
      } as React.CSSProperties}
    >
      <div
        className={cn(
          "where-to__inner",
          isMobile ? "pl-3" : "pl-12"
        )}
      >
      {/* Heading with 3rem left margin */}
      <div className="where-to__heading-container">
        <h2 id="where-to-heading" className="where-to__heading">
          <span className="where-to__heading-prefix block text-where-heading-m lg:text-where-heading-d font-light tracking-wide text-where-active uppercase leading-none">
        WHERE TO
          </span>
        </h2>
      </div>

      {/* Tab Viewport Container - Full width, extends to right edge */}
      <div 
        ref={tabViewportRef}
        className="where-to__tab-viewport w-full"
        style={{ 
          position: 'relative',
          marginLeft: '-3rem',
          paddingLeft: '3rem'
        }}
      >
        <nav 
          ref={tabSliderRef}
          className="where-to__tab-slider flex flex-nowrap items-baseline will-change-transform" 
          role="tablist" 
          aria-label="Where To Categories"
          style={{ 
        position: 'relative'
          }}
        >
          {/* Duplicate tabs at the beginning for circular navigation */}
          {venueData.map((category) => (
        <button
          key={`prev-${category.id}`}
          role="tab"
          aria-selected={false}
          aria-controls={`panel-${category.id}`}
          tabIndex={-1}
          className={cn(
            "where-to__tab text-where-heading-m lg:text-where-heading-d font-light tracking-wide uppercase leading-none flex-shrink-0",
            "bg-transparent border-0 p-0 cursor-pointer transition-colors duration-200",
            "mr-8 md:mr-10 lg:mr-[60px] whitespace-nowrap",
            "focus:outline-none",
            category.id === activeTab 
          ? "text-where-active hover:text-where-active" 
          : "text-where-inactive hover:text-where-active"
          )}
          onClick={() => handleTabClick(category.id as TabId)}
        >
          {category.label}
        </button>
          ))}
          
          {/* Main tabs sequence */}
          {venueData.map((category) => (
        <button
          key={category.id}
          ref={(el) => { tabRefs.current[category.id] = el; }}
          role="tab"
          id={`tab-${category.id}`}
          aria-selected={category.id === activeTab}
          aria-controls={`panel-${category.id}`}
          tabIndex={category.id === activeTab ? 0 : -1}
          className={cn(
            "where-to__tab text-where-heading-m lg:text-where-heading-d font-light tracking-wide uppercase leading-none flex-shrink-0",
            "bg-transparent border-0 p-0 cursor-pointer transition-colors duration-200",
            "mr-8 md:mr-10 lg:mr-[60px] whitespace-nowrap",
            "focus:outline-none",
            category.id === activeTab 
          ? "text-where-active hover:text-where-active" 
          : "text-where-inactive hover:text-where-active"
          )}
          onClick={() => handleTabClick(category.id as TabId)}
          onKeyDown={(e) => handleKeyDown(e, category.id as TabId)}
        >
          {category.label}
        </button>
          ))}
          
          {/* Duplicate tabs at the end for circular navigation */}
          {venueData.map((category) => (
        <button
          key={`next-${category.id}`}
          role="tab"
          aria-selected={false}
          aria-controls={`panel-${category.id}`}
          tabIndex={-1}
          className={cn(
            "where-to__tab text-where-heading-m lg:text-where-heading-d font-light tracking-wide uppercase leading-none flex-shrink-0",
            "bg-transparent border-0 p-0 cursor-pointer transition-colors duration-200",
            "mr-8 md:mr-10 lg:mr-[60px] whitespace-nowrap",
            "focus:outline-none",
            category.id === activeTab 
          ? "text-where-active hover:text-where-active" 
          : "text-where-inactive hover:text-where-active"
          )}
          onClick={() => handleTabClick(category.id as TabId)}
        >
          {category.label}
        </button>
          ))}
        </nav>
      </div>

      {/* Divider and content with 3rem left margin */}
      <div className="where-to__content-container">
        <hr className="where-to__divider border-0 border-t border-where-divider mt-20 sm:mt-120" />

        <div 
          ref={containerRef}
          className="where-to__panels"
        >
          {isMobile ? (
        <MobileCarousel ref={mobileCarouselRef} items={activeCategoryItems} />
          ) : (
        // Desktop Layout
        venueData.map((category) => (
          <section
            key={category.id}
            id={`panel-${category.id}`}
            role="tabpanel"
            aria-labelledby={`tab-${category.id}`}
            ref={(el) => { panelRefs.current[category.id] = el; }}
            className={cn(
          "where-to__panel",
          category.id !== activeTab && "hidden"
            )}
          >
            <ol className="where-to__list list-none p-0 m-0">
          {category.items.map((item, index) => (
            <li 
              key={item.id}
              className={cn(
            "where-to__row where-to__content-item",
            "grid gap-where-gutter-m lg:gap-where-gutter-d py-6 lg:py-8",
            "grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_2fr]",
            "items-start",
            index > 0 && "border-t border-where-divider"
              )}
            >
              <div className="where-to__thumb where-to__content-image w-full md:w-40 lg:w-64 mb-4 md:mb-0">
            <Image
              src={item.image}
              alt={item.alt}
              width={260}
              height={336}
              className="w-full h-full object-cover"
              loading="lazy"
            />
              </div>
              
              <h3 className="where-to__item-title text-where-title font-medium text-where-active mb-2 md:mb-0 md:mr-4 lg:mr-0">
            {item.title}
              </h3>
              
              <p className="where-to__item-desc leading-relaxed">
            {item.description}
              </p>
            </li>
          ))}
            </ol>
          </section>
        ))
          )}
        </div>
      </div>
        </div>
    </section>
  );
});

WhereToComponent.displayName = 'WhereToComponent';

export default WhereToComponent;
