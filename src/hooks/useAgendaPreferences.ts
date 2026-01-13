import { useState, useEffect, useCallback, useRef } from 'react';

// Types for agenda display preferences
export type ZoomLevel = 'minimum' | 'standard' | 'maximum';
export type StatsMode = 'hidden' | 'perDay' | 'perHalfDay';
export type HoverGranularity = 'default' | 5 | 10 | 12 | 15 | 20 | 30 | 45;
export type SidebarGrouping = 'alphabetical' | 'center' | 'location' | 'specialty';
export type SchoolHolidayRegion = 'A' | 'B' | 'C' | 'corse' | null;

export interface AgendaPreferences {
  // Density
  zoomLevel: ZoomLevel;
  
  // Time range
  displayStartTime: string; // HH:MM
  displayEndTime: string; // HH:MM
  
  // Mouse precision
  hoverGranularityMinutes: HoverGranularity;
  
  // School holidays
  schoolHolidaysRegion: SchoolHolidayRegion;
  showHolidaysMiniCalendar: boolean;
  showHolidaysMainCalendar: boolean;
  
  // Display options
  weekVisibleDays: number[]; // 0=Mon, 1=Tue, ..., 6=Sun
  showOnlyUpcomingDays: boolean;
  showConsultationReasonsInDayView: boolean;
  showSideBySideAgendasInWeekView: boolean;
  
  // Sidebar grouping
  sidebarGroupingPrimary: SidebarGrouping;
  sidebarGroupingSecondary: SidebarGrouping | null;
  
  // Statistics
  statsMode: StatsMode;
  afternoonStartTime: string; // HH:MM
  
  // Other options
  notificationsOnlineBookings: boolean;
  waitingRoomSound: boolean;
  enablePatientNameBlurOption: boolean;
}

const DEFAULT_PREFERENCES: AgendaPreferences = {
  zoomLevel: 'standard', // Standard is the default - IMPORTANT
  displayStartTime: '07:00',
  displayEndTime: '19:00',
  hoverGranularityMinutes: 'default',
  schoolHolidaysRegion: null,
  showHolidaysMiniCalendar: false,
  showHolidaysMainCalendar: false,
  weekVisibleDays: [0, 1, 2, 3, 4, 5, 6], // All days visible by default (Mon-Sun)
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

// Force reset to v3 to ensure new defaults are applied
const STORAGE_KEY = 'agenda_display_preferences_v3';

// Zoom level to slot height mapping
const ZOOM_SLOT_HEIGHTS: Record<ZoomLevel, number> = {
  minimum: 24,
  standard: 36,
  maximum: 60,
};

export function useAgendaPreferences() {
  const [preferences, setPreferencesState] = useState<AgendaPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to load agenda preferences:', e);
    }
    return DEFAULT_PREFERENCES;
  });

  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage with debounce
  const persistPreferences = useCallback((prefs: AgendaPreferences) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setIsSaving(true);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
        // TODO: Also save to Supabase when user_preferences table exists
      } catch (e) {
        console.error('Failed to save agenda preferences:', e);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, []);

  // Update a single preference
  const updatePreference = useCallback(<K extends keyof AgendaPreferences>(
    key: K,
    value: AgendaPreferences[K]
  ) => {
    setPreferencesState(prev => {
      const updated = { ...prev, [key]: value };
      persistPreferences(updated);
      return updated;
    });
  }, [persistPreferences]);

  // Update multiple preferences at once
  const updatePreferences = useCallback((updates: Partial<AgendaPreferences>) => {
    setPreferencesState(prev => {
      const updated = { ...prev, ...updates };
      persistPreferences(updated);
      return updated;
    });
  }, [persistPreferences]);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferencesState(DEFAULT_PREFERENCES);
    persistPreferences(DEFAULT_PREFERENCES);
  }, [persistPreferences]);

  // Apply CSS variables based on zoom level
  useEffect(() => {
    const root = document.documentElement;
    const slotHeight = ZOOM_SLOT_HEIGHTS[preferences.zoomLevel];
    root.style.setProperty('--grid-slot-height', `${slotHeight}px`);
    
    // Adjust header and axis based on zoom
    const headerHeight = preferences.zoomLevel === 'minimum' ? 36 : 
                        preferences.zoomLevel === 'maximum' ? 48 : 40;
    root.style.setProperty('--grid-header-height', `${headerHeight}px`);
  }, [preferences.zoomLevel]);

  // Computed helpers
  const slotHeight = ZOOM_SLOT_HEIGHTS[preferences.zoomLevel];
  
  const getVisibleDayNames = useCallback(() => {
    const dayNames = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
    return preferences.weekVisibleDays.map(d => dayNames[d]);
  }, [preferences.weekVisibleDays]);

  const isDayVisible = useCallback((dayIndex: number) => {
    return preferences.weekVisibleDays.includes(dayIndex);
  }, [preferences.weekVisibleDays]);

  const toggleDayVisibility = useCallback((dayIndex: number) => {
    const current = preferences.weekVisibleDays;
    const updated = current.includes(dayIndex)
      ? current.filter(d => d !== dayIndex)
      : [...current, dayIndex].sort((a, b) => a - b);
    
    // Ensure at least one day is visible
    if (updated.length > 0) {
      updatePreference('weekVisibleDays', updated);
    }
  }, [preferences.weekVisibleDays, updatePreference]);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    isSaving,
    slotHeight,
    getVisibleDayNames,
    isDayVisible,
    toggleDayVisibility,
    defaults: DEFAULT_PREFERENCES,
  };
}

export { DEFAULT_PREFERENCES, ZOOM_SLOT_HEIGHTS };
