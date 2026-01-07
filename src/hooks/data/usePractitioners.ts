/**
 * React Query hooks for Practitioners
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Practitioner } from '@/types';
import * as practitionersService from '@/services/supabase/practitionersService';
import { toast } from 'sonner';

// Query keys
export const practitionersKeys = {
  all: ['practitioners'] as const,
  lists: () => [...practitionersKeys.all, 'list'] as const,
  details: () => [...practitionersKeys.all, 'detail'] as const,
  detail: (id: string) => [...practitionersKeys.details(), id] as const,
  byUser: (userId: string) => [...practitionersKeys.all, 'byUser', userId] as const,
};

// ==================== QUERIES ====================

export function usePractitioners() {
  return useQuery({
    queryKey: practitionersKeys.lists(),
    queryFn: async () => {
      const result = await practitionersService.fetchPractitioners();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePractitioner(id: string) {
  return useQuery({
    queryKey: practitionersKeys.detail(id),
    queryFn: async () => {
      const result = await practitionersService.fetchPractitionerById(id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!id,
  });
}

export function usePractitionerByUser(userId: string) {
  return useQuery({
    queryKey: practitionersKeys.byUser(userId),
    queryFn: async () => {
      const result = await practitionersService.fetchPractitionerByUserId(userId);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!userId,
  });
}

// ==================== MUTATIONS ====================

export function useCreatePractitioner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (practitioner: Omit<Practitioner, 'id'>) => {
      const result = await practitionersService.createPractitioner(practitioner);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: practitionersKeys.all });
      toast.success('Praticien créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdatePractitioner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Practitioner> }) => {
      const result = await practitionersService.updatePractitioner(id, updates);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: practitionersKeys.all });
      queryClient.invalidateQueries({ queryKey: practitionersKeys.detail(id) });
      toast.success('Praticien mis à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
