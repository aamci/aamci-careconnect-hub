import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Consultation {
  id: string;
  patient_id: string;
  practitioner_id: string;
  appointment_id: string | null;
  status: string;
  start_time: string;
  end_time: string | null;
  chief_complaint: string | null;
  history_of_present_illness: string | null;
  diagnosis: Json | null;
  physical_examination: Json | null;
  treatment_plan: string | null;
  follow_up_instructions: string | null;
  prescriptions: Json | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Fetch consultations for a patient
export function usePatientConsultations(patientId: string) {
  return useQuery({
    queryKey: ['patient-consultations', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data as Consultation[];
    },
    enabled: !!patientId,
  });
}

// Fetch active/in-progress consultation
export function useActiveConsultation(patientId: string) {
  return useQuery({
    queryKey: ['active-consultation', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'in-progress')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as Consultation | null;
    },
    enabled: !!patientId,
  });
}

// Create consultation
export function useCreateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (consultation: {
      patient_id: string;
      practitioner_id: string;
      appointment_id?: string | null;
      status?: string;
      chief_complaint?: string | null;
      notes?: string | null;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('consultations')
        .insert({
          patient_id: consultation.patient_id,
          practitioner_id: consultation.practitioner_id,
          appointment_id: consultation.appointment_id || null,
          status: consultation.status || 'in-progress',
          chief_complaint: consultation.chief_complaint || null,
          notes: consultation.notes || null,
          created_by: user.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Consultation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-consultations', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['active-consultation', data.patient_id] });
      toast.success('Consultation démarrée');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création');
      console.error(error);
    },
  });
}

// Update consultation
export function useUpdateConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      patientId,
      updates,
    }: {
      id: string;
      patientId: string;
      updates: {
        chief_complaint?: string | null;
        history_of_present_illness?: string | null;
        treatment_plan?: string | null;
        follow_up_instructions?: string | null;
        notes?: string | null;
        status?: string;
      };
    }) => {
      const { data, error } = await supabase
        .from('consultations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, patientId } as Consultation & { patientId: string };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-consultations', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['active-consultation', data.patientId] });
      toast.success('Consultation mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}

// End consultation
export function useEndConsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      patientId,
    }: {
      id: string;
      patientId: string;
    }) => {
      const { data, error } = await supabase
        .from('consultations')
        .update({
          status: 'completed',
          end_time: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-consultations', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['active-consultation', data.patientId] });
      toast.success('Consultation terminée');
    },
    onError: (error) => {
      toast.error('Erreur lors de la clôture');
      console.error(error);
    },
  });
}
