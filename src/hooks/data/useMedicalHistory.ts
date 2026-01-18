/**
 * React Query hooks for Patient Medical History (Doctolib-level)
 * Real-time data from Supabase with optimistic updates
 *
 * Covers:
 * - Patient Conditions (antecedents medicaux)
 * - Patient Procedures (antecedents chirurgicaux)
 * - Patient Family History (histoire familiale)
 * - Patient Devices (dispositifs medicaux)
 * - Patient Lifestyle (mode de vie)
 * - Patient CVD Risk (risque cardiovasculaire)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as medicalHistoryService from '@/services/supabase/medicalHistoryService';
import type {
  PatientCondition,
  PatientProcedure,
  PatientFamilyHistory,
  PatientDevice,
  PatientLifestyle,
  PatientCvdRisk,
  PatientMedicalHistorySummary,
} from '@/services/supabase/medicalHistoryService';

// Re-export types for convenience
export type {
  PatientCondition,
  PatientProcedure,
  PatientFamilyHistory,
  PatientDevice,
  PatientLifestyle,
  PatientCvdRisk,
  PatientMedicalHistorySummary,
};

// ============================================================================
// QUERY KEYS
// ============================================================================

export const medicalHistoryKeys = {
  all: ['medical-history'] as const,
  // Conditions
  conditions: (patientId: string) => [...medicalHistoryKeys.all, 'conditions', patientId] as const,
  // Procedures
  procedures: (patientId: string) => [...medicalHistoryKeys.all, 'procedures', patientId] as const,
  // Family History
  familyHistory: (patientId: string) => [...medicalHistoryKeys.all, 'family-history', patientId] as const,
  // Devices
  devices: (patientId: string) => [...medicalHistoryKeys.all, 'devices', patientId] as const,
  // Lifestyle
  lifestyle: (patientId: string) => [...medicalHistoryKeys.all, 'lifestyle', patientId] as const,
  // CVD Risk
  cvdRisk: (patientId: string) => [...medicalHistoryKeys.all, 'cvd-risk', patientId] as const,
  // Summary
  summary: (patientId: string) => [...medicalHistoryKeys.all, 'summary', patientId] as const,
};

// ============================================================================
// PATIENT CONDITIONS HOOKS
// ============================================================================

/**
 * Fetch all conditions for a patient
 */
export function usePatientConditions(patientId: string) {
  return useQuery({
    queryKey: medicalHistoryKeys.conditions(patientId),
    queryFn: () => medicalHistoryService.fetchPatientConditions(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  });
}

/**
 * Create a new condition
 */
export function useCreateCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, input }: {
      patientId: string;
      input: Omit<PatientCondition, 'id' | 'patientId' | 'createdAt' | 'createdBy'>;
    }) => medicalHistoryService.createPatientCondition(patientId, input),
    onSuccess: (data, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.conditions(patientId) });
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.summary(patientId) });
      toast.success(`Antecedent "${data.title}" ajoute`);
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

/**
 * Update an existing condition
 */
export function useUpdateCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conditionId, updates, patientId }: {
      conditionId: string;
      updates: Partial<PatientCondition>;
      patientId: string;
    }) => medicalHistoryService.updatePatientCondition(conditionId, updates),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.conditions(patientId) });
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.summary(patientId) });
      toast.success('Antecedent mis a jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

/**
 * Delete a condition
 */
export function useDeleteCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conditionId, patientId }: { conditionId: string; patientId: string }) =>
      medicalHistoryService.deletePatientCondition(conditionId),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.conditions(patientId) });
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.summary(patientId) });
      toast.success('Antecedent supprime');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ============================================================================
// PATIENT PROCEDURES HOOKS
// ============================================================================

/**
 * Fetch all procedures for a patient
 */
export function usePatientProcedures(patientId: string) {
  return useQuery({
    queryKey: medicalHistoryKeys.procedures(patientId),
    queryFn: () => medicalHistoryService.fetchPatientProcedures(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  });
}

/**
 * Create a new procedure
 */
export function useCreateProcedure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, input }: {
      patientId: string;
      input: Omit<PatientProcedure, 'id' | 'patientId' | 'createdAt' | 'createdBy'>;
    }) => medicalHistoryService.createPatientProcedure(patientId, input),
    onSuccess: (data, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.procedures(patientId) });
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.summary(patientId) });
      toast.success(`Intervention "${data.title}" ajoutee`);
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ============================================================================
// PATIENT FAMILY HISTORY HOOKS
// ============================================================================

/**
 * Fetch family history for a patient
 */
export function usePatientFamilyHistory(patientId: string) {
  return useQuery({
    queryKey: medicalHistoryKeys.familyHistory(patientId),
    queryFn: () => medicalHistoryService.fetchPatientFamilyHistory(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  });
}

/**
 * Create a new family history entry
 */
export function useCreateFamilyHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, input }: {
      patientId: string;
      input: Omit<PatientFamilyHistory, 'id' | 'patientId' | 'createdAt' | 'createdBy'>;
    }) => medicalHistoryService.createPatientFamilyHistory(patientId, input),
    onSuccess: (data, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.familyHistory(patientId) });
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.summary(patientId) });
      toast.success(`Antecedent familial ajoute`);
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ============================================================================
// PATIENT DEVICES HOOKS
// ============================================================================

