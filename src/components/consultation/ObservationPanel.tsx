/**
 * Panneau d'observation médicale
 * Modèle, motif, interrogatoire, examen, diagnostic, plan de traitement, suivi
 */

import { ChevronRight, Clock, Stethoscope, FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ConsultationData } from '@/hooks/useConsultation';
import { usePatientConsultations } from '@/hooks/data/useConsultations';
import { usePatientLabResults } from '@/hooks/data/useLabResults';
import { useLatestVitalSigns } from '@/hooks/data/useVitalSigns';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ObservationPanelProps {
  consultation: ConsultationData;
  onUpdate: <K extends keyof ConsultationData>(field: K, value: ConsultationData[K]) => void;
  onToggleCarePlan?: () => void;
  showCarePlanButton?: boolean;
}

const CONSULTATION_TEMPLATES = [
  { id: 'visite-aptitude-aeronautique', name: 'VISITE APTITUDE AERONAUTIQUE' },
  { id: 'consultation-generale', name: 'Consultation générale' },
  { id: 'suivi', name: 'Consultation de suivi' },
  { id: 'urgence', name: 'Consultation d\'urgence' },
  { id: 'renouvellement', name: 'Renouvellement ordonnance' },
  { id: 'pediatrie', name: 'Consultation pédiatrique' },
];

