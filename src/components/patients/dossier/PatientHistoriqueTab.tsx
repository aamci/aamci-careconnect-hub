/**
 * PatientHistoriqueTab - Historique complet du patient
 * Affiche les rendez-vous passés et à venir avec statistiques de présence
 */

import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient, Appointment } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { usePatientHistory } from '@/hooks/data/usePatientHistory';
import {
  PresenceSummaryCard,
  HistorySection,
  HistoryEmptyState,
  AuditLink,
  DocumentsTimeline,
} from './historique';
import DossierPageLayout from './shared/DossierPageLayout';

interface OutletContext {
  patient: Patient;
}

const PatientHistoriqueTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const [activeTab, setActiveTab] = useState<'all' | 'consultations' | 'documents'>('all');

  // Récupérer l'historique du patient
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = usePatientHistory(patient.id);

  // Mock documents - À remplacer par un vrai hook
  const mockDocuments = [];

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

          {/* Tabs pour filtrer par type */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">Tout</TabsTrigger>
              <TabsTrigger value="consultations">Consultations</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Vue Tout */}
            <TabsContent value="all" className="space-y-6">
              {!hasAnyAppointments && <HistoryEmptyState />}

              {upcomingCount > 0 && historyData && (
                <HistorySection
                  title="À venir"
                  count={upcomingCount}
                  appointments={historyData.upcoming}
                  onOpenAppointment={handleOpenAppointment}
                />
              )}

              {pastCount > 0 && historyData && (
                <HistorySection
                  title="Passés"
                  count={pastCount}
                  groupedAppointments={historyData.past}
                  onOpenAppointment={handleOpenAppointment}
                />
              )}

              {mockDocuments.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Documents récents</h3>
                  <DocumentsTimeline
                    patientId={patient.id}
                    documents={mockDocuments}
                    onDocumentUpdate={() => refetch()}
                  />
                </div>
              )}

              {hasAnyAppointments && <AuditLink onViewAudit={handleViewAudit} />}
            </TabsContent>

            {/* Vue Consultations */}
            <TabsContent value="consultations" className="space-y-6">
              {!hasAnyAppointments && <HistoryEmptyState />}

              {upcomingCount > 0 && historyData && (
                <HistorySection
                  title="À venir"
                  count={upcomingCount}
                  appointments={historyData.upcoming}
                  onOpenAppointment={handleOpenAppointment}
                />
              )}

              {pastCount > 0 && historyData && (
                <HistorySection
                  title="Passés"
                  count={pastCount}
                  groupedAppointments={historyData.past}
                  onOpenAppointment={handleOpenAppointment}
                />
              )}

              {hasAnyAppointments && <AuditLink onViewAudit={handleViewAudit} />}
            </TabsContent>

            {/* Vue Documents */}
            <TabsContent value="documents">
              <DocumentsTimeline
                patientId={patient.id}
                documents={mockDocuments}
                onDocumentUpdate={() => refetch()}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </DossierPageLayout>
  );
};

export default PatientHistoriqueTab;
