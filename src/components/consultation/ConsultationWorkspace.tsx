/**
 * Espace de travail de consultation
 * Observation médicale + Plan de soins avec documents
 */

import { useState } from 'react';
import { Patient } from '@/types';
import { useConsultation } from '@/hooks/useConsultation';
import { ObservationPanel } from './ObservationPanel';
import { CarePlanPanel } from './CarePlanPanel';
import { ConsultationActionBar } from './ConsultationActionBar';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface ConsultationWorkspaceProps {
  patient: Patient;
  consultationId?: string;
}

export function ConsultationWorkspace({
  patient,
  consultationId
}: ConsultationWorkspaceProps) {
  const breakpoint = useBreakpoint();
  const [showCarePlanDrawer, setShowCarePlanDrawer] = useState(false);

  const {
    consultation,
    updateField,
    addDocument,
    removeDocument,
    save,
    complete,
    cancel,
    isSaving,
    isCompleting,
    canComplete
  } = useConsultation({
    patientId: patient.id,
    consultationId
  });

  const isDesktop = ['laptop', 'desktop', 'wide'].includes(breakpoint);

  return (
    <div className="flex flex-col h-full">
      {/* Layout principal */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Zone centrale - Observation médicale */}
        <div className="flex-1 overflow-y-auto">
          <ObservationPanel
            consultation={consultation}
            onUpdate={updateField}
            onToggleCarePlan={() => setShowCarePlanDrawer(true)}
            showCarePlanButton={!isDesktop}
          />
        </div>

        {/* Zone droite - Plan de soins (Desktop) */}
        {isDesktop && (
          <div className="w-[400px] overflow-y-auto border-l">
            <CarePlanPanel
              consultation={consultation}
              patient={patient}
              onAddDocument={addDocument}
              onRemoveDocument={removeDocument}
            />
          </div>
        )}
      </div>

      {/* Drawer Plan de soins (Mobile/Tablet) */}
      {!isDesktop && (
        <Sheet open={showCarePlanDrawer} onOpenChange={setShowCarePlanDrawer}>
          <SheetContent side="right" className="w-full sm:w-[400px]">
            <CarePlanPanel
              consultation={consultation}
              patient={patient}
              onAddDocument={addDocument}
              onRemoveDocument={removeDocument}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Barre d'actions */}
      <ConsultationActionBar
        onCancel={cancel}
        onSave={save}
        onComplete={complete}
        isSaving={isSaving}
        isCompleting={isCompleting}
        canComplete={canComplete}
      />
    </div>
  );
}
