import { useCallback, useSyncExternalStore, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Types for agenda display preferences
// ZoomLevel is now a numeric value from 0-20
// 0 = Minimum, 10 = Standard, 20 = Maximum
// Intermediate values are interpolated
export type ZoomLevel = number;
export type ZoomLevelLabel = 'minimum' | 'standard' | 'maximum';
export type StatsMode = 'hidden' | 'perDay' | 'perHalfDay';
export type HoverGranularity = 'default' | 5 | 10 | 12 | 15 | 20 | 30 | 45;
export type SidebarGrouping = 'alphabetical' | 'center' | 'location' | 'specialty';
export type SchoolHolidayRegion = 'A' | 'B' | 'C' | 'corse' | null;

// New premium preference types
export type TimeFormat = '12h' | '24h';
export type SlotHeightMode = 'auto' | 'small' | 'medium' | 'large';
export type SecondaryLineContent = 'motif' | 'location' | 'tags' | 'none';
export type AgendaTheme = 'standard' | 'high-contrast' | 'pastel';

// Zoom level constants
export const ZOOM_MIN = 0;
export const ZOOM_STANDARD = 10;
export const ZOOM_MAX = 20;

// Slot heights at key points
const SLOT_HEIGHT_MIN = 20;      // At zoom 0 (Minimum)
const SLOT_HEIGHT_STANDARD = 40; // At zoom 10 (Standard)
const SLOT_HEIGHT_MAX = 72;      // At zoom 20 (Maximum)

// Calculate interpolated slot height for any zoom level (0-20)
export function getSlotHeightForZoom(zoomLevel: ZoomLevel): number {
  if (zoomLevel <= ZOOM_MIN) return SLOT_HEIGHT_MIN;
  if (zoomLevel >= ZOOM_MAX) return SLOT_HEIGHT_MAX;

  if (zoomLevel <= ZOOM_STANDARD) {
    // Interpolate between Minimum (0) and Standard (10)
    const ratio = zoomLevel / ZOOM_STANDARD;
    return Math.round(SLOT_HEIGHT_MIN + (SLOT_HEIGHT_STANDARD - SLOT_HEIGHT_MIN) * ratio);
  } else {
    // Interpolate between Standard (10) and Maximum (20)
    const ratio = (zoomLevel - ZOOM_STANDARD) / (ZOOM_MAX - ZOOM_STANDARD);
    return Math.round(SLOT_HEIGHT_STANDARD + (SLOT_HEIGHT_MAX - SLOT_HEIGHT_STANDARD) * ratio);
  }
}

// Get label for zoom level display
export function getZoomLevelLabel(zoomLevel: ZoomLevel): ZoomLevelLabel {
  if (zoomLevel <= ZOOM_MIN) return 'minimum';
  if (zoomLevel >= ZOOM_MAX) return 'maximum';
  if (zoomLevel === ZOOM_STANDARD) return 'standard';
  return zoomLevel < ZOOM_STANDARD ? 'minimum' : 'maximum';
}

// Map between numeric zoom and Supabase format (still uses discrete levels)
function zoomToDbFormat(zoomLevel: ZoomLevel): string {
  if (zoomLevel <= 3) return 'MINIMUM';
  if (zoomLevel >= 17) return 'MAXIMUM';
  return 'STANDARD';
}

function zoomFromDbFormat(dbZoom: string): ZoomLevel {
  switch (dbZoom) {
    case 'MINIMUM': return ZOOM_MIN;
    case 'MAXIMUM': return ZOOM_MAX;
    default: return ZOOM_STANDARD;
  }
}

export interface AgendaPreferences {
  // Existing preferences
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

  // New premium preferences - Format & Display
  timeFormat: TimeFormat;
  showWeekends: boolean;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  hideNonWorkingHours: boolean;
  slotHeightMode: SlotHeightMode;

  // New premium preferences - Information Display
  showStatusIcons: boolean;
  showDailyLoadIndicator: boolean;
  secondaryLineContent: SecondaryLineContent;
  showWeekNumbers: boolean;

  // New premium preferences - Visual Comfort
  agendaTheme: AgendaTheme;
  concentrationMode: boolean;
  enableAnimations: boolean;
}

// DEFAULT VALUES - Exactly matching the reference images
const DEFAULT_PREFERENCES: AgendaPreferences = {
  // Existing preferences
  zoomLevel: ZOOM_MIN, // 0 = Minimum zoom (default)
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

  // New premium preferences - Format & Display
  timeFormat: '24h',
  showWeekends: true,
  firstDayOfWeek: 1, // Monday
  hideNonWorkingHours: false,
  slotHeightMode: 'auto',

  // New premium preferences - Information Display
  showStatusIcons: true,
  showDailyLoadIndicator: true,
  secondaryLineContent: 'motif',
  showWeekNumbers: false,

  // New premium preferences - Visual Comfort
  agendaTheme: 'standard',
  concentrationMode: false,
  enableAnimations: true,
};

const STORAGE_KEY = 'agenda_display_preferences_v8'; // Version bump for premium features

// Legacy ZOOM_SLOT_HEIGHTS kept for backwards compatibility
// Use getSlotHeightForZoom() for proper interpolated values
const ZOOM_SLOT_HEIGHTS = {
  minimum: SLOT_HEIGHT_MIN,
  standard: SLOT_HEIGHT_STANDARD,
  maximum: SLOT_HEIGHT_MAX,
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
  const slotHeight = getSlotHeightForZoom(zoomLevel);
  root.style.setProperty('--grid-slot-height', `${slotHeight}px`);

  // Interpolate header height based on zoom level
  let headerHeight: number;
  if (zoomLevel <= ZOOM_MIN) {
    headerHeight = 36;
  } else if (zoomLevel >= ZOOM_MAX) {
    headerHeight = 48;
  } else if (zoomLevel <= ZOOM_STANDARD) {
    const ratio = zoomLevel / ZOOM_STANDARD;
    headerHeight = Math.round(36 + (40 - 36) * ratio);
  } else {
    const ratio = (zoomLevel - ZOOM_STANDARD) / (ZOOM_MAX - ZOOM_STANDARD);
    headerHeight = Math.round(40 + (48 - 40) * ratio);
  }
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

// ============ SUPABASE SYNC ============
let syncInitialized = false;
let syncInProgress = false;
let currentUserId: string | null = null;

// Convert local preferences to Supabase format
function toSupabaseFormat(prefs: AgendaPreferences) {
  const [startH, startM] = prefs.displayStartTime.split(':').map(Number);
  const [endH, endM] = prefs.displayEndTime.split(':').map(Number);
  const [afternoonH, afternoonM] = prefs.afternoonStartTime.split(':').map(Number);

  return {
    zoom_level: zoomToDbFormat(prefs.zoomLevel),
    time_range_start_minute: startH * 60 + startM,
    time_range_end_minute: endH * 60 + endM,
    hover_granularity_minutes: prefs.hoverGranularityMinutes === 'default' ? 15 : prefs.hoverGranularityMinutes,
    school_holidays_region: prefs.schoolHolidaysRegion || 'A',
    show_holidays_mini_calendar: prefs.showHolidaysMiniCalendar,
    show_holidays_main_calendar: prefs.showHolidaysMainCalendar,
    week_visible_days: prefs.weekVisibleDays.reduce((acc, day) => acc | (1 << day), 0),
    show_only_upcoming_days: prefs.showOnlyUpcomingDays,
    show_consultation_reasons: prefs.showConsultationReasonsInDayView,
    show_side_by_side_agendas: prefs.showSideBySideAgendasInWeekView,
    sidebar_grouping_primary: prefs.sidebarGroupingPrimary,
    sidebar_grouping_secondary: prefs.sidebarGroupingSecondary,
    stats_mode: prefs.statsMode,
    afternoon_start_minute: afternoonH * 60 + afternoonM,
    notifications_online_bookings: prefs.notificationsOnlineBookings,
    waiting_room_sound: prefs.waitingRoomSound,
    enable_patient_name_blur: prefs.enablePatientNameBlurOption,
  };
}

// Convert Supabase format to local preferences
function fromSupabaseFormat(row: Record<string, unknown>): Partial<AgendaPreferences> {
  const startMinute = row.time_range_start_minute as number;
  const endMinute = row.time_range_end_minute as number;
  const afternoonMinute = row.afternoon_start_minute as number;
  const weekDaysBitmask = row.week_visible_days as number;

  // Convert bitmask to array
  const weekDays: number[] = [];
  for (let i = 0; i < 7; i++) {
    if (weekDaysBitmask & (1 << i)) weekDays.push(i);
  }

  return {
    zoomLevel: zoomFromDbFormat(row.zoom_level as string),
    displayStartTime: `${Math.floor(startMinute / 60).toString().padStart(2, '0')}:${(startMinute % 60).toString().padStart(2, '0')}`,
    displayEndTime: `${Math.floor(endMinute / 60).toString().padStart(2, '0')}:${(endMinute % 60).toString().padStart(2, '0')}`,
    hoverGranularityMinutes: (row.hover_granularity_minutes as HoverGranularity) || 'default',
    schoolHolidaysRegion: (row.school_holidays_region as SchoolHolidayRegion) || null,
    showHolidaysMiniCalendar: row.show_holidays_mini_calendar as boolean,
    showHolidaysMainCalendar: row.show_holidays_main_calendar as boolean,
    weekVisibleDays: weekDays.length > 0 ? weekDays : [0, 1, 2, 3, 4, 5, 6],
    showOnlyUpcomingDays: row.show_only_upcoming_days as boolean,
    showConsultationReasonsInDayView: row.show_consultation_reasons as boolean,
    showSideBySideAgendasInWeekView: row.show_side_by_side_agendas as boolean,
    sidebarGroupingPrimary: (row.sidebar_grouping_primary as SidebarGrouping) || 'alphabetical',
    sidebarGroupingSecondary: row.sidebar_grouping_secondary as SidebarGrouping | null,
    statsMode: (row.stats_mode as StatsMode) || 'hidden',
    afternoonStartTime: `${Math.floor(afternoonMinute / 60).toString().padStart(2, '0')}:${(afternoonMinute % 60).toString().padStart(2, '0')}`,
    notificationsOnlineBookings: row.notifications_online_bookings as boolean,
    waitingRoomSound: row.waiting_room_sound as boolean,
    enablePatientNameBlurOption: row.enable_patient_name_blur as boolean,
  };
}

// Fetch preferences from Supabase
async function fetchFromSupabase(): Promise<Partial<AgendaPreferences> | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    currentUserId = user.id;

    const { data, error } = await supabase
      .rpc('get_or_create_calendar_preferences', {
        p_user_id: user.id,
        p_scope: 'global',
      });

    if (error) {
      console.error('[AgendaPreferences] Supabase fetch error:', error);
      return null;
    }

    return data ? fromSupabaseFormat(data) : null;
  } catch (e) {
    console.error('[AgendaPreferences] Supabase fetch failed:', e);
    return null;
  }
}

