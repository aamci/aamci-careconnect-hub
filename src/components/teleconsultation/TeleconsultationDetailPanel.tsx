import React, { useState } from 'react';
import {
  Video,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  FileText,
  Copy,
  ExternalLink,
  X as XIcon,
  AlertCircle,
  CheckCircle2,
  Circle,
  Hourglass,
  Loader2,
  Trash2,
} from 'lucide-react';
import { format, formatDistanceToNow, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  useTeleconsultationEvents,
  useUpdateTeleconsultation,
  useDeleteTeleconsultation,
} from '@/hooks/data/useTeleconsultation';
import { StatusWorkflowBadge } from '@/components/teleconsultation/StatusWorkflowBadge';
import type {
  TeleconsultationWithRelations,
  TeleconsultationStatus,
  EventType,
} from '@/types/teleconsultation';

interface TeleconsultationDetailPanelProps {
  teleconsultation: TeleconsultationWithRelations;
  onClose: () => void;
  onJoin: (id: string) => void;
}

const statusDisplay: Record<TeleconsultationStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  scheduled: { label: 'Programmee', color: 'text-blue-700', bgColor: 'bg-blue-50', icon: Calendar },
  waiting: { label: 'En attente', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: Hourglass },
  ready: { label: 'Prete', color: 'text-teal-700', bgColor: 'bg-teal-50', icon: CheckCircle2 },
  in_progress: { label: 'En cours', color: 'text-green-700', bgColor: 'bg-green-50', icon: Video },
  paused: { label: 'En pause', color: 'text-amber-700', bgColor: 'bg-amber-50', icon: Clock },
  completed: { label: 'Terminee', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: CheckCircle2 },
  cancelled: { label: 'Annulee', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: XIcon },
  failed: { label: 'Echouee', color: 'text-destructive', bgColor: 'bg-destructive/10', icon: AlertCircle },
};

const eventTypeLabels: Partial<Record<EventType, string>> = {
  patient_joined: 'Patient connecte',
  practitioner_joined: 'Praticien connecte',
  patient_left: 'Patient deconnecte',
  practitioner_left: 'Praticien deconnecte',
  session_started: 'Session demarree',
  session_ended: 'Session terminee',
  session_paused: 'Session en pause',
  session_resumed: 'Session reprise',
  video_enabled: 'Video activee',
  video_disabled: 'Video desactivee',
  audio_enabled: 'Audio active',
  audio_disabled: 'Audio desactive',
  screen_share_started: 'Partage ecran demarre',
  screen_share_stopped: 'Partage ecran arrete',
  document_shared: 'Document partage',
  note_added: 'Note ajoutee',
  network_issue: 'Probleme reseau',
  quality_degraded: 'Qualite degradee',
};

