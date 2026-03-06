/**
 * StatusWorkflowBadge - Badge with tooltip explaining teleconsultation status workflow
 * Reusable across list page, detail panel, video room, patient home
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { TeleconsultationStatus } from '@/types/teleconsultation';

interface StatusWorkflowBadgeProps {
  status: TeleconsultationStatus;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<
  TeleconsultationStatus,
  {
    label: string;
    description: string;
    trigger: string;
    bgClass: string;
    textClass: string;
    dotClass: string;
    animate: boolean;
  }
> = {
  scheduled: {
    label: 'Planifiee',
    description: 'La teleconsultation est planifiee mais n\'a pas encore commence.',
    trigger: 'Creee depuis le planning lors de la prise de rendez-vous.',
    bgClass: 'bg-blue-50 border-blue-200',
    textClass: 'text-blue-700',
    dotClass: 'bg-blue-500',
    animate: false,
  },
  waiting: {
    label: 'En attente',
    description: 'Le patient est connecte et attend que le praticien rejoigne la session.',
    trigger: 'Le patient a rejoint la salle d\'attente virtuelle.',
    bgClass: 'bg-amber-50 border-amber-200',
    textClass: 'text-amber-700',
    dotClass: 'bg-amber-500',
    animate: true,
  },
  ready: {
    label: 'Pret',
    description: 'Les deux participants sont connectes et prets a demarrer.',
    trigger: 'Le praticien et le patient sont tous les deux presents.',
    bgClass: 'bg-teal-50 border-teal-200',
    textClass: 'text-teal-700',
    dotClass: 'bg-teal-500',
    animate: true,
  },
  in_progress: {
    label: 'En cours',
    description: 'La consultation video est active et en cours.',
    trigger: 'Le praticien a lance la session video.',
    bgClass: 'bg-green-50 border-green-200',
    textClass: 'text-green-700',
    dotClass: 'bg-green-500',
    animate: true,
  },
  paused: {
    label: 'En pause',
    description: 'La consultation est temporairement suspendue.',
    trigger: 'Le praticien a mis la session en pause.',
    bgClass: 'bg-amber-50 border-amber-200',
    textClass: 'text-amber-600',
    dotClass: 'bg-amber-400',
    animate: false,
  },
  completed: {
    label: 'Terminee',
    description: 'La consultation a ete finalisee avec succes.',
    trigger: 'Le praticien a clique "Terminer et quitter".',
    bgClass: 'bg-gray-50 border-gray-200',
    textClass: 'text-gray-600',
    dotClass: 'bg-gray-400',
    animate: false,
  },
  cancelled: {
    label: 'Annulee',
    description: 'La consultation a ete annulee avant d\'avoir lieu.',
    trigger: 'Le praticien ou le systeme a annule la session.',
    bgClass: 'bg-red-50 border-red-200',
    textClass: 'text-red-600',
    dotClass: 'bg-red-400',
    animate: false,
  },
  failed: {
    label: 'Echouee',
    description: 'La consultation n\'a pas pu avoir lieu pour raison technique.',
    trigger: 'Echec de connexion ou probleme technique majeur.',
    bgClass: 'bg-red-50 border-red-200',
    textClass: 'text-red-600',
    dotClass: 'bg-red-400',
    animate: false,
  },
};

export function StatusWorkflowBadge({
  status,
  size = 'sm',
  showTooltip = true,
  className,
}: StatusWorkflowBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;

  const badge = (
    <Badge
      variant="outline"
      className={cn(
        'gap-1.5 font-medium border',
        config.bgClass,
        config.textClass,
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full flex-shrink-0',
          config.dotClass,
          config.animate && 'animate-pulse'
        )}
      />
      {config.label}
    </Badge>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="max-w-xs p-3 space-y-1.5"
        >
          <p className="text-sm font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
          <p className="text-xs text-muted-foreground/80 italic">
            Declencheur : {config.trigger}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export { STATUS_CONFIG };
