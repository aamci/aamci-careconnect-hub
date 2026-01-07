/**
 * React Query hooks for Patient Allergies
 * Real-time data from Supabase with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as allergiesService from '@/services/supabase/allergiesService';
import type { PatientAllergy, Allergen, CreateAllergyInput } from '@/services/supabase/allergiesService';

// Re-export types for convenience
export type { PatientAllergy, Allergen, CreateAllergyInput };

// Query keys for cache management
export const allergiesKeys = {
  all: ['allergies'] as const,
  reference: () => [...allergiesKeys.all, 'reference'] as const,
  commonReference: () => [...allergiesKeys.all, 'common-reference'] as const,
  patient: (patientId: string) => [...allergiesKeys.all, 'patient', patientId] as const,
  patientHistory: (patientId: string) => [...allergiesKeys.all, 'patient-history', patientId] as const,
  distribution: () => [...allergiesKeys.all, 'distribution'] as const,
};

// ==================== QUERIES ====================

/**
 * Fetch all allergens from reference table
 */
export function useAllergenReference() {
  return useQuery({
    queryKey: allergiesKeys.reference(),
    queryFn: allergiesService.fetchAllergenReference,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - reference data rarely changes
  });
}

/**
 * Fetch common allergens only (for quick selection)
 */
export function useCommonAllergens() {
  return useQuery({
    queryKey: allergiesKeys.commonReference(),
    queryFn: allergiesService.fetchCommonAllergens,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * Fetch active allergies for a specific patient
 */
export function usePatientAllergies(patientId: string) {
  return useQuery({
    queryKey: allergiesKeys.patient(patientId),
    queryFn: () => allergiesService.fetchPatientAllergies(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Fetch full allergy history for a patient (including inactive)
 */
export function usePatientAllergiesHistory(patientId: string) {
  return useQuery({
    queryKey: allergiesKeys.patientHistory(patientId),
    queryFn: () => allergiesService.fetchPatientAllergiesHistory(patientId),
    enabled: !!patientId,
  });
}

/**
 * Fetch allergy distribution for data quality monitoring
 */
export function useAllergyDistribution() {
  return useQuery({
    queryKey: allergiesKeys.distribution(),
    queryFn: allergiesService.getAllergyDistribution,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ==================== MUTATIONS ====================

/**
 * Add a new allergy to a patient
 */
export function useCreatePatientAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, input }: { patientId: string; input: CreateAllergyInput }) =>
      allergiesService.createPatientAllergy(patientId, input),
    onSuccess: (data, { patientId }) => {
      // Invalidate patient allergies cache
      queryClient.invalidateQueries({ queryKey: allergiesKeys.patient(patientId) });
      queryClient.invalidateQueries({ queryKey: allergiesKeys.patientHistory(patientId) });
      queryClient.invalidateQueries({ queryKey: allergiesKeys.distribution() });
      toast.success(`Allergie "${data.allergenName}" ajoutée`);
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('Cette allergie existe déjà pour ce patient');
      } else {
        toast.error(`Erreur: ${error.message}`);
      }
    },
  });
}

/**
 * Update an existing allergy
 */
export function useUpdatePatientAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ allergyId, updates, patientId }: { 
      allergyId: string; 
      updates: Partial<CreateAllergyInput>;
      patientId: string;
    }) => allergiesService.updatePatientAllergy(allergyId, updates),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: allergiesKeys.patient(patientId) });
      queryClient.invalidateQueries({ queryKey: allergiesKeys.patientHistory(patientId) });
      toast.success('Allergie mise à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

/**
 * Deactivate an allergy (soft delete)
 */
export function useDeactivatePatientAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ allergyId, patientId }: { allergyId: string; patientId: string }) =>
      allergiesService.deactivatePatientAllergy(allergyId),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: allergiesKeys.patient(patientId) });
      queryClient.invalidateQueries({ queryKey: allergiesKeys.patientHistory(patientId) });
      queryClient.invalidateQueries({ queryKey: allergiesKeys.distribution() });
      toast.success('Allergie désactivée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

/**
 * Reactivate a previously deactivated allergy
 */
export function useReactivatePatientAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ allergyId, patientId }: { allergyId: string; patientId: string }) =>
      allergiesService.reactivatePatientAllergy(allergyId),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: allergiesKeys.patient(patientId) });
      queryClient.invalidateQueries({ queryKey: allergiesKeys.patientHistory(patientId) });
      queryClient.invalidateQueries({ queryKey: allergiesKeys.distribution() });
      toast.success('Allergie réactivée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Check if a patient has a specific allergy
 */
export function usePatientHasAllergy(patientId: string, allergenCode: string) {
  const { data: allergies } = usePatientAllergies(patientId);
  return allergies?.some(a => a.allergenCode === allergenCode) ?? false;
}
