/**
 * React Query hooks for Analytics and Metrics
 */

import { useQuery } from '@tanstack/react-query';
import * as analyticsService from '@/services/supabase/analyticsService';
import { AnalyticsFilters } from '@/services/supabase/analyticsService';

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  kpis: (filters: AnalyticsFilters) => [...analyticsKeys.all, 'kpis', filters] as const,
  timeSeries: (filters: AnalyticsFilters, granularity: string) =>
    [...analyticsKeys.all, 'timeseries', filters, granularity] as const,
  distribution: (filters: AnalyticsFilters, groupBy: string) =>
    [...analyticsKeys.all, 'distribution', filters, groupBy] as const,
};

// ==================== KPIs HOOKS ====================

export function useAllKPIs(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: analyticsKeys.kpis(filters),
    queryFn: async () => {
      const result = await analyticsService.getAllKPIs(filters);
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - analytics data doesn't need to be real-time
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

export function useAppointmentsMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: [...analyticsKeys.kpis(filters), 'appointments'],
    queryFn: async () => {
      const result = await analyticsService.getAppointmentsMetrics(filters);
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useDocumentsMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: [...analyticsKeys.kpis(filters), 'documents'],
    queryFn: async () => {
      const result = await analyticsService.getDocumentsMetrics(filters);
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePatientsMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: [...analyticsKeys.kpis(filters), 'patients'],
    queryFn: async () => {
      const result = await analyticsService.getPatientsMetrics(filters);
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: [...analyticsKeys.kpis(filters), 'revenue'],
    queryFn: async () => {
      const result = await analyticsService.getRevenueMetrics(filters);
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useQualityMetrics(filters: AnalyticsFilters) {
  return useQuery({
    queryKey: [...analyticsKeys.kpis(filters), 'quality'],
    queryFn: async () => {
      const result = await analyticsService.getQualityMetrics(filters);
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== TIME SERIES HOOKS ====================

export function useAppointmentsTimeSeries(
  filters: AnalyticsFilters,
  granularity: 'day' | 'week' | 'month' = 'day'
) {
  return useQuery({
    queryKey: analyticsKeys.timeSeries(filters, granularity),
    queryFn: async () => {
      const result = await analyticsService.getAppointmentsTimeSeries(filters, granularity);
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// ==================== DISTRIBUTION HOOKS ====================

export function useAppointmentsDistribution(
  filters: AnalyticsFilters,
  groupBy: 'type' | 'status' | 'practitioner' = 'type'
) {
  return useQuery({
    queryKey: analyticsKeys.distribution(filters, groupBy),
    queryFn: async () => {
      const result = await analyticsService.getAppointmentsDistribution(filters, groupBy);
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
