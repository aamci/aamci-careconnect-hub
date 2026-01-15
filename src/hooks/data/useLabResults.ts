import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface LabResult {
  id: string;
  patient_id: string;
  practitioner_id: string | null;
  document_id: string | null;
  category: string | null;
  lab_name: string | null;
  test_date: string;
  received_date: string | null;
  status: string | null;
  results: Json;
  interpretation: string | null;
  is_abnormal: boolean | null;
  notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch lab results for a patient
export function usePatientLabResults(patientId: string) {
  return useQuery({
    queryKey: ['patient-lab-results', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', patientId)
        .order('test_date', { ascending: false });

      if (error) throw error;
      return data as LabResult[];
    },
    enabled: !!patientId,
  });
}

// Create lab result
export function useCreateLabResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labResult: {
      patient_id: string;
      practitioner_id?: string | null;
      document_id?: string | null;
      category?: string | null;
      lab_name?: string | null;
      test_date: string;
      received_date?: string | null;
      status?: string;
      results: Json;
      interpretation?: string | null;
      is_abnormal?: boolean;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('lab_results')
        .insert({
          patient_id: labResult.patient_id,
          practitioner_id: labResult.practitioner_id || null,
          document_id: labResult.document_id || null,
          category: labResult.category || null,
          lab_name: labResult.lab_name || null,
          test_date: labResult.test_date,
          received_date: labResult.received_date || null,
          status: labResult.status || 'pending',
          results: labResult.results,
          interpretation: labResult.interpretation || null,
          is_abnormal: labResult.is_abnormal || false,
          notes: labResult.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as LabResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-lab-results', data.patient_id] });
      toast.success('Résultat ajouté');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'ajout');
      console.error(error);
    },
  });
}

// Mark as reviewed
export function useReviewLabResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      patientId,
    }: {
      id: string;
      patientId: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('lab_results')
        .update({
          status: 'reviewed',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.user?.id || null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-lab-results', data.patientId] });
      toast.success('Résultat marqué comme revu');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}
