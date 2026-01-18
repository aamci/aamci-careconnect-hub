import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { Stethoscope, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DossierPageLayout from './shared/DossierPageLayout';

interface OutletContext {
  patient: Patient;
}

const PatientConsultationTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();

  return (
    <DossierPageLayout
      patient={patient}
      title="Consultation en cours"
      breadcrumbLabel="Consultation"
      headerActions={
        <Button className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nouvelle consultation
        </Button>
      }
    >
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Stethoscope className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Aucune consultation en cours
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            Démarrez une nouvelle consultation pour {patient.firstName} {patient.lastName} 
            ou sélectionnez une consultation existante dans l'historique.
          </p>
          <div className="flex gap-3">
            <Button className="gap-1.5">
              <Plus className="h-4 w-4" />
              Démarrer une consultation
            </Button>
            <Button variant="outline" className="gap-1.5">
              <FileText className="h-4 w-4" />
              Voir l'historique
            </Button>
          </div>
        </CardContent>
      </Card>
    </DossierPageLayout>
  );
};

export default PatientConsultationTab;
