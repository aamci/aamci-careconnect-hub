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
  diagnosis: string;
  treatmentPlan: string;
  followUpInstructions: string;
  conclusion: string;
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
    diagnosis: '',
    treatmentPlan: '',
    followUpInstructions: '',
    conclusion: '',
    documents: []
  });

  // Sync with real Supabase data
  useEffect(() => {
    if (consultationData && !isLoading) {
      const diagnosisData = consultationData.diagnosis;
      const physicalExam = consultationData.physical_examination;

      // Parse diagnosis JSON if needed
      let diagnosisText = '';
      if (typeof diagnosisData === 'string') {
        diagnosisText = diagnosisData;
      } else if (diagnosisData && typeof diagnosisData === 'object') {
        const d = diagnosisData as Record<string, unknown>;
        diagnosisText = (d.text as string) || (d.description as string) || JSON.stringify(diagnosisData);
      }

      // Parse physical examination JSON if needed
      let examinationText = '';
      if (typeof physicalExam === 'string') {
        examinationText = physicalExam;
      } else if (physicalExam && typeof physicalExam === 'object') {
        const p = physicalExam as Record<string, unknown>;
        examinationText = (p.text as string) || (p.findings as string) || JSON.stringify(physicalExam);
      }

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
        examination: examinationText || consultationData.notes || '',
        diagnosis: diagnosisText,
        treatmentPlan: consultationData.treatment_plan || '',
        followUpInstructions: consultationData.follow_up_instructions || '',
        conclusion: consultationData.notes || '',
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

  const buildUpdates = useCallback(() => {
    return {
      chief_complaint: consultation.reason || null,
      history_of_present_illness: consultation.anamnesis || null,
      notes: consultation.conclusion || consultation.examination || null,
      treatment_plan: consultation.treatmentPlan || null,
      follow_up_instructions: consultation.followUpInstructions || null,
    };
  }, [consultation]);

  const save = useCallback(async () => {
    if (!consultationData) return;

    setIsSaving(true);
    try {
      if (options.onSave) {
        await options.onSave(consultation);
      } else {
        await updateMutation.mutateAsync({
          id: consultationData.id,
          patientId: options.patientId,
          updates: buildUpdates()
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
  }, [consultation, consultationData, options, toast, updateMutation, buildUpdates]);

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
      // Save all fields first
      await updateMutation.mutateAsync({
        id: consultationData.id,
        patientId: options.patientId,
        updates: buildUpdates()
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
  }, [consultation, consultationData, options, toast, updateMutation, endMutation, navigate, buildUpdates]);

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
