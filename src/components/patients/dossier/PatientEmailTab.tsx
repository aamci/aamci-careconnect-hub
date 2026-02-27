/**
 * PatientEmailTab - Patient email filtered by patient context
 * Thin wrapper around EmailMode with expand/collapse and patient filtering
 */

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { Maximize2, Minimize2, Mail, MailPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import DossierPageLayout from './shared/DossierPageLayout';
import EmailMode from '@/components/messaging/EmailMode';

interface OutletContext {
  patient: Patient;
}

const PatientEmailTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const [isExpanded, setIsExpanded] = useState(false);

  // Escape to close expanded mode
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only close on Escape if not typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === 'Escape' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        setIsExpanded(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // ── Expanded mode: fills the Outlet area (below header, right of both sidebars) ──

  if (isExpanded) {
    return (
      <div className="absolute inset-0 z-20 bg-background flex flex-col">
        {/* Compact header bar */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card flex-shrink-0">
          <Mail className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold flex-1 truncate">
            Courriel - {patient.firstName} {patient.lastName}
          </h2>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsExpanded(false)}
          >
            <Minimize2 className="h-3.5 w-3.5" />
            Reduire
          </Button>
        </div>

        {/* EmailMode fills the rest */}
        <EmailMode
          patientId={patient.id}
          className="flex-1 min-h-0"
        />
      </div>
    );
  }

  // ── Normal mode: inside DossierPageLayout ──

  return (
    <DossierPageLayout
      patient={patient}
      title="Courriel"
      breadcrumbLabel="Courriel"
      fitScreen
      headerActions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsExpanded(true)}
            title="Agrandir la zone courriel"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Agrandir
          </Button>
        </div>
      }
    >
      <EmailMode
        patientId={patient.id}
        className="h-[calc(100vh-220px)] border border-border rounded-lg"
      />
    </DossierPageLayout>
  );
};

export default PatientEmailTab;
