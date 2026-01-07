/**
 * PatientAllergiesBadge - Affiche les allergies d'un patient de manière compacte
 * Utilise les données réelles de Supabase via le hook usePatientAllergies
 */

import React from 'react';
import { AlertTriangle, Pill, Leaf, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePatientAllergies } from '@/hooks/data/useAllergies';
import { cn } from '@/lib/utils';

interface PatientAllergiesBadgeProps {
  patientId: string;
  compact?: boolean;
  className?: string;
}

const severityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
};

const categoryIcons = {
  medication: Pill,
  food: Utensils,
  environmental: Leaf,
  material: AlertTriangle,
  other: AlertTriangle,
};

const PatientAllergiesBadge: React.FC<PatientAllergiesBadgeProps> = ({
  patientId,
  compact = false,
  className,
}) => {
  const { data: allergies, isLoading } = usePatientAllergies(patientId);

  if (isLoading) {
    return null;
  }

  if (!allergies || allergies.length === 0) {
    return null;
  }

  if (compact) {
    // Mode compact : affiche un badge avec le nombre d'allergies
    const hasCritical = allergies.some(a => a.severity === 'critical');
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={cn(
              'gap-1 cursor-pointer',
              hasCritical ? 'border-destructive/50 text-destructive bg-destructive/5' : 'border-orange-500/50 text-orange-600 bg-orange-50',
              className
            )}
          >
            <AlertTriangle className="w-3 h-3" />
            {allergies.length} allergie{allergies.length > 1 ? 's' : ''}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            {allergies.map(allergy => (
              <div key={allergy.id} className="flex items-center gap-2 text-sm">
                <span className={cn(
                  'w-2 h-2 rounded-full',
                  allergy.severity === 'critical' ? 'bg-red-500' :
                  allergy.severity === 'high' ? 'bg-orange-500' :
                  allergy.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                )} />
                <span className="font-medium">{allergy.allergenName}</span>
                <span className="text-muted-foreground">({allergy.severity})</span>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Mode complet : affiche tous les badges d'allergies
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {allergies.map(allergy => {
        const Icon = categoryIcons[allergy.allergenCategory as keyof typeof categoryIcons] || AlertTriangle;
        return (
          <Tooltip key={allergy.id}>
            <TooltipTrigger asChild>
              <Badge 
                variant="outline"
                className={cn(
                  'gap-1.5 cursor-pointer transition-colors',
                  severityColors[allergy.severity]
                )}
              >
                <Icon className="w-3 h-3" />
                {allergy.allergenName}
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="space-y-1 text-sm">
                <div><strong>Sévérité:</strong> {allergy.severity}</div>
                {allergy.reactionDescription && (
                  <div><strong>Réaction:</strong> {allergy.reactionDescription}</div>
                )}
                <div><strong>Source:</strong> {allergy.source}</div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};

export default PatientAllergiesBadge;
