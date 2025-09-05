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
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};
export function useMediaQuery(query: string): boolean;
export function useMediaQuery(breakpoint: BreakpointKey): boolean;

/**
 * Custom hook for responsive media queries with SSR support
 * 
 * @param query - Media query string or predefined breakpoint key
 * @returns Boolean indicating if the media query matches, or object with device types
 * 
 * @example
 * // Get all device types
 * const { isMobile, isTablet, isDesktop } = useMediaQuery();
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
  // SSR-safe initialization
  const getInitialValue = useCallback((mediaQuery: string): boolean => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(mediaQuery).matches;
  }, []);

  // If no query provided, return all device types
  if (!query) {
    const [isMobile, setIsMobile] = useState(() => getInitialValue(BREAKPOINTS.mobile));
    const [isTablet, setIsTablet] = useState(() => getInitialValue(BREAKPOINTS.tablet));
    const [isDesktop, setIsDesktop] = useState(() => getInitialValue(BREAKPOINTS.desktop));

    useEffect(() => {
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
        }, 100);
      };

      // Set initial values
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

    return { isMobile, isTablet, isDesktop };
  }

  // Single query mode
  const mediaQuery = query in BREAKPOINTS ? BREAKPOINTS[query as BreakpointKey] : query;
  const [matches, setMatches] = useState(() => getInitialValue(mediaQuery));

  useEffect(() => {
    const mq = window.matchMedia(mediaQuery);

    // Update function with debouncing
    let timeoutId: NodeJS.Timeout;
    
    const updateMatch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setMatches(mq.matches);
      }, 100);
    };

    // Set initial value
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
