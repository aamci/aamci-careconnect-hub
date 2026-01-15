import React from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { Patient, Appointment } from '@/types';
import { Filter, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { usePatientHistory } from '@/hooks/data/usePatientHistory';
import { ActionsPanel } from '@/components/patients/dossier/actions-panel';
import {
  PresenceSummaryCard,
  HistoryEmptyState,
  HistorySection,
  AuditLink,
} from './historique';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface OutletContext {
  patient: Patient;
}

const PatientHistoriqueTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  
  const { data: historyData, isLoading, error, refetch } = usePatientHistory(patient.id);

  const handleOpenAppointment = (appointment: Appointment) => {
    // Navigate to appointment detail or open modal
    toast.info(`Ouverture du rendez-vous ${appointment.id}`);
  };

  const handleViewAudit = () => {
    toast.info('Historique des modifications à venir');
  };

  const handleClosePatientDossier = () => {
    navigate('/patients');
  };

  // Calculate total counts
  const upcomingCount = historyData?.upcoming.length || 0;
  const pastCount = historyData?.past.reduce((acc, group) => acc + group.items.length, 0) || 0;
  const hasAnyAppointments = upcomingCount > 0 || pastCount > 0;

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Header with Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/patients/${patient.id}/home`}>Dossier patient</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Historique</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-4 w-4" />
              Filtrer
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary gap-1.5"
              onClick={handleClosePatientDossier}
            >
              Fermer le dossier patient
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

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
      </div>

      {/* Right Actions Panel - Sticky */}
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <ActionsPanel patient={patient} />
      </div>
    </div>
  );
};

export default PatientHistoriqueTab;
