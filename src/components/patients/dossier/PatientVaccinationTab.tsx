import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { format, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Syringe,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePatientVaccinations, useUpcomingVaccinations, useCreateVaccination } from '@/hooks/data/useVaccinations';
import DossierPageLayout from './shared/DossierPageLayout';
import EmptyState from './shared/EmptyState';
import { toast } from 'sonner';

interface OutletContext {
  patient: Patient;
}

const PatientVaccinationTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const { data: vaccinations, isLoading } = usePatientVaccinations(patient.id);
  const { data: upcomingVaccinations } = useUpcomingVaccinations(patient.id);
  const createVaccinationMutation = useCreateVaccination();

  const [showVaccinationModal, setShowVaccinationModal] = useState(false);

  const handleAddVaccination = () => {
    setShowVaccinationModal(true);
  };

  const handlePlanReminder = (nextDoseDate: string) => {
    navigate('/', { state: { preselectedPatient: patient, preselectedDate: nextDoseDate } });
  };

  const handleExport = () => {
    window.print();
  };

  // Separate past and completed vaccinations
  const completedVaccinations = vaccinations?.filter(v => !v.next_dose_date || isPast(new Date(v.next_dose_date))) ?? [];
  const pendingVaccinations = upcomingVaccinations ?? [];

  return (
    <DossierPageLayout 
      patient={patient} 
      title="Carnet de vaccination" 
      breadcrumbLabel="Vaccination"
      isLoading={isLoading}
      headerActions={
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1.5" onClick={handleExport}>
            <FileText className="h-4 w-4" />
            Exporter
          </Button>
          <Button className="gap-1.5" onClick={handleAddVaccination}>
            <Plus className="h-4 w-4" />
            Ajouter une vaccination
          </Button>
        </div>
      }
    >
      {/* Upcoming Reminders */}
      {pendingVaccinations.length > 0 && (
        <Card className="mb-6 border-warning/50 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-warning" />
              Rappels à venir
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                {pendingVaccinations.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingVaccinations.map((vacc) => (
              <div 
                key={vacc.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-warning" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground">{vacc.vaccine_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {vacc.next_dose_date && (
                        <>Prévu le {format(new Date(vacc.next_dose_date), 'dd MMMM yyyy', { locale: fr })}</>
                      )}
                      {vacc.dose_number && ` — Dose ${vacc.dose_number + 1}`}
                    </p>
                  </div>
                </div>
                <Button size="sm" className="gap-1.5" onClick={() => vacc.next_dose_date && handlePlanReminder(vacc.next_dose_date)}>
                  <Calendar className="h-3.5 w-3.5" />
                  Planifier
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Vaccination Record */}
      {(!vaccinations || vaccinations.length === 0) ? (
        <EmptyState
          icon={Syringe}
          title="Carnet de vaccination vide"
          description="Aucune vaccination n'a été enregistrée pour ce patient. Ajoutez les vaccinations effectuées."
          actionLabel="Ajouter une vaccination"
          actionIcon={Plus}
          onAction={handleAddVaccination}
        />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Vaccinations effectuées</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {completedVaccinations.length} vaccination{completedVaccinations.length > 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {vaccinations.map((vaccination) => (
                <div 
                  key={vaccination.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {vaccination.vaccine_name}
                        </h4>
                        {vaccination.dose_number && (
                          <Badge variant="outline" className="text-xs">
                            Dose {vaccination.dose_number}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(vaccination.administration_date), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                        {vaccination.administration_site && (
                          <span>Site: {vaccination.administration_site}</span>
                        )}
                        {vaccination.batch_number && (
                          <span>Lot: {vaccination.batch_number}</span>
                        )}
                        {vaccination.manufacturer && (
                          <span>Fabricant: {vaccination.manufacturer}</span>
                        )}
                      </div>

                      {vaccination.next_dose_date && isFuture(new Date(vaccination.next_dose_date)) && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-warning">
                          <Bell className="h-3 w-3" />
                          Prochain rappel : {format(new Date(vaccination.next_dose_date), 'dd MMM yyyy', { locale: fr })}
                        </div>
                      )}

                      {vaccination.notes && (
                        <p className="mt-2 text-xs text-muted-foreground italic">{vaccination.notes}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Footer */}
      <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          Les données de vaccination sont conservées conformément à la réglementation en vigueur.
          Pour toute modification, veuillez contacter le praticien responsable.
        </p>
      </div>
    </DossierPageLayout>
  );
};

export default PatientVaccinationTab;
