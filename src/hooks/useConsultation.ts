/**
 * Hook de gestion d'une consultation
 * État, documents, prescriptions, actions - Connecté à Supabase
 */

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';
import {
  useActiveConsultation,
  useUpdateConsultation,
  useEndConsultation
} from '@/hooks/data/useConsultations';
import { useNavigate } from 'react-router-dom';

export interface ConsultationData {
  id: string;
  patientId: string;
  practitionerId: string;
  startedAt: Date;
  status: 'in_progress' | 'completed' | 'canceled';
  templateId?: string;
  templateName?: string;
  reason: string;
  anamnesis: string;
  examination: string;
  documents: Document[];
}

interface UseConsultationOptions {
  patientId: string;
  consultationId?: string;
  onSave?: (data: ConsultationData) => Promise<void>;
  onComplete?: (data: ConsultationData) => Promise<void>;
}

export function useConsultation(options: UseConsultationOptions) {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load real data from Supabase
  const { data: activeConsultation, isLoading } = useActiveConsultation(options.patientId);
  const updateMutation = useUpdateConsultation();
  const endMutation = useEndConsultation();

  // Use the consultation passed as parameter or the active one
  const consultationData = activeConsultation;

  const [consultation, setConsultation] = useState<ConsultationData>({
    id: options.consultationId || `temp-${Date.now()}`,
    patientId: options.patientId,
    practitionerId: 'current-user',
    startedAt: new Date(),
    status: 'in_progress',
    reason: '',
    anamnesis: '',
    examination: '',
    documents: []
  });

  // Sync with real Supabase data
  useEffect(() => {
    if (consultationData && !isLoading) {
      setConsultation({
        id: consultationData.id,
        patientId: consultationData.patient_id,
        practitionerId: consultationData.practitioner_id,
        startedAt: new Date(consultationData.start_time),
        status: consultationData.status as 'in_progress' | 'completed' | 'canceled',
        templateId: undefined,
        templateName: undefined,
        reason: consultationData.chief_complaint || '',
        anamnesis: consultationData.history_of_present_illness || '',
        examination: consultationData.notes || '',
        documents: []
      });
    }
  }, [consultationData, isLoading]);

  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const updateField = useCallback(<K extends keyof ConsultationData>(field: K, value: ConsultationData[K]) => {
    setConsultation(prev => ({ ...prev, [field]: value }));
  }, []);

  const addDocument = useCallback((document: Document) => {
    setConsultation(prev => ({
      ...prev,
      documents: [...prev.documents, document]
    }));
  }, []);

  const removeDocument = useCallback((documentId: string) => {
    setConsultation(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== documentId)
    }));
  }, []);

  const save = useCallback(async () => {
    if (!consultationData) return;

    setIsSaving(true);
    try {
      if (options.onSave) {
        await options.onSave(consultation);
      } else {
        // Save to Supabase
        await updateMutation.mutateAsync({
          id: consultationData.id,
          patientId: options.patientId,
          updates: {
            chief_complaint: consultation.reason || null,
            history_of_present_illness: consultation.anamnesis || null,
            notes: consultation.examination || null
          }
        });
      }

      toast({
        title: 'Consultation sauvegardée',
        description: 'Les modifications ont été enregistrées.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de sauvegarde',
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [consultation, consultationData, options, toast, updateMutation]);

  const complete = useCallback(async () => {
    if (!consultationData) return;

    if (!consultation.reason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Consultation incomplète',
        description: 'Le motif de consultation est obligatoire.'
      });
      return;
    }

    setIsCompleting(true);
    try {
      // Save first
      await updateMutation.mutateAsync({
        id: consultationData.id,
        patientId: options.patientId,
        updates: {
          chief_complaint: consultation.reason || null,
          history_of_present_illness: consultation.anamnesis || null,
          notes: consultation.examination || null
        }
      });

      // Then end
      if (options.onComplete) {
        await options.onComplete({
          ...consultation,
          status: 'completed'
        });
      } else {
        await endMutation.mutateAsync({
          id: consultationData.id,
          patientId: options.patientId
        });
      }

      toast({
        title: 'Consultation terminée',
        description: 'La consultation a été finalisée avec succès.'
      });

      // Navigate back to home page after completion
      setTimeout(() => {
        navigate(`/patients/${options.patientId}/home`);
      }, 1000);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur de finalisation',
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
      throw error;
    } finally {
      setIsCompleting(false);
    }
  }, [consultation, consultationData, options, toast, updateMutation, endMutation, navigate]);

  const cancel = useCallback(() => {
    navigate(`/patients/${options.patientId}/home`);
  }, [navigate, options.patientId]);

  return {
    consultation,
    updateField,
    addDocument,
    removeDocument,
    save,
    complete,
    cancel,
    isSaving: isSaving || updateMutation.isPending,
    isCompleting: isCompleting || endMutation.isPending,
    canComplete: consultation.reason.trim().length > 0
  };
}
