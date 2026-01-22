/**
 * Hook de gestion d'une consultation
 * État, documents, prescriptions, actions
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/document';

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
    setIsSaving(true);
    try {
      if (options.onSave) {
        await options.onSave(consultation);
      } else {
        const response = await fetch('/api/consultations', {
          method: consultation.id.startsWith('temp-') ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(consultation)
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde');
        }

        const saved = await response.json();
        setConsultation(saved);
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
  }, [consultation, options, toast]);

  const complete = useCallback(async () => {
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
      const completedConsultation = {
        ...consultation,
        status: 'completed' as const,
        endedAt: new Date()
      };

      if (options.onComplete) {
        await options.onComplete(completedConsultation);
      } else {
        const response = await fetch(`/api/consultations/${consultation.id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(completedConsultation)
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la finalisation');
        }
      }

      toast({
        title: 'Consultation terminée',
        description: 'La consultation a été finalisée avec succès.'
      });

      setConsultation(completedConsultation);
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
  }, [consultation, options, toast]);

  const cancel = useCallback(() => {
    setConsultation(prev => ({
      ...prev,
      status: 'canceled'
    }));
  }, []);

  return {
    consultation,
    updateField,
    addDocument,
    removeDocument,
    save,
    complete,
    cancel,
    isSaving,
    isCompleting,
    canComplete: consultation.reason.trim().length > 0
  };
}
