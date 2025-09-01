'use client';

import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useWhereToStore } from '@/lib/store';
import { venueData } from '@/data/venues';
import { TabId } from '@/types';
import { cn } from '@/lib/utils';

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
  const isTransitioning = useRef(false);
  const tabWidths = useRef<{ [key: string]: number }>({});
  const [isMobile, setIsMobile] = useState(false);
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeCategory = venueData.find(category => category.id === activeTab);
  const inactiveCategories = venueData.filter(category => category.id !== activeTab);
  const activeCategoryItems = activeCategory?.items || [];

  // Mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    // Check on mount
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Auto-slide functionality for mobile carousel
  const startAutoSlide = useCallback(() => {
    if (!isMobile || isCarouselPaused || activeCategoryItems.length <= 1) return;
    
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }
    
    autoSlideTimerRef.current = setInterval(() => {
      setCurrentCarouselIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % activeCategoryItems.length;
        return nextIndex;
      });
    }, 4000); // 4 second intervals
  }, [isMobile, isCarouselPaused, activeCategoryItems.length]);

  const stopAutoSlide = useCallback(() => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }
  }, []);

  const pauseAutoSlide = useCallback(() => {
    setIsCarouselPaused(true);
    stopAutoSlide();
  }, [stopAutoSlide]);

  const resumeAutoSlide = useCallback(() => {
    setIsCarouselPaused(false);
  }, []);

  // Carousel navigation functions
  const goToCarouselItem = useCallback((index: number) => {
    if (!isMobile || !carouselTrackRef.current) return;
    
    const itemWidth = window.innerWidth * 0.85; // 85% of viewport width
    const gap = window.innerWidth * 0.02; // 2% gap
    const totalItemWidth = itemWidth + gap;
    
    // Calculate position including duplicates (we'll add 3 items at the start for infinite loop)
    const translateX = -((index + 3) * totalItemWidth);
    
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    gsap.to(carouselTrackRef.current, {
      x: translateX,
      duration: prefersReducedMotion ? 0.2 : 0.6,
      ease: "power2.out",
      onComplete: () => {
        // Handle infinite loop reset
        if (index >= activeCategoryItems.length) {
          // Reset to beginning
          const resetIndex = index % activeCategoryItems.length;
          const resetTranslateX = -((resetIndex + 3) * totalItemWidth);
          gsap.set(carouselTrackRef.current, { x: resetTranslateX });
          setCurrentCarouselIndex(resetIndex);
        } else if (index < 0) {
          // Reset to end
          const resetIndex = activeCategoryItems.length + index;
          const resetTranslateX = -((resetIndex + 3) * totalItemWidth);
          gsap.set(carouselTrackRef.current, { x: resetTranslateX });
          setCurrentCarouselIndex(resetIndex);
        }
      }
    });
  }, [isMobile, activeCategoryItems.length]);

  const nextCarouselItem = useCallback(() => {
    const nextIndex = (currentCarouselIndex + 1) % activeCategoryItems.length;
    setCurrentCarouselIndex(nextIndex);
    goToCarouselItem(nextIndex);
  }, [currentCarouselIndex, activeCategoryItems.length, goToCarouselItem]);

  const prevCarouselItem = useCallback(() => {
    const prevIndex = (currentCarouselIndex - 1 + activeCategoryItems.length) % activeCategoryItems.length;
    setCurrentCarouselIndex(prevIndex);
    goToCarouselItem(prevIndex);
  }, [currentCarouselIndex, activeCategoryItems.length, goToCarouselItem]);

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

    // Animate content panels if they exist
    if (currentPanel && nextPanel) {
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
      // If panels don't exist, just update the state after tab animation
      tl.call(() => {
        setActiveTab(tabId);
      }, [], prefersReducedMotion ? 0.2 : 0.6);
    }
  }, [activeTab, calculateTabTranslation, setActiveTab]);

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

  // Touch/swipe support for mobile carousel
  const addCarouselTouchSupport = useCallback(() => {
    if (!isMobile || !carouselRef.current) return;

    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isScrolling = false;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = startX;
      isScrolling = false;
      isDragging = false;
      pauseAutoSlide(); // Pause auto-slide on touch
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      currentX = e.touches[0].clientX;
      const diffX = startX - currentX;
      const diffY = startY - e.touches[0].clientY;

      if (!isScrolling && !isDragging) {
        isScrolling = Math.abs(diffX) > Math.abs(diffY);
        isDragging = isScrolling;
      }

      if (isScrolling) {
        e.preventDefault();
        
        // Optional: Add visual feedback during drag
        if (carouselTrackRef.current && isDragging) {
          const itemWidth = window.innerWidth * 0.85;
          const gap = window.innerWidth * 0.02;
          const totalItemWidth = itemWidth + gap;
          const currentTranslateX = -((currentCarouselIndex + 3) * totalItemWidth);
          const dragOffset = -diffX * 0.3; // Reduce drag sensitivity
          
          gsap.set(carouselTrackRef.current, {
            x: currentTranslateX + dragOffset
          });
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!startX || !isScrolling) {
        // Resume auto-slide after a delay if no swipe occurred
        setTimeout(() => resumeAutoSlide(), 2000);
        return;
      }

      const diffX = startX - e.changedTouches[0].clientX;
      const threshold = 30; // Reduced threshold for better responsiveness
      const velocity = Math.abs(diffX) / (Date.now() - (e.timeStamp || Date.now()));

      // Reset visual feedback
      if (carouselTrackRef.current && isDragging) {
        goToCarouselItem(currentCarouselIndex);
      }

      if (Math.abs(diffX) > threshold || velocity > 0.5) {
        if (diffX > 0) {
          // Swipe left - go to next item
          nextCarouselItem();
        } else {
          // Swipe right - go to previous item
          prevCarouselItem();
        }
      }

      // Resume auto-slide after interaction
      setTimeout(() => resumeAutoSlide(), 3000);

      startX = 0;
      startY = 0;
      currentX = 0;
      isScrolling = false;
      isDragging = false;
    };

    const carousel = carouselRef.current;
    carousel.addEventListener('touchstart', handleTouchStart, { passive: true });
    carousel.addEventListener('touchmove', handleTouchMove, { passive: false });
    carousel.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      carousel.removeEventListener('touchstart', handleTouchStart);
      carousel.removeEventListener('touchmove', handleTouchMove);
      carousel.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, nextCarouselItem, prevCarouselItem, pauseAutoSlide, resumeAutoSlide, currentCarouselIndex, goToCarouselItem]);

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
    const cleanupCarouselTouch = addCarouselTouchSupport();
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      cleanupTouch?.();
      cleanupCarouselTouch?.();
    };
  }, [activeTab, calculateTabWidths, calculateTabTranslation, animateTabsHorizontally, addTouchSupport, addCarouselTouchSupport]);

  // Carousel auto-slide effect
  useEffect(() => {
    if (isMobile && !isCarouselPaused) {
      startAutoSlide();
    } else {
      stopAutoSlide();
    }

    return () => {
      stopAutoSlide();
    };
  }, [isMobile, isCarouselPaused, startAutoSlide, stopAutoSlide]);

  // Sync carousel position when currentCarouselIndex changes
  useEffect(() => {
    if (isMobile && activeCategoryItems.length > 0) {
      goToCarouselItem(currentCarouselIndex);
    }
  }, [currentCarouselIndex, isMobile, activeCategoryItems.length, goToCarouselItem]);

  // Reset carousel when tab changes
  useEffect(() => {
    if (isMobile) {
      setCurrentCarouselIndex(0);
      // Initialize carousel position
      if (carouselTrackRef.current && activeCategoryItems.length > 0) {
        const itemWidth = window.innerWidth * 0.85;
        const gap = window.innerWidth * 0.02;
        const totalItemWidth = itemWidth + gap;
        const initialTranslateX = -(3 * totalItemWidth); // Start at first real item (after 3 duplicates)
        
        gsap.set(carouselTrackRef.current, { 
          x: initialTranslateX,
          willChange: 'transform'
        });
      }
    }
  }, [activeTab, isMobile, activeCategoryItems.length]);

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

  // Handle keyboard navigation for carousel controls
  const handleCarouselKeyDown = (event: React.KeyboardEvent) => {
    if (!isMobile) return;
    
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        nextCarouselItem();
        pauseAutoSlide();
        setTimeout(() => resumeAutoSlide(), 3000);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        prevCarouselItem();
        pauseAutoSlide();
        setTimeout(() => resumeAutoSlide(), 3000);
        break;
      case ' ':
        event.preventDefault();
        if (isCarouselPaused) {
          resumeAutoSlide();
        } else {
          pauseAutoSlide();
        }
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
      <div className={cn(
        "where-to__inner",
        !isMobile && "pl-12"
      )}>
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
        style={!isMobile ? { 
          position: 'relative',
          overflow: 'hidden',
          marginLeft: '-3rem',
          paddingLeft: '3rem'
        } : {
          position: 'relative',
          overflow: 'hidden'
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
            // Mobile Carousel Layout
            <div 
              ref={carouselRef}
              className="where-to__carousel-container"
              onMouseEnter={pauseAutoSlide}
              onMouseLeave={resumeAutoSlide}
              onKeyDown={handleCarouselKeyDown}
              tabIndex={0}
              role="region"
              aria-label="Carousel navigation"
            >
              <div className="where-to__carousel-viewport overflow-hidden">
                <div 
                  ref={carouselTrackRef}
                  className="where-to__carousel-track flex will-change-transform"
                  style={{ transform: 'translateZ(0)' }}
                >
                  {/* Duplicate last 3 items at the beginning for infinite loop */}
                  {activeCategoryItems.slice(-3).map((item, index) => (
                    <div
                      key={`prev-${item.id}`}
                      className="where-to__carousel-item flex-shrink-0"
                      style={{ 
                        width: '85vw',
                        marginRight: '2vw'
                      }}
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
                    </div>
                  ))}

                  {/* Main items */}
                  {activeCategoryItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="where-to__carousel-item flex-shrink-0"
                      style={{ 
                        width: '85vw',
                        marginRight: '2vw'
                      }}
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
                    </div>
                  ))}

                  {/* Duplicate first 3 items at the end for infinite loop */}
                  {activeCategoryItems.slice(0, 3).map((item, index) => (
                    <div
                      key={`next-${item.id}`}
                      className="where-to__carousel-item flex-shrink-0"
                      style={{ 
                        width: '85vw',
                        marginRight: '2vw'
                      }}
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Navigation Controls */}
              <div className="where-to__carousel-controls flex justify-between items-center mt-6 px-4">
                {/* Previous Button */}
                <button
                  onClick={prevCarouselItem}
                  onMouseEnter={pauseAutoSlide}
                  onMouseLeave={resumeAutoSlide}
                  className="where-to__carousel-btn where-to__carousel-btn--prev flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-where-active focus:ring-opacity-50"
                  aria-label="Previous item"
                  disabled={activeCategoryItems.length <= 1}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-where-active"
                  >
                    <polyline points="15,18 9,12 15,6"></polyline>
                  </svg>
                </button>

                {/* Carousel Indicators */}
                <div className="where-to__carousel-indicators flex space-x-2">
                  {activeCategoryItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentCarouselIndex(index);
                        goToCarouselItem(index);
                        pauseAutoSlide();
                        setTimeout(() => resumeAutoSlide(), 3000);
                      }}
                      onMouseEnter={pauseAutoSlide}
                      onMouseLeave={resumeAutoSlide}
                      className={cn(
                        "where-to__carousel-indicator w-2 h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-where-active focus:ring-opacity-50",
                        index === currentCarouselIndex
                          ? "bg-where-active scale-125"
                          : "bg-gray-300 hover:bg-gray-400"
                      )}
                      aria-label={`Go to item ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={nextCarouselItem}
                  onMouseEnter={pauseAutoSlide}
                  onMouseLeave={resumeAutoSlide}
                  className="where-to__carousel-btn where-to__carousel-btn--next flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-where-active focus:ring-opacity-50"
                  aria-label="Next item"
                  disabled={activeCategoryItems.length <= 1}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-where-active"
                  >
                    <polyline points="9,18 15,12 9,6"></polyline>
                  </svg>
                </button>
              </div>

              {/* Auto-slide pause/play toggle (optional) */}
              <div className="where-to__carousel-auto-control flex justify-center mt-4">
                <button
                  onClick={() => {
                    if (isCarouselPaused) {
                      resumeAutoSlide();
                    } else {
                      pauseAutoSlide();
                    }
                  }}
                  className="where-to__carousel-auto-btn flex items-center space-x-2 px-4 py-2 text-sm text-where-active hover:text-where-active/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-where-active focus:ring-opacity-50 rounded-md"
                  aria-label={isCarouselPaused ? "Resume auto-slide" : "Pause auto-slide"}
                >
                  {isCarouselPaused ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21"></polygon>
                      </svg>
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                      </svg>
                      <span>Pause</span>
                    </>
                  )}
                </button>
              </div>

            </div>
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
