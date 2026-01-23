import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { Stethoscope, Plus, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DossierPageLayout from './shared/DossierPageLayout';
import { ConsultationWorkspace } from '@/components/consultation';
import {
  useActiveConsultation,
  useCreateConsultation,
} from '@/hooks/data/useConsultations';
import { supabase } from '@/integrations/supabase/client';
import { fetchPractitionerByUserId } from '@/services/supabase/practitionersService';
import { useToast } from '@/hooks/use-toast';

interface OutletContext {
  patient: Patient;
}

const PatientConsultationTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: activeConsultation, isLoading } = useActiveConsultation(patient.id);
  const createConsultation = useCreateConsultation();

  const handleStartConsultation = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          variant: 'destructive',
          title: 'Erreur d\'authentification',
          description: 'Vous devez être connecté pour démarrer une consultation.'
        });
        return;
      }

      // Look up the practitioner record for this user
      let { data: practitioner } = await fetchPractitionerByUserId(user.user.id);

      // TEMPORARY FIX: If no practitioner found by user_id, use the first available practitioner
      // This happens because practitioners.user_id is NULL in the database
      if (!practitioner) {
        console.warn('[PatientConsultationTab] No practitioner found for user_id, using first available practitioner');

        const { data: practitioners } = await supabase
          .from('practitioners')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .single();

        if (practitioners) {
          practitioner = {
            id: practitioners.id,
            firstName: practitioners.first_name,
            lastName: practitioners.last_name,
            title: practitioners.title || 'Dr',
            specialty: practitioners.specialty || '',
            email: practitioners.email || '',
            phone: practitioners.phone || undefined,
            avatarUrl: practitioners.avatar_url || undefined,
            color: practitioners.color || '#3B82F6',
            siteIds: practitioners.site_ids || []
          };
        }
      }

      if (!practitioner) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Aucun praticien disponible dans le système.'
        });
        return;
      }

      // Create consultation with the correct practitioner ID
      createConsultation.mutate({
        patient_id: patient.id,
        practitioner_id: practitioner.id,
        status: 'in-progress'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue.'
      });
    }
  };

  const handleViewHistory = () => {
    navigate('/patients/' + patient.id + '/historique');
  };

  // Active consultation workspace - Layout complet 3 colonnes
  if (activeConsultation) {
    return <ConsultationWorkspace patient={patient} consultationId={activeConsultation.id} />;
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
