/**
 * Barre d'actions de la consultation
 * Annuler, Sauvegarder, Terminer, Facturer
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    onCancel();
  };

  const handleBilling = () => {
    toast({
      title: 'Facturation',
      description: 'La fonctionnalité de facturation sera bientôt disponible.'
    });
  };

  return (
    <>
      <div className="sticky bottom-0 border-t bg-background p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            onClick={handleCancelClick}
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
              onClick={handleBilling}
              disabled={isSaving || isCompleting}
            >
              Facturer
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Annuler la consultation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les modifications non sauvegardées seront perdues. Êtes-vous sûr de vouloir quitter sans sauvegarder ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuer la consultation</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel}>
              Oui, annuler
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
