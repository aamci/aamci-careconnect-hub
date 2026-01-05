import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, ChevronDown, ChevronUp, Info, Star, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { observationTemplates, defaultBiometrics } from '@/data/consultationMockData';
import { BiometricData } from '@/types/consultation';

interface MedicalObservationPanelProps {
  onSave?: (data: ObservationData) => void;
  onDraftChange?: (isDraft: boolean) => void;
}

interface ObservationData {
  templateId?: string;
  motif: string;
  interrogatoire: string;
  examen: string;
  biometrics: BiometricData[];
}

const RichTextToolbar: React.FC = () => (
  <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 font-bold">B</Button>
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 italic">I</Button>
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 underline">U</Button>
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 line-through">S</Button>
    <div className="w-px h-5 bg-border mx-1" />
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
      <span className="text-xs">≡</span>
    </Button>
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
      <span className="text-xs">⋮</span>
    </Button>
    <div className="flex-1" />
    <Select defaultValue="normal">
      <SelectTrigger className="h-7 w-24 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-popover z-50">
        <SelectItem value="normal">Normal</SelectItem>
        <SelectItem value="heading1">Titre 1</SelectItem>
        <SelectItem value="heading2">Titre 2</SelectItem>
      </SelectContent>
    </Select>
    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">⋮</Button>
  </div>
);

const MedicalObservationPanel: React.FC<MedicalObservationPanelProps> = ({
  onSave,
  onDraftChange
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [motif, setMotif] = useState('');
  const [interrogatoire, setInterrogatoire] = useState('');
  const [examen, setExamen] = useState('');
  const [biometrics, setBiometrics] = useState<BiometricData[]>(defaultBiometrics);
  const [isInterrogatoireOpen, setIsInterrogatoireOpen] = useState(true);
  const [isExamenOpen, setIsExamenOpen] = useState(true);
  const [isBiometricsOpen, setIsBiometricsOpen] = useState(true);
  const [isDraft, setIsDraft] = useState(false);

  // Auto-save draft
  useEffect(() => {
    const hasContent = motif || interrogatoire || examen;
    if (hasContent && !isDraft) {
      setIsDraft(true);
      onDraftChange?.(true);
    }
  }, [motif, interrogatoire, examen, isDraft, onDraftChange]);

  // Calculate BMI automatically
  const calculateBMI = useCallback(() => {
    const height = biometrics.find(b => b.type === 'height')?.value;
    const weight = biometrics.find(b => b.type === 'weight')?.value;

    if (height && weight && typeof height === 'number' && typeof weight === 'number') {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      setBiometrics(prev => prev.map(b => 
        b.type === 'bmi' ? { ...b, value: Math.round(bmi * 10) / 10 } : b
      ));
    }
  }, [biometrics]);

  const updateBiometric = (id: string, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setBiometrics(prev => prev.map(b => 
      b.id === id ? { ...b, value: numValue } : b
    ));
  };

  useEffect(() => {
    calculateBMI();
  }, [biometrics.find(b => b.type === 'height')?.value, biometrics.find(b => b.type === 'weight')?.value]);

  return (
    <div className="flex-1 h-full bg-card border-r border-border flex flex-col min-w-[400px]">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Observation médicale</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Template Selector */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1">
              Nom du modèle <ChevronUp className="w-3.5 h-3.5" />
            </label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner un modèle" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {observationTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Motif */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 flex items-center gap-1">
              Motif <ChevronUp className="w-3.5 h-3.5" />
            </label>
            <Input
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Entrer le motif"
              className="bg-background"
            />
          </div>

          {/* Interrogatoire */}
          <Collapsible open={isInterrogatoireOpen} onOpenChange={setIsInterrogatoireOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground mb-1.5">
              Interrogatoire
              {isInterrogatoireOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border border-border rounded-md overflow-hidden">
                <RichTextToolbar />
                <textarea
                  value={interrogatoire}
                  onChange={(e) => setInterrogatoire(e.target.value)}
                  placeholder="Entrer les réponses de votre interrogatoire : symptômes, anamnèse..."
                  className="w-full h-32 p-3 text-sm bg-background resize-none focus:outline-none"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Examen */}
          <Collapsible open={isExamenOpen} onOpenChange={setIsExamenOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-sm text-muted-foreground mb-1.5">
              Examen
              {isExamenOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border border-border rounded-md overflow-hidden">
                <RichTextToolbar />
                <textarea
                  value={examen}
                  onChange={(e) => setExamen(e.target.value)}
                  placeholder="Entrer les résultats de l'examen"
                  className="w-full h-32 p-3 text-sm bg-background resize-none focus:outline-none"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Données biométriques */}
          <Collapsible open={isBiometricsOpen} onOpenChange={setIsBiometricsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              Données biométriques
              {isBiometricsOpen ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              <Info className="w-3.5 h-3.5" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-3">
                {biometrics.map((bio) => (
                  <div key={bio.id} className="flex items-center gap-3">
                    <Star className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground min-w-[180px]">{bio.label}</span>
                    <Input
                      type={bio.isAuto ? 'text' : 'number'}
                      value={bio.value ?? ''}
                      onChange={(e) => !bio.isAuto && updateBiometric(bio.id, e.target.value)}
                      placeholder={bio.isAuto ? 'Auto' : 'Valeur'}
                      className="w-20 h-8 text-sm"
                      disabled={bio.isAuto}
                    />
                    <span className="text-sm text-muted-foreground">{bio.unit}</span>
                    <span className="text-muted-foreground">-</span>
                    <span className="text-muted-foreground">-</span>
                  </div>
                ))}

                <button className="flex items-center gap-1 text-sm text-primary hover:text-primary-light transition-colors mt-2">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une donnée</span>
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Additional section hint */}
          <div className="pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Données historiques</span>
              <Plus className="w-3.5 h-3.5" />
              <Info className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Draft indicator */}
      {isDraft && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border">
          <span className="text-xs text-muted-foreground">Brouillon sauvegardé automatiquement</span>
        </div>
      )}
    </div>
  );
};

export default MedicalObservationPanel;
