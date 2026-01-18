import { useMemo, useState, useEffect, RefObject } from 'react';

// Support both string labels and numeric zoom levels (0-20)
export type ZoomLevel = 'minimum' | 'standard' | 'maximum' | number;
export type ZoomLevelLabel = 'minimum' | 'standard' | 'maximum';
export type DensityMode = 'comfort' | 'compact';

// Zoom level constants (matches useAgendaPreferences)
const ZOOM_MIN = 0;
const ZOOM_STANDARD = 10;
const ZOOM_MAX = 20;

// Zoom multipliers - how much to scale from the adaptive base height
// At zoom 0 (minimum): 1.0x (just fit the screen)
// At zoom 10 (standard): 1.5x
// At zoom 20 (maximum): 2.5x
const ZOOM_MULTIPLIER_MIN = 1.0;
const ZOOM_MULTIPLIER_STANDARD = 1.5;
const ZOOM_MULTIPLIER_MAX = 2.5;

// Fallback slot heights when container isn't measured yet
const FALLBACK_SLOT_HEIGHT_MIN = 40;
const FALLBACK_SLOT_HEIGHT_STANDARD = 60;
const FALLBACK_SLOT_HEIGHT_MAX = 100;

interface DensityConfig {
  slotHeight: number;
  eventPadding: string;
  fontSize: string;
  headerHeight: number;
  axisWidth: number;
}

/**
 * Get zoom multiplier for a given zoom level
 * Interpolates smoothly between min/standard/max multipliers
 */
function getZoomMultiplier(zoomLevel: ZoomLevel): number {
  // Handle string labels
  if (typeof zoomLevel === 'string') {
    switch (zoomLevel) {
      case 'minimum': return ZOOM_MULTIPLIER_MIN;
      case 'maximum': return ZOOM_MULTIPLIER_MAX;
      default: return ZOOM_MULTIPLIER_STANDARD;
    }
  }

  // Handle numeric zoom levels (0-20)
  const numericZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel));

  if (numericZoom <= ZOOM_STANDARD) {
    // Interpolate between minimum and standard (0-10)
    const ratio = numericZoom / ZOOM_STANDARD;
    return ZOOM_MULTIPLIER_MIN + ratio * (ZOOM_MULTIPLIER_STANDARD - ZOOM_MULTIPLIER_MIN);
  } else {
    // Interpolate between standard and maximum (10-20)
    const ratio = (numericZoom - ZOOM_STANDARD) / (ZOOM_MAX - ZOOM_STANDARD);
    return ZOOM_MULTIPLIER_STANDARD + ratio * (ZOOM_MULTIPLIER_MAX - ZOOM_MULTIPLIER_STANDARD);
  }
}

/**
 * Get fallback slot height when container isn't measured
 */
function getFallbackSlotHeight(zoomLevel: ZoomLevel): number {
  if (typeof zoomLevel === 'string') {
    switch (zoomLevel) {
      case 'minimum': return FALLBACK_SLOT_HEIGHT_MIN;
      case 'maximum': return FALLBACK_SLOT_HEIGHT_MAX;
      default: return FALLBACK_SLOT_HEIGHT_STANDARD;
    }
  }

  const numericZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, zoomLevel));

  if (numericZoom <= ZOOM_STANDARD) {
    const ratio = numericZoom / ZOOM_STANDARD;
    return Math.round(FALLBACK_SLOT_HEIGHT_MIN + ratio * (FALLBACK_SLOT_HEIGHT_STANDARD - FALLBACK_SLOT_HEIGHT_MIN));
  } else {
    const ratio = (numericZoom - ZOOM_STANDARD) / (ZOOM_MAX - ZOOM_STANDARD);
    return Math.round(FALLBACK_SLOT_HEIGHT_STANDARD + ratio * (FALLBACK_SLOT_HEIGHT_MAX - FALLBACK_SLOT_HEIGHT_STANDARD));
  }
}

/**
 * Convert zoom level to a label for styling purposes
 */
function getZoomLabel(zoomLevel: ZoomLevel): ZoomLevelLabel {
  if (typeof zoomLevel === 'string') {
    return zoomLevel;
  }

  if (zoomLevel <= 3) return 'minimum';
  if (zoomLevel >= 17) return 'maximum';
  return 'standard';
}

