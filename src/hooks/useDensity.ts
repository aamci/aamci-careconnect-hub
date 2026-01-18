/**
 * useDensity Hook - Design System Density Management
 *
 * Manages 3 density modes:
 * - compact: Optimized for 1366x768 screens, maximum information density
 * - standard: Balanced for 1920x1080 screens (default)
 * - confort: Enhanced readability for large screens / accessibility
 *
 * Features:
 * - Persists preference in localStorage
 * - Auto-detection based on screen size (if no preference)
 * - Applies data-density attribute to document root
 * - Returns computed token values for component use
 */

import { useState, useEffect, useCallback, useMemo } from 'react';

export type DensityMode = 'compact' | 'standard' | 'confort';

const STORAGE_KEY = 'careconnect-density-mode';

interface DensityConfig {
  // Spacing
  spaceXs: number;
  spaceSm: number;
  spaceMd: number;
  spaceLg: number;
  spaceXl: number;
  space2xl: number;

  // Typography
  textXs: number;
  textSm: number;
  textBase: number;
  textLg: number;
  textXl: number;
  text2xl: number;

  // Components
  cardPadding: number;
  cardGap: number;
  cardRadius: number;
  btnHeight: number;
  inputHeight: number;
  badgeHeight: number;

  // Avatar
  avatarSm: number;
  avatarMd: number;
  avatarLg: number;

  // Icons
  iconSm: number;
  iconMd: number;
  iconLg: number;

  // Grid
  slotHeight: number;
  headerHeight: number;
  axisWidth: number;

  // Patient Dossier
  infoCardMinHeight: number;
  infoCardHeaderHeight: number;
  listItemHeight: number;
  sectionGap: number;
}

const DENSITY_CONFIGS: Record<DensityMode, DensityConfig> = {
  compact: {
    spaceXs: 2,
    spaceSm: 4,
    spaceMd: 8,
    spaceLg: 12,
    spaceXl: 16,
    space2xl: 24,
    textXs: 10,
    textSm: 11,
    textBase: 12,
    textLg: 14,
    textXl: 15,
    text2xl: 16,
    cardPadding: 10,
    cardGap: 8,
    cardRadius: 8,
    btnHeight: 28,
    inputHeight: 32,
    badgeHeight: 20,
    avatarSm: 22,
    avatarMd: 28,
    avatarLg: 36,
    iconSm: 12,
    iconMd: 14,
    iconLg: 18,
    slotHeight: 36,
    headerHeight: 36,
    axisWidth: 44,
    infoCardMinHeight: 72,
    infoCardHeaderHeight: 28,
    listItemHeight: 32,
    sectionGap: 8,
  },
  standard: {
    spaceXs: 4,
    spaceSm: 8,
    spaceMd: 12,
    spaceLg: 16,
    spaceXl: 24,
    space2xl: 32,
    textXs: 11,
    textSm: 12,
    textBase: 14,
    textLg: 16,
    textXl: 18,
    text2xl: 20,
    cardPadding: 16,
    cardGap: 12,
    cardRadius: 10,
    btnHeight: 36,
    inputHeight: 40,
    badgeHeight: 24,
    avatarSm: 28,
    avatarMd: 36,
    avatarLg: 48,
    iconSm: 14,
    iconMd: 18,
    iconLg: 22,
    slotHeight: 48,
    headerHeight: 44,
    axisWidth: 52,
    infoCardMinHeight: 100,
    infoCardHeaderHeight: 36,
    listItemHeight: 40,
    sectionGap: 12,
  },
  confort: {
    spaceXs: 6,
    spaceSm: 10,
    spaceMd: 16,
    spaceLg: 20,
    spaceXl: 32,
    space2xl: 40,
    textXs: 12,
    textSm: 13,
    textBase: 15,
    textLg: 17,
    textXl: 20,
    text2xl: 24,
    cardPadding: 20,
    cardGap: 16,
    cardRadius: 12,
    btnHeight: 44,
    inputHeight: 48,
    badgeHeight: 28,
    avatarSm: 32,
    avatarMd: 44,
    avatarLg: 56,
    iconSm: 16,
    iconMd: 20,
    iconLg: 26,
    slotHeight: 60,
    headerHeight: 52,
    axisWidth: 60,
    infoCardMinHeight: 120,
    infoCardHeaderHeight: 44,
    listItemHeight: 48,
    sectionGap: 16,
  },
};

function detectAutoMode(): DensityMode {
  if (typeof window === 'undefined') return 'standard';

  const width = window.innerWidth;
  if (width <= 1366) return 'compact';
  if (width >= 2560) return 'confort';
  return 'standard';
}

function getStoredMode(): DensityMode | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && ['compact', 'standard', 'confort'].includes(stored)) {
    return stored as DensityMode;
  }
  return null;
}

