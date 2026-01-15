import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PatientDocument {
  id: string;
  patient_id: string;
  name: string;
  type: string | null;
  category: string | null;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  storage_bucket: string | null;
  appointment_id: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch documents for a patient
export function usePatientDocuments(patientId: string) {
  return useQuery({
    queryKey: ['patient-documents', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PatientDocument[];
    },
    enabled: !!patientId,
  });
}

// Create document metadata (file upload handled separately)
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (document: Omit<PatientDocument, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('documents')
        .insert(document)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', data.patient_id] });
      toast.success('Document ajouté');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'ajout du document');
      console.error(error);
    },
  });
}

// Delete a document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', data.patientId] });
      toast.success('Document supprimé');
    },
    onError: (error) => {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    },
  });
}
