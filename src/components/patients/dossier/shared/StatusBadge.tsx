import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type StatusType = 
  | 'active' 
  | 'completed' 
  | 'cancelled' 
  | 'pending' 
  | 'draft' 
  | 'signed' 
  | 'paid'
  | 'overdue'
  | 'abnormal'
  | 'normal'
  | 'reviewed'
  | 'scheduled'
  | 'suspended'
  | 'archived';

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  active: { label: 'Actif', className: 'bg-green-100 text-green-700 border-green-200' },
  completed: { label: 'Terminé', className: 'bg-muted text-muted-foreground border-border' },
  cancelled: { label: 'Annulé', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  pending: { label: 'En attente', className: 'bg-warning/10 text-warning border-warning/20' },
  draft: { label: 'Brouillon', className: 'bg-muted text-muted-foreground border-border' },
  signed: { label: 'Signé', className: 'bg-primary/10 text-primary border-primary/20' },
  paid: { label: 'Payé', className: 'bg-green-100 text-green-700 border-green-200' },
  overdue: { label: 'En retard', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  abnormal: { label: 'Anormal', className: 'bg-destructive/10 text-destructive border-destructive/20' },
  normal: { label: 'Normal', className: 'bg-green-100 text-green-700 border-green-200' },
  reviewed: { label: 'Relu', className: 'bg-primary/10 text-primary border-primary/20' },
  scheduled: { label: 'Planifié', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  suspended: { label: 'Suspendu', className: 'bg-warning/10 text-warning border-warning/20' },
  archived: { label: 'Archivé', className: 'bg-muted text-muted-foreground border-border' },
};

interface StatusBadgeProps {
  status: StatusType;
  customLabel?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customLabel, className }) => {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge 
      variant="outline" 
      className={cn('text-xs font-medium', config.className, className)}
    >
      {customLabel || config.label}
    </Badge>
  );
};

export default StatusBadge;
export type { StatusType };
