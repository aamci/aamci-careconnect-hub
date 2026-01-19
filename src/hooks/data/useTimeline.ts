/**
 * React Query hooks for Patient Timeline
 * Provides data fetching and mutations for the HISTORIQUE section
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as timelineService from '@/services/supabase/timelineService';
import * as reminderService from '@/services/supabase/reminderService';
import {
  TimelineFilters,
  TimelineEvent,
  PatientReminder,
  PatientTask,
  CreateReminderInput,
  UpdateReminderInput,
  ReminderStatus,
  PatientTaskStatus,
} from '@/types/timeline';

// ==================== QUERY KEYS ====================

export const timelineKeys = {
  all: ['timeline'] as const,
  patient: (patientId: string) => [...timelineKeys.all, patientId] as const,
  patientFiltered: (patientId: string, filters: TimelineFilters) =>
    [...timelineKeys.patient(patientId), 'filtered', filters] as const,
  patientSearch: (patientId: string, query: string) =>
    [...timelineKeys.patient(patientId), 'search', query] as const,
  stats: (patientId: string) => [...timelineKeys.patient(patientId), 'stats'] as const,
  filterOptions: (patientId: string) => [...timelineKeys.patient(patientId), 'filterOptions'] as const,
  reminders: (patientId: string) => [...timelineKeys.patient(patientId), 'reminders'] as const,
  tasks: (patientId: string) => [...timelineKeys.patient(patientId), 'tasks'] as const,
};

// ==================== TIMELINE QUERIES ====================

export function usePatientTimeline(patientId: string, filters: TimelineFilters = {}) {
  return useInfiniteQuery({
    queryKey: timelineKeys.patientFiltered(patientId, filters),
    queryFn: async ({ pageParam = 0 }) => {
      const result = await timelineService.fetchPatientTimeline(patientId, filters, {
        offset: pageParam as number,
        limit: 20,
      });
      if (result.error) throw result.error;
      return result;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTimelineSearch(patientId: string, query: string) {
  return useQuery({
    queryKey: timelineKeys.patientSearch(patientId, query),
    queryFn: async () => {
      const result = await timelineService.searchPatientTimeline(patientId, query);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!patientId && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ==================== STATS QUERIES ====================

export function usePatientAttendanceStats(patientId: string) {
  return useQuery({
    queryKey: timelineKeys.stats(patientId),
    queryFn: async () => {
      const result = await timelineService.fetchPatientAttendanceStats(patientId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTimelineFilterOptions(patientId: string) {
  return useQuery({
    queryKey: timelineKeys.filterOptions(patientId),
    queryFn: async () => {
      const result = await timelineService.fetchTimelineFilterOptions(patientId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== TIMELINE MUTATIONS ====================

export function useCreateTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (event: Omit<TimelineEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const result = await timelineService.createTimelineEvent(event);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: timelineKeys.patient(data.patient_id) });
        toast.success('Événement ajouté à l\'historique');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteTimelineEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, patientId }: { eventId: string; patientId: string }) => {
      const result = await timelineService.deleteTimelineEvent(eventId);
      if (result.error) throw result.error;
      return { eventId, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.patient(data.patientId) });
      toast.success('Événement supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ==================== REMINDERS QUERIES ====================

export function usePatientReminders(patientId: string, status: ReminderStatus | 'all' = 'pending') {
  return useQuery({
    queryKey: [...timelineKeys.reminders(patientId), status],
    queryFn: async () => {
      const result = await reminderService.fetchPatientReminders(patientId, status);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpcomingReminders(patientId: string, daysAhead: number = 30) {
  return useQuery({
    queryKey: [...timelineKeys.reminders(patientId), 'upcoming', daysAhead],
    queryFn: async () => {
      const result = await reminderService.fetchUpcomingReminders(patientId, daysAhead);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== REMINDERS MUTATIONS ====================

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateReminderInput) => {
      const result = await reminderService.createReminder(input);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: timelineKeys.reminders(data.patient_id) });
        toast.success('Rappel créé');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reminderId,
      patientId,
      updates,
    }: {
      reminderId: string;
      patientId: string;
      updates: UpdateReminderInput;
    }) => {
      const result = await reminderService.updateReminder(reminderId, updates);
      if (result.error) throw result.error;
      return { data: result.data, patientId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.reminders(result.patientId) });
      if (result.data?.status === 'completed') {
        toast.success('Rappel marqué comme terminé');
      } else {
        toast.success('Rappel mis à jour');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reminderId, patientId }: { reminderId: string; patientId: string }) => {
      const result = await reminderService.deleteReminder(reminderId);
      if (result.error) throw result.error;
      return { reminderId, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.reminders(data.patientId) });
      toast.success('Rappel supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ==================== TASKS QUERIES ====================

export function usePatientTasks(patientId: string, status: PatientTaskStatus | 'all' = 'all') {
  return useQuery({
    queryKey: [...timelineKeys.tasks(patientId), status],
    queryFn: async () => {
      const result = await reminderService.fetchPatientTasks(patientId, status);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ==================== TASKS MUTATIONS ====================

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<PatientTask, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const result = await reminderService.createTask(task);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: timelineKeys.tasks(data.patient_id) });
        toast.success('Tâche créée');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      patientId,
      updates,
    }: {
      taskId: string;
      patientId: string;
      updates: Partial<PatientTask>;
    }) => {
      const result = await reminderService.updateTask(taskId, updates);
      if (result.error) throw result.error;
      return { data: result.data, patientId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.tasks(result.patientId) });
      if (result.data?.status === 'done') {
        toast.success('Tâche terminée');
      } else {
        toast.success('Tâche mise à jour');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, patientId }: { taskId: string; patientId: string }) => {
      const result = await reminderService.deleteTask(taskId);
      if (result.error) throw result.error;
      return { taskId, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: timelineKeys.tasks(data.patientId) });
      toast.success('Tâche supprimée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
