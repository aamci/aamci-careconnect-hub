import { useMemo } from 'react';
import { useAgendaPreferences, type ZoomLevel } from './useAgendaPreferences';

export type DensityMode = 'comfort' | 'compact';

interface DensityConfig {
  slotHeight: number;
  eventPadding: string;
  fontSize: string;
  headerHeight: number;
  axisWidth: number;
}

// Map zoom levels to slot heights
const getSlotHeightForZoom = (zoomLevel: ZoomLevel): number => {
  switch (zoomLevel) {
    case 'minimum': return 24;
    case 'standard': return 36;
    case 'maximum': return 60;
    default: return 36;
  }
};

// Get density config based on zoom level
const getDensityConfig = (zoomLevel: ZoomLevel): DensityConfig => {
  const slotHeight = getSlotHeightForZoom(zoomLevel);
  
  if (zoomLevel === 'minimum') {
    return {
      slotHeight,
      eventPadding: 'px-1 py-0',
      fontSize: 'text-[8px]',
      headerHeight: 36,
      axisWidth: 44,
    };
  }
  
  if (zoomLevel === 'maximum') {
    return {
      slotHeight,
      eventPadding: 'px-2 py-1.5',
      fontSize: 'text-xs',
      headerHeight: 48,
      axisWidth: 56,
    };
  }
  
  // Standard
  return {
    slotHeight,
    eventPadding: 'px-1.5 py-0.5',
    fontSize: 'text-[10px]',
    headerHeight: 40,
    axisWidth: 52,
  };
};

export function useGridDensity() {
  const { preferences } = useAgendaPreferences();
  
  const config = useMemo(() => {
    return getDensityConfig(preferences.zoomLevel);
  }, [preferences.zoomLevel]);

  const isCompact = preferences.zoomLevel === 'minimum';

  return {
    mode: isCompact ? 'compact' : 'comfort' as DensityMode,
    config,
    isCompact,
    zoomLevel: preferences.zoomLevel,
  };
}
