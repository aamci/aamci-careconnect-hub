import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Vaccination {
  id: string;
  patient_id: string;
  practitioner_id: string | null;
  vaccine_name: string;
  vaccine_code: string | null;
  manufacturer: string | null;
  batch_number: string | null;
  administration_date: string;
  administration_site: string | null;
  dose_number: number | null;
  next_dose_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// Fetch vaccinations for a patient
export function usePatientVaccinations(patientId: string) {
  return useQuery({
    queryKey: ['patient-vaccinations', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('patient_id', patientId)
        .order('administration_date', { ascending: false });

      if (error) throw error;
      return data as Vaccination[];
    },
    enabled: !!patientId,
  });
}

// Fetch upcoming vaccinations (reminders)
export function useUpcomingVaccinations(patientId: string) {
  return useQuery({
    queryKey: ['upcoming-vaccinations', patientId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('vaccinations')
        .select('*')
        .eq('patient_id', patientId)
        .not('next_dose_date', 'is', null)
        .gte('next_dose_date', today)
        .order('next_dose_date', { ascending: true });

      if (error) throw error;
      return data as Vaccination[];
    },
    enabled: !!patientId,
  });
}

// Create vaccination
export function useCreateVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vaccination: {
      patient_id: string;
      practitioner_id?: string | null;
      vaccine_name: string;
      vaccine_code?: string | null;
      manufacturer?: string | null;
      batch_number?: string | null;
      administration_date: string;
      administration_site?: string | null;
      dose_number?: number | null;
      next_dose_date?: string | null;
      notes?: string | null;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('vaccinations')
        .insert({
          patient_id: vaccination.patient_id,
          practitioner_id: vaccination.practitioner_id || null,
          vaccine_name: vaccination.vaccine_name,
          vaccine_code: vaccination.vaccine_code || null,
          manufacturer: vaccination.manufacturer || null,
          batch_number: vaccination.batch_number || null,
          administration_date: vaccination.administration_date,
          administration_site: vaccination.administration_site || null,
          dose_number: vaccination.dose_number || 1,
          next_dose_date: vaccination.next_dose_date || null,
          notes: vaccination.notes || null,
          created_by: user.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Vaccination;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-vaccinations', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-vaccinations', data.patient_id] });
      toast.success('Vaccination enregistrée');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(error);
    },
  });
}

// Update vaccination
export function useUpdateVaccination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      patientId,
      updates,
    }: {
      id: string;
      patientId: string;
      updates: Partial<Omit<Vaccination, 'id' | 'patient_id' | 'created_at' | 'updated_at' | 'created_by'>>;
    }) => {
      const { data, error } = await supabase
        .from('vaccinations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-vaccinations', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-vaccinations', data.patientId] });
      toast.success('Vaccination mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}
