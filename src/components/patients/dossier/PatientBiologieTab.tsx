import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FlaskConical,
  Activity,
  Plus,
  AlertTriangle,
  Calendar,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { usePatientLabResults, useCreateLabResult } from '@/hooks/data/useLabResults';
import { usePatientVitalSigns, useCreateVitalSigns } from '@/hooks/data/useVitalSigns';
import DossierPageLayout from './shared/DossierPageLayout';
import EmptyState from './shared/EmptyState';
import StatusBadge from './shared/StatusBadge';
import { toast } from 'sonner';

interface OutletContext {
  patient: Patient;
}

interface LabResultItem {
  name: string;
  value: string | number;
  unit: string;
  reference_range?: string;
  is_abnormal?: boolean;
}

const PatientBiologieTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const { data: labResults, isLoading: loadingLab } = usePatientLabResults(patient.id);
  const { data: vitalSigns, isLoading: loadingVitals } = usePatientVitalSigns(patient.id);
  const createLabResultMutation = useCreateLabResult();
  const createVitalSignsMutation = useCreateVitalSigns();

  const [showLabModal, setShowLabModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  const isLoading = loadingLab || loadingVitals;

  const handleAddLabResult = () => {
    setShowLabModal(true);
  };

  const handleAddVitals = () => {
    setShowVitalsModal(true);
  };

  // Parse results safely
  const parseResults = (results: unknown): LabResultItem[] => {
    if (Array.isArray(results)) return results as LabResultItem[];
    return [];
  };


  return (
    <DossierPageLayout 
      patient={patient} 
      title="Biologie et Biométrie" 
      breadcrumbLabel="Biologie"
      isLoading={isLoading}
    >
      <Tabs defaultValue="biology" className="space-y-6">
        <TabsList>
          <TabsTrigger value="biology" className="gap-1.5">
            <FlaskConical className="h-4 w-4" />
            Biologie
            {labResults && labResults.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {labResults.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="biometry" className="gap-1.5">
            <Activity className="h-4 w-4" />
            Biométrie
          </TabsTrigger>
        </TabsList>

        {/* Biology Tab */}
        <TabsContent value="biology" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-1.5" onClick={handleAddLabResult}>
              <Plus className="h-4 w-4" />
              Ajouter un résultat
            </Button>
          </div>

          {!labResults || labResults.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="Aucun résultat biologique"
              description="Aucun résultat d'analyse n'a été enregistré pour ce patient."
              actionLabel="Ajouter un résultat"
              actionIcon={Plus}
              onAction={handleAddLabResult}
            />
          ) : (
            <div className="space-y-4">
              {labResults.map((result) => {
                const items = parseResults(result.results);
                const hasAbnormal = items.some(i => i.is_abnormal);
                
                return (
                  <Card key={result.id} className={cn(hasAbnormal && 'border-warning/50')}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base">
                              Analyses du {format(new Date(result.test_date), 'dd MMMM yyyy', { locale: fr })}
                            </CardTitle>
                            {hasAbnormal && (
                              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Valeurs anormales
                              </Badge>
                            )}
                            <StatusBadge status={result.status === 'reviewed' ? 'reviewed' : 'pending'} />
                          </div>
                          {result.lab_name && (
                            <p className="text-xs text-muted-foreground">Laboratoire : {result.lab_name}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-4 w-4" />
                          Détails
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.slice(0, 6).map((item, idx) => (
                          <div 
                            key={idx}
                            className={cn(
                              'p-3 rounded-lg border',
                              item.is_abnormal ? 'bg-destructive/5 border-destructive/20' : 'bg-muted/30 border-border'
                            )}
                          >
                            <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
                            <div className="flex items-baseline gap-1">
                              <span className={cn(
                                'text-lg font-semibold',
                                item.is_abnormal ? 'text-destructive' : 'text-foreground'
                              )}>
                                {item.value}
                              </span>
                              <span className="text-xs text-muted-foreground">{item.unit}</span>
                            </div>
                            {item.reference_range && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Réf: {item.reference_range}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {items.length > 6 && (
                        <Button variant="link" size="sm" className="mt-3 p-0 h-auto">
                          Voir {items.length - 6} autres résultats
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Biometry Tab */}
        <TabsContent value="biometry" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-1.5" onClick={handleAddVitals}>
              <Plus className="h-4 w-4" />
              Ajouter des constantes
            </Button>
          </div>

          {!vitalSigns || vitalSigns.length === 0 ? (
            <EmptyState
              icon={Activity}
              title="Aucune mesure"
              description="Aucune constante biométrique n'a été enregistrée pour ce patient."
              actionLabel="Ajouter des constantes"
              actionIcon={Plus}
              onAction={handleAddVitals}
            />
          ) : (
            <>
              {/* Latest Vitals Summary */}
              <Card className="bg-muted/30">
                <CardContent className="py-4">
                  <h3 className="text-sm font-medium text-foreground mb-4">Dernières mesures</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {vitalSigns[0] && (
                      <>
                        {vitalSigns[0].weight_kg && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{vitalSigns[0].weight_kg}</p>
                            <p className="text-xs text-muted-foreground">Poids (kg)</p>
                          </div>
                        )}
                        {vitalSigns[0].height_cm && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{vitalSigns[0].height_cm}</p>
                            <p className="text-xs text-muted-foreground">Taille (cm)</p>
                          </div>
                        )}
                        {vitalSigns[0].bmi && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{vitalSigns[0].bmi.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground">IMC</p>
                          </div>
                        )}
                        {(vitalSigns[0].systolic_bp || vitalSigns[0].diastolic_bp) && (
                          <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{vitalSigns[0].systolic_bp}/{vitalSigns[0].diastolic_bp}</p>
                            <p className="text-xs text-muted-foreground">TA (mmHg)</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* History */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Historique des mesures</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {vitalSigns.map((vital) => (
                      <div key={vital.id} className="p-4 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {format(new Date(vital.recorded_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {vital.weight_kg && <span>Poids: <strong>{vital.weight_kg} kg</strong></span>}
                          {vital.height_cm && <span>Taille: <strong>{vital.height_cm} cm</strong></span>}
                          {vital.bmi && <span>IMC: <strong>{vital.bmi.toFixed(1)}</strong></span>}
                          {(vital.systolic_bp || vital.diastolic_bp) && <span>TA: <strong>{vital.systolic_bp}/{vital.diastolic_bp}</strong></span>}
                          {vital.heart_rate && <span>FC: <strong>{vital.heart_rate} bpm</strong></span>}
                          {vital.temperature_c && <span>T°: <strong>{vital.temperature_c}°C</strong></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </DossierPageLayout>
  );
};

export default PatientBiologieTab;
