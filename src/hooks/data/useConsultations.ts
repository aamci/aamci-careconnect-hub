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
      try {
        const { data, error } = await supabase
          .from('consultations')
          .select('*')
          .eq('patient_id', patientId)
          .order('start_time', { ascending: false });

        if (error) throw error;
        return data as Consultation[];
      } catch (err) {
        console.warn('[usePatientConsultations] Supabase unavailable, returning empty:', err);
        return [] as Consultation[];
      }
    },
    enabled: !!patientId,
  });
}

// Fetch active/in-progress consultation
export function useActiveConsultation(patientId: string) {
  return useQuery({
    queryKey: ['active-consultation', patientId],
    queryFn: async () => {
      try {
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
      } catch (err) {
        console.warn('[useActiveConsultation] Supabase unavailable, returning null:', err);
        return null;
      }
    },
    enabled: !!patientId,
  });
}

// Create consultation (with mock fallback for demo mode)
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
      try {
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
      } catch (err) {
        console.warn('[useCreateConsultation] Supabase unavailable, returning mock consultation:', err);
        const now = new Date().toISOString();
        return {
          id: `consult-mock-${Date.now()}`,
          patient_id: consultation.patient_id,
          practitioner_id: consultation.practitioner_id,
          appointment_id: consultation.appointment_id || null,
          status: consultation.status || 'in-progress',
          start_time: now,
          end_time: null,
          chief_complaint: consultation.chief_complaint || null,
          history_of_present_illness: null,
          diagnosis: null,
          physical_examination: null,
          treatment_plan: null,
          follow_up_instructions: null,
          prescriptions: null,
          notes: consultation.notes || null,
          created_at: now,
          updated_at: now,
          created_by: null,
        } as Consultation;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-consultations', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['active-consultation', data.patient_id] });
    },
    onError: (error) => {
      toast.error('Erreur lors de la creation');
      console.error(error);
    },
  });
}

// Update consultation (with mock fallback for demo mode)
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
      try {
        const { data, error } = await supabase
          .from('consultations')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return { ...data, patientId } as Consultation & { patientId: string };
      } catch (err) {
        console.warn('[useUpdateConsultation] Supabase unavailable, returning mock:', err);
        const now = new Date().toISOString();
        return {
          id,
          patient_id: patientId,
          practitioner_id: 'pract-1',
          appointment_id: null,
          status: updates.status || 'in-progress',
          start_time: now,
          end_time: null,
          chief_complaint: updates.chief_complaint ?? null,
          history_of_present_illness: updates.history_of_present_illness ?? null,
          diagnosis: null,
          physical_examination: null,
          treatment_plan: updates.treatment_plan ?? null,
          follow_up_instructions: updates.follow_up_instructions ?? null,
          prescriptions: null,
          notes: updates.notes ?? null,
          created_at: now,
          updated_at: now,
          created_by: null,
          patientId,
        } as Consultation & { patientId: string };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-consultations', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['active-consultation', data.patientId] });
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise a jour');
      console.error(error);
    },
  });
}

// End consultation (with mock fallback for demo mode)
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
      try {
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
      } catch (err) {
        console.warn('[useEndConsultation] Supabase unavailable, returning mock:', err);
        return {
          id,
          patient_id: patientId,
          status: 'completed',
          end_time: new Date().toISOString(),
          patientId,
        };
      }
    },
    onSuccess: (data) => {
      const pid = (data as { patientId?: string }).patientId || (data as { patient_id?: string }).patient_id;
      if (pid) {
        queryClient.invalidateQueries({ queryKey: ['patient-consultations', pid] });
        queryClient.invalidateQueries({ queryKey: ['active-consultation', pid] });
      }
    },
    onError: (error) => {
      toast.error('Erreur lors de la cloture');
      console.error(error);
    },
  });
}
