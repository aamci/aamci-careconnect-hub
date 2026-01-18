/**
 * useCalendarPreferences Hook
 *
 * React Query integration for calendar display preferences
 * - Server state: Supabase (source of truth)
 * - Local cache: localStorage (fallback + optimistic)
 * - CSS variables injection on change
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { calendarPreferencesService } from '@/services/supabase/calendarPreferencesService';
import {
  CalendarPreferences,
  CalendarPreferencesUpdate,
  DEFAULT_PREFERENCES,
  ZOOM_CONFIG,
  minutesToTime,
} from '@/types/calendar-preferences';

// Query keys
export const calendarPreferencesKeys = {
  all: ['calendar-preferences'] as const,
  byScope: (scope: string) => [...calendarPreferencesKeys.all, scope] as const,
  audit: (prefId?: string) => [...calendarPreferencesKeys.all, 'audit', prefId] as const,
};

// Local storage key
const LOCAL_STORAGE_KEY = 'calendar_preferences_cache_v1';

// Save to localStorage
function saveToLocalCache(prefs: CalendarPreferences): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      data: prefs,
      timestamp: Date.now(),
    }));
  } catch {
    // Storage full or disabled
  }
}

// Load from localStorage
function loadFromLocalCache(): CalendarPreferences | null {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    // Cache valid for 24h
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

// Inject CSS variables
function injectCSSVariables(prefs: CalendarPreferences): void {
  const config = ZOOM_CONFIG[prefs.zoomLevel];
  const root = document.documentElement;

  root.style.setProperty('--grid-slot-height', `${config.slotHeight}px`);
  root.style.setProperty('--grid-header-height', `${config.headerHeight}px`);
  root.style.setProperty('--grid-font-size', config.fontSize);
  root.style.setProperty('--grid-start-time', minutesToTime(prefs.timeRangeStartMinute));
  root.style.setProperty('--grid-end-time', minutesToTime(prefs.timeRangeEndMinute));
}

/**
 * Main hook for calendar preferences
 */
export function useCalendarPreferences(scope: string = 'global') {
  const queryClient = useQueryClient();

  // Query: Fetch preferences
  const {
    data: preferences,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: calendarPreferencesKeys.byScope(scope),
    queryFn: () => calendarPreferencesService.fetch(scope),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
    placeholderData: () => {
      // Use local cache as placeholder
      const cached = loadFromLocalCache();
      if (cached && cached.calendarScope === scope) {
        return cached;
      }
      return undefined;
    },
    retry: 2,
  });

  // Update local cache when data changes
  useEffect(() => {
    if (preferences) {
      saveToLocalCache(preferences);
      injectCSSVariables(preferences);
    }
  }, [preferences]);

  // Mutation: Update preferences
  const updateMutation = useMutation({
    mutationFn: async ({
      update,
      expectedVersion,
    }: {
      update: CalendarPreferencesUpdate;
      expectedVersion?: number;
    }) => {
      return calendarPreferencesService.update(update, scope, expectedVersion);
    },
    onMutate: async ({ update }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: calendarPreferencesKeys.byScope(scope) });

      // Snapshot previous value
      const previousPrefs = queryClient.getQueryData<CalendarPreferences>(
        calendarPreferencesKeys.byScope(scope)
      );

      // Optimistic update
      if (previousPrefs) {
        const optimistic: CalendarPreferences = {
          ...previousPrefs,
          ...update,
          version: previousPrefs.version + 1,
          updatedAt: new Date().toISOString(),
        };
        queryClient.setQueryData(calendarPreferencesKeys.byScope(scope), optimistic);
        injectCSSVariables(optimistic);
      }

      return { previousPrefs };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previousPrefs) {
        queryClient.setQueryData(
          calendarPreferencesKeys.byScope(scope),
          context.previousPrefs
        );
        injectCSSVariables(context.previousPrefs);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync
      queryClient.invalidateQueries({ queryKey: calendarPreferencesKeys.byScope(scope) });
    },
  });

  // Mutation: Reset to defaults
  const resetMutation = useMutation({
    mutationFn: () => calendarPreferencesService.reset(scope),
    onSuccess: (newPrefs) => {
      queryClient.setQueryData(calendarPreferencesKeys.byScope(scope), newPrefs);
      saveToLocalCache(newPrefs);
      injectCSSVariables(newPrefs);
    },
  });

  // Convenience update function
  const updatePreferences = useCallback(
    (update: CalendarPreferencesUpdate) => {
      return updateMutation.mutateAsync({
        update,
        expectedVersion: preferences?.version,
      });
    },
    [updateMutation, preferences?.version]
  );

  // Individual setters for common operations
  const setZoomLevel = useCallback(
    (zoomLevel: CalendarPreferences['zoomLevel']) => {
      return updatePreferences({ zoomLevel });
    },
    [updatePreferences]
  );

  const setTimeRange = useCallback(
    (startMinute: number, endMinute: number) => {
      return updatePreferences({
        timeRangeStartMinute: startMinute,
        timeRangeEndMinute: endMinute,
      });
    },
    [updatePreferences]
  );

  const setHoverGranularity = useCallback(
    (minutes: CalendarPreferences['hoverGranularityMinutes']) => {
      return updatePreferences({ hoverGranularityMinutes: minutes });
    },
    [updatePreferences]
  );

  return {
    // Data
    preferences: preferences ?? {
      ...DEFAULT_PREFERENCES,
      id: '',
      userId: '',
      calendarScope: scope,
      version: 0,
      createdAt: '',
      updatedAt: '',
    } as CalendarPreferences,

    // State
    isLoading,
    isError,
    error,
    isUpdating: updateMutation.isPending,
    isResetting: resetMutation.isPending,

    // Actions
    updatePreferences,
    resetPreferences: resetMutation.mutateAsync,
    refetch,

    // Convenience setters
    setZoomLevel,
    setTimeRange,
    setHoverGranularity,

    // Computed values
    zoomConfig: ZOOM_CONFIG[preferences?.zoomLevel ?? 'STANDARD'],
    startTime: minutesToTime(preferences?.timeRangeStartMinute ?? 420),
    endTime: minutesToTime(preferences?.timeRangeEndMinute ?? 1140),
  };
}

/**
 * Hook for audit log
 */
export function useCalendarPreferencesAudit(preferenceId?: string) {
  return useQuery({
    queryKey: calendarPreferencesKeys.audit(preferenceId),
    queryFn: () => calendarPreferencesService.fetchAuditLog(preferenceId),
    enabled: !!preferenceId,
    staleTime: 60 * 1000, // 1 minute
  });
}

export default useCalendarPreferences;
