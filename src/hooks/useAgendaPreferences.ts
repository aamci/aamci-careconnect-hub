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

// DEFAULT VALUES - Exactly matching the reference images
const DEFAULT_PREFERENCES: AgendaPreferences = {
  // Zoom: Minimum (first position) - Default
  zoomLevel: 'minimum',
  // Time range: 07:00 to 19:00 - Image 1
  displayStartTime: '07:00',
  displayEndTime: '19:00',
  // Mouse precision: Default - Image 2
  hoverGranularityMinutes: 'default',
  // School holidays: Zone A selected but checkboxes unchecked - Image 2
  schoolHolidaysRegion: 'A',
  showHolidaysMiniCalendar: false,
  showHolidaysMainCalendar: false,
  // All days visible (lun-dim all selected) - Image 3
  weekVisibleDays: [0, 1, 2, 3, 4, 5, 6],
  // Upcoming days: unchecked - Image 3
  showOnlyUpcomingDays: false,
  // Show consultation reasons: checked - Image 3
  showConsultationReasonsInDayView: true,
  showSideBySideAgendasInWeekView: false,
  sidebarGroupingPrimary: 'alphabetical',
  sidebarGroupingSecondary: null,
  // Statistics: Hidden (Masquées selected) - Image 3
  statsMode: 'hidden',
  afternoonStartTime: '14:00',
  // Notifications: checked - Image 3
  notificationsOnlineBookings: true,
  // Sound: unchecked - Image 3
  waitingRoomSound: false,
  // Blur option: unchecked - Image 3
  enablePatientNameBlurOption: false,
};

// Force reset to v5 to ensure new defaults are applied
const STORAGE_KEY = 'agenda_display_preferences_v5';

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
        const parsed = { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
        console.log('[AgendaPreferences] Loaded from storage:', parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Failed to load agenda preferences:', e);
    }
    console.log('[AgendaPreferences] Using defaults:', DEFAULT_PREFERENCES);
    return DEFAULT_PREFERENCES;
  });

  const [isSaving, setIsSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage IMMEDIATELY (no debounce for instant effect)
  const persistPreferences = useCallback((prefs: AgendaPreferences) => {
    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Save immediately for instant application
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      console.log('[AgendaPreferences] Saved immediately:', prefs);
    } catch (e) {
      console.error('Failed to save agenda preferences:', e);
    } finally {
      setIsSaving(false);
    }
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
