/**
 * React Query hooks for Patient History
 */

import { useQuery } from '@tanstack/react-query';
import * as historyService from '@/services/supabase/historyService';
import type { HistoryEventType } from '@/types/history';

// Query keys
export const historyKeys = {
  all: ['history'] as const,
  patient: (patientId: string) => [...historyKeys.all, 'patient', patientId] as const,
  byType: (patientId: string, type: HistoryEventType) =>
    [...historyKeys.patient(patientId), 'type', type] as const,
  inRange: (patientId: string, start: Date, end: Date) =>
    [...historyKeys.patient(patientId), 'range', start.toISOString(), end.toISOString()] as const
};

/**
 * Get complete patient history
 */
export function usePatientHistory(patientId: string | null) {
  return useQuery({
    queryKey: historyKeys.patient(patientId || ''),
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      const result = await historyService.getPatientHistory(patientId);
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
}

/**
 * Get patient history filtered by type
 */
export function usePatientHistoryByType(patientId: string | null, type: HistoryEventType) {
  return useQuery({
    queryKey: historyKeys.byType(patientId || '', type),
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      const result = await historyService.getHistoryByType(patientId, type);
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000
  });
}

/**
 * Get patient history in date range
 */
export function usePatientHistoryInRange(
  patientId: string | null,
  start: Date,
  end: Date
) {
  return useQuery({
    queryKey: historyKeys.inRange(patientId || '', start, end),
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required');
      const result = await historyService.getHistoryInRange(patientId, start, end);
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000
  });
}
