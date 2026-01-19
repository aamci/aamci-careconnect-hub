/**
 * Timeline Service - Patient History
 * Supabase service for managing patient timeline events
 */

import { supabase } from '@/integrations/supabase/client';
import {
  TimelineEvent,
  TimelineFilters,
  TimelinePagination,
  PatientAttendanceStats,
  TimelineEventType,
} from '@/types/timeline';

// ==================== TIMELINE EVENTS ====================

export async function fetchPatientTimeline(
  patientId: string,
  filters: TimelineFilters = {},
  pagination: { offset: number; limit: number } = { offset: 0, limit: 20 }
): Promise<{ data: TimelineEvent[]; pagination: TimelinePagination; error: Error | null }> {
  try {
    let query = supabase
      .from('timeline_events')
      .select('*', { count: 'exact' })
      .eq('patient_id', patientId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Apply type filter
    if (filters.types && filters.types.length > 0) {
      query = query.in('event_type', filters.types);
    }

    // Apply subtype filter
    if (filters.subtypes && filters.subtypes.length > 0) {
      query = query.in('event_subtype', filters.subtypes);
    }

    // Apply date range filter
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    // Apply search query
    if (filters.searchQuery && filters.searchQuery.length >= 2) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,subtitle.ilike.%${filters.searchQuery}%`);
    }

    // Apply practitioner filter (stored in metadata)
    if (filters.practitionerId) {
      query = query.contains('metadata', { practitioner_id: filters.practitionerId });
    }

    // Apply status filter for appointments
    if (filters.statuses && filters.statuses.length > 0) {
      // Filter appointments by status in metadata
      const statusConditions = filters.statuses.map(s => `metadata->>'status' = '${s}'`).join(' OR ');
      query = query.or(statusConditions);
    }

    // Apply pagination
    query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching timeline:', error);
      return {
        data: [],
        pagination: { ...pagination, total: 0, hasMore: false },
        error: new Error(error.message),
      };
    }

    return {
      data: (data || []) as TimelineEvent[],
      pagination: {
        ...pagination,
        total: count || 0,
        hasMore: (count || 0) > pagination.offset + pagination.limit,
      },
      error: null,
    };
  } catch (err) {
    console.error('Error in fetchPatientTimeline:', err);
    return {
      data: [],
      pagination: { ...pagination, total: 0, hasMore: false },
      error: err instanceof Error ? err : new Error('Unknown error'),
    };
  }
}

export async function fetchTimelineEvent(eventId: string): Promise<{ data: TimelineEvent | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as TimelineEvent, error: null };
}

export async function createTimelineEvent(
  event: Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: TimelineEvent | null; error: Error | null }> {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('timeline_events')
    .insert({
      ...event,
      created_by: user.user?.id,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as TimelineEvent, error: null };
}

export async function deleteTimelineEvent(eventId: string): Promise<{ error: Error | null }> {
  // Soft delete
  const { error } = await supabase
    .from('timeline_events')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', eventId);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

// ==================== ATTENDANCE STATS ====================

export async function fetchPatientAttendanceStats(
  patientId: string
): Promise<{ data: PatientAttendanceStats | null; error: Error | null }> {
  // Compute stats from appointments directly since the view might not exist yet
  const { data, error } = await supabase
    .from('appointments')
    .select('status')
    .eq('patient_id', patientId)
    .lt('start_time', new Date().toISOString());

  if (error) {
    console.error('Error fetching attendance stats:', error);
    return { data: null, error: new Error(error.message) };
  }

  // Calculate stats
  const appointments = data || [];
  const completedCount = appointments.filter(a => a.status === 'completed').length;
  const absentExcusedCount = appointments.filter(a => a.status === 'absent-excused').length;
  const noShowCount = appointments.filter(a => a.status === 'absent-unexcused').length;
  const cancelledCount = appointments.filter(a => a.status === 'cancelled').length;
  const totalCount = appointments.length;

  const eligibleForRate = totalCount - cancelledCount - appointments.filter(a => a.status === 'scheduled').length;
  const attendanceRate = eligibleForRate > 0 ? Math.round((completedCount / eligibleForRate) * 1000) / 10 : 0;

  return {
    data: {
      patient_id: patientId,
      completed_count: completedCount,
      absent_excused_count: absentExcusedCount,
      no_show_count: noShowCount,
      cancelled_count: cancelledCount,
      total_count: totalCount,
      attendance_rate: attendanceRate,
    },
    error: null,
  };
}

// ==================== TIMELINE FILTERS INFO ====================

export async function fetchTimelineFilterOptions(patientId: string): Promise<{
  data: {
    types: { value: TimelineEventType; count: number }[];
    dateRange: { min: string | null; max: string | null };
  };
  error: Error | null;
}> {
  // Fetch event types with counts
  const { data: events, error } = await supabase
    .from('timeline_events')
    .select('event_type, created_at')
    .eq('patient_id', patientId)
    .is('deleted_at', null);

  if (error) {
    return {
      data: { types: [], dateRange: { min: null, max: null } },
      error: new Error(error.message),
    };
  }

  // Count by type
  const typeCounts = (events || []).reduce((acc, event) => {
    const type = event.event_type as TimelineEventType;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<TimelineEventType, number>);

  const types = Object.entries(typeCounts).map(([value, count]) => ({
    value: value as TimelineEventType,
    count,
  }));

  // Get date range
  const dates = (events || []).map(e => new Date(e.created_at).getTime());
  const min = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null;
  const max = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

  return {
    data: { types, dateRange: { min, max } },
    error: null,
  };
}

// ==================== SEARCH ====================

export async function searchPatientTimeline(
  patientId: string,
  query: string,
  limit: number = 20
): Promise<{ data: TimelineEvent[]; error: Error | null }> {
  if (!query || query.length < 2) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from('timeline_events')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,subtitle.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  return { data: (data || []) as TimelineEvent[], error: null };
}
