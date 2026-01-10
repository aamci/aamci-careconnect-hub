import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AlertCircle, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CancelSubstituteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  agendaName: string;
  onConfirm: () => void;
}

const CancelSubstituteDialog: React.FC<CancelSubstituteDialogProps> = ({
  isOpen,
  onClose,
  date,
  agendaName,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Annuler le remplacement</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-800">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p>
                  Vous allez retirer le remplaçant prévu{' '}
                  <strong>
                    le {format(date, 'EEEE d MMMM', { locale: fr })} sur l'agenda {agendaName}
                  </strong>
                  . Tous les rendez-vous prévus seront donc assurés par le praticien détenteur 
                  de cet agenda.
                </p>
                <p>
                  Les patients seront informés de ce changement sur doctolib.fr et dans les 
                  communications liées à ces rendez-vous.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            VALIDER
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CancelSubstituteDialog;
