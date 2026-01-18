/**
 * Calendar Display Preferences Types
 * Single Source of Truth for preference structure
 */

export type ZoomLevel = 'MINIMUM' | 'STANDARD' | 'MAXIMUM';
export type SidebarGrouping = 'alphabetical' | 'center' | 'location' | 'specialty';
export type StatsMode = 'hidden' | 'perDay' | 'perHalfDay';
export type SchoolRegion = 'A' | 'B' | 'C' | 'Corse';

export interface CalendarPreferences {
  id: string;
  userId: string;
  calendarScope: string;

  // Display Time Range
  timeRangeStartMinute: number;  // 0-1439
  timeRangeEndMinute: number;    // 0-1439

  // Zoom / Density
  zoomLevel: ZoomLevel;

  // Hover precision
  hoverGranularityMinutes: 5 | 10 | 15 | 20 | 30 | 45;

  // Week view
  weekVisibleDays: number;       // 7-bit bitmask
  showOnlyUpcomingDays: boolean;
  showSideBySideAgendas: boolean;

  // School holidays
  schoolHolidaysRegion: SchoolRegion;
  showHolidaysMiniCalendar: boolean;
  showHolidaysMainCalendar: boolean;

  // Display options
  showConsultationReasons: boolean;
  sidebarGroupingPrimary: SidebarGrouping;
  sidebarGroupingSecondary: SidebarGrouping | null;

  // Statistics
  statsMode: StatsMode;

  // Times
  afternoonStartMinute: number;

  // Notifications
  notificationsOnlineBookings: boolean;
  waitingRoomSound: boolean;
  enablePatientNameBlur: boolean;

  // Metadata
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarPreferencesUpdate {
  timeRangeStartMinute?: number;
  timeRangeEndMinute?: number;
  zoomLevel?: ZoomLevel;
  hoverGranularityMinutes?: 5 | 10 | 15 | 20 | 30 | 45;
  weekVisibleDays?: number;
  showOnlyUpcomingDays?: boolean;
  showSideBySideAgendas?: boolean;
  schoolHolidaysRegion?: SchoolRegion;
  showHolidaysMiniCalendar?: boolean;
  showHolidaysMainCalendar?: boolean;
  showConsultationReasons?: boolean;
  sidebarGroupingPrimary?: SidebarGrouping;
  sidebarGroupingSecondary?: SidebarGrouping | null;
  statsMode?: StatsMode;
  afternoonStartMinute?: number;
  notificationsOnlineBookings?: boolean;
  waitingRoomSound?: boolean;
  enablePatientNameBlur?: boolean;
}

export interface CalendarPreferencesAuditEntry {
  id: string;
  preferenceId: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  fieldChanged: string | null;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
}

// Default values
export const DEFAULT_PREFERENCES: Omit<CalendarPreferences, 'id' | 'userId' | 'calendarScope' | 'version' | 'createdAt' | 'updatedAt'> = {
  timeRangeStartMinute: 420,  // 07:00
  timeRangeEndMinute: 1140,   // 19:00
  zoomLevel: 'STANDARD',
  hoverGranularityMinutes: 15,
  weekVisibleDays: 127,       // All days
  showOnlyUpcomingDays: false,
  showSideBySideAgendas: false,
  schoolHolidaysRegion: 'A',
  showHolidaysMiniCalendar: true,
  showHolidaysMainCalendar: false,
  showConsultationReasons: true,
  sidebarGroupingPrimary: 'alphabetical',
  sidebarGroupingSecondary: null,
  statsMode: 'hidden',
  afternoonStartMinute: 840,  // 14:00
  notificationsOnlineBookings: true,
  waitingRoomSound: true,
  enablePatientNameBlur: false,
};

// Zoom to pixel mapping
export const ZOOM_CONFIG: Record<ZoomLevel, { slotHeight: number; headerHeight: number; fontSize: string }> = {
  MINIMUM: { slotHeight: 24, headerHeight: 36, fontSize: '11px' },
  STANDARD: { slotHeight: 36, headerHeight: 40, fontSize: '12px' },
  MAXIMUM: { slotHeight: 60, headerHeight: 48, fontSize: '13px' },
};

// Helper: minutes to HH:MM
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Helper: HH:MM to minutes
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// Helper: Check if day is visible (bitmask)
export function isDayVisible(weekVisibleDays: number, dayIndex: number): boolean {
  // dayIndex: 0=Mon, 6=Sun
  return (weekVisibleDays & (1 << dayIndex)) !== 0;
}

// Helper: Toggle day visibility
export function toggleDayVisibility(weekVisibleDays: number, dayIndex: number): number {
  return weekVisibleDays ^ (1 << dayIndex);
}