/**
 * Fetch all devices for a patient
 */
export function usePatientDevices(patientId: string) {
  return useQuery({
    queryKey: medicalHistoryKeys.devices(patientId),
    queryFn: () => medicalHistoryService.fetchPatientDevices(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  });
}

/**
 * Create a new device entry
 */
export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, input }: {
      patientId: string;
      input: Omit<PatientDevice, 'id' | 'patientId' | 'createdAt' | 'createdBy'>;
    }) => medicalHistoryService.createPatientDevice(patientId, input),
    onSuccess: (data, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.devices(patientId) });
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.summary(patientId) });
      toast.success(`Dispositif "${data.deviceName}" ajoute`);
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ============================================================================
// PATIENT LIFESTYLE HOOKS
// ============================================================================

/**
 * Fetch lifestyle data for a patient
 */
export function usePatientLifestyle(patientId: string) {
  return useQuery({
    queryKey: medicalHistoryKeys.lifestyle(patientId),
    queryFn: () => medicalHistoryService.fetchPatientLifestyle(patientId),
    enabled: !!patientId,
    staleTime: 60 * 1000,
  });
}

/**
 * Create or update lifestyle data
 */
export function useUpsertLifestyle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, input }: {
      patientId: string;
      input: Omit<PatientLifestyle, 'id' | 'patientId' | 'recordedAt' | 'createdBy'>;
    }) => medicalHistoryService.upsertPatientLifestyle(patientId, input),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.lifestyle(patientId) });
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.summary(patientId) });
      toast.success('Mode de vie enregistre');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ============================================================================
// PATIENT CVD RISK HOOKS
// ============================================================================

/**
 * Fetch CVD risk data for a patient
 */
export function usePatientCvdRisk(patientId: string) {
  return useQuery({
    queryKey: medicalHistoryKeys.cvdRisk(patientId),
    queryFn: () => medicalHistoryService.fetchPatientCvdRisk(patientId),
    enabled: !!patientId,
    staleTime: 60 * 1000,
  });
}

/**
 * Create or update CVD risk data
 */
export function useUpsertCvdRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, input }: {
      patientId: string;
      input: Omit<PatientCvdRisk, 'id' | 'patientId' | 'createdAt' | 'createdBy'>;
    }) => medicalHistoryService.upsertPatientCvdRisk(patientId, input),
    onSuccess: (_, { patientId }) => {
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.cvdRisk(patientId) });
      queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.summary(patientId) });
      toast.success('Risque cardiovasculaire enregistre');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ============================================================================
// MEDICAL HISTORY SUMMARY HOOK
// ============================================================================

/**
 * Fetch complete medical history summary for a patient
 * Aggregates all medical history data
 */
export function usePatientMedicalHistorySummary(patientId: string) {
  return useQuery({
    queryKey: medicalHistoryKeys.summary(patientId),
    queryFn: () => medicalHistoryService.fetchPatientMedicalHistory(patientId),
    enabled: !!patientId,
    staleTime: 30 * 1000,
  });
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * Check if patient has active ALD conditions
 */
export function usePatientHasALD(patientId: string) {
  const { data: conditions } = usePatientConditions(patientId);
  return conditions?.some(c => c.isAld && c.clinicalStatus === 'active') ?? false;
}

/**
 * Check if patient has MRI-incompatible devices
 */
export function usePatientHasMRIIncompatibleDevice(patientId: string) {
  const { data: devices } = usePatientDevices(patientId);
  return devices?.some(d => d.isActive && d.mriCompatible === false) ?? false;
}

/**
 * Get active conditions count
 */
export function useActiveConditionsCount(patientId: string) {
  const { data: conditions } = usePatientConditions(patientId);
  return conditions?.filter(c => c.clinicalStatus === 'active').length ?? 0;
}

/**
 * Get high-risk CVD status
 */
export function usePatientIsHighCvdRisk(patientId: string) {
  const { data: cvdRisk } = usePatientCvdRisk(patientId);
  return cvdRisk?.riskCategory === 'high' || cvdRisk?.riskCategory === 'very_high';
}

/**
 * Get smoking status
 */
export function usePatientSmokingStatus(patientId: string) {
  const { data: lifestyle } = usePatientLifestyle(patientId);
  return lifestyle?.tobaccoStatus ?? 'unknown';
}

/**
 * Invalidate all medical history data for a patient
 */
export function useInvalidateMedicalHistory() {
  const queryClient = useQueryClient();

  return (patientId: string) => {
    queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.conditions(patientId) });
    queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.procedures(patientId) });
    queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.familyHistory(patientId) });
    queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.devices(patientId) });
    queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.lifestyle(patientId) });
    queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.cvdRisk(patientId) });
    queryClient.invalidateQueries({ queryKey: medicalHistoryKeys.summary(patientId) });
  };
}
