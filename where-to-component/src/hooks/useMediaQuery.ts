'use client';

import { useState, useEffect, useCallback } from 'react';

// Predefined breakpoints matching Tailwind CSS defaults
export const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  // Additional common breakpoints
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

// Hook overloads for different usage patterns
export function useMediaQuery(): {
  isMobile: boolean | null;
  isTablet: boolean | null;
  isDesktop: boolean | null;
  isHydrated: boolean;
};
export function useMediaQuery(query: string): boolean | null;
export function useMediaQuery(breakpoint: BreakpointKey): boolean | null;

/**
 * SSR-safe custom hook for responsive media queries
 * 
 * @param query - Media query string or predefined breakpoint key
 * @returns Boolean indicating if the media query matches (null during SSR), or object with device types
 * 
 * @example
 * // Get all device types
 * const { isMobile, isTablet, isDesktop, isHydrated } = useMediaQuery();
 * 
 * @example
 * // Use predefined breakpoint
 * const isMobile = useMediaQuery('mobile');
 * 
 * @example
 * // Use custom media query
 * const isLargeScreen = useMediaQuery('(min-width: 1440px)');
 */
export function useMediaQuery(query?: string | BreakpointKey) {
  // Track if component has hydrated to prevent hydration mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  // SSR-safe initialization - always return null during SSR
  const getInitialValue = useCallback((mediaQuery: string): boolean | null => {
    if (typeof window === 'undefined' || !isHydrated) return null;
    return window.matchMedia(mediaQuery).matches;
  }, [isHydrated]);

  // If no query provided, return all device types
  if (!query) {
    const [isMobile, setIsMobile] = useState<boolean | null>(() => getInitialValue(BREAKPOINTS.mobile));
    const [isTablet, setIsTablet] = useState<boolean | null>(() => getInitialValue(BREAKPOINTS.tablet));
    const [isDesktop, setIsDesktop] = useState<boolean | null>(() => getInitialValue(BREAKPOINTS.desktop));

    useEffect(() => {
      // Set hydrated flag to true after first render
      setIsHydrated(true);
      
      if (typeof window === 'undefined') return;
      
      const mobileQuery = window.matchMedia(BREAKPOINTS.mobile);
      const tabletQuery = window.matchMedia(BREAKPOINTS.tablet);
      const desktopQuery = window.matchMedia(BREAKPOINTS.desktop);

      // Update functions with debouncing
      let timeoutId: NodeJS.Timeout;
      
      const updateValues = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsMobile(mobileQuery.matches);
          setIsTablet(tabletQuery.matches);
          setIsDesktop(desktopQuery.matches);
        }, 16); // Reduced debounce for faster response
      };

      // Set initial values immediately after hydration
      updateValues();

      // Add listeners
      mobileQuery.addEventListener('change', updateValues);
      tabletQuery.addEventListener('change', updateValues);
      desktopQuery.addEventListener('change', updateValues);

      return () => {
        clearTimeout(timeoutId);
        mobileQuery.removeEventListener('change', updateValues);
        tabletQuery.removeEventListener('change', updateValues);
        desktopQuery.removeEventListener('change', updateValues);
      };
    }, []);

    return { isMobile, isTablet, isDesktop, isHydrated };
  }

  // Single query mode
  const mediaQuery = query in BREAKPOINTS ? BREAKPOINTS[query as BreakpointKey] : query;
  const [matches, setMatches] = useState<boolean | null>(() => getInitialValue(mediaQuery));

  useEffect(() => {
    // Set hydrated flag to true after first render
    setIsHydrated(true);
    
    if (typeof window === 'undefined') return;
    
    const mq = window.matchMedia(mediaQuery);

    // Update function with debouncing
    let timeoutId: NodeJS.Timeout;
    
    const updateMatch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMatches(mq.matches);
      }, 16); // Reduced debounce for faster response
    };

    // Set initial value immediately after hydration
    updateMatch();

    // Add listener
    mq.addEventListener('change', updateMatch);

    return () => {
      clearTimeout(timeoutId);
      mq.removeEventListener('change', updateMatch);
    };
  }, [mediaQuery]);

  return matches;
}

// Utility hook for common mobile detection (backward compatibility)
export const useMobileDetection = () => {
  return useMediaQuery('mobile');
};

// Utility hooks for specific breakpoints
export const useIsMobile = () => useMediaQuery('mobile');
export const useIsTablet = () => useMediaQuery('tablet');
export const useIsDesktop = () => useMediaQuery('desktop');
