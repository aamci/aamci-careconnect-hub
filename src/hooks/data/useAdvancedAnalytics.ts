/**
 * React Query hooks for Advanced Analytics KPIs
 * Extension du dashboard ACTIVITÉ - zéro régression sur useAnalytics.ts
 */

import { useQuery } from '@tanstack/react-query';
import { AnalyticsFilters } from '@/services/supabase/analyticsService';
import * as advancedService from '@/services/supabase/advancedAnalyticsService';

// ==================== QUERY KEYS ====================

export const advancedAnalyticsKeys = {
  all: ['advanced-analytics'] as const,
  // Phase 1
  noShow: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'no-show', filters] as const,
  revenuePerHour: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'rph', filters] as const,
  firstVisitDelay: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'first-visit', filters] as const,
  consultationDuration: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'duration', filters] as const,
  documentCompletion: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'doc-completion', filters] as const,
  // Phase 2
  followup: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'followup', filters] as const,
  slotOccupancy: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'occupancy', filters] as const,
  telemedicine: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'telemedicine', filters] as const,
  collection: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'collection', filters] as const,
  patientSegment: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'segment', filters] as const,
  // Phase 3
  ageDistribution: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'age-distribution', filters] as const,
  emergencyRecurrence: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'emergency', filters] as const,
  workloadVariability: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'workload', filters] as const,
  documentRatio: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'doc-ratio', filters] as const,
  cascadeCancellation: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'cascade', filters] as const,
  complexConsultation: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'complex', filters] as const,
  rescheduling: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'reschedule', filters] as const,
  // All
  allExtended: (filters: AnalyticsFilters) => [...advancedAnalyticsKeys.all, 'all', filters] as const,
};

// ==================== PHASE 1 HOOKS ====================

export function useNoShowMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.noShow(filters),
    queryFn: async () => {
      const result = await advancedService.getNoShowMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useRevenuePerHourMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.revenuePerHour(filters),
    queryFn: async () => {
      const result = await advancedService.getRevenuePerHourMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useFirstVisitDelayMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.firstVisitDelay(filters),
    queryFn: async () => {
      const result = await advancedService.getFirstVisitDelayMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useConsultationDurationMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.consultationDuration(filters),
    queryFn: async () => {
      const result = await advancedService.getConsultationDurationMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useDocumentCompletionMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.documentCompletion(filters),
    queryFn: async () => {
      const result = await advancedService.getDocumentCompletionMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ==================== PHASE 2 HOOKS ====================

export function useFollowupMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.followup(filters),
    queryFn: async () => {
      const result = await advancedService.getFollowupMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useSlotOccupancyMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.slotOccupancy(filters),
    queryFn: async () => {
      const result = await advancedService.getSlotOccupancyMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useTelemedicineMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.telemedicine(filters),
    queryFn: async () => {
      const result = await advancedService.getTelemedicineMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCollectionMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.collection(filters),
    queryFn: async () => {
      const result = await advancedService.getCollectionMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function usePatientSegmentMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.patientSegment(filters),
    queryFn: async () => {
      const result = await advancedService.getPatientSegmentMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ==================== PHASE 3 HOOKS ====================

export function useAgeDistributionMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.ageDistribution(filters),
    queryFn: async () => {
      const result = await advancedService.getAgeDistributionMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useEmergencyRecurrenceMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.emergencyRecurrence(filters),
    queryFn: async () => {
      const result = await advancedService.getEmergencyRecurrenceMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useWorkloadVariabilityMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.workloadVariability(filters),
    queryFn: async () => {
      const result = await advancedService.getWorkloadVariabilityMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export function useDocumentRatioMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.documentRatio(filters),
    queryFn: async () => {
      const result = await advancedService.getDocumentRatioMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useCascadeCancellationMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.cascadeCancellation(filters),
    queryFn: async () => {
      const result = await advancedService.getCascadeCancellationMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useComplexConsultationMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.complexConsultation(filters),
    queryFn: async () => {
      const result = await advancedService.getComplexConsultationMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useReschedulingMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.rescheduling(filters),
    queryFn: async () => {
      const result = await advancedService.getReschedulingMetrics(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// ==================== ALL EXTENDED KPIs HOOK ====================

export function useAllExtendedKPIs(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: advancedAnalyticsKeys.allExtended(filters),
    queryFn: async () => {
      const result = await advancedService.getAllExtendedKPIs(filters);
      if (result.error) throw result.error;
      return result.data!;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
