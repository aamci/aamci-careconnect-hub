import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export type ModifyScope = 'single' | 'future' | 'series';

interface ModifyScopeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scope: ModifyScope) => void;
  isRecurring: boolean;
}

const ModifyScopeDialog: React.FC<ModifyScopeDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isRecurring,
}) => {
  const [selectedScope, setSelectedScope] = useState<ModifyScope>('single');

  const handleConfirm = () => {
    onConfirm(selectedScope);
    onClose();
  };

  // If not recurring, auto-confirm with single
  React.useEffect(() => {
    if (isOpen && !isRecurring) {
      onConfirm('single');
      onClose();
    }
  }, [isOpen, isRecurring, onConfirm, onClose]);

  if (!isRecurring) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Modifier la plage d'ouverture
          </AlertDialogTitle>
          <AlertDialogDescription className="text-foreground">
            Cette plage fait partie d'une série récurrente. Quelle portée souhaitez-vous appliquer à vos modifications ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <RadioGroup
            value={selectedScope}
            onValueChange={(v) => setSelectedScope(v as ModifyScope)}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="single" id="modify-single" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="modify-single" className="font-medium cursor-pointer">
                  Cette occurrence uniquement
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Modifie uniquement cette plage spécifique, sans affecter les autres occurrences de la série.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="future" id="modify-future" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="modify-future" className="font-medium cursor-pointer">
                  Cette occurrence et les futures
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Applique les modifications à cette plage et à toutes les occurrences futures de la série.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
              <RadioGroupItem value="series" id="modify-series" className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor="modify-series" className="font-medium cursor-pointer">
                  Toute la série
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Applique les modifications à toutes les occurrences de la série, passées et futures.
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
          <p className="text-amber-800 dark:text-amber-200">
            <strong>Note :</strong> Les rendez-vous déjà pris ne seront pas affectés par cette modification.
          </p>
        </div>

        <AlertDialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleConfirm}
            className="bg-amber-400 hover:bg-amber-500 text-amber-950"
          >
            Appliquer les modifications
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ModifyScopeDialog;
