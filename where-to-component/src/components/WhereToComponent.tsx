'use client';

import { useRef } from 'react';
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
  const isTransitioning = useRef(false);

  const activeCategory = venueData.find(category => category.id === activeTab);
  const inactiveCategories = venueData.filter(category => category.id !== activeTab);

  // Handle tab activation with GSAP animation
  const handleTabClick = (tabId: TabId) => {
    if (tabId === activeTab || isTransitioning.current) return;
    
    isTransitioning.current = true;
    const currentPanel = panelRefs.current[activeTab];
    const nextPanel = panelRefs.current[tabId];
    
    if (currentPanel && nextPanel) {
      // Set aria-busy to prevent interactions during transition
      if (containerRef.current) {
        containerRef.current.setAttribute('aria-busy', 'true');
      }

      // Animate out current panel and in next panel
      const tl = gsap.timeline({
        onComplete: () => {
          setActiveTab(tabId);
          isTransitioning.current = false;
          if (containerRef.current) {
            containerRef.current.removeAttribute('aria-busy');
          }
        }
      });

      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      if (prefersReducedMotion) {
        tl.to(currentPanel, { opacity: 0, duration: 0.14 })
          .set(nextPanel, { opacity: 0 })
          .to(nextPanel, { opacity: 1, duration: 0.14 });
      } else {
        tl.to(currentPanel, { opacity: 0, y: -8, duration: 0.28, ease: "power2.out" })
          .set(nextPanel, { opacity: 0, y: 8 })
          .to(nextPanel, { opacity: 1, y: 0, duration: 0.28, ease: "power2.out" });
      }
    } else {
      setActiveTab(tabId);
      isTransitioning.current = false;
    }
  };

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
          <nav 
            className="where-to__tablist flex flex-nowrap items-baseline gap-4 mt-2 overflow-x-auto" 
            role="tablist" 
            aria-label="Where To Categories"
          >
            {/* Active tab first */}
            <button
              role="tab"
              id={`tab-${activeCategory?.id}`}
              aria-selected="true"
              aria-controls={`panel-${activeCategory?.id}`}
              tabIndex={0}
              className={cn(
                "where-to__tab text-where-heading-m lg:text-where-heading-d font-light tracking-wide uppercase leading-none",
                "bg-transparent border-0 p-0 cursor-pointer transition-colors duration-200 flex-shrink-0",
                "text-where-active hover:text-where-active focus:outline-none focus:ring-2 focus:ring-where-active focus:ring-offset-2"
              )}
              onClick={() => handleTabClick(activeCategory?.id as TabId)}
              onKeyDown={(e) => handleKeyDown(e, activeCategory?.id as TabId)}
            >
              {activeCategory?.label}
            </button>
            
            {/* Inactive tabs */}
            {inactiveCategories.map((category) => (
              <button
                key={category.id}
                role="tab"
                id={`tab-${category.id}`}
                aria-selected="false"
                aria-controls={`panel-${category.id}`}
                tabIndex={-1}
                className={cn(
                  "where-to__tab text-where-heading-m lg:text-where-heading-d font-light tracking-wide uppercase leading-none flex-shrink-0",
                  "bg-transparent border-0 p-0 cursor-pointer transition-colors duration-200",
                  "text-where-inactive hover:text-where-active focus:outline-none focus:ring-2 focus:ring-where-active focus:ring-offset-2"
                )}
                onClick={() => handleTabClick(category.id as TabId)}
                onKeyDown={(e) => handleKeyDown(e, category.id as TabId)}
              >
                {category.label}
              </button>
            ))}
          </nav>
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
