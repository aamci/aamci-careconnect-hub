/**
 * LifestyleSection - Detailed Lifestyle and Risk Factors Input
 * Includes tobacco, alcohol, physical activity, nutrition with advanced editing
 */

import React, { useState } from 'react';
import {
  Cigarette,
  Wine,
  Dumbbell,
  Apple,
  Pill,
  ChevronDown,
  ChevronUp,
  Edit3,
  Save,
  X,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type {
  TobaccoStatus,
  AlcoholConsumption,
  PhysicalActivityLevel,
} from '@/types/medicalHistory';

// ============================================================================
// TYPES
// ============================================================================

export interface LifestyleData {
  tobacco: {
    status: TobaccoStatus;
    packYears?: number;
    startAge?: number;
    stopDate?: string;
    type?: string;
    comment?: string;
  };
  alcohol: {
    consumption: AlcoholConsumption;
    unitsPerWeek?: number;
    type?: string;
    comment?: string;
  };
  physicalActivity: {
    level: PhysicalActivityLevel;
    hoursPerWeek?: number;
    types?: string[];
    comment?: string;
  };
  nutrition: {
    dietType?: string;
    restrictions?: string[];
    comment?: string;
  };
  drugs: {
    use: boolean;
    types?: string[];
    comment?: string;
  };
}

interface LifestyleSectionProps {
  data: Partial<LifestyleData>;
  onChange: (data: Partial<LifestyleData>) => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
  readOnly?: boolean;
}

interface AdvancedEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: keyof LifestyleData;
  currentValue: LifestyleData[keyof LifestyleData];
  onSave: (value: LifestyleData[keyof LifestyleData]) => void;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const tobaccoStatusOptions: Array<{ value: TobaccoStatus; label: string; color: string }> = [
  { value: 'never', label: 'Jamais', color: 'bg-green-100 text-green-700' },
  { value: 'former', label: 'Sevre', color: 'bg-blue-100 text-blue-700' },
  { value: 'current', label: 'Actif', color: 'bg-red-100 text-red-700' },
  { value: 'passive_exposure', label: 'Exposition passive', color: 'bg-orange-100 text-orange-700' },
];

const alcoholOptions: Array<{ value: AlcoholConsumption; label: string; color: string }> = [
  { value: 'none', label: 'Aucune', color: 'bg-green-100 text-green-700' },
  { value: 'occasional', label: 'Occasionnelle', color: 'bg-blue-100 text-blue-700' },
  { value: 'moderate', label: 'Moderee', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'heavy', label: 'Importante', color: 'bg-red-100 text-red-700' },
  { value: 'former', label: 'Ancien', color: 'bg-purple-100 text-purple-700' },
];

const physicalActivityOptions: Array<{
  value: PhysicalActivityLevel;
  label: string;
  color: string;
}> = [
  { value: 'sedentary', label: 'Sedentarite (faible)', color: 'bg-red-100 text-red-700' },
  { value: 'low', label: 'Faible', color: 'bg-orange-100 text-orange-700' },
  { value: 'moderate', label: 'Moderee', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'Elevee', color: 'bg-green-100 text-green-700' },
  { value: 'athlete', label: 'Athlete', color: 'bg-blue-100 text-blue-700' },
];

// ============================================================================
// ADVANCED EDIT DIALOG
// ============================================================================

const AdvancedEditDialog: React.FC<AdvancedEditDialogProps> = ({
  isOpen,
  onClose,
  category,
  currentValue,
  onSave,
}) => {
  const [value, setValue] = useState(currentValue);

  const handleSave = () => {
    onSave(value);
    onClose();
  };

  const renderContent = () => {
    switch (category) {
      case 'tobacco':
        return (
          <div className="space-y-4">
            <div>
              <Label>Paquets-annees</Label>
              <Input
                type="number"
                placeholder="Ex: 15"
                value={value?.packYears || ''}
                onChange={(e) =>
                  setValue({ ...value, packYears: parseInt(e.target.value) || undefined })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Calcul: (cigarettes/jour / 20) x annees de tabagisme
              </p>
            </div>
            <div>
              <Label>Age de debut</Label>
              <Input
                type="number"
                placeholder="Ex: 18"
                value={value?.startAge || ''}
                onChange={(e) =>
                  setValue({ ...value, startAge: parseInt(e.target.value) || undefined })
                }
              />
            </div>
            <div>
              <Label>Type de tabac</Label>
              <Input
                placeholder="Ex: Cigarettes, cigares, electronique..."
                value={value?.type || ''}
                onChange={(e) => setValue({ ...value, type: e.target.value })}
              />
            </div>
            <div>
              <Label>Source de l'information</Label>
              <Input
                placeholder="Ex: Declaration patient, dossier..."
                value={value?.source || ''}
                onChange={(e) => setValue({ ...value, source: e.target.value })}
              />
            </div>
            <div>
              <Label>Commentaire</Label>
              <Textarea
                placeholder="Details supplementaires..."
                value={value?.comment || ''}
                onChange={(e) => setValue({ ...value, comment: e.target.value })}
              />
            </div>
          </div>
        );

      case 'alcohol':
        return (
          <div className="space-y-4">
            <div>
              <Label>Unites par semaine</Label>
              <Input
                type="number"
                placeholder="Ex: 10"
                value={value?.unitsPerWeek || ''}
                onChange={(e) =>
                  setValue({ ...value, unitsPerWeek: parseInt(e.target.value) || undefined })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                1 unite = 1 verre standard (10g d'alcool pur)
              </p>
            </div>
            <div>
              <Label>Type de consommation</Label>
              <Input
                placeholder="Ex: Vin, biere, spiritueux..."
                value={value?.type || ''}
                onChange={(e) => setValue({ ...value, type: e.target.value })}
              />
            </div>
            <div>
              <Label>Commentaire</Label>
              <Textarea
                placeholder="Details supplementaires..."
                value={value?.comment || ''}
                onChange={(e) => setValue({ ...value, comment: e.target.value })}
              />
            </div>
          </div>
        );

      case 'physicalActivity':
        return (
          <div className="space-y-4">
            <div>
              <Label>Heures par semaine</Label>
              <Input
                type="number"
                placeholder="Ex: 3"
                value={value?.hoursPerWeek || ''}
                onChange={(e) =>
                  setValue({ ...value, hoursPerWeek: parseInt(e.target.value) || undefined })
                }
              />
            </div>
            <div>
              <Label>Types d'activites</Label>
              <Input
                placeholder="Ex: Marche, natation, velo..."
                value={value?.types?.join(', ') || ''}
                onChange={(e) =>
                  setValue({
                    ...value,
                    types: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                Separez les activites par des virgules
              </p>
            </div>
            <div>
              <Label>Commentaire</Label>
              <Textarea
                placeholder="Details supplementaires..."
                value={value?.comment || ''}
                onChange={(e) => setValue({ ...value, comment: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const categoryLabels: Record<keyof LifestyleData, string> = {
    tobacco: 'Tabac - Edition avancee',
    alcohol: 'Alcool - Edition avancee',
    physicalActivity: 'Activite physique - Edition avancee',
    nutrition: 'Alimentation - Edition avancee',
    drugs: 'Substances - Edition avancee',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {categoryLabels[category]}
          </DialogTitle>
        </DialogHeader>

        {renderContent()}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const LifestyleSection: React.FC<LifestyleSectionProps> = ({
  data,
  onChange,
  onSave,
  isLoading = false,
  readOnly = false,
}) => {
  const [advancedEditOpen, setAdvancedEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<keyof LifestyleData | null>(null);

  const handleOpenAdvanced = (category: keyof LifestyleData) => {
    setEditingCategory(category);
    setAdvancedEditOpen(true);
  };

  const handleAdvancedSave = (value: LifestyleData[keyof LifestyleData]) => {
    if (editingCategory) {
      onChange({
        ...data,
        [editingCategory]: {
          ...(data[editingCategory] as Record<string, unknown>),
          ...(value as Record<string, unknown>)
        }
      });
    }
  };

  const getStatusBadge = (
    value: string | undefined,
    options: Array<{ value: string; label: string; color: string }>
  ) => {
    const option = options.find((o) => o.value === value);
    if (!option) return null;
    return (
      <Badge className={cn('text-xs', option.color)}>
        {option.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Tobacco Section */}
      <Card>
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cigarette className="h-4 w-4 text-muted-foreground" />
                  Tabac
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.tobacco?.status, tobaccoStatusOptions)}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform ui-expanded:rotate-180" />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <RadioGroup
                  value={data.tobacco?.status || 'never'}
                  onValueChange={(value) =>
                    onChange({
                      ...data,
                      tobacco: { ...data.tobacco, status: value as TobaccoStatus },
                    })
                  }
                  disabled={readOnly}
                  className="flex flex-wrap gap-4"
                >
                  {tobaccoStatusOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`tobacco-${opt.value}`} />
                      <Label htmlFor={`tobacco-${opt.value}`} className="cursor-pointer">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {data.tobacco?.status && data.tobacco.status !== 'never' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Commentaire</Label>
                      <Input
                        placeholder="Ex: 20 cigarettes/jour depuis 10 ans"
                        value={data.tobacco?.comment || ''}
                        onChange={(e) =>
                          onChange({
                            ...data,
                            tobacco: { ...data.tobacco, comment: e.target.value },
                          })
                        }
                        disabled={readOnly}
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary"
                      onClick={() => handleOpenAdvanced('tobacco')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Edition avancee
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Alcohol Section */}
      <Card>
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wine className="h-4 w-4 text-muted-foreground" />
                  Alcool
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.alcohol?.consumption, alcoholOptions)}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform ui-expanded:rotate-180" />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <RadioGroup
                  value={data.alcohol?.consumption || 'none'}
                  onValueChange={(value) =>
                    onChange({
                      ...data,
                      alcohol: { ...data.alcohol, consumption: value as AlcoholConsumption },
                    })
                  }
                  disabled={readOnly}
                  className="flex flex-wrap gap-4"
                >
                  {alcoholOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`alcohol-${opt.value}`} />
                      <Label htmlFor={`alcohol-${opt.value}`} className="cursor-pointer">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {data.alcohol?.consumption && data.alcohol.consumption !== 'none' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-muted-foreground">Commentaire</Label>
                      <Input
                        placeholder="Ex: 2 verres de vin par repas"
                        value={data.alcohol?.comment || ''}
                        onChange={(e) =>
                          onChange({
                            ...data,
                            alcohol: { ...data.alcohol, comment: e.target.value },
                          })
                        }
                        disabled={readOnly}
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary"
                      onClick={() => handleOpenAdvanced('alcohol')}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Edition avancee
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Physical Activity Section */}
      <Card>
        <Collapsible>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  Activite physique
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(data.physicalActivity?.level, physicalActivityOptions)}
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform ui-expanded:rotate-180" />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <RadioGroup
                  value={data.physicalActivity?.level || 'moderate'}
                  onValueChange={(value) =>
                    onChange({
                      ...data,
                      physicalActivity: {
                        ...data.physicalActivity,
                        level: value as PhysicalActivityLevel,
                      },
                    })
                  }
                  disabled={readOnly}
                  className="flex flex-wrap gap-4"
                >
                  {physicalActivityOptions.map((opt) => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={`activity-${opt.value}`} />
                      <Label htmlFor={`activity-${opt.value}`} className="cursor-pointer">
                        {opt.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Commentaire</Label>
                    <Input
                      placeholder="Ex: Course a pied, natation..."
                      value={data.physicalActivity?.comment || ''}
                      onChange={(e) =>
                        onChange({
                          ...data,
                          physicalActivity: { ...data.physicalActivity, comment: e.target.value },
                        })
                      }
                      disabled={readOnly}
                      className="flex-1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary"
                    onClick={() => handleOpenAdvanced('physicalActivity')}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Edition avancee
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Save Button */}
      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">...</span>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer le mode de vie
              </>
            )}
          </Button>
        </div>
      )}

      {/* Advanced Edit Dialog */}
      {editingCategory && (
        <AdvancedEditDialog
          isOpen={advancedEditOpen}
          onClose={() => setAdvancedEditOpen(false)}
          category={editingCategory}
          currentValue={data[editingCategory]}
          onSave={handleAdvancedSave}
        />
      )}
    </div>
  );
};

export default LifestyleSection;