export function ObservationPanel({
  consultation,
  onUpdate,
  onToggleCarePlan,
  showCarePlanButton = false
}: ObservationPanelProps) {
  const { data: pastConsultations } = usePatientConsultations(consultation.patientId);
  const { data: labResults } = usePatientLabResults(consultation.patientId);
  const { data: latestVitals } = useLatestVitalSigns(consultation.patientId);

  const completedConsultations = pastConsultations?.filter(
    c => c.status === 'completed' && c.id !== consultation.id
  ) || [];

  return (
    <div className="space-y-6 p-6">
      {/* Header avec bouton plan de soins (mobile) */}
      {showCarePlanButton && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleCarePlan}
            className="gap-2"
          >
            Plan de soins
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Onglets */}
      <Tabs defaultValue="observation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="historique">Historique du patient</TabsTrigger>
          <TabsTrigger value="observation">Observation médicale</TabsTrigger>
        </TabsList>

        {/* Historique du patient */}
        <TabsContent value="historique" className="space-y-4 mt-6">
          {/* Dernières constantes */}
          {latestVitals && (
            <Card>
              <CardContent className="py-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary" />
                  Dernières constantes
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {latestVitals.weight_kg != null && (
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-semibold">{latestVitals.weight_kg}</p>
                      <p className="text-xs text-muted-foreground">Poids (kg)</p>
                    </div>
                  )}
                  {(latestVitals.systolic_bp != null || latestVitals.diastolic_bp != null) && (
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-semibold">{latestVitals.systolic_bp}/{latestVitals.diastolic_bp}</p>
                      <p className="text-xs text-muted-foreground">TA (mmHg)</p>
                    </div>
                  )}
                  {latestVitals.heart_rate != null && (
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-semibold">{latestVitals.heart_rate}</p>
                      <p className="text-xs text-muted-foreground">FC (bpm)</p>
                    </div>
                  )}
                  {latestVitals.temperature_c != null && (
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-lg font-semibold">{latestVitals.temperature_c}</p>
                      <p className="text-xs text-muted-foreground">Temp. (°C)</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Mesurées le {format(new Date(latestVitals.recorded_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Derniers résultats biologiques */}
          {labResults && labResults.length > 0 && (
            <Card>
              <CardContent className="py-4">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Derniers résultats biologiques
                </h4>
                <div className="space-y-2">
                  {labResults.slice(0, 3).map((result) => {
                    const items = Array.isArray(result.results) ? result.results : [];
                    const hasAbnormal = items.some((r: any) => r.is_abnormal);
                    return (
                      <div key={result.id} className="flex items-center justify-between p-2 rounded-lg border">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {format(new Date(result.test_date), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                          {result.category && (
                            <Badge variant="secondary" className="text-xs">{result.category}</Badge>
                          )}
                        </div>
                        {hasAbnormal && (
                          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Anormal
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consultations précédentes */}
          <Card>
            <CardContent className="py-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                Consultations précédentes
                {completedConsultations.length > 0 && (
                  <Badge variant="secondary" className="text-xs">{completedConsultations.length}</Badge>
                )}
              </h4>
              {completedConsultations.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  Aucune consultation antérieure pour ce patient.
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {completedConsultations.slice(0, 10).map((c) => (
                    <div key={c.id} className="p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {format(new Date(c.start_time), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Terminée
                        </Badge>
                      </div>
                      {c.chief_complaint && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {c.chief_complaint}
                        </p>
                      )}
                      {c.treatment_plan && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                          Plan: {c.treatment_plan}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message si aucune donnée */}
          {!latestVitals && (!labResults || labResults.length === 0) && completedConsultations.length === 0 && (
            <div className="flex flex-col items-center py-8 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Aucun historique médical disponible pour ce patient.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Observation médicale */}
        <TabsContent value="observation" className="space-y-6 mt-6">
          {/* Modèle de consultation */}
          <div className="space-y-2">
            <Label htmlFor="template">Nom du modèle</Label>
            <Select
              value={consultation.templateId || ''}
              onValueChange={(value) => {
                const template = CONSULTATION_TEMPLATES.find(t => t.id === value);
                onUpdate('templateId', value);
                onUpdate('templateName', template?.name);
              }}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder="Sélectionner un modèle" />
              </SelectTrigger>
              <SelectContent>
                {CONSULTATION_TEMPLATES.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motif */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Motif <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Entrer le motif de consultation..."
              value={consultation.reason}
              onChange={(e) => onUpdate('reason', e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Interrogatoire */}
          <div className="space-y-2">
            <Label htmlFor="anamnesis">Interrogatoire</Label>
            <Textarea
              id="anamnesis"
              placeholder="Entrer les réponses de l'interrogatoire : symptômes, anamnèse..."
              value={consultation.anamnesis}
              onChange={(e) => onUpdate('anamnesis', e.target.value)}
              rows={5}
              className="min-h-[120px]"
            />
          </div>

          {/* Examen clinique */}
          <div className="space-y-2">
            <Label htmlFor="examination">Examen clinique</Label>
            <Textarea
              id="examination"
              placeholder="Entrer les résultats de l'examen clinique..."
              value={consultation.examination}
              onChange={(e) => onUpdate('examination', e.target.value)}
              rows={5}
              className="min-h-[120px]"
            />
          </div>

          {/* Diagnostic */}
          <div className="space-y-2">
            <Label htmlFor="diagnosis">Diagnostic</Label>
            <Textarea
              id="diagnosis"
              placeholder="Diagnostic principal et diagnostics associés..."
              value={consultation.diagnosis}
              onChange={(e) => onUpdate('diagnosis', e.target.value)}
              rows={3}
            />
          </div>

          {/* Plan de traitement */}
          <div className="space-y-2">
            <Label htmlFor="treatmentPlan">Plan de traitement</Label>
            <Textarea
              id="treatmentPlan"
              placeholder="Traitement prescrit, posologie, durée..."
              value={consultation.treatmentPlan}
              onChange={(e) => onUpdate('treatmentPlan', e.target.value)}
              rows={4}
              className="min-h-[100px]"
            />
          </div>

          {/* Consignes de suivi */}
          <div className="space-y-2">
            <Label htmlFor="followUpInstructions">Consignes de suivi</Label>
            <Textarea
              id="followUpInstructions"
              placeholder="Consignes pour le patient, prochain rendez-vous, examens à prévoir..."
              value={consultation.followUpInstructions}
              onChange={(e) => onUpdate('followUpInstructions', e.target.value)}
              rows={3}
            />
          </div>

          {/* Conclusion */}
          <div className="space-y-2">
            <Label htmlFor="conclusion">Conclusion</Label>
            <Textarea
              id="conclusion"
              placeholder="Notes de conclusion, observations finales..."
              value={consultation.conclusion}
              onChange={(e) => onUpdate('conclusion', e.target.value)}
              rows={3}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
