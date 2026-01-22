/**
 * Dialog de confirmation de suppression de document
 * Gère les cas particuliers (CERFA, documents signés, etc.)
 */

import { AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Document } from '@/types/document';

interface DeleteDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteDocumentDialog({
  open,
  onClose,
  document,
  onConfirm,
  isDeleting = false
}: DeleteDocumentDialogProps) {
  if (!document) return null;

  const isCERFA = document.subcategory === 'cerfa';
  const isSigned = document.isSigned;

  const getWarningMessage = () => {
    if (isCERFA) {
      return "Attention ! ce document a déjà été enregistré comme CERFA, voulez-vous quand même l'annuler ?";
    }

    if (isSigned) {
      return "Attention ! ce document est signé électroniquement. Sa suppression est définitive et sera tracée dans l'audit log.";
    }

    return 'Attention ! Supprimer ce document est définitif. Il sera retiré de la consultation et du dossier patient.';
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {isCERFA ? 'Annuler ce document' : 'Supprimer ce document'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{getWarningMessage()}</p>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">{document.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{document.filename}</p>
            </div>

            {(isCERFA || isSigned) && (
              <p className="text-sm mt-4">
                Voulez-vous continuer ?
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {isCERFA ? 'Conserver le document' : 'Annuler'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
