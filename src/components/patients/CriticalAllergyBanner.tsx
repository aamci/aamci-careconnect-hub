/**
 * CriticalAllergyBanner - Bannière d'alerte pour allergies critiques/life-threatening
 *
 * P0-003: Affiche de manière prominente les allergies à haut risque vital
 * - Sticky en haut de la page HOME
 * - Visible immédiatement à l'ouverture du dossier
 * - Style rouge/destructive pour urgence visuelle maximale
 */

import React from 'react';
import { AlertTriangle, ShieldAlert, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePatientAllergies, type PatientAllergy } from '@/hooks/data/useAllergies';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface CriticalAllergyBannerProps {
  patientId: string;
  className?: string;
  /** Compact mode for smaller display */
  compact?: boolean;
  /** Callback when user acknowledges the alert */
  onAcknowledge?: () => void;
}

const CriticalAllergyBanner: React.FC<CriticalAllergyBannerProps> = ({
  patientId,
  className,
  compact = false,
  onAcknowledge,
}) => {
  const navigate = useNavigate();
  const { data: allergies, isLoading } = usePatientAllergies(patientId);

  // Filter for critical/high severity allergies only
  const criticalAllergies = React.useMemo(() => {
    if (!allergies) return [];
    return allergies.filter(
      (a) => a.severity === 'critical' || a.severity === 'high'
    );
  }, [allergies]);

  // Don't render if loading or no critical allergies
  if (isLoading || criticalAllergies.length === 0) {
    return null;
  }

  const hasCritical = criticalAllergies.some(a => a.severity === 'critical');
  const criticalCount = criticalAllergies.filter(a => a.severity === 'critical').length;
  const highCount = criticalAllergies.filter(a => a.severity === 'high').length;

  // Compact mode for sidebar or smaller spaces
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-md border',
          hasCritical
            ? 'bg-destructive/10 border-destructive/30 text-destructive'
            : 'bg-orange-50 border-orange-200 text-orange-700',
          className
        )}
      >
        <ShieldAlert className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs font-medium truncate">
          {criticalAllergies.length} allergie{criticalAllergies.length > 1 ? 's' : ''} {hasCritical ? 'critique' : 'sévère'}{criticalAllergies.length > 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border-2 shadow-sm',
        hasCritical
          ? 'bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10 border-destructive/40'
          : 'bg-gradient-to-r from-orange-50 via-orange-25 to-orange-50 border-orange-300',
        className
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3 p-3 sm:p-4">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 rounded-full p-2',
            hasCritical ? 'bg-destructive/20' : 'bg-orange-100'
          )}
        >
          <ShieldAlert
            className={cn(
              'h-5 w-5',
              hasCritical ? 'text-destructive' : 'text-orange-600'
            )}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                'text-sm font-semibold',
                hasCritical ? 'text-destructive' : 'text-orange-700'
              )}
            >
              {hasCritical ? 'Allergies critiques' : 'Allergies à surveiller'}
            </h3>
            {criticalCount > 0 && (
              <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                {criticalCount} critique{criticalCount > 1 ? 's' : ''}
              </Badge>
            )}
            {highCount > 0 && (
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-xs bg-orange-100 text-orange-700 border-orange-300"
              >
                {highCount} sévère{highCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {/* Allergen list */}
          <div className="flex flex-wrap items-center gap-2">
            {criticalAllergies.slice(0, 4).map((allergy) => (
              <AllergyChip key={allergy.id} allergy={allergy} />
            ))}
            {criticalAllergies.length > 4 && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-6 px-2 text-xs',
                  hasCritical
                    ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                    : 'text-orange-700 hover:text-orange-700 hover:bg-orange-100'
                )}
                onClick={() => navigate('../antecedents')}
              >
                +{criticalAllergies.length - 4} autres
                <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            )}
          </div>

          {/* Warning message for critical */}
          {hasCritical && (
            <p className="mt-2 text-xs text-destructive/80 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Risque vital - Vérifier avant toute prescription
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 px-2 text-xs',
              hasCritical
                ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                : 'text-orange-700 hover:text-orange-700 hover:bg-orange-100'
            )}
            onClick={() => navigate('../antecedents')}
          >
            Voir tout
          </Button>
          {onAcknowledge && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-7 w-7',
                hasCritical
                  ? 'text-destructive/60 hover:text-destructive hover:bg-destructive/10'
                  : 'text-orange-500 hover:text-orange-700 hover:bg-orange-100'
              )}
              onClick={onAcknowledge}
              aria-label="Fermer l'alerte"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-component for individual allergy chip
interface AllergyChipProps {
  allergy: PatientAllergy;
}

const AllergyChip: React.FC<AllergyChipProps> = ({ allergy }) => {
  const isCritical = allergy.severity === 'critical';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border',
        isCritical
          ? 'bg-destructive/15 text-destructive border-destructive/30'
          : 'bg-orange-100 text-orange-800 border-orange-200'
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 rounded-full',
          isCritical ? 'bg-destructive animate-pulse' : 'bg-orange-500'
        )}
      />
      <span className="max-w-[120px] truncate">{allergy.allergenName}</span>
      {allergy.reactionDescription && (
        <span className="text-[10px] opacity-70 max-w-[80px] truncate">
          ({allergy.reactionDescription})
        </span>
      )}
    </div>
  );
};

export default CriticalAllergyBanner;
