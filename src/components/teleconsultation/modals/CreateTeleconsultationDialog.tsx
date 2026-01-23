/**
 * CreateTeleconsultationDialog - Dialog pour créer une téléconsultation
 * Permet de créer une téléconsultation à partir d'un rendez-vous existant
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Video, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useCreateTeleconsultation } from '@/hooks/data/useTeleconsultation';
import type { Appointment } from '@/types';
import type { Teleconsultation } from '@/types/teleconsultation';

interface CreateTeleconsultationDialogProps {
  appointment: Appointment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTeleconsultationDialog({
  appointment,
  open,
  onOpenChange,
}: CreateTeleconsultationDialogProps) {
  const [consultationReason, setConsultationReason] = useState(appointment.motif.name || '');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [createdTeleconsultation, setCreatedTeleconsultation] = useState<Teleconsultation | null>(null);

  const createTeleconsultationMutation = useCreateTeleconsultation();

  /**
   * Créer la téléconsultation
   */
  const handleCreate = async () => {
    try {
      const teleconsultation = await createTeleconsultationMutation.mutateAsync({
        appointment_id: appointment.id,
        patient_id: appointment.patientId,
        practitioner_id: appointment.practitionerId,
        scheduled_start: appointment.startTime.toISOString(),
        consultation_reason: consultationReason || undefined,
        chief_complaint: chiefComplaint || undefined,
        settings: {
          video_enabled: true,
          audio_enabled: true,
          screen_share_enabled: false,
          recording_enabled: false,
          quality: 'auto',
        },
      });

      setCreatedTeleconsultation(teleconsultation);
      toast.success('Téléconsultation créée avec succès');
    } catch (error) {
      console.error('Error creating teleconsultation:', error);
      toast.error('Erreur lors de la création de la téléconsultation');
    }
  };

  /**
   * Copier le lien dans le presse-papiers
   */
  const handleCopyLink = async (link: string, type: 'patient' | 'practitioner') => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success(`Lien ${type === 'patient' ? 'patient' : 'praticien'} copié`);
    } catch (error) {
      toast.error('Erreur lors de la copie');
    }
  };

  /**
   * Fermer et réinitialiser
   */
  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setCreatedTeleconsultation(null);
      setConsultationReason(appointment.motif.name || '');
      setChiefComplaint('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!createdTeleconsultation ? (
          <>
            {/* Formulaire de création */}
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Créer une téléconsultation
              </DialogTitle>
              <DialogDescription>
                Générer un lien de téléconsultation pour ce rendez-vous
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Info rendez-vous */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Rendez-vous</p>
                <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Patient : </span>
                    <span className="font-medium">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date : </span>
                    <span className="font-medium">
                      {format(appointment.startTime, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Motif : </span>
                    <span className="font-medium">{appointment.motif.name}</span>
                  </p>
                </div>
              </div>

              {/* Raison de la consultation */}
              <div className="space-y-2">
                <Label htmlFor="consultation-reason">Motif de la consultation</Label>
                <Textarea
                  id="consultation-reason"
                  value={consultationReason}
                  onChange={(e) => setConsultationReason(e.target.value)}
                  placeholder="Ex: Consultation de suivi, symptômes grippaux..."
                  rows={2}
                />
              </div>

              {/* Plainte principale */}
              <div className="space-y-2">
                <Label htmlFor="chief-complaint">
                  Plainte principale <span className="text-muted-foreground">(optionnel)</span>
                </Label>
                <Textarea
                  id="chief-complaint"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Ex: Fièvre depuis 3 jours, toux sèche..."
                  rows={3}
                />
              </div>

              {/* Info importante */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Les liens de téléconsultation seront générés et envoyés automatiquement au patient et au praticien.
                  Ils expireront 24h après l'heure prévue du rendez-vous.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createTeleconsultationMutation.isPending}
              >
                {createTeleconsultationMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Video className="h-4 w-4 mr-2" />
                    Créer la téléconsultation
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Affichage des liens créés */}
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Téléconsultation créée !
              </DialogTitle>
              <DialogDescription>
                Partagez les liens ci-dessous avec le patient et le praticien
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Lien patient */}
              <div className="space-y-2">
                <Label>Lien patient</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createdTeleconsultation.patient_link}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted font-mono truncate"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyLink(createdTeleconsultation.patient_link, 'patient')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Lien praticien */}
              <div className="space-y-2">
                <Label>Lien praticien</Label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createdTeleconsultation.practitioner_link}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted font-mono truncate"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyLink(createdTeleconsultation.practitioner_link, 'practitioner')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Info expiration */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <p className="font-medium mb-1">Important :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Les liens expirent le {format(new Date(createdTeleconsultation.room_expires_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}</li>
                    <li>Envoyez ces liens par email ou SMS sécurisé</li>
                    <li>Ne partagez pas ces liens publiquement</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Fermer
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
