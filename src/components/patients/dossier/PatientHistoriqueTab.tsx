/**
 * PatientHistoriqueTab - Historique complet du patient
 * Affiche les rendez-vous passés et à venir avec statistiques de présence
 */

import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient, Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePatientHistory } from '@/hooks/data/usePatientHistory';
import {
  PresenceSummaryCard,
  HistorySection,
  HistoryEmptyState,
  AuditLink,
} from './historique';
import DossierPageLayout from './shared/DossierPageLayout';

interface OutletContext {
  patient: Patient;
}

const PatientHistoriqueTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();

  // Récupérer l'historique du patient
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = usePatientHistory(patient.id);

  // Handlers
  const handleOpenAppointment = (appointment: Appointment) => {
    toast.info(`Ouverture du rendez-vous ${appointment.id}`);
  };

  const handleViewAudit = () => {
    toast.info('Historique des modifications à venir');
  };

  // Calculs
  const upcomingCount = historyData?.upcoming.length || 0;
  const pastCount = historyData?.past.reduce((acc, group) => acc + group.items.length, 0) || 0;
  const hasAnyAppointments = upcomingCount > 0 || pastCount > 0;

  return (
    <DossierPageLayout
      patient={patient}
      title="Historique"
      breadcrumbLabel="Historique"
      isLoading={isLoading}
      showFilter={false}
    >
      {/* État d'erreur */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Erreur lors du chargement de l'historique</p>
          <Button variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Contenu */}
      {!isLoading && !error && (
        <>
          {/* Carte résumé présence */}
          {historyData && (
            <PresenceSummaryCard summary={historyData.summary} />
          )}

          {/* État vide */}
          {!hasAnyAppointments && <HistoryEmptyState />}

          {/* Section À venir */}
          {upcomingCount > 0 && historyData && (
            <HistorySection
              title="À venir"
              count={upcomingCount}
              appointments={historyData.upcoming}
              onOpenAppointment={handleOpenAppointment}
            />
          )}

          {/* Section Passés (groupés par année) */}
          {pastCount > 0 && historyData && (
            <HistorySection
              title="Passés"
              count={pastCount}
              groupedAppointments={historyData.past}
              onOpenAppointment={handleOpenAppointment}
            />
          )}

          {/* Lien audit (seulement s'il y a des rendez-vous) */}
          {hasAnyAppointments && <AuditLink onViewAudit={handleViewAudit} />}
        </>
      )}
    </DossierPageLayout>
  );
};

export default PatientHistoriqueTab;
