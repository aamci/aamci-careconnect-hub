/**
 * React Query hooks for Patients
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Patient, PatientAlert } from '@/types';
import * as patientsService from '@/services/supabase/patientsService';
import { toast } from 'sonner';

// Query keys
export const patientsKeys = {
  all: ['patients'] as const,
  lists: () => [...patientsKeys.all, 'list'] as const,
  search: (query: string) => [...patientsKeys.lists(), { search: query }] as const,
  details: () => [...patientsKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientsKeys.details(), id] as const,
};

// ==================== QUERIES ====================

export function usePatients() {
  return useQuery({
    queryKey: patientsKeys.lists(),
    queryFn: async () => {
      const result = await patientsService.fetchPatients();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: patientsKeys.detail(id),
    queryFn: async () => {
      const result = await patientsService.fetchPatientById(id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!id,
  });
}

export function usePatientSearch(query: string) {
  return useQuery({
    queryKey: patientsKeys.search(query),
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const result = await patientsService.searchPatients(query);
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ==================== MUTATIONS ====================

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = await patientsService.createPatient(patient);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientsKeys.all });
      toast.success('Patient créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Patient> }) => {
      const result = await patientsService.updatePatient(id, updates);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: patientsKeys.all });
      queryClient.invalidateQueries({ queryKey: patientsKeys.detail(id) });
      toast.success('Patient mis à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await patientsService.deletePatient(id);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientsKeys.all });
      toast.success('Patient supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ==================== ALERTS MUTATIONS ====================

export function useCreatePatientAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, alert }: { patientId: string; alert: Omit<PatientAlert, 'id'> }) => {
      const result = await patientsService.createPatientAlert(patientId, alert);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: patientsKeys.detail(patientId) });
      toast.success('Alerte ajoutée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useResolvePatientAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ alertId, patientId }: { alertId: string; patientId: string }) => {
      const result = await patientsService.resolvePatientAlert(alertId);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: patientsKeys.detail(patientId) });
      toast.success('Alerte résolue');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
