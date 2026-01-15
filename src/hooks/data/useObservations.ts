import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Observation {
  id: string;
  patient_id: string;
  practitioner_id: string | null;
  consultation_id: string | null;
  appointment_id: string | null;
  content: string;
  author_name: string | null;
  author_id: string | null;
  is_urgent: boolean;
  send_to_secretariat: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch observations (notes) for a patient
export function usePatientObservations(patientId: string) {
  return useQuery({
    queryKey: ['patient-observations', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('patient_id', patientId)
        .not('content', 'like', '%[VACCINATION]%') // Exclude vaccination entries
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(n => ({
        ...n,
        is_urgent: n.is_urgent || false,
        send_to_secretariat: n.send_to_secretariat || false,
      })) as Observation[];
    },
    enabled: !!patientId,
  });
}

// Create observation
export function useCreateObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (observation: Omit<Observation, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          patient_id: observation.patient_id,
          content: observation.content,
          author_name: observation.author_name,
          author_id: observation.author_id,
          is_urgent: observation.is_urgent,
          send_to_secretariat: observation.send_to_secretariat,
          appointment_id: observation.appointment_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-observations', data.patient_id] });
      toast.success('Observation ajoutée');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'ajout');
      console.error(error);
    },
  });
}

// Update observation
export function useUpdateObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientId, content }: { id: string; patientId: string; content: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-observations', data.patientId] });
      toast.success('Observation mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}

// Delete observation
export function useDeleteObservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-observations', data.patientId] });
      toast.success('Observation supprimée');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    },
  });
}
