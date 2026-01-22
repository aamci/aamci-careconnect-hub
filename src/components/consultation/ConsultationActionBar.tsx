/**
 * Barre d'actions de la consultation
 * Annuler, Sauvegarder, Terminer, Facturer
 */

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ConsultationActionBarProps {
  onCancel: () => void;
  onSave: () => void;
  onComplete: () => void;
  isSaving?: boolean;
  isCompleting?: boolean;
  canComplete?: boolean;
}

export function ConsultationActionBar({
  onCancel,
  onSave,
  onComplete,
  isSaving = false,
  isCompleting = false,
  canComplete = false
}: ConsultationActionBarProps) {
  return (
    <div className="sticky bottom-0 border-t bg-background p-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving || isCompleting}
          className="sm:w-auto"
        >
          Annuler
        </Button>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={onSave}
            disabled={isSaving || isCompleting}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder
          </Button>

          <Button
            onClick={onComplete}
            disabled={!canComplete || isSaving || isCompleting}
          >
            {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Terminer
          </Button>

          <Button
            variant="secondary"
            disabled={isSaving || isCompleting}
          >
            Facturer
          </Button>
        </div>
      </div>
    </div>
  );
}
