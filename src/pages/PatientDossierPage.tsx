import React from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { mockPatients } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import PatientDossierSidebar from '@/components/patients/dossier/PatientDossierSidebar';

const PatientDossierPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const patient = mockPatients.find(p => p.id === patientId);
  
  if (!patient) {
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
