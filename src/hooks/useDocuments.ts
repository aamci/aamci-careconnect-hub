/**
 * Hook React Query pour gestion des documents
 * Utilise le service documentsService avec garantie ZÉRO PERTE
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import {
  listDocuments,
  deleteDocument,
  updateDocument,
  shareDocumentWithPatient,
  type DocumentFilter,
  type UpdateDocumentInput
} from '@/services/supabase/documentsService';
import { Document } from '@/types/document';

/**
 * Hook pour récupérer les documents d'un patient
 */
export function usePatientDocuments(patientId: string) {
  return useQuery({
    queryKey: ['documents', 'patient', patientId],
    queryFn: async () => {
      const filter: DocumentFilter = {
        patientId,
        includeDeleted: false
      };
      return await listDocuments(filter);
    },
    enabled: !!patientId
  });
}

/**
 * Hook pour récupérer les documents d'une consultation
 */
export function useConsultationDocuments(consultationId: string) {
  return useQuery({
    queryKey: ['documents', 'consultation', consultationId],
    queryFn: async () => {
      const filter: DocumentFilter = {
        consultationId,
        includeDeleted: false
      };
      return await listDocuments(filter);
    },
    enabled: !!consultationId
  });
}

/**
 * Hook pour mettre à jour un document
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      documentId,
      updates
    }: {
      documentId: string;
      updates: UpdateDocumentInput;
    }) => {
      return await updateDocument(documentId, updates);
    },
    onSuccess: (document: Document) => {
      // Invalider les queries concernées
      queryClient.invalidateQueries({ queryKey: ['documents', 'patient', document.patientId] });
      if (document.consultationId) {
        queryClient.invalidateQueries({ queryKey: ['documents', 'consultation', document.consultationId] });
      }

      toast({
        title: 'Document mis à jour',
        description: 'Les modifications ont été enregistrées.'
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message
      });
    }
  });
}

/**
 * Hook pour supprimer un document (soft delete)
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ documentId, patientId }: { documentId: string; patientId: string }) => {
      const success = await deleteDocument(documentId);
      return { success, patientId, documentId };
    },
    onSuccess: ({ patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'patient', patientId] });

      toast({
        title: 'Document supprimé',
        description: 'Le document a été supprimé avec succès.'
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur de suppression',
        description: error.message
      });
    }
  });
}

/**
 * Hook pour partager un document avec le patient
 */
export function useShareDocument() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (documentId: string) => {
      return await shareDocumentWithPatient(documentId);
    },
    onSuccess: (document: Document) => {
      queryClient.invalidateQueries({ queryKey: ['documents', 'patient', document.patientId] });

      toast({
        title: 'Document partagé',
        description: 'Le document est maintenant visible par le patient.'
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erreur de partage',
        description: error.message
      });
    }
  });
}