export function TeleconsultationDetailPanel({
  teleconsultation: tc,
  onClose,
  onJoin,
}: TeleconsultationDetailPanelProps) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const { data: events = [] } = useTeleconsultationEvents(tc.id, { limit: 30 });
  const updateMutation = useUpdateTeleconsultation();
  const deleteMutation = useDeleteTeleconsultation();

  const canJoin = ['waiting', 'ready', 'in_progress'].includes(tc.status);

  const patientAge = tc.patient?.dateOfBirth
    ? differenceInYears(new Date(), new Date(tc.patient.dateOfBirth))
    : null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tc.patient_link);
    toast.success('Lien patient copie dans le presse-papiers');
  };

  const handleCancel = async () => {
    try {
      await updateMutation.mutateAsync({
        id: tc.id,
        updates: { status: 'cancelled' },
      });
      setConfirmCancelOpen(false);
      onClose();
    } catch {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(tc.id);
      onClose();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="flex flex-col h-full -mx-6 -mt-4">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-3">
          <StatusWorkflowBadge status={tc.status} size="md" />
          <span className="text-xs text-muted-foreground">
            {format(new Date(tc.scheduled_start), 'EEEE d MMMM yyyy', { locale: fr })}
          </span>
        </div>

        <h3 className="text-lg font-semibold">
          {tc.patient?.firstName} {tc.patient?.lastName}
        </h3>
        <p className="text-sm text-muted-foreground">
          {format(new Date(tc.scheduled_start), 'HH:mm', { locale: fr })}
          {tc.duration_minutes ? ` - ${tc.duration_minutes} min` : ''}
        </p>
      </div>

      <Separator />

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-5">
          {/* Patient info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Patient
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">
                  {tc.patient?.firstName} {tc.patient?.lastName}
                  {patientAge !== null && (
                    <span className="text-muted-foreground ml-1">({patientAge} ans)</span>
                  )}
                </span>
              </div>
              {tc.patient?.phone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{tc.patient.phone}</span>
                </div>
              )}
              {tc.patient?.email && (
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{tc.patient.email}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Clinical context */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Contexte clinique
            </h4>
            <div className="space-y-2">
              {tc.consultation_reason && (
                <div className="flex items-start gap-2.5">
                  <Stethoscope className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Motif</p>
                    <p className="text-sm">{tc.consultation_reason}</p>
                  </div>
                </div>
              )}
              {tc.chief_complaint && (
                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Plainte principale</p>
                    <p className="text-sm">{tc.chief_complaint}</p>
                  </div>
                </div>
              )}
              {!tc.consultation_reason && !tc.chief_complaint && (
                <p className="text-sm text-muted-foreground italic">
                  Aucun contexte clinique renseigne
                </p>
              )}
            </div>
          </div>

          {/* Session details (for completed/in-progress) */}
          {(tc.actual_start || tc.actual_end) && (
            <>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Session
                </h4>
                <div className="space-y-2">
                  {tc.actual_start && (
                    <div className="flex items-center gap-2.5">
                      <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">
                        Debut : {format(new Date(tc.actual_start), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                  )}
                  {tc.actual_end && (
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">
                        Fin : {format(new Date(tc.actual_end), 'HH:mm', { locale: fr })}
                      </span>
                    </div>
                  )}
                  {tc.actual_start && tc.actual_end && (
                    <div className="flex items-center gap-2.5">
                      <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">
                        Duree : {Math.round(
                          (new Date(tc.actual_end).getTime() - new Date(tc.actual_start).getTime()) / 60000
                        )} min
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Event timeline */}
          {events.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Journal ({events.length})
                </h4>
                <div className="space-y-1.5">
                  {events.slice(0, 15).map((event) => (
                    <div key={event.id} className="flex items-center gap-2 text-xs">
                      <Circle className={cn(
                        'h-1.5 w-1.5 flex-shrink-0 fill-current',
                        event.severity === 'error' || event.severity === 'critical'
                          ? 'text-destructive'
                          : event.severity === 'warning'
                          ? 'text-amber-500'
                          : 'text-muted-foreground/50'
                      )} />
                      <span className="text-muted-foreground w-12 flex-shrink-0">
                        {format(new Date(event.occurred_at), 'HH:mm', { locale: fr })}
                      </span>
                      <span className="truncate">
                        {eventTypeLabels[event.event_type] || event.event_type}
                      </span>
                    </div>
                  ))}
                  {events.length > 15 && (
                    <p className="text-xs text-muted-foreground italic mt-1">
                      +{events.length - 15} evenements
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      <Separator />

      {/* Footer actions */}
      <div className="flex-shrink-0 px-6 py-3 space-y-2">
        {canJoin && (
          <Button className="w-full gap-2" onClick={() => onJoin(tc.id)}>
            <Video className="h-4 w-4" />
            Rejoindre la consultation
          </Button>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={handleCopyLink}>
            <Copy className="h-3.5 w-3.5" />
            Lien patient
          </Button>

          {tc.patient && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => window.open(`/patients/${tc.patient_id}`, '_blank')}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Dossier
            </Button>
          )}
        </div>

        {!['completed', 'cancelled', 'failed'].includes(tc.status) && (
          <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive gap-1.5">
                <XIcon className="h-3.5 w-3.5" />
                Annuler la teleconsultation
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Annuler cette teleconsultation ?</AlertDialogTitle>
                <AlertDialogDescription>
                  La teleconsultation avec {tc.patient?.firstName} {tc.patient?.lastName} sera annulee.
                  Le patient devra reprendre un rendez-vous.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Non, garder</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Oui, annuler
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {['completed', 'cancelled', 'failed'].includes(tc.status) && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full text-destructive hover:text-destructive gap-1.5">
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette teleconsultation ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irreversible. Toutes les donnees associees seront supprimees.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
