/**
 * PatientMessagingTab - Unified messaging for patient dossier
 * Combines Messagerie (chat) and Courrier (email) with mode switcher
 * Mirrors the global MessagesPage layout, filtered by patient
 */

import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import {
  Mail,
  MessageCircle,
  Shield,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageMode } from '@/types/messaging';
import DossierPageLayout from './shared/DossierPageLayout';
import EmailMode from '@/components/messaging/EmailMode';
import ChatMode from '@/components/messaging/ChatMode';

interface OutletContext {
  patient: Patient;
}

const modes: { id: MessageMode; label: string; icon: React.ElementType }[] = [
  { id: 'chat', label: 'Messagerie', icon: MessageCircle },
  { id: 'email', label: 'Courrier', icon: Mail },
];

const PatientMessagingTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const [activeMode, setActiveMode] = useState<MessageMode>('chat');
  const [isExpanded, setIsExpanded] = useState(false);

  // Escape to close expanded mode
  useEffect(() => {
    if (!isExpanded) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (e.key === 'Escape' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        setIsExpanded(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // ── Mode switcher bar (shared between normal and expanded) ──

  const modeSwitcher = (
    <div className="flex items-center gap-1">
      {modes.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            <mode.icon className="h-3.5 w-3.5" />
            <span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );

  // ── Active content ──

  const activeContent = activeMode === 'email' ? (
    <EmailMode patientId={patient.id} />
  ) : (
    <ChatMode patientId={patient.id} />
  );

  // ── Expanded mode: fills the Outlet area ──

  if (isExpanded) {
    return (
      <div className="absolute inset-0 z-20 bg-background flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card flex-shrink-0">
          {modeSwitcher}
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-green-600" />
            <span>Chiffre</span>
          </div>
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

        {/* Content fills remaining space */}
        <div className="flex-1 overflow-hidden">
          {activeContent}
        </div>
      </div>
    );
  }

  // ── Normal mode: inside DossierPageLayout ──

  return (
    <DossierPageLayout
      patient={patient}
      title="Messagerie"
      breadcrumbLabel="Messagerie"
      fitScreen
      headerActions={
        <div className="flex items-center gap-2">
          {modeSwitcher}
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-green-600" />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setIsExpanded(true)}
            title="Agrandir"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            Agrandir
          </Button>
        </div>
      }
    >
      <div className="h-[calc(100vh-220px)] border border-border rounded-lg overflow-hidden">
        {activeContent}
      </div>
    </DossierPageLayout>
  );
};

export default PatientMessagingTab;
