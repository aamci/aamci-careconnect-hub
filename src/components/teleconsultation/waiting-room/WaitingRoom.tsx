/**
 * WaitingRoom - Salle d'attente avant la téléconsultation
 * Affichage des informations, test technique, attente du praticien
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Video,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { TechnicalCheck } from './TechnicalCheck';
import {
  useTeleconsultation,
  useValidateTeleconsultationAccess,
  useCreateSession,
} from '@/hooks/data/useTeleconsultation';
import type { TechnicalCheckResult, ParticipantType, Teleconsultation } from '@/types/teleconsultation';

interface WaitingRoomProps {
  teleconsultationId: string;
  token: string;
  participantType: ParticipantType;
}

export function WaitingRoom({ teleconsultationId, token, participantType }: WaitingRoomProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [currentStep, setCurrentStep] = useState<'validating' | 'technical-check' | 'waiting' | 'ready'>('validating');
  const [technicalCheckResult, setTechnicalCheckResult] = useState<TechnicalCheckResult | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Valider l'accès
  const {
    data: accessValidation,
    isLoading: isValidatingAccess,
    error: accessError,
  } = useValidateTeleconsultationAccess(teleconsultationId, token, participantType);

  // Récupérer la téléconsultation
  const { data: teleconsultation, isLoading: isLoadingTeleconsultation } = useTeleconsultation(
    accessValidation?.isValid ? teleconsultationId : null
  );

  // Créer une session
  const createSessionMutation = useCreateSession();

  // Vérifier l'accès au chargement
  useEffect(() => {
    if (!isValidatingAccess && accessValidation) {
      if (!accessValidation.isValid) {
        toast.error(accessValidation.error || 'Accès refusé');
        // Rediriger vers la page d'accueil après 3 secondes
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setCurrentStep('technical-check');
      }
    }
  }, [isValidatingAccess, accessValidation, navigate]);

  /**
   * Gérer la fin du test technique
   */
  const handleTechnicalCheckComplete = (result: TechnicalCheckResult) => {
    setTechnicalCheckResult(result);

    // Vérifier que tout est OK
    if (result.camera.available && result.microphone.available && result.speaker.available) {
      toast.success('Test technique réussi !');
    } else {
      toast.warning('Certains tests ont échoué. Vous pouvez quand même continuer.');
    }
  };

  /**
   * Passer à l'étape suivante
   */
  const handleContinue = () => {
    if (currentStep === 'technical-check') {
      setCurrentStep('waiting');
    }
  };

  /**
   * Rejoindre la consultation
   */
  const handleJoinConsultation = async () => {
    if (!teleconsultation || !technicalCheckResult) return;

    setIsJoining(true);

    try {
      // Créer une session
      const session = await createSessionMutation.mutateAsync({
        teleconsultation_id: teleconsultationId,
        token,
        participant_type: participantType,
        device_info: {
          browser: technicalCheckResult.browser.browser,
          browser_version: technicalCheckResult.browser.version,
          os: null,
          device_type: null,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          camera_enabled: technicalCheckResult.camera.available,
          microphone_enabled: technicalCheckResult.microphone.available,
        },
      });

      // Rediriger vers la salle de consultation
      navigate(`/visio/${teleconsultationId}?token=${token}&type=${participantType}`);
    } catch (error) {
      console.error('Error joining consultation:', error);
      toast.error('Erreur lors de la connexion');
      setIsJoining(false);
    }
  };

  /**
   * Quitter la salle d'attente
   */
  const handleLeave = () => {
    navigate('/');
  };

  // Loading
  if (isValidatingAccess || isLoadingTeleconsultation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Accès refusé
  if (!accessValidation?.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {accessValidation?.error || 'Accès refusé à cette téléconsultation.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Pas de téléconsultation trouvée
  if (!teleconsultation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Téléconsultation introuvable.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">
                  {participantType === 'patient' ? 'Salle d\'attente' : 'Pré-consultation'}
                </CardTitle>
                <CardDescription>
                  {participantType === 'patient'
                    ? 'Préparez-vous pour votre téléconsultation'
                    : 'Vérifiez votre matériel avant de rejoindre le patient'}
                </CardDescription>
              </div>
              <Badge variant={teleconsultation.status === 'scheduled' ? 'secondary' : 'default'}>
                {getStatusLabel(teleconsultation.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date et heure */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(teleconsultation.scheduled_start), 'EEEE d MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Heure</p>
                  <p className="font-medium">
                    {format(new Date(teleconsultation.scheduled_start), 'HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>

              {/* Motif */}
              {teleconsultation.consultation_reason && (
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Motif</p>
                    <p className="font-medium">{teleconsultation.consultation_reason}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Étape actuelle */}
        {currentStep === 'technical-check' && (
          <div className="space-y-6">
            <TechnicalCheck onCheckComplete={handleTechnicalCheckComplete} />

            {technicalCheckResult && (
              <div className="flex gap-3">
                <Button onClick={handleLeave} variant="outline" className="flex-1">
                  <LogOut className="h-4 w-4 mr-2" />
                  Quitter
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  Continuer
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 'waiting' && (
          <Card>
            <CardHeader>
              <CardTitle>Prêt à rejoindre</CardTitle>
              <CardDescription>
                {participantType === 'patient'
                  ? 'Vous pouvez maintenant rejoindre la consultation'
                  : 'Rejoignez la consultation quand vous êtes prêt'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Instructions */}
              <Alert>
                <Video className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Avant de rejoindre :</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Assurez-vous d'être dans un endroit calme</li>
                    <li>Vérifiez que votre caméra et microphone fonctionnent</li>
                    <li>Ayez votre carte vitale à portée de main</li>
                    {participantType === 'practitioner' && (
                      <li>Consultez le dossier patient avant de rejoindre</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>

              {/* Boutons */}
              <div className="flex gap-3">
                <Button onClick={handleLeave} variant="outline" className="flex-1">
                  <LogOut className="h-4 w-4 mr-2" />
                  Quitter
                </Button>
                <Button
                  onClick={handleJoinConsultation}
                  disabled={isJoining}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    <>
                      <Video className="h-4 w-4 mr-2" />
                      Rejoindre la consultation
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/**
 * Obtenir le label du statut
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: 'Programmée',
    waiting: 'En attente',
    ready: 'Prête',
    in_progress: 'En cours',
    paused: 'En pause',
    completed: 'Terminée',
    cancelled: 'Annulée',
    failed: 'Échouée',
  };

  return labels[status] || status;
}
