/**
 * React Query hooks for Appointments and Motifs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Appointment, AppointmentMotif } from '@/types';
import * as appointmentsService from '@/services/supabase/appointmentsService';
import { startOfWeek, endOfWeek, startOfDay, endOfDay, addDays } from 'date-fns';
import { toast } from 'sonner';

// Query keys
export const appointmentsKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentsKeys.all, 'list'] as const,
  byRange: (start: Date, end: Date, practitioners?: string[]) => 
    [...appointmentsKeys.lists(), { start: start.toISOString(), end: end.toISOString(), practitioners }] as const,
  details: () => [...appointmentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentsKeys.details(), id] as const,
};

export const motifsKeys = {
  all: ['motifs'] as const,
  lists: () => [...motifsKeys.all, 'list'] as const,
};

// ==================== MOTIFS HOOKS ====================

export function useMotifs() {
  return useQuery({
    queryKey: motifsKeys.lists(),
    queryFn: async () => {
      const result = await appointmentsService.fetchMotifs();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ==================== APPOINTMENTS QUERIES ====================

export function useAppointments(
  startDate: Date,
  endDate: Date,
  practitionerIds?: string[]
) {
  return useQuery({
    queryKey: appointmentsKeys.byRange(startDate, endDate, practitionerIds),
    queryFn: async () => {
      const result = await appointmentsService.fetchAppointments(startDate, endDate, practitionerIds);
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useWeekAppointments(weekStart: Date, practitionerIds?: string[]) {
  const start = startOfWeek(weekStart, { weekStartsOn: 1 });
  const end = endOfWeek(weekStart, { weekStartsOn: 1 });
  
  return useAppointments(start, end, practitionerIds);
}

export function useDayAppointments(date: Date, practitionerIds?: string[]) {
  const start = startOfDay(date);
  const end = endOfDay(date);
  
  return useAppointments(start, end, practitionerIds);
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentsKeys.detail(id),
    queryFn: async () => {
      const result = await appointmentsService.fetchAppointmentById(id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!id,
  });
}

// ==================== APPOINTMENTS MUTATIONS ====================

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      appointment: Omit<Appointment, 'id' | 'patient' | 'practitioner' | 'motif' | 'history' | 'createdAt' | 'updatedAt'>
    ) => {
      const result = await appointmentsService.createAppointment(appointment);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
      toast.success('Rendez-vous créé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Appointment, 'patient' | 'practitioner' | 'motif' | 'history'>>;
    }) => {
      const result = await appointmentsService.updateAppointment(id, updates);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.detail(id) });
      toast.success('Rendez-vous mis à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Appointment['status'] }) => {
      const result = await appointmentsService.updateAppointmentStatus(id, status);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.detail(id) });
      toast.success('Statut mis à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await appointmentsService.deleteAppointment(id);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentsKeys.all });
      toast.success('Rendez-vous supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
