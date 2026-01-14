import { useCallback, useSyncExternalStore, useEffect } from 'react';

// Types for agenda display preferences
export type ZoomLevel = 'minimum' | 'standard' | 'maximum';
export type StatsMode = 'hidden' | 'perDay' | 'perHalfDay';
export type HoverGranularity = 'default' | 5 | 10 | 12 | 15 | 20 | 30 | 45;
export type SidebarGrouping = 'alphabetical' | 'center' | 'location' | 'specialty';
export type SchoolHolidayRegion = 'A' | 'B' | 'C' | 'corse' | null;

export interface AgendaPreferences {
  zoomLevel: ZoomLevel;
  displayStartTime: string;
  displayEndTime: string;
  hoverGranularityMinutes: HoverGranularity;
  schoolHolidaysRegion: SchoolHolidayRegion;
  showHolidaysMiniCalendar: boolean;
  showHolidaysMainCalendar: boolean;
  weekVisibleDays: number[];
  showOnlyUpcomingDays: boolean;
  showConsultationReasonsInDayView: boolean;
  showSideBySideAgendasInWeekView: boolean;
  sidebarGroupingPrimary: SidebarGrouping;
  sidebarGroupingSecondary: SidebarGrouping | null;
  statsMode: StatsMode;
  afternoonStartTime: string;
  notificationsOnlineBookings: boolean;
  waitingRoomSound: boolean;
  enablePatientNameBlurOption: boolean;
}

// DEFAULT VALUES - Exactly matching the reference images
const DEFAULT_PREFERENCES: AgendaPreferences = {
  zoomLevel: 'minimum',
  displayStartTime: '07:00',
  displayEndTime: '19:00',
  hoverGranularityMinutes: 'default',
  schoolHolidaysRegion: 'A',
  showHolidaysMiniCalendar: false,
  showHolidaysMainCalendar: false,
  weekVisibleDays: [0, 1, 2, 3, 4, 5, 6],
  showOnlyUpcomingDays: false,
  showConsultationReasonsInDayView: true,
  showSideBySideAgendasInWeekView: false,
  sidebarGroupingPrimary: 'alphabetical',
  sidebarGroupingSecondary: null,
  statsMode: 'hidden',
  afternoonStartTime: '14:00',
  notificationsOnlineBookings: true,
  waitingRoomSound: false,
  enablePatientNameBlurOption: false,
};

const STORAGE_KEY = 'agenda_display_preferences_v6';

const ZOOM_SLOT_HEIGHTS: Record<ZoomLevel, number> = {
  minimum: 24,
  standard: 36,
  maximum: 60,
};

// ============ ULTRA-FAST STORE (No React state, direct mutation + sync) ============
let currentPreferences: AgendaPreferences = DEFAULT_PREFERENCES;
const listeners = new Set<() => void>();

// Load from localStorage on module init
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      currentPreferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  // Apply CSS immediately on load
  applyZoomCSS(currentPreferences.zoomLevel);
}

function applyZoomCSS(zoomLevel: ZoomLevel) {
  const root = document.documentElement;
  const slotHeight = ZOOM_SLOT_HEIGHTS[zoomLevel];
  root.style.setProperty('--grid-slot-height', `${slotHeight}px`);
  const headerHeight = zoomLevel === 'minimum' ? 36 : zoomLevel === 'maximum' ? 48 : 40;
  root.style.setProperty('--grid-header-height', `${headerHeight}px`);
}

function getSnapshot(): AgendaPreferences {
  return currentPreferences;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setPreferences(newPrefs: AgendaPreferences) {
  currentPreferences = newPrefs;
  // Save to localStorage synchronously
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPrefs));
  } catch (e) {
    console.error('Failed to save preferences:', e);
  }
  // Apply CSS immediately for zoom
  applyZoomCSS(newPrefs.zoomLevel);
  // Notify all listeners synchronously
  listeners.forEach(listener => listener());
}

// ============ HOOK ============
export function useAgendaPreferences() {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  // Apply CSS on mount and when zoomLevel changes
  useEffect(() => {
    applyZoomCSS(preferences.zoomLevel);
  }, [preferences.zoomLevel]);

  const updatePreference = useCallback(<K extends keyof AgendaPreferences>(
    key: K,
    value: AgendaPreferences[K]
  ) => {
    const updated = { ...currentPreferences, [key]: value };
    setPreferences(updated);
  }, []);

  const updatePreferences = useCallback((updates: Partial<AgendaPreferences>) => {
    const updated = { ...currentPreferences, ...updates };
    setPreferences(updated);
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const slotHeight = ZOOM_SLOT_HEIGHTS[preferences.zoomLevel];

  const getVisibleDayNames = useCallback(() => {
    const dayNames = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
    return preferences.weekVisibleDays.map(d => dayNames[d]);
  }, [preferences.weekVisibleDays]);

  const isDayVisible = useCallback((dayIndex: number) => {
    return preferences.weekVisibleDays.includes(dayIndex);
  }, [preferences.weekVisibleDays]);

  const toggleDayVisibility = useCallback((dayIndex: number) => {
    const current = currentPreferences.weekVisibleDays;
    const updated = current.includes(dayIndex)
      ? current.filter(d => d !== dayIndex)
      : [...current, dayIndex].sort((a, b) => a - b);
    if (updated.length > 0) {
      setPreferences({ ...currentPreferences, weekVisibleDays: updated });
    }
  }, []);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    isSaving: false,
    slotHeight,
    getVisibleDayNames,
    isDayVisible,
    toggleDayVisibility,
    defaults: DEFAULT_PREFERENCES,
  };
}

export { DEFAULT_PREFERENCES, ZOOM_SLOT_HEIGHTS };
