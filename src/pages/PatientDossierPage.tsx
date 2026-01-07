import React from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { usePatient } from '@/hooks/data/usePatients';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import PatientDossierSidebar from '@/components/patients/dossier/PatientDossierSidebar';

const PatientDossierPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const { data: patient, isLoading, error } = usePatient(patientId || '');
  
  if (isLoading) {
    return (
      <MainLayout activeNav="patients" onNavChange={() => {}}>
        <div className="h-full flex bg-background">
          <div className="w-64 p-4 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!patient || error) {
    return (
      <MainLayout activeNav="patients" onNavChange={() => {}}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Patient non trouvé</h2>
            <Button onClick={() => navigate('/patients')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activeNav="patients" onNavChange={() => {}}>
      <div className="h-full flex bg-background">
        {/* Left Sidebar - Patient Dossier Navigation */}
        <PatientDossierSidebar patient={patient} />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-muted/30">
          <Outlet context={{ patient }} />
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientDossierPage;
