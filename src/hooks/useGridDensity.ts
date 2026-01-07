import { useState, useEffect, useCallback } from 'react';

export type DensityMode = 'comfort' | 'compact';

interface DensityConfig {
  slotHeight: number;
  eventPadding: string;
  fontSize: string;
  headerHeight: number;
  axisWidth: number;
}

const DENSITY_CONFIGS: Record<DensityMode, DensityConfig> = {
  comfort: {
    slotHeight: 48,
    eventPadding: 'px-2 py-1',
    fontSize: 'text-[10px]',
    headerHeight: 44,
    axisWidth: 52,
  },
  compact: {
    slotHeight: 36,
    eventPadding: 'px-1.5 py-0.5',
    fontSize: 'text-[9px]',
    headerHeight: 40,
    axisWidth: 48,
  },
};

const STORAGE_KEY = 'agenda_density_mode';

export function useGridDensity() {
  const [mode, setModeState] = useState<DensityMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'comfort' || stored === 'compact') {
        return stored;
      }
    }
    return 'compact'; // Default to compact
  });

  const setMode = useCallback((newMode: DensityMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'comfort' ? 'compact' : 'comfort');
  }, [mode, setMode]);

  const config = DENSITY_CONFIGS[mode];

  // Apply CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--grid-slot-height', `${config.slotHeight}px`);
    root.style.setProperty('--grid-header-height', `${config.headerHeight}px`);
    root.style.setProperty('--grid-axis-width', `${config.axisWidth}px`);
  }, [config]);

  return {
    mode,
    setMode,
    toggleMode,
    config,
    isCompact: mode === 'compact',
  };
}
