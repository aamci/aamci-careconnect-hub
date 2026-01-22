import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { Stethoscope, Plus, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DossierPageLayout from './shared/DossierPageLayout';
import {
  useActiveConsultation,
  useCreateConsultation,
  useUpdateConsultation,
  useEndConsultation,
} from '@/hooks/data/useConsultations';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface OutletContext {
  patient: Patient;
}

const PatientConsultationTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const navigate = useNavigate();

  const { data: activeConsultation, isLoading } = useActiveConsultation(patient.id);
  const createConsultation = useCreateConsultation();
  const updateConsultation = useUpdateConsultation();
  const endConsultation = useEndConsultation();

  const [chiefComplaint, setChiefComplaint] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Load active consultation data
  React.useEffect(() => {
    if (activeConsultation) {
      setChiefComplaint(activeConsultation.chief_complaint || '');
      setNotes(activeConsultation.notes || '');
    }
  }, [activeConsultation]);

  const handleStartConsultation = async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    createConsultation.mutate({
      patient_id: patient.id,
      practitioner_id: user.user.id,
      status: 'in-progress'
    });
  };

  const handleSaveConsultation = () => {
    if (!activeConsultation) return;

    updateConsultation.mutate({
      id: activeConsultation.id,
      patientId: patient.id,
      updates: {
        chief_complaint: chiefComplaint || null,
        notes: notes || null
      }
    });
  };

  const handleEndConsultation = () => {
    if (!activeConsultation) return;

    // Save first
    if (chiefComplaint || notes) {
      updateConsultation.mutate(
        {
          id: activeConsultation.id,
          patientId: patient.id,
          updates: {
            chief_complaint: chiefComplaint || null,
            notes: notes || null
          }
        },
        {
          onSuccess: () => {
            // Then end
            endConsultation.mutate({
              id: activeConsultation.id,
              patientId: patient.id
            });
          }
        }
      );
    } else {
      endConsultation.mutate({
        id: activeConsultation.id,
        patientId: patient.id
      });
    }
  };

  const handleViewHistory = () => {
    navigate('/patients/' + patient.id + '/historique');
  };

  // Active consultation workspace
  if (activeConsultation) {
    return (
      <DossierPageLayout
        patient={patient}
        title="Consultation en cours"
        breadcrumbLabel="Consultation"
        headerActions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveConsultation}
              disabled={updateConsultation.isPending}
            >
              {updateConsultation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
            <Button onClick={handleEndConsultation} disabled={endConsultation.isPending}>
              {endConsultation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Clôture...
                </>
              ) : (
                'Terminer la consultation'
              )}
            </Button>
          </div>
        }
      >
        <Card>
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Consultation active</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Démarrée le {new Date(activeConsultation.start_time).toLocaleString('fr-FR')}
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chief-complaint">Motif de consultation *</Label>
                <Textarea
                  id="chief-complaint"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Décrivez le motif principal de la consultation..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes cliniques</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observations, examens cliniques, impressions diagnostiques..."
                  rows={10}
                />
              </div>

              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Note :</strong> Cette interface de consultation est simplifiée.
                  Les fonctionnalités complètes (examen physique, diagnostics structurés,
                  ordonnances intégrées) seront disponibles dans une version ultérieure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </DossierPageLayout>
    );
  }

  // No active consultation - show empty state
  return (
    <DossierPageLayout
      patient={patient}
      title="Consultation en cours"
      breadcrumbLabel="Consultation"
      isLoading={isLoading}
      headerActions={
        <Button
          className="gap-1.5"
          onClick={handleStartConsultation}
          disabled={createConsultation.isPending}
        >
          {createConsultation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
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
            <Button
              className="gap-1.5"
              onClick={handleStartConsultation}
              disabled={createConsultation.isPending}
            >
              {createConsultation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Démarrage...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Démarrer une consultation
                </>
              )}
            </Button>
            <Button variant="outline" className="gap-1.5" onClick={handleViewHistory}>
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
