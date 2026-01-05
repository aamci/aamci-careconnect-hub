import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConsultationActionBarProps {
  onCancel?: () => void;
  onSaveWithoutBilling?: () => void;
  onSaveAndBill?: () => void;
  isDraft?: boolean;
  isSaving?: boolean;
}

const ConsultationActionBar: React.FC<ConsultationActionBarProps> = ({
  onCancel,
  onSaveWithoutBilling,
  onSaveAndBill,
  isDraft = false,
  isSaving = false
}) => {
  return (
    <div className="h-14 bg-card border-t border-border flex items-center justify-between px-6">
      {/* Left: Cancel */}
      <Button
        variant="ghost"
        onClick={onCancel}
        className="text-muted-foreground hover:text-foreground uppercase tracking-wide text-sm font-medium"
      >
        Annuler
      </Button>

      {/* Right: Save Actions */}
      <div className="flex items-center gap-3">
        {isDraft && (
          <span className="text-xs text-muted-foreground mr-2">
            Modifications non enregistrées
          </span>
        )}
        
        <Button
          onClick={onSaveWithoutBilling}
          disabled={isSaving}
          className="bg-primary hover:bg-primary-light text-primary-foreground uppercase tracking-wide text-sm font-semibold px-6"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer sans facturer'}
        </Button>
      </div>
    </div>
  );
};

export default ConsultationActionBar;
