/**
 * PatientStatusBadges - Badges de statut médico-administratif patient
 *
 * P0-004: Affiche les badges importants pour le statut patient:
 * - ALD (Affection de Longue Durée) - couverture 100%
 * - Patient fragile (multi-critères)
 * - Dispositifs médicaux implantés
 * - Contre-indication IRM
 */

import React, { useMemo } from 'react';
import {
  Shield,
  HeartPulse,
  Cpu,
  Ban,
  AlertTriangle,
  Baby,
  Clock,
  Stethoscope,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  usePatientConditions,
  usePatientDevices,
  usePatientHasALD,
  usePatientHasMRIIncompatibleDevice,
} from '@/hooks/data/useMedicalHistory';
import { usePatientAllergies } from '@/hooks/data/useAllergies';
import { cn } from '@/lib/utils';
import { differenceInYears } from 'date-fns';

interface PatientStatusBadgesProps {
  patientId: string;
  /** Date de naissance du patient pour calcul d'âge */
  dateOfBirth?: Date;
  /** Mode d'affichage compact (icône seule) ou normal */
  compact?: boolean;
  /** Orientation: horizontal (default) ou vertical */
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

interface StatusBadgeConfig {
  id: string;
  icon: React.ElementType;
  label: string;
  shortLabel: string;
  description: string;
  variant: 'ald' | 'fragile' | 'device' | 'warning' | 'info';
  priority: number;
}

const variantStyles = {
  ald: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-50',
  fragile: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-50',
  device: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-50',
  warning: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-50',
  info: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-50',
};

const PatientStatusBadges: React.FC<PatientStatusBadgesProps> = ({
  patientId,
  dateOfBirth,
  compact = false,
  orientation = 'horizontal',
  className,
}) => {
  // Data hooks
  const hasALD = usePatientHasALD(patientId);
  const hasMRIIncompatible = usePatientHasMRIIncompatibleDevice(patientId);
  const { data: conditions, isLoading: loadingConditions } = usePatientConditions(patientId);
  const { data: devices, isLoading: loadingDevices } = usePatientDevices(patientId);
  const { data: allergies, isLoading: loadingAllergies } = usePatientAllergies(patientId);

  // Calculate patient age
  const patientAge = useMemo(() => {
    if (!dateOfBirth) return null;
    return differenceInYears(new Date(), new Date(dateOfBirth));
  }, [dateOfBirth]);

  // Determine fragile status based on multiple criteria
  const fragileStatus = useMemo(() => {
    const reasons: string[] = [];

    // Age criteria
    if (patientAge !== null) {
      if (patientAge >= 75) {
        reasons.push('Âge ≥ 75 ans');
      } else if (patientAge <= 3) {
        reasons.push('Nourrisson/jeune enfant');
      }
    }

    // Multi-morbidity (3+ active conditions)
    const activeConditions = conditions?.filter(c => c.clinicalStatus === 'active') ?? [];
    if (activeConditions.length >= 3) {
      reasons.push(`${activeConditions.length} pathologies actives`);
    }

    // Critical severity conditions
    const criticalConditions = activeConditions.filter(c => c.severity === 'critical');
    if (criticalConditions.length > 0) {
      reasons.push(`${criticalConditions.length} pathologie(s) critique(s)`);
    }

    // High-severity allergies
    const criticalAllergies = allergies?.filter(a => a.severity === 'critical' || a.severity === 'high') ?? [];
    if (criticalAllergies.length >= 2) {
      reasons.push(`${criticalAllergies.length} allergies sévères`);
    }

    // Active medical devices
    const activeDevices = devices?.filter(d => d.isActive) ?? [];
    if (activeDevices.length >= 2) {
      reasons.push(`${activeDevices.length} dispositifs implantés`);
    }

    return {
      isFragile: reasons.length >= 1,
      reasons,
    };
  }, [patientAge, conditions, allergies, devices]);

  // Build active badges list
  const activeBadges = useMemo(() => {
    const badges: StatusBadgeConfig[] = [];

    // ALD badge
    if (hasALD) {
      const aldConditions = conditions?.filter(c => c.isAld && c.clinicalStatus === 'active') ?? [];
      badges.push({
        id: 'ald',
        icon: Shield,
        label: 'ALD',
        shortLabel: 'ALD',
        description: aldConditions.length > 0
          ? `${aldConditions.length} ALD active(s): ${aldConditions.map(c => c.title).join(', ')}`
          : 'Affection de Longue Durée',
        variant: 'ald',
        priority: 1,
      });
    }

    // Fragile patient badge
    if (fragileStatus.isFragile) {
      badges.push({
        id: 'fragile',
        icon: HeartPulse,
        label: 'Patient fragile',
        shortLabel: 'Fragile',
        description: `Critères: ${fragileStatus.reasons.join(', ')}`,
        variant: 'fragile',
        priority: 2,
      });
    }

    // MRI incompatible badge
    if (hasMRIIncompatible) {
      badges.push({
        id: 'mri',
        icon: Ban,
        label: 'CI IRM',
        shortLabel: 'CI IRM',
        description: 'Contre-indication IRM (dispositif non compatible)',
        variant: 'warning',
        priority: 3,
      });
    }

    // Implanted devices badge (if not already showing MRI warning)
    const activeDevices = devices?.filter(d => d.isActive) ?? [];
    if (activeDevices.length > 0 && !hasMRIIncompatible) {
      badges.push({
        id: 'devices',
        icon: Cpu,
        label: `${activeDevices.length} dispositif${activeDevices.length > 1 ? 's' : ''}`,
        shortLabel: `${activeDevices.length} DM`,
        description: `Dispositifs: ${activeDevices.map(d => d.deviceName).join(', ')}`,
        variant: 'device',
        priority: 4,
      });
    }

    // Pediatric indicator
    if (patientAge !== null && patientAge <= 18 && patientAge > 3) {
      badges.push({
        id: 'pediatric',
        icon: Baby,
        label: 'Pédiatrique',
        shortLabel: 'Pédia',
        description: `Patient pédiatrique (${patientAge} ans)`,
        variant: 'info',
        priority: 5,
      });
    }

    // Geriatric indicator (if not already fragile)
    if (patientAge !== null && patientAge >= 65 && patientAge < 75 && !fragileStatus.isFragile) {
      badges.push({
        id: 'geriatric',
        icon: Clock,
        label: 'Senior',
        shortLabel: 'Senior',
        description: `Patient senior (${patientAge} ans)`,
        variant: 'info',
        priority: 6,
      });
    }

    // Sort by priority
    return badges.sort((a, b) => a.priority - b.priority);
  }, [hasALD, fragileStatus, hasMRIIncompatible, conditions, devices, patientAge]);

  // Loading state
  if (loadingConditions || loadingDevices || loadingAllergies) {
    return null;
  }

  // No badges to show
  if (activeBadges.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex gap-1.5',
        orientation === 'vertical' ? 'flex-col items-start' : 'flex-row flex-wrap items-center',
        className
      )}
    >
      {activeBadges.map((badge) => (
        <StatusBadge key={badge.id} config={badge} compact={compact} />
      ))}
    </div>
  );
};

// Individual badge component
interface StatusBadgeProps {
  config: StatusBadgeConfig;
  compact: boolean;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ config, compact }) => {
  const Icon = config.icon;

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 cursor-default transition-colors border',
        variantStyles[config.variant],
        compact ? 'px-1.5 py-0.5' : 'px-2 py-0.5'
      )}
    >
      <Icon className={cn('flex-shrink-0', compact ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {!compact && (
        <span className="text-xs font-medium">{config.shortLabel}</span>
      )}
    </Badge>
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium text-sm">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

export default PatientStatusBadges;