function applyDensityToDOM(mode: DensityMode) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-density', mode);
  }
}

export interface UseDensityReturn {
  /** Current density mode */
  mode: DensityMode;

  /** Configuration values for current mode */
  config: DensityConfig;

  /** Change density mode (persists to localStorage) */
  setMode: (mode: DensityMode) => void;

  /** Reset to auto-detection (removes localStorage preference) */
  resetToAuto: () => void;

  /** Whether user has a stored preference */
  hasStoredPreference: boolean;

  /** Quick check helpers */
  isCompact: boolean;
  isStandard: boolean;
  isConfort: boolean;

  /** CSS variable getter - returns 'var(--density-...)' strings */
  cssVar: (name: keyof DensityConfig) => string;
}

export function useDensity(): UseDensityReturn {
  const [mode, setModeState] = useState<DensityMode>(() => {
    const stored = getStoredMode();
    return stored ?? detectAutoMode();
  });

  const [hasStoredPreference, setHasStoredPreference] = useState<boolean>(() => {
    return getStoredMode() !== null;
  });

  // Apply to DOM on mount and mode changes
  useEffect(() => {
    applyDensityToDOM(mode);
  }, [mode]);

  // Listen for screen size changes (for auto mode)
  useEffect(() => {
    if (hasStoredPreference) return; // Don't auto-update if user has preference

    const handleResize = () => {
      const autoMode = detectAutoMode();
      setModeState(autoMode);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasStoredPreference]);

  const setMode = useCallback((newMode: DensityMode) => {
    localStorage.setItem(STORAGE_KEY, newMode);
    setModeState(newMode);
    setHasStoredPreference(true);
  }, []);

  const resetToAuto = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setHasStoredPreference(false);
    setModeState(detectAutoMode());
  }, []);

  const config = useMemo(() => DENSITY_CONFIGS[mode], [mode]);

  const cssVar = useCallback((name: keyof DensityConfig): string => {
    const cssVarMap: Record<keyof DensityConfig, string> = {
      spaceXs: '--density-space-xs',
      spaceSm: '--density-space-sm',
      spaceMd: '--density-space-md',
      spaceLg: '--density-space-lg',
      spaceXl: '--density-space-xl',
      space2xl: '--density-space-2xl',
      textXs: '--density-text-xs',
      textSm: '--density-text-sm',
      textBase: '--density-text-base',
      textLg: '--density-text-lg',
      textXl: '--density-text-xl',
      text2xl: '--density-text-2xl',
      cardPadding: '--density-card-padding',
      cardGap: '--density-card-gap',
      cardRadius: '--density-card-radius',
      btnHeight: '--density-btn-height',
      inputHeight: '--density-input-height',
      badgeHeight: '--density-badge-height',
      avatarSm: '--density-avatar-sm',
      avatarMd: '--density-avatar-md',
      avatarLg: '--density-avatar-lg',
      iconSm: '--density-icon-sm',
      iconMd: '--density-icon-md',
      iconLg: '--density-icon-lg',
      slotHeight: '--density-slot-height',
      headerHeight: '--density-header-height',
      axisWidth: '--density-axis-width',
      infoCardMinHeight: '--density-info-card-min-height',
      infoCardHeaderHeight: '--density-info-card-header-height',
      listItemHeight: '--density-list-item-height',
      sectionGap: '--density-section-gap',
    };
    return `var(${cssVarMap[name]})`;
  }, []);

  return {
    mode,
    config,
    setMode,
    resetToAuto,
    hasStoredPreference,
    isCompact: mode === 'compact',
    isStandard: mode === 'standard',
    isConfort: mode === 'confort',
    cssVar,
  };
}

/**
 * Helper to interpolate between density modes
 * Useful for smooth animations or custom intermediate states
 */
export function interpolateDensity(
  from: DensityMode,
  to: DensityMode,
  progress: number // 0-1
): Partial<DensityConfig> {
  const fromConfig = DENSITY_CONFIGS[from];
  const toConfig = DENSITY_CONFIGS[to];

  const result: Partial<DensityConfig> = {};

  for (const key of Object.keys(fromConfig) as (keyof DensityConfig)[]) {
    const fromVal = fromConfig[key];
    const toVal = toConfig[key];
    result[key] = Math.round(fromVal + (toVal - fromVal) * progress);
  }

  return result;
}

/**
 * Get density config without hook (for non-React contexts)
 */
export function getDensityConfig(mode?: DensityMode): DensityConfig {
  const effectiveMode = mode ?? getStoredMode() ?? detectAutoMode();
  return DENSITY_CONFIGS[effectiveMode];
}

export { DENSITY_CONFIGS };
export default useDensity;
