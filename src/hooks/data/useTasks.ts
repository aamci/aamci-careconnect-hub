/**
 * React Query hooks for Tasks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/types';
import * as tasksService from '@/services/supabase/tasksService';
import { toast } from 'sonner';

// Query keys
export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  byStatus: (status: Task['status']) => [...tasksKeys.lists(), { status }] as const,
  byPatient: (patientId: string) => [...tasksKeys.lists(), { patientId }] as const,
  myTasks: () => [...tasksKeys.lists(), 'mine'] as const,
};

// ==================== QUERIES ====================

export function useTasks() {
  return useQuery({
    queryKey: tasksKeys.lists(),
    queryFn: async () => {
      const result = await tasksService.fetchTasks();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useTasksByStatus(status: Task['status']) {
  return useQuery({
    queryKey: tasksKeys.byStatus(status),
    queryFn: async () => {
      const result = await tasksService.fetchTasksByStatus(status);
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 60 * 1000,
  });
}

export function useTasksByPatient(patientId: string) {
  return useQuery({
    queryKey: tasksKeys.byPatient(patientId),
    queryFn: async () => {
      const result = await tasksService.fetchTasksByPatient(patientId);
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!patientId,
    staleTime: 60 * 1000,
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: tasksKeys.myTasks(),
    queryFn: async () => {
      const result = await tasksService.fetchMyTasks();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 60 * 1000,
  });
}

// ==================== MUTATIONS ====================

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = await tasksService.createTask(task);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
      toast.success('Tâche créée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const result = await tasksService.updateTask(id, updates);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
      toast.success('Tâche mise à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tasksService.completeTask(id);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
      toast.success('Tâche terminée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await tasksService.deleteTask(id);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksKeys.all });
      toast.success('Tâche supprimée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
