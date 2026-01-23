import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface Prescription {
  id: string;
  patient_id: string;
  practitioner_id: string;
  consultation_id: string | null;
  appointment_id: string | null;
  type: string;
  status: string;
  content: Json;
  start_date: string | null;
  end_date: string | null;
  duration_days: number | null;
  renewable: boolean | null;
  renewal_count: number | null;
  max_renewals: number | null;
  signed_at: string | null;
  signed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Fetch active prescriptions for a patient
export function useActivePrescriptions(patientId: string) {
  return useQuery({
    queryKey: ['active-prescriptions', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Prescription[];
    },
    enabled: !!patientId,
  });
}

// Fetch all prescriptions for a patient
export function usePatientPrescriptions(patientId: string) {
  return useQuery({
    queryKey: ['patient-prescriptions', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Prescription[];
    },
    enabled: !!patientId,
  });
}

// Create prescription
export function useCreatePrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prescription: {
      patient_id: string;
      practitioner_id: string;
      consultation_id?: string | null;
      appointment_id?: string | null;
      type?: string;
      content: Json;
      start_date?: string | null;
      end_date?: string | null;
      duration_days?: number | null;
      renewable?: boolean;
      notes?: string | null;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: prescription.patient_id,
          practitioner_id: prescription.practitioner_id,
          consultation_id: prescription.consultation_id || null,
          appointment_id: prescription.appointment_id || null,
          type: prescription.type || 'medication',
          status: 'active',
          content: prescription.content,
          start_date: prescription.start_date || null,
          end_date: prescription.end_date || null,
          duration_days: prescription.duration_days || null,
          renewable: prescription.renewable || false,
          notes: prescription.notes || null,
          created_by: user.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Prescription;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-prescriptions', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['active-prescriptions', data.patient_id] });
      toast.success('Ordonnance créée');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création');
      console.error(error);
    },
  });
}

// Update prescription status
export function useUpdatePrescriptionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      patientId,
      status,
    }: {
      id: string;
      patientId: string;
      status: string;
    }) => {
      const updates: Record<string, unknown> = { status };

      if (status === 'stopped') {
        updates.end_date = new Date().toISOString().split('T')[0];
      }

      const { data, error } = await supabase
        .from('prescriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-prescriptions', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['active-prescriptions', data.patientId] });
      toast.success('Ordonnance mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}

// Renew prescription
export function useRenewPrescription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      prescriptionId,
      patientId,
    }: {
      prescriptionId: string;
      patientId: string;
    }) => {
      // Get original prescription
      const { data: original, error: fetchError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('id', prescriptionId)
        .single();

      if (fetchError) throw fetchError;

      // Create renewed prescription
      const { data: user } = await supabase.auth.getUser();
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: original.patient_id,
          practitioner_id: user.user?.id || original.practitioner_id,
          type: original.type,
          content: original.content,
          status: 'active',
          start_date: today,
          end_date: original.duration_days
            ? new Date(Date.now() + original.duration_days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : null,
          duration_days: original.duration_days,
          renewable: original.renewable,
          renewal_count: (original.renewal_count || 0) + 1,
          max_renewals: original.max_renewals,
          notes: original.notes,
          created_by: user.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update original prescription renewal count
      await supabase
        .from('prescriptions')
        .update({ renewal_count: (original.renewal_count || 0) + 1 })
        .eq('id', prescriptionId);

      return { ...data, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-prescriptions', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['active-prescriptions', data.patientId] });
      toast.success('Ordonnance renouvelée');
    },
    onError: (error) => {
      toast.error('Erreur lors du renouvellement');
      console.error(error);
    },
  });
}
