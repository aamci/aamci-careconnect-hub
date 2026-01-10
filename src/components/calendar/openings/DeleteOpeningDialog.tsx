import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertTriangle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { type PractitionerOpening } from '@/services/supabase/openingsService';

interface DeleteOpeningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  opening: PractitionerOpening;
  onConfirm: (choice: 'single' | 'future' | 'series') => void;
}

const DeleteOpeningDialog: React.FC<DeleteOpeningDialogProps> = ({
  isOpen,
  onClose,
  opening,
  onConfirm,
}) => {
  const [choice, setChoice] = useState<'single' | 'future' | 'series'>('single');
  const isRecurring = opening?.isRecurring && opening?.seriesId;

  const handleConfirm = () => {
    onConfirm(choice);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Supprimer la plage d'ouverture
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              <strong>Attention :</strong> Cette action est irréversible. 
              Les rendez-vous existants sur cette plage resteront actifs et ne seront pas supprimés.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Plage du <strong>{opening && format(opening.openingDate, 'EEEE d MMMM yyyy', { locale: fr })}</strong>
              {' '}de <strong>{opening?.startTime}</strong> à <strong>{opening?.endTime}</strong>
            </p>
          </div>

          {isRecurring ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Cette plage fait partie d'une série récurrente. Que souhaitez-vous supprimer ?</p>
              
              <RadioGroup value={choice} onValueChange={(v: any) => setChoice(v)} className="space-y-2">
                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="single" id="delete-single" />
                  <Label htmlFor="delete-single" className="flex-1 cursor-pointer">
                    <span className="font-medium">Cette occurrence uniquement</span>
                    <p className="text-xs text-muted-foreground">
                      Supprime uniquement le {format(opening.openingDate, 'd MMMM', { locale: fr })}
                    </p>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="future" id="delete-future" />
                  <Label htmlFor="delete-future" className="flex-1 cursor-pointer">
                    <span className="font-medium">Cette occurrence et les futures</span>
                    <p className="text-xs text-muted-foreground">
                      Supprime à partir du {format(opening.openingDate, 'd MMMM', { locale: fr })}
                    </p>
                  </Label>
                </div>

                <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="series" id="delete-series" />
                  <Label htmlFor="delete-series" className="flex-1 cursor-pointer">
                    <span className="font-medium">Toute la série</span>
                    <p className="text-xs text-muted-foreground">
                      Supprime toutes les occurrences passées et futures
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          ) : (
            <p className="text-sm">
              Êtes-vous sûr de vouloir supprimer cette plage d'ouverture ?
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
          >
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteOpeningDialog;
