/**
 * Calendar Preferences Service
 * Supabase API for user calendar display preferences
 *
 * API Specification:
 * - GET:  fetchPreferences(scope) → CalendarPreferences
 * - PUT:  updatePreferences(data, version) → CalendarPreferences (idempotent)
 * - POST: resetPreferences(scope) → CalendarPreferences (reset to defaults)
 *
 * Concurrency: uses version field for optimistic locking
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  CalendarPreferences,
  CalendarPreferencesUpdate,
  CalendarPreferencesAuditEntry,
} from '@/types/calendar-preferences';

// Database row type (snake_case)
interface CalendarPreferencesRow {
  id: string;
  user_id: string;
  calendar_scope: string;
  time_range_start_minute: number;
  time_range_end_minute: number;
  zoom_level: string;
  hover_granularity_minutes: number;
  week_visible_days: number;
  show_only_upcoming_days: boolean;
  show_side_by_side_agendas: boolean;
  school_holidays_region: string;
  show_holidays_mini_calendar: boolean;
  show_holidays_main_calendar: boolean;
  show_consultation_reasons: boolean;
  sidebar_grouping_primary: string;
  sidebar_grouping_secondary: string | null;
  stats_mode: string;
  afternoon_start_minute: number;
  notifications_online_bookings: boolean;
  waiting_room_sound: boolean;
  enable_patient_name_blur: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

// Map DB row to TypeScript type
function mapRowToPreferences(row: CalendarPreferencesRow): CalendarPreferences {
  return {
    id: row.id,
    userId: row.user_id,
    calendarScope: row.calendar_scope,
    timeRangeStartMinute: row.time_range_start_minute,
    timeRangeEndMinute: row.time_range_end_minute,
    zoomLevel: row.zoom_level as CalendarPreferences['zoomLevel'],
    hoverGranularityMinutes: row.hover_granularity_minutes as CalendarPreferences['hoverGranularityMinutes'],
    weekVisibleDays: row.week_visible_days,
    showOnlyUpcomingDays: row.show_only_upcoming_days,
    showSideBySideAgendas: row.show_side_by_side_agendas,
    schoolHolidaysRegion: row.school_holidays_region as CalendarPreferences['schoolHolidaysRegion'],
    showHolidaysMiniCalendar: row.show_holidays_mini_calendar,
    showHolidaysMainCalendar: row.show_holidays_main_calendar,
    showConsultationReasons: row.show_consultation_reasons,
    sidebarGroupingPrimary: row.sidebar_grouping_primary as CalendarPreferences['sidebarGroupingPrimary'],
    sidebarGroupingSecondary: row.sidebar_grouping_secondary as CalendarPreferences['sidebarGroupingSecondary'],
    statsMode: row.stats_mode as CalendarPreferences['statsMode'],
    afternoonStartMinute: row.afternoon_start_minute,
    notificationsOnlineBookings: row.notifications_online_bookings,
    waitingRoomSound: row.waiting_room_sound,
    enablePatientNameBlur: row.enable_patient_name_blur,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Map update to DB columns
function mapUpdateToRow(update: CalendarPreferencesUpdate): Partial<CalendarPreferencesRow> {
  const row: Partial<CalendarPreferencesRow> = {};

  if (update.timeRangeStartMinute !== undefined) row.time_range_start_minute = update.timeRangeStartMinute;
  if (update.timeRangeEndMinute !== undefined) row.time_range_end_minute = update.timeRangeEndMinute;
  if (update.zoomLevel !== undefined) row.zoom_level = update.zoomLevel;
  if (update.hoverGranularityMinutes !== undefined) row.hover_granularity_minutes = update.hoverGranularityMinutes;
  if (update.weekVisibleDays !== undefined) row.week_visible_days = update.weekVisibleDays;
  if (update.showOnlyUpcomingDays !== undefined) row.show_only_upcoming_days = update.showOnlyUpcomingDays;
  if (update.showSideBySideAgendas !== undefined) row.show_side_by_side_agendas = update.showSideBySideAgendas;
  if (update.schoolHolidaysRegion !== undefined) row.school_holidays_region = update.schoolHolidaysRegion;
  if (update.showHolidaysMiniCalendar !== undefined) row.show_holidays_mini_calendar = update.showHolidaysMiniCalendar;
  if (update.showHolidaysMainCalendar !== undefined) row.show_holidays_main_calendar = update.showHolidaysMainCalendar;
  if (update.showConsultationReasons !== undefined) row.show_consultation_reasons = update.showConsultationReasons;
  if (update.sidebarGroupingPrimary !== undefined) row.sidebar_grouping_primary = update.sidebarGroupingPrimary;
  if (update.sidebarGroupingSecondary !== undefined) row.sidebar_grouping_secondary = update.sidebarGroupingSecondary;
  if (update.statsMode !== undefined) row.stats_mode = update.statsMode;
  if (update.afternoonStartMinute !== undefined) row.afternoon_start_minute = update.afternoonStartMinute;
  if (update.notificationsOnlineBookings !== undefined) row.notifications_online_bookings = update.notificationsOnlineBookings;
  if (update.waitingRoomSound !== undefined) row.waiting_room_sound = update.waitingRoomSound;
  if (update.enablePatientNameBlur !== undefined) row.enable_patient_name_blur = update.enablePatientNameBlur;

  return row;
}

/**
 * Fetch user's calendar preferences (or create defaults)
 * GET /me/calendar/preferences?scope=global|calendar:{id}
 */
