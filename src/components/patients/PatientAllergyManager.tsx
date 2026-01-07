/**
 * PatientAllergyManager - Composant complet pour gérer les allergies d'un patient
 * Permet d'ajouter, modifier et désactiver des allergies
 */

import React, { useState } from 'react';
import { AlertTriangle, Plus, X, Pill, Leaf, Utensils, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  usePatientAllergies, 
  useAllergenReference, 
  useCreatePatientAllergy,
  useDeactivatePatientAllergy,
  type PatientAllergy,
  type CreateAllergyInput
} from '@/hooks/data/useAllergies';
import { cn } from '@/lib/utils';

interface PatientAllergyManagerProps {
  patientId: string;
  readOnly?: boolean;
}

const severityLabels = {
  low: 'Faible',
  medium: 'Modérée',
  high: 'Élevée',
  critical: 'Critique',
};

const severityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
};

const categoryIcons = {
  medication: Pill,
  food: Utensils,
  environmental: Leaf,
  material: AlertTriangle,
  other: AlertTriangle,
};

const PatientAllergyManager: React.FC<PatientAllergyManagerProps> = ({
  patientId,
  readOnly = false,
}) => {
  const { data: allergies, isLoading: loadingAllergies } = usePatientAllergies(patientId);
  const { data: allergens, isLoading: loadingAllergens } = useAllergenReference();
  const createAllergy = useCreatePatientAllergy();
  const deactivateAllergy = useDeactivatePatientAllergy();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAllergen, setSelectedAllergen] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [reactionDescription, setReactionDescription] = useState('');

  const handleAddAllergy = async () => {
    if (!selectedAllergen) return;

    try {
      await createAllergy.mutateAsync({
        patientId,
        input: {
          allergenCode: selectedAllergen,
          severity: selectedSeverity,
          reactionDescription: reactionDescription || undefined,
        },
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemoveAllergy = async (allergy: PatientAllergy) => {
    try {
      await deactivateAllergy.mutateAsync({
        allergyId: allergy.id,
        patientId,
      });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const resetForm = () => {
    setSelectedAllergen('');
    setSelectedSeverity('medium');
    setReactionDescription('');
  };

  // Filter out already added allergens
  const existingCodes = new Set(allergies?.map(a => a.allergenCode) || []);
  const availableAllergens = allergens?.filter(a => !existingCodes.has(a.code)) || [];

  if (loadingAllergies) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Allergies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Allergies
            </CardTitle>
            <CardDescription>
              {allergies?.length === 0 
                ? 'Aucune allergie connue' 
                : `${allergies?.length} allergie${(allergies?.length || 0) > 1 ? 's' : ''} enregistrée${(allergies?.length || 0) > 1 ? 's' : ''}`
              }
            </CardDescription>
          </div>
          {!readOnly && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter une allergie</DialogTitle>
                  <DialogDescription>
                    Sélectionnez un allergène et précisez la sévérité de la réaction.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergen">Allergène</Label>
                    <Select value={selectedAllergen} onValueChange={setSelectedAllergen}>
                      <SelectTrigger id="allergen">
                        <SelectValue placeholder="Sélectionner un allergène" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingAllergens ? (
                          <SelectItem value="" disabled>Chargement...</SelectItem>
                        ) : availableAllergens.length === 0 ? (
                          <SelectItem value="" disabled>Tous les allergènes sont déjà ajoutés</SelectItem>
                        ) : (
                          availableAllergens.map(allergen => (
                            <SelectItem key={allergen.code} value={allergen.code}>
                              <div className="flex items-center gap-2">
                                {allergen.isCommon && <Check className="w-3 h-3 text-green-500" />}
                                {allergen.name}
                                <span className="text-muted-foreground text-xs">({allergen.category})</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">Sévérité</Label>
                    <Select value={selectedSeverity} onValueChange={(v) => setSelectedSeverity(v as any)}>
                      <SelectTrigger id="severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Faible - Inconfort mineur</SelectItem>
                        <SelectItem value="medium">Modérée - Réaction significative</SelectItem>
                        <SelectItem value="high">Élevée - Réaction sévère</SelectItem>
                        <SelectItem value="critical">Critique - Risque vital (anaphylaxie)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reaction">Description de la réaction (optionnel)</Label>
                    <Textarea
                      id="reaction"
                      placeholder="Ex: Urticaire généralisée, œdème de Quincke..."
                      value={reactionDescription}
                      onChange={(e) => setReactionDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleAddAllergy} 
                    disabled={!selectedAllergen || createAllergy.isPending}
                  >
                    {createAllergy.isPending ? 'Ajout...' : 'Ajouter'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {allergies && allergies.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allergies.map(allergy => {
              const Icon = categoryIcons[allergy.allergenCategory as keyof typeof categoryIcons] || AlertTriangle;
              return (
                <Badge
                  key={allergy.id}
                  variant="outline"
                  className={cn(
                    'gap-1.5 pr-1 transition-colors',
                    severityColors[allergy.severity]
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{allergy.allergenName}</span>
                  <span className="text-xs opacity-75">({severityLabels[allergy.severity]})</span>
                  {!readOnly && (
                    <button
                      onClick={() => handleRemoveAllergy(allergy)}
                      className="ml-1 p-0.5 rounded hover:bg-black/10 transition-colors"
                      disabled={deactivateAllergy.isPending}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Aucune allergie connue pour ce patient.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientAllergyManager;
