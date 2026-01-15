import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Pill,
  Plus,
  Pause,
  Play,
  StopCircle,
  RefreshCw,
  FileText,
  AlertTriangle,
  Clock,
  User,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useActivePrescriptions, usePatientPrescriptions } from '@/hooks/data/usePrescriptions';
import DossierPageLayout from './shared/DossierPageLayout';
import EmptyState from './shared/EmptyState';
import StatusBadge from './shared/StatusBadge';
import { toast } from 'sonner';

interface OutletContext {
  patient: Patient;
}

interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
}

const PatientTraitementTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const { data: activePrescriptions, isLoading: loadingActive } = useActivePrescriptions(patient.id);
  const { data: allPrescriptions, isLoading: loadingAll } = usePatientPrescriptions(patient.id);
  
  const isLoading = loadingActive || loadingAll;

  const handleNewPrescription = () => {
    toast.info('Création d\'ordonnance à implémenter');
  };

  const handleStopMedication = (medication: string) => {
    toast.info(`Arrêt de "${medication}" à implémenter`);
  };

  const handleRenew = (prescriptionId: string) => {
    toast.info('Renouvellement à implémenter');
  };

  const handlePrint = () => {
    toast.info('Impression à implémenter');
  };

  // Parse content safely
  const parseMedications = (content: unknown): MedicationItem[] => {
    if (Array.isArray(content)) return content as MedicationItem[];
    if (typeof content === 'object' && content !== null) {
      const c = content as Record<string, unknown>;
      if (Array.isArray(c.medications)) return c.medications as MedicationItem[];
    }
    return [];
  };

  // Get current medications from active prescriptions
  const currentMedications = activePrescriptions?.flatMap(p => 
    parseMedications(p.content).map(med => ({ ...med, prescriptionId: p.id, prescriber: 'Dr. Martin' }))
  ) ?? [];

  return (
    <DossierPageLayout 
      patient={patient} 
      title="Traitement en cours" 
      breadcrumbLabel="Traitement"
      isLoading={isLoading}
      headerActions={
        <Button className="gap-1.5" onClick={handleNewPrescription}>
          <Plus className="h-4 w-4" />
          Nouvelle ordonnance
        </Button>
      }
    >
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current" className="gap-1.5">
            <Pill className="h-4 w-4" />
            Traitement actif
            {currentMedications.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {currentMedications.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Current Treatment Tab */}
        <TabsContent value="current" className="space-y-4">
          {currentMedications.length === 0 ? (
            <EmptyState
              icon={Pill}
              title="Aucun traitement en cours"
              description="Ce patient n'a pas de traitement actif. Créez une ordonnance pour démarrer un traitement."
              actionLabel="Nouvelle ordonnance"
              actionIcon={Plus}
              onAction={handleNewPrescription}
            />
          ) : (
            <>
              {/* Summary Card */}
              <Card className="bg-muted/30">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Pill className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {currentMedications.length} médicament{currentMedications.length > 1 ? 's' : ''} actif{currentMedications.length > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">Dernière mise à jour aujourd'hui</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={handlePrint}>
                      <FileText className="h-4 w-4" />
                      Imprimer la liste
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Medications List */}
              <Card>
                <CardContent className="p-0 divide-y divide-border">
                  {currentMedications.map((med, index) => (
                    <div key={index} className="p-4 hover:bg-muted/30 transition-colors group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-foreground">{med.name}</h4>
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                              Actif
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {med.dosage} — {med.frequency}
                          </p>
                          {med.instructions && (
                            <p className="text-xs text-muted-foreground italic">{med.instructions}</p>
                          )}
                          {med.duration && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              Durée : {med.duration}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleRenew(med.prescriptionId)}>
                            <RefreshCw className="h-3.5 w-3.5" />
                            Renouveler
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1 text-xs text-destructive hover:text-destructive"
                            onClick={() => handleStopMedication(med.name)}
                          >
                            <StopCircle className="h-3.5 w-3.5" />
                            Arrêter
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {!allPrescriptions || allPrescriptions.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Aucun historique"
              description="Aucune ordonnance n'a encore été créée pour ce patient."
            />
          ) : (
            <Card>
              <CardContent className="p-0 divide-y divide-border">
                {allPrescriptions.map((prescription) => {
                  const medications = parseMedications(prescription.content);
                  const statusMap: Record<string, 'active' | 'completed' | 'cancelled'> = {
                    active: 'active',
                    completed: 'completed',
                    cancelled: 'cancelled',
                  };
                  
                  return (
                    <div key={prescription.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-foreground">
                              Ordonnance du {format(new Date(prescription.created_at), 'dd MMM yyyy', { locale: fr })}
                            </span>
                            <StatusBadge status={statusMap[prescription.status] || 'pending'} />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {medications.length} médicament{medications.length > 1 ? 's' : ''}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <FileText className="h-3.5 w-3.5" />
                          Voir
                        </Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {medications.slice(0, 3).map((med, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {med.name}
                          </Badge>
                        ))}
                        {medications.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{medications.length - 3} autres
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DossierPageLayout>
  );
};

export default PatientTraitementTab;
