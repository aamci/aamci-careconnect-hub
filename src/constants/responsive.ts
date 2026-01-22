/**
 * Configuration responsive et breakpoints
 * Stratégie anti-overlap pour layouts multi-colonnes
 */

export type Breakpoint = 'mobile' | 'tablet' | 'laptop' | 'desktop' | 'wide';

export const BREAKPOINTS: Record<Breakpoint, number> = {
  mobile: 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  wide: 1920
} as const;

export const Z_INDEX_MAP = {
  BASE_CONTENT: 1,
  STICKY_HEADERS: 10,
  SIDE_NAVIGATION: 100,
  ACTIONS_COLUMN: 200,
  DRAWER_OVERLAY: 900,
  DRAWER_CONTENT: 1000,
  MODAL_OVERLAY: 1900,
  MODAL_CONTENT: 2000,
  TOAST: 3000
} as const;

export function getCurrentBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.wide) return 'wide';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.laptop) return 'laptop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

export function isMobile(breakpoint: Breakpoint): boolean {
  return breakpoint === 'mobile';
}

export function isTablet(breakpoint: Breakpoint): boolean {
  return breakpoint === 'tablet';
}

export function isDesktop(breakpoint: Breakpoint): boolean {
  return ['laptop', 'desktop', 'wide'].includes(breakpoint);
}
