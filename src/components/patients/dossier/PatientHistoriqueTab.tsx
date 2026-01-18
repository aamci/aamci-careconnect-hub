import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient, Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePatientHistory } from '@/hooks/data/usePatientHistory';
import {
  PresenceSummaryCard,
  HistoryEmptyState,
  HistorySection,
  AuditLink,
} from './historique';
import DossierPageLayout from './shared/DossierPageLayout';

interface OutletContext {
  patient: Patient;
}

const PatientHistoriqueTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();

  const { data: historyData, isLoading, error, refetch } = usePatientHistory(patient.id);

  const handleOpenAppointment = (appointment: Appointment) => {
    // Navigate to appointment detail or open modal
    toast.info(`Ouverture du rendez-vous ${appointment.id}`);
  };

  const handleViewAudit = () => {
    toast.info('Historique des modifications à venir');
  };

  // Calculate total counts
  const upcomingCount = historyData?.upcoming.length || 0;
  const pastCount = historyData?.past.reduce((acc, group) => acc + group.items.length, 0) || 0;
  const hasAnyAppointments = upcomingCount > 0 || pastCount > 0;

  return (
    <DossierPageLayout
      patient={patient}
      title="Historique"
      breadcrumbLabel="Historique"
      isLoading={isLoading}
      showFilter
    >
      {/* Error state */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Erreur lors du chargement de l'historique</p>
          <Button variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && historyData && (
        <>
          {/* Presence Summary Card */}
          <PresenceSummaryCard summary={historyData.summary} />

          {/* Empty state */}
          {!hasAnyAppointments && <HistoryEmptyState />}

          {/* Upcoming Section */}
          {upcomingCount > 0 && (
            <HistorySection
              title="À venir"
              count={upcomingCount}
              appointments={historyData.upcoming}
              onOpenAppointment={handleOpenAppointment}
            />
          )}

          {/* Past Section (grouped by year) */}
          {pastCount > 0 && (
            <HistorySection
              title="Passés"
              count={pastCount}
              groupedAppointments={historyData.past}
              onOpenAppointment={handleOpenAppointment}
            />
          )}

          {/* Audit Link (only if there are appointments) */}
          {hasAnyAppointments && (
            <AuditLink onViewAudit={handleViewAudit} />
          )}
        </>
      )}
    </DossierPageLayout>
  );
};

export default PatientHistoriqueTab;
