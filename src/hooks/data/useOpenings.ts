import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { startOfWeek, endOfWeek, addDays } from 'date-fns';
import {
  fetchOpenings,
  fetchOpening,
  createOpening,
  updateOpening,
  updateOpeningSeries,
  deleteOpening,
  checkOpeningOverlap,
  type PractitionerOpening,
  type CreateOpeningInput,
  type UpdateOpeningInput,
} from '@/services/supabase/openingsService';

// Keys for query caching
const OPENINGS_KEY = 'openings';

// Hook: Fetch openings for current week
export function useWeekOpenings(currentDate: Date, practitionerId?: string) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  return useQuery({
    queryKey: [OPENINGS_KEY, 'week', weekStart.toISOString(), practitionerId],
    queryFn: () => fetchOpenings(weekStart, weekEnd, practitionerId),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook: Fetch openings for a date range
export function useOpeningsRange(startDate: Date, endDate: Date, practitionerId?: string) {
  return useQuery({
    queryKey: [OPENINGS_KEY, 'range', startDate.toISOString(), endDate.toISOString(), practitionerId],
    queryFn: () => fetchOpenings(startDate, endDate, practitionerId),
    staleTime: 30 * 1000,
  });
}

// Hook: Fetch single opening
export function useOpening(id: string | null) {
  return useQuery({
    queryKey: [OPENINGS_KEY, 'single', id],
    queryFn: () => (id ? fetchOpening(id) : null),
    enabled: !!id,
  });
}

// Hook: Create opening mutation
export function useCreateOpening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOpeningInput) => createOpening(input),
    onSuccess: () => {
      // Invalidate all opening queries
      queryClient.invalidateQueries({ queryKey: [OPENINGS_KEY] });
    },
  });
}

// Hook: Update opening mutation
export function useUpdateOpening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateOpeningInput) => updateOpening(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [OPENINGS_KEY] });
      // Also update specific opening cache
      queryClient.setQueryData([OPENINGS_KEY, 'single', data.id], data);
    },
  });
}

// Hook: Update opening series mutation
export function useUpdateOpeningSeries() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ seriesId, input }: { seriesId: string; input: Partial<UpdateOpeningInput> }) =>
      updateOpeningSeries(seriesId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPENINGS_KEY] });
    },
  });
}

// Hook: Delete opening mutation
export function useDeleteOpening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deleteSeries }: { id: string; deleteSeries?: boolean }) =>
      deleteOpening(id, deleteSeries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OPENINGS_KEY] });
    },
  });
}

// Hook: Check overlap (for validation)
export function useCheckOpeningOverlap() {
  return useMutation({
    mutationFn: ({
      practitionerId,
      date,
      startTime,
      endTime,
      excludeId,
    }: {
      practitionerId: string;
      date: string;
      startTime: string;
      endTime: string;
      excludeId?: string;
    }) => checkOpeningOverlap(practitionerId, date, startTime, endTime, excludeId),
  });
}

// Re-export types
export type { PractitionerOpening, CreateOpeningInput, UpdateOpeningInput };