// Save preferences to Supabase (debounced)
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

async function saveToSupabase(prefs: AgendaPreferences) {
  if (!currentUserId) return;

  // Clear previous timeout
  if (saveTimeout) clearTimeout(saveTimeout);

  // Debounce saves by 500ms
  saveTimeout = setTimeout(async () => {
    try {
      syncInProgress = true;
      const dbFormat = toSupabaseFormat(prefs);

      const { error } = await supabase
        .from('user_calendar_preferences')
        .update(dbFormat)
        .eq('user_id', currentUserId)
        .eq('calendar_scope', 'global');

      if (error) {
        console.error('[AgendaPreferences] Supabase save error:', error);
      }
    } catch (e) {
      console.error('[AgendaPreferences] Supabase save failed:', e);
    } finally {
      syncInProgress = false;
    }
  }, 500);
}

// Initialize sync from Supabase
async function initializeSync() {
  if (syncInitialized) return;
  syncInitialized = true;

  const remote = await fetchFromSupabase();
  if (remote) {
    // Merge remote with local (remote takes precedence for shared fields)
    const merged = { ...currentPreferences, ...remote };
    setPreferences(merged);
  }
}

// ============ HOOK ============
export function useAgendaPreferences() {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const initRef = useRef(false);

  // Initialize Supabase sync on first render
  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      initializeSync();
    }
  }, []);

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
    // Sync to Supabase in background
    saveToSupabase(updated);
  }, []);

  const updatePreferences = useCallback((updates: Partial<AgendaPreferences>) => {
    const updated = { ...currentPreferences, ...updates };
    setPreferences(updated);
    // Sync to Supabase in background
    saveToSupabase(updated);
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    saveToSupabase(DEFAULT_PREFERENCES);
  }, []);

  const slotHeight = getSlotHeightForZoom(preferences.zoomLevel);

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
      const newPrefs = { ...currentPreferences, weekVisibleDays: updated };
      setPreferences(newPrefs);
      saveToSupabase(newPrefs);
    }
  }, []);

  return {
    preferences,
    updatePreference,
    updatePreferences,
    resetPreferences,
    isSaving: syncInProgress,
    slotHeight,
    getVisibleDayNames,
    isDayVisible,
    toggleDayVisibility,
    defaults: DEFAULT_PREFERENCES,
  };
}

export {
  DEFAULT_PREFERENCES,
  ZOOM_SLOT_HEIGHTS,
  SLOT_HEIGHT_MIN,
  SLOT_HEIGHT_STANDARD,
  SLOT_HEIGHT_MAX,
};

export type {
  TimeFormat,
  SlotHeightMode,
  SecondaryLineContent,
  AgendaTheme,
};
