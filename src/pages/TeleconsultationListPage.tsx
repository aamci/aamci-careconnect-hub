import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, User, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTeleconsultations } from '@/hooks/data/useTeleconsultation';
import type { TeleconsultationWithRelations } from '@/types/teleconsultation';

const TeleconsultationListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: teleconsultations = [], isLoading, error } = useTeleconsultations();

  // Filtrer les téléconsultations par statut
  const scheduledConsultations = teleconsultations.filter(
    (tc) => tc.status === 'scheduled' || tc.status === 'waiting' || tc.status === 'ready'
  );
  const inProgressConsultations = teleconsultations.filter((tc) => tc.status === 'in_progress');
  const completedConsultations = teleconsultations.filter((tc) => tc.status === 'completed');

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      scheduled: { label: 'Programmée', variant: 'secondary' },
      waiting: { label: 'En attente', variant: 'outline' },
      ready: { label: 'Prête', variant: 'default' },
      in_progress: { label: 'En cours', variant: 'default' },
      completed: { label: 'Terminée', variant: 'secondary' },
      cancelled: { label: 'Annulée', variant: 'destructive' },
      failed: { label: 'Échec technique', variant: 'destructive' },
    };

    const config = statusConfig[status] || { label: status, variant: 'secondary' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const TeleconsultationCard: React.FC<{ tc: TeleconsultationWithRelations }> = ({ tc }) => {
    const canJoin = ['waiting', 'ready', 'in_progress'].includes(tc.status);
    const scheduledDate = new Date(tc.scheduled_start);

    return (
      <Card className="hover:bg-muted/50 transition-colors">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">
                  {tc.patient?.firstName} {tc.patient?.lastName}
                </h3>
                {getStatusBadge(tc.status)}
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span>
                  {format(scheduledDate, 'PPP à HH:mm', { locale: fr })}
                </span>
              </div>

              {tc.consultation_reason && (
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Motif :</strong> {tc.consultation_reason}
                </p>
              )}

              {tc.duration_minutes && (
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Durée :</strong> {tc.duration_minutes} minutes
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {canJoin && (
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => navigate(`/visio/${tc.id}`)}
                >
                  <Video className="h-4 w-4" />
                  Rejoindre
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  // Copier le lien patient dans le presse-papier
                  navigator.clipboard.writeText(tc.patient_link);
                }}
              >
                Copier lien patient
              </Button>
            </div>
          </div>

          {tc.status === 'in_progress' && tc.actual_start && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Démarrée {format(new Date(tc.actual_start), 'HH:mm', { locale: fr })} •{' '}
                {Math.round((Date.now() - new Date(tc.actual_start).getTime()) / 60000)} min
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <MainLayout activeNav="teleconsult" onNavChange={(nav) => navigate(nav === 'agenda' ? '/' : `/${nav}`)}>
      <div className="h-full p-6 bg-muted/30 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Téléconsultations</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gérez vos consultations vidéo
              </p>
            </div>
            <Button
              onClick={() => navigate('/')}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Créer depuis l'agenda
            </Button>
          </div>

          {/* Info Card */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Comment créer une téléconsultation ?</h3>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">1.</span>
                    <span>Allez dans votre <strong>agenda</strong> et sélectionnez un rendez-vous</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">2.</span>
                    <span>Cliquez sur <strong>"Créer téléconsultation"</strong> dans le panneau de détails</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">3.</span>
                    <span>Des liens sécurisés seront générés automatiquement pour vous et le patient</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">4.</span>
                    <span>Envoyez le lien au patient par email ou SMS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary">5.</span>
                    <span>Rejoignez la consultation via <strong>"Rejoindre téléconsultation"</strong></span>
                  </li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="p-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-destructive">
                  Erreur de chargement
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Impossible de charger les téléconsultations
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Réessayer
                </Button>
              </div>
            </Card>
          )}

          {/* Content */}
          {!isLoading && !error && (
            <>
              {/* En cours */}
              {inProgressConsultations.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Video className="h-5 w-5 text-primary" />
                    En cours ({inProgressConsultations.length})
                  </h2>
                  <div className="space-y-4">
                    {inProgressConsultations.map((tc) => (
                      <TeleconsultationCard key={tc.id} tc={tc} />
                    ))}
                  </div>
                </div>
              )}

              {/* Programmées */}
              {scheduledConsultations.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    À venir ({scheduledConsultations.length})
                  </h2>
                  <div className="space-y-4">
                    {scheduledConsultations.map((tc) => (
                      <TeleconsultationCard key={tc.id} tc={tc} />
                    ))}
                  </div>
                </div>
              )}

              {/* Terminées */}
              {completedConsultations.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Terminées ({completedConsultations.length})
                  </h2>
                  <div className="space-y-4">
                    {completedConsultations.slice(0, 10).map((tc) => (
                      <TeleconsultationCard key={tc.id} tc={tc} />
                    ))}
                  </div>
                  {completedConsultations.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Affichage des 10 dernières téléconsultations terminées
                    </p>
                  )}
                </div>
              )}

              {/* Empty State */}
              {teleconsultations.length === 0 && (
                <Card className="p-8">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Aucune téléconsultation</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Créez votre première téléconsultation depuis l'agenda
                    </p>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Aller à l'agenda
                    </Button>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default TeleconsultationListPage;
