/**
 * Hook for fetching patient appointment history
 */

import { useQuery } from '@tanstack/react-query';
import { Appointment } from '@/types';
import * as appointmentsService from '@/services/supabase/appointmentsService';
import { subYears, addYears } from 'date-fns';

export interface PatientHistorySummary {
  honoredCount: number;
  excusedAbsenceCount: number;
  unexcusedAbsenceCount: number;
}

export interface GroupedAppointments {
  year: number;
  items: Appointment[];
}

export interface PatientHistoryData {
  summary: PatientHistorySummary;
  upcoming: Appointment[];
  past: GroupedAppointments[];
  reminders: any[]; // For future reminder feature
}

export const patientHistoryKeys = {
  all: ['patient-history'] as const,
  byPatient: (patientId: string) => [...patientHistoryKeys.all, patientId] as const,
};

export function usePatientHistory(patientId: string) {
  return useQuery({
    queryKey: patientHistoryKeys.byPatient(patientId),
    queryFn: async (): Promise<PatientHistoryData> => {
      // Fetch all appointments for this patient (past 10 years + next year)
      const startDate = subYears(new Date(), 10);
      const endDate = addYears(new Date(), 1);
      
      const result = await appointmentsService.fetchAppointments(startDate, endDate);
      
      if (result.error) throw result.error;
      
      // Filter only this patient's appointments
      const patientAppointments = (result.data || []).filter(
        apt => apt.patientId === patientId
      );
      
      const now = new Date();
      
      // Separate upcoming and past
      const upcoming = patientAppointments
        .filter(apt => apt.startTime > now && apt.status === 'scheduled')
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      const past = patientAppointments
        .filter(apt => apt.startTime <= now || apt.status !== 'scheduled')
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
      
      // Group past by year
      const groupedByYear: Map<number, Appointment[]> = new Map();
      past.forEach(apt => {
        const year = apt.startTime.getFullYear();
        const existing = groupedByYear.get(year) || [];
        existing.push(apt);
        groupedByYear.set(year, existing);
      });
      
      const pastGrouped: GroupedAppointments[] = Array.from(groupedByYear.entries())
        .map(([year, items]) => ({ year, items }))
        .sort((a, b) => b.year - a.year);
      
      // Calculate summary
      const summary: PatientHistorySummary = {
        honoredCount: patientAppointments.filter(apt => apt.status === 'completed').length,
        excusedAbsenceCount: patientAppointments.filter(apt => apt.status === 'absent-excused').length,
        unexcusedAbsenceCount: patientAppointments.filter(apt => apt.status === 'absent-unexcused').length,
      };
      
      return {
        summary,
        upcoming,
        past: pastGrouped,
        reminders: [], // Future feature
      };
    },
    enabled: !!patientId,
    staleTime: 30 * 1000,
  });
}