export async function fetchCalendarPreferences(
  scope: string = 'global'
): Promise<CalendarPreferences> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Use RPC to get or create
  const { data, error } = await supabase
    .rpc('get_or_create_calendar_preferences', {
      p_user_id: user.id,
      p_scope: scope,
    });

  if (error) throw new Error(`Failed to fetch preferences: ${error.message}`);
  if (!data) throw new Error('No preferences returned');

  return mapRowToPreferences(data as CalendarPreferencesRow);
}

/**
 * Update calendar preferences (idempotent PUT)
 * PUT /me/calendar/preferences
 *
 * @param update - Fields to update
 * @param expectedVersion - For optimistic concurrency (optional)
 * @throws ConflictError if version mismatch
 */
export async function updateCalendarPreferences(
  update: CalendarPreferencesUpdate,
  scope: string = 'global',
  expectedVersion?: number
): Promise<CalendarPreferences> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Validate time range
  if (update.timeRangeStartMinute !== undefined || update.timeRangeEndMinute !== undefined) {
    const start = update.timeRangeStartMinute ?? 420;
    const end = update.timeRangeEndMinute ?? 1140;

    if (start < 0 || end > 1439) {
      throw new Error('Invalid time range: must be between 00:00 and 23:59');
    }
    if (start >= end) {
      throw new Error('Invalid time range: start must be before end');
    }
    if ((end - start) < 240) {
      throw new Error('Invalid time range: minimum duration is 4 hours');
    }
  }

  const rowUpdate = mapUpdateToRow(update);

  // Build query
  let query = supabase
    .from('user_calendar_preferences')
    .update(rowUpdate)
    .eq('user_id', user.id)
    .eq('calendar_scope', scope);

  // Optimistic locking
  if (expectedVersion !== undefined) {
    query = query.eq('version', expectedVersion);
  }

  const { data, error } = await query.select().single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('ConflictError: Preferences were modified by another session. Please refresh.');
    }
    throw new Error(`Failed to update preferences: ${error.message}`);
  }

  return mapRowToPreferences(data as CalendarPreferencesRow);
}

/**
 * Reset preferences to defaults
 * POST /me/calendar/preferences/reset
 */
export async function resetCalendarPreferences(
  scope: string = 'global'
): Promise<CalendarPreferences> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('user_calendar_preferences')
    .delete()
    .eq('user_id', user.id)
    .eq('calendar_scope', scope);

  if (error) throw new Error(`Failed to reset preferences: ${error.message}`);

  // Recreate with defaults
  return fetchCalendarPreferences(scope);
}

/**
 * Fetch audit log for preferences
 */
export async function fetchPreferencesAuditLog(
  preferenceId?: string,
  limit: number = 50
): Promise<CalendarPreferencesAuditEntry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabase
    .from('user_calendar_preferences_audit')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (preferenceId) {
    query = query.eq('preference_id', preferenceId);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch audit log: ${error.message}`);

  return (data || []).map((row) => ({
    id: row.id,
    preferenceId: row.preference_id,
    userId: row.user_id,
    action: row.action,
    fieldChanged: row.field_changed,
    oldValue: row.old_value,
    newValue: row.new_value,
    createdAt: row.created_at,
  }));
}

// Export service object for consistent API
export const calendarPreferencesService = {
  fetch: fetchCalendarPreferences,
  update: updateCalendarPreferences,
  reset: resetCalendarPreferences,
  fetchAuditLog: fetchPreferencesAuditLog,
};