// Get density config based on slot height and zoom label
const getDensityConfig = (slotHeight: number, zoomLabel: ZoomLevelLabel): DensityConfig => {
  if (zoomLabel === 'minimum') {
    return {
      slotHeight,
      eventPadding: 'px-1 py-0',
      fontSize: 'text-[9px]',
      headerHeight: 36,
      axisWidth: 44,
    };
  }

  if (zoomLabel === 'maximum') {
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

// Main hook with explicit zoomLevel parameter (for non-adaptive use)
export function useGridDensity(zoomLevel: ZoomLevel = 'standard') {
  const config = useMemo(() => {
    const slotHeight = getFallbackSlotHeight(zoomLevel);
    const zoomLabel = getZoomLabel(zoomLevel);
    return getDensityConfig(slotHeight, zoomLabel);
  }, [zoomLevel]);

  const zoomLabel = getZoomLabel(zoomLevel);
  const isCompact = zoomLabel === 'minimum';

  return {
    mode: isCompact ? 'compact' : ('comfort' as DensityMode),
    config,
    isCompact,
    zoomLevel,
  };
}

/**
 * Adaptive Grid Density Hook
 *
 * Key behavior:
 * - At zoom 0 (minimum): Grid fills available space exactly (no scrolling)
 * - As zoom increases: Grid expands beyond screen (scrollable)
 * - Zoom multiplier scales from 1.0x (min) to 2.5x (max)
 *
 * @param zoomLevel - Current zoom level (string label or number 0-20)
 * @param containerRef - Ref to the scrollable container
 * @param startHour - First hour displayed
 * @param endHour - Last hour displayed
 */
export function useAdaptiveGridDensity(
  zoomLevel: ZoomLevel = 'standard',
  containerRef: RefObject<HTMLElement | null>,
  startHour: number = 7,
  endHour: number = 20
) {
  const [containerHeight, setContainerHeight] = useState(0);
  const totalHours = endHour - startHour + 1;

  // Measure container height on mount and resize
  useEffect(() => {
    const measureHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.clientHeight;
        setContainerHeight(height);
      }
    };

    // Initial measurement with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(measureHeight, 50);

    // Re-measure on resize
    const resizeObserver = new ResizeObserver(measureHeight);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', measureHeight);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', measureHeight);
    };
  }, [containerRef]);

  // Calculate slot height based on zoom level
  const slotHeight = useMemo(() => {
    // If container not measured yet, use fallback
    if (containerHeight === 0) {
      return getFallbackSlotHeight(zoomLevel);
    }

    // Calculate base height that fills the container at zoom 0
    // Subtract 16px: 8px for top padding (first hour visibility) + 8px safety margin
    const baseSlotHeight = Math.floor((containerHeight - 16) / totalHours);

    // Apply zoom multiplier
    const multiplier = getZoomMultiplier(zoomLevel);
    const calculatedHeight = Math.round(baseSlotHeight * multiplier);

    // Ensure minimum height of 24px
    return Math.max(24, calculatedHeight);
  }, [zoomLevel, containerHeight, totalHours]);

  const zoomLabel = getZoomLabel(zoomLevel);
  const isCompact = zoomLabel === 'minimum';

  const config = useMemo(() => {
    return getDensityConfig(slotHeight, zoomLabel);
  }, [slotHeight, zoomLabel]);

  // Calculate total grid height
  const totalGridHeight = useMemo(() => {
    return config.slotHeight * totalHours;
  }, [config.slotHeight, totalHours]);

  return {
    mode: isCompact ? 'compact' : ('comfort' as DensityMode),
    config,
    isCompact,
    zoomLevel,
    containerHeight,
    totalGridHeight,
  };
}

/**
 * Simple function to get slot height for a given container and time range
 * Useful for non-React contexts
 */
export function calculateAdaptiveSlotHeight(
  containerHeight: number,
  startHour: number,
  endHour: number,
  minSlotHeight: number = 20
): number {
  const totalHours = endHour - startHour + 1;
  return Math.max(Math.floor(containerHeight / totalHours), minSlotHeight);
}
