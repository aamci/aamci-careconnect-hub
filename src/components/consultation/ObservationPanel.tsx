/**
 * Panneau d'observation médicale
 * Modèle, motif, interrogatoire, examen
 */

import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ConsultationData } from '@/hooks/useConsultation';

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
  { id: 'urgence', name: 'Consultation d\'urgence' }
];

export function ObservationPanel({
  consultation,
  onUpdate,
  onToggleCarePlan,
  showCarePlanButton = false
}: ObservationPanelProps) {
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

        <TabsContent value="historique" className="space-y-4 mt-6">
          <p className="text-sm text-muted-foreground">
            Historique du patient à implémenter
          </p>
        </TabsContent>

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
            <Label htmlFor="reason" className="required">
              Motif
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
              rows={6}
              className="min-h-[150px]"
            />
          </div>

          {/* Examen */}
          <div className="space-y-2">
            <Label htmlFor="examination">Examen</Label>
            <Textarea
              id="examination"
              placeholder="Entrer les résultats de l'examen..."
              value={consultation.examination}
              onChange={(e) => onUpdate('examination', e.target.value)}
              rows={6}
              className="min-h-[150px]"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
