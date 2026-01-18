import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Document workflow status types
 * P0-010: Track document lifecycle from upload to archive
 */
export type DocumentWorkflowStatus =
  | 'draft'              // Brouillon - en cours de création
  | 'pending_validation' // En attente de validation
  | 'validated'          // Validé par un praticien
  | 'rejected'           // Rejeté (avec motif)
  | 'archived';          // Archivé

export const WORKFLOW_STATUS_CONFIG: Record<DocumentWorkflowStatus, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  nextStatuses: DocumentWorkflowStatus[];
}> = {
  draft: {
    label: 'Brouillon',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    nextStatuses: ['pending_validation', 'archived'],
  },
  pending_validation: {
    label: 'À valider',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    nextStatuses: ['validated', 'rejected', 'draft'],
  },
  validated: {
    label: 'Validé',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    nextStatuses: ['archived'],
  },
  rejected: {
    label: 'Rejeté',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    nextStatuses: ['draft', 'archived'],
  },
  archived: {
    label: 'Archivé',
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    nextStatuses: [],
  },
};

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
  // P0-010: Workflow status fields
  workflow_status: DocumentWorkflowStatus;
  validated_by: string | null;
  validated_at: string | null;
  rejected_reason: string | null;
  is_confidential: boolean;
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

// P0-010: Update document workflow status
export function useUpdateDocumentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      patientId,
      status,
      rejectedReason,
    }: {
      id: string;
      patientId: string;
      status: DocumentWorkflowStatus;
      rejectedReason?: string;
    }) => {
      const updateData: Record<string, any> = {
        workflow_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'validated') {
        updateData.validated_at = new Date().toISOString();
        // validated_by would come from auth context
      }

      if (status === 'rejected' && rejectedReason) {
        updateData.rejected_reason = rejectedReason;
      }

      const { data, error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-documents', data.patientId] });
      const statusLabels: Record<DocumentWorkflowStatus, string> = {
        draft: 'Brouillon',
        pending_validation: 'En attente de validation',
        validated: 'Validé',
        rejected: 'Rejeté',
        archived: 'Archivé',
      };
      toast.success(`Document marqué comme "${statusLabels[data.workflow_status as DocumentWorkflowStatus]}"`);
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error(error);
    },
  });
}
