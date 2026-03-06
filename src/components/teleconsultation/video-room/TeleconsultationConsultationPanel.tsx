/**
 * TeleconsultationConsultationPanel - Full consultation workspace embedded in teleconsultation
 * Adapts ObservationPanel and CarePlanPanel content for sidebar-width layout.
 * Creates/loads an in-progress consultation linked to the teleconsultation's patient.
 *
 * Key fix: uses disableNavigate so completing a consultation does NOT leave the VideoRoom.
 * Key fix: tracks local consultation ID for mock/demo mode when Supabase is unavailable.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  CheckCircle2,
  Loader2,
  Stethoscope,
  FileText,
  ClipboardList,
  Pill,
  FlaskConical,
  Mail,
  ImageIcon,
  FolderOpen,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useConsultation } from '@/hooks/useConsultation';
import {
  useActiveConsultation,
  useCreateConsultation,
} from '@/hooks/data/useConsultations';
import { useUpdateTeleconsultation } from '@/hooks/data/useTeleconsultation';
import { supabase } from '@/integrations/supabase/client';
import type { TeleconsultationWithRelations } from '@/types/teleconsultation';

interface TeleconsultationConsultationPanelProps {
  teleconsultation: TeleconsultationWithRelations;
  teleconsultationId: string;
}

const CONSULTATION_TEMPLATES = [
  { id: 'consultation-generale', name: 'Consultation generale' },
  { id: 'suivi', name: 'Consultation de suivi' },
  { id: 'urgence', name: 'Consultation d\'urgence' },
  { id: 'renouvellement', name: 'Renouvellement ordonnance' },
  { id: 'pediatrie', name: 'Consultation pediatrique' },
];

export function TeleconsultationConsultationPanel({
  teleconsultation: tc,
  teleconsultationId,
}: TeleconsultationConsultationPanelProps) {
  const patientId = tc.patient_id;
  const [isCreating, setIsCreating] = useState(false);

  // Track locally-created consultation ID (for mock/demo mode)
  const [localConsultationId, setLocalConsultationId] = useState<string | null>(null);

  // Check for existing active consultation from Supabase
  const { data: activeConsultation, isLoading: loadingActive } = useActiveConsultation(patientId);
  const createConsultationMutation = useCreateConsultation();
  const updateTcMutation = useUpdateTeleconsultation();

  // Determine if we have a consultation (from Supabase OR locally created)
  const consultationId = activeConsultation?.id || localConsultationId || tc.consultation_id || undefined;
  const hasConsultation = !!consultationId;

  // useConsultation with disableNavigate to stay in VideoRoom
  const {
    consultation,
    updateField,
    save,
    complete,
    isSaving,
    isCompleting,
    canComplete,
  } = useConsultation({
    patientId,
    consultationId,
    disableNavigate: true,
  });

  // Create consultation handler
  const handleCreateConsultation = useCallback(async () => {
    if (isCreating || hasConsultation) return;
    setIsCreating(true);

    try {
      // Try to get practitioner info
      let practitionerId = tc.practitioner_id || 'pract-1';
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: pract } = await supabase
            .from('practitioners')
            .select('id')
            .eq('user_id', userData.user.id)
            .single();
          if (pract) practitionerId = pract.id;
        }
      } catch {
        // Use default practitioner in demo mode
      }

      const result = await createConsultationMutation.mutateAsync({
        patient_id: patientId,
        practitioner_id: practitionerId,
        status: 'in-progress',
      });

      if (result?.id) {
        // Track the ID locally so the panel transitions to consultation mode
        setLocalConsultationId(result.id);

        // Link consultation to teleconsultation
        updateTcMutation.mutate({
          id: teleconsultationId,
          updates: { consultation_id: result.id },
        });

        toast.success('Consultation demarree');
      }
    } catch {
      toast.error('Erreur lors de la creation de la consultation');
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, hasConsultation, patientId, tc.practitioner_id, teleconsultationId, createConsultationMutation, updateTcMutation]);

  // Pre-fill reason from teleconsultation
  useEffect(() => {
    if (consultation && !consultation.reason && tc.consultation_reason) {
      updateField('reason', tc.consultation_reason);
    }
  }, [consultation, tc.consultation_reason, updateField]);

  // Loading state
  if (loadingActive && !localConsultationId) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  // No active consultation - show create button
  if (!hasConsultation) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Stethoscope className="h-7 w-7 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-1">
          Aucune consultation en cours
        </h3>
        <p className="text-xs text-gray-400 mb-4 max-w-[280px]">
          Demarrez une consultation pour documenter l'observation medicale, creer des ordonnances et gerer le plan de soins.
        </p>
        <Button
          onClick={handleCreateConsultation}
          disabled={isCreating || createConsultationMutation.isPending}
          className="gap-1.5"
          size="sm"
        >
          {(isCreating || createConsultationMutation.isPending) ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          Demarrer la consultation
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header with save/complete actions */}
      <div className="flex-shrink-0 px-4 py-2.5 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-white">Consultation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1 border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
            onClick={() => save()}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Save className="h-3 w-3" />
            )}
            Sauvegarder
          </Button>
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => complete()}
            disabled={isCompleting || !canComplete}
          >
            {isCompleting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3" />
            )}
            Terminer
          </Button>
        </div>
      </div>

      {/* Tabbed content: Observation / Plan de soins */}
      <Tabs defaultValue="observation" className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-shrink-0 border-b border-gray-700 px-3 pt-1.5">
          <TabsList className="w-full bg-gray-700/50 h-8">
            <TabsTrigger
              value="observation"
              className="flex-1 text-xs text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600 h-6 gap-1"
            >
              <ClipboardList className="h-3 w-3" />
              Observation
            </TabsTrigger>
            <TabsTrigger
              value="careplan"
              className="flex-1 text-xs text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-600 h-6 gap-1"
            >
              <Pill className="h-3 w-3" />
              Plan de soins
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Observation Tab */}
        <TabsContent value="observation" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {/* Template selector */}
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">Modele</Label>
                <Select
                  value={consultation.templateId || ''}
                  onValueChange={(value) => {
                    const tpl = CONSULTATION_TEMPLATES.find((t) => t.id === value);
                    updateField('templateId', value);
                    updateField('templateName', tpl?.name || '');
                  }}
                >
                  <SelectTrigger className="h-8 text-xs bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Selectionner un modele..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSULTATION_TEMPLATES.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id} className="text-xs">
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Motif */}
              <ConsultationField
                label="Motif de consultation *"
                value={consultation.reason}
                onChange={(v) => updateField('reason', v)}
                placeholder="Motif principal de la consultation..."
                rows={2}
              />

              {/* Interrogatoire */}
              <ConsultationField
                label="Interrogatoire / Anamnese"
                value={consultation.anamnesis}
                onChange={(v) => updateField('anamnesis', v)}
                placeholder="Histoire de la maladie, antecedents..."
                rows={3}
              />

              {/* Examen clinique */}
              <ConsultationField
                label="Examen clinique"
                value={consultation.examination}
                onChange={(v) => updateField('examination', v)}
                placeholder="Observations cliniques, signes vitaux..."
                rows={3}
              />

              {/* Diagnostic */}
              <ConsultationField
                label="Diagnostic"
                value={consultation.diagnosis}
                onChange={(v) => updateField('diagnosis', v)}
                placeholder="Diagnostic principal et secondaire..."
                rows={2}
              />

              {/* Plan de traitement */}
              <ConsultationField
                label="Plan de traitement"
                value={consultation.treatmentPlan}
                onChange={(v) => updateField('treatmentPlan', v)}
                placeholder="Prescriptions, recommandations..."
                rows={3}
              />

              {/* Consignes de suivi */}
              <ConsultationField
                label="Consignes de suivi"
                value={consultation.followUpInstructions}
                onChange={(v) => updateField('followUpInstructions', v)}
                placeholder="Prochaine consultation, surveillance..."
                rows={2}
              />

              {/* Conclusion */}
              <ConsultationField
                label="Conclusion / Notes"
                value={consultation.conclusion}
                onChange={(v) => updateField('conclusion', v)}
                placeholder="Synthese, remarques..."
                rows={2}
              />
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Care Plan Tab */}
        <TabsContent value="careplan" className="flex-1 overflow-hidden mt-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              <CarePlanAction
                icon={Pill}
                label="Ordonnance pharmaceutique"
                description="Creer une prescription medicamenteuse"
                onClick={() => toast.info('Ouverture du module ordonnance...')}
              />
              <CarePlanAction
                icon={FlaskConical}
                label="Biologie"
                description="Demander des examens biologiques"
                onClick={() => toast.info('Ouverture du module biologie...')}
              />
              <CarePlanAction
                icon={Mail}
                label="Courrier"
                description="Rediger un courrier medical"
                onClick={() => toast.info('Ouverture du module courrier...')}
              />
              <CarePlanAction
                icon={ImageIcon}
                label="Imagerie"
                description="Demander des examens d'imagerie"
                onClick={() => toast.info('Ouverture du module imagerie...')}
              />

              <Separator className="bg-gray-700 my-2" />

              <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-2">
                Documents de la consultation
              </div>

              {consultation.documents.length === 0 ? (
                <div className="text-center py-6">
                  <FolderOpen className="h-6 w-6 mx-auto text-gray-600 mb-1.5" />
                  <p className="text-xs text-gray-500">Aucun document</p>
                </div>
              ) : (
                consultation.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-gray-700/50 rounded-md p-2.5 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-xs text-gray-200 truncate flex-1">
                      {doc.title || doc.id}
                    </span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Compact consultation text field for sidebar layout
function ConsultationField({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <div>
      <Label className="text-xs text-gray-400 mb-1 block">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="text-sm bg-gray-700 border-gray-600 text-white placeholder:text-gray-500 resize-none"
      />
    </div>
  );
}

// Care plan action button
function CarePlanAction({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-700/50 hover:bg-gray-700 rounded-md p-3 flex items-start gap-3 transition-colors text-left"
    >
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-200">{label}</p>
        <p className="text-[11px] text-gray-500">{description}</p>
      </div>
    </button>
  );
}
