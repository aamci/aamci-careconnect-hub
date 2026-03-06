import React from 'react';
import {
  CheckCircle2,
  Clock,
  User,
  FileText,
  FolderOpen,
  Receipt,
  ClipboardList,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useTeleconsultationNotes,
  useTeleconsultationDocuments,
} from '@/hooks/data/useTeleconsultation';
import type { TeleconsultationWithRelations } from '@/types/teleconsultation';

interface PostConsultationDialogProps {
  teleconsultation: TeleconsultationWithRelations;
  duration: number;
  open: boolean;
  onConfirmEnd: () => void;
  onCancel: () => void;
}

export function PostConsultationDialog({
  teleconsultation: tc,
  duration,
  open,
  onConfirmEnd,
  onCancel,
}: PostConsultationDialogProps) {
  const { data: notes = [] } = useTeleconsultationNotes(tc.id);
  const { data: documents = [] } = useTeleconsultationDocuments(tc.id);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
    return `${minutes} min`;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Fin de consultation
          </DialogTitle>
          <DialogDescription>
            Resume de la teleconsultation avant cloture
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Session summary */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2.5">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {tc.patient?.firstName} {tc.patient?.lastName}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Duree : {formatDuration(duration)}
              </span>
            </div>
            {tc.consultation_reason && (
              <div className="flex items-center gap-2.5">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">
                  {tc.consultation_reason}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Activity recap */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Activite pendant la session
            </h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Notes de consultation</span>
                </div>
                <span className="font-medium">{notes.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span>Documents partages</span>
                </div>
                <span className="font-medium">{documents.length}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Next steps checklist */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Prochaines etapes
            </h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-sm cursor-default">
                <div className="h-4 w-4 rounded border border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground">-</span>
                </div>
                <span className="text-muted-foreground">Ordonnance</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm cursor-default">
                <div className="h-4 w-4 rounded bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                </div>
                <span>Facturation automatique</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm cursor-default">
                <div className="h-4 w-4 rounded border border-muted-foreground/30 flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground">-</span>
                </div>
                <span className="text-muted-foreground">Compte-rendu</span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Retourner a la consultation
          </Button>
          <Button onClick={onConfirmEnd} className="gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Terminer et quitter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
