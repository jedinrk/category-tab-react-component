'use client';

import { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { useWhereToStore } from '@/lib/store';
import { venueData } from '@/data/venues';
import { TabId } from '@/types';
import { cn } from '@/lib/utils';

export default function WhereToComponent() {
  const { activeTab, setActiveTab } = useWhereToStore();
  const panelRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const tabSliderRef = useRef<HTMLDivElement>(null);
  const tabViewportRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const isTransitioning = useRef(false);
  const tabWidths = useRef<{ [key: string]: number }>({});

  const activeCategory = venueData.find(category => category.id === activeTab);
  const inactiveCategories = venueData.filter(category => category.id !== activeTab);

  // Calculate tab widths and positions
  const calculateTabWidths = useCallback(() => {
    venueData.forEach((category) => {
      const tabElement = tabRefs.current[category.id];
      if (tabElement) {
        tabWidths.current[category.id] = tabElement.offsetWidth;
      }
    });
  }, []);

  // Calculate the translation needed to position active tab on the left
  const calculateTabTranslation = useCallback((targetTabId: TabId) => {
    const targetIndex = venueData.findIndex(cat => cat.id === targetTabId);
    let translateX = 0;
    
    // Calculate cumulative width of tabs before the target tab
    for (let i = 0; i < targetIndex; i++) {
      const tabId = venueData[i].id;
      const tabWidth = tabWidths.current[tabId] || 0;
      const marginRight = window.innerWidth >= 1024 ? 60 : window.innerWidth >= 768 ? 40 : 30;
      translateX += tabWidth + marginRight;
    }
    
    return -translateX;
  }, []);

  // Handle tab activation with GSAP animation
  const handleTabClick = useCallback((tabId: TabId) => {
    if (tabId === activeTab || isTransitioning.current) return;
    
    isTransitioning.current = true;
    const currentPanel = panelRefs.current[activeTab];
    const nextPanel = panelRefs.current[tabId];
    
    if (containerRef.current) {
      containerRef.current.setAttribute('aria-busy', 'true');
    }

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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Animate tab horizontal scroll
    if (tabSliderRef.current) {
      const translateX = calculateTabTranslation(tabId);
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
    
    const translateX = calculateTabTranslation(targetTabId);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    gsap.to(tabSliderRef.current, {
      x: translateX,
      duration: prefersReducedMotion ? 0.2 : 0.6,
      ease: "power2.out"
    });
  }, [calculateTabTranslation]);

  // Touch/swipe support for mobile
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
        gsap.set(tabSliderRef.current, { 
          x: calculateTabTranslation(activeTab),
          willChange: 'transform'
        });
      }
    };

    // Initialize after a short delay to ensure DOM is ready
    const timer = setTimeout(initializeTabs, 100);
    
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

  // Handle keyboard navigation
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
      className="where-to py-12 lg:py-16" 
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
      <div className="where-to__container w-full px-4">
        <h2 id="where-to-heading" className="where-to__heading mb-6 lg:mb-8">
          <span className="where-to__heading-prefix block text-where-heading-m lg:text-where-heading-d font-light tracking-wide text-where-active uppercase leading-none">
            WHERE TO
          </span>
          
          {/* Tab Viewport Container */}
          <div 
            ref={tabViewportRef}
            className="where-to__tab-viewport overflow-hidden w-full mt-2"
          >
            <nav 
              ref={tabSliderRef}
              className="where-to__tab-slider flex flex-nowrap items-baseline will-change-transform" 
              role="tablist" 
              aria-label="Where To Categories"
              style={{ transform: 'translateX(0px)' }}
            >
              {/* All tabs in order */}
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
                    "mr-8 md:mr-10 lg:mr-15 whitespace-nowrap",
                    "focus:outline-none focus:ring-2 focus:ring-where-active focus:ring-offset-2",
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
            </nav>
          </div>
        </h2>

        <hr className="where-to__divider border-0 border-t border-where-divider my-6 lg:my-8" />

        <div 
          ref={containerRef}
          className="where-to__panels"
        >
          {venueData.map((category) => (
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
                      "where-to__row grid gap-where-gutter-m lg:gap-where-gutter-d py-6 lg:py-8",
                      "grid-cols-1 md:grid-cols-[auto_1fr] lg:grid-cols-[auto_1fr_2fr]",
                      "items-start lg:items-center",
                      index > 0 && "border-t border-where-divider"
                    )}
                  >
                    <div className="where-to__thumb w-full md:w-40 lg:w-52 aspect-square mb-4 md:mb-0">
                      <Image
                        src={item.image}
                        alt={item.alt}
                        width={208}
                        height={208}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    
                    <h3 className="where-to__item-title text-where-title font-medium text-where-active mb-2 md:mb-0 md:mr-4 lg:mr-0">
                      {item.title}
                    </h3>
                    
                    <p className="where-to__item-desc text-where-body leading-relaxed text-where-body">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
