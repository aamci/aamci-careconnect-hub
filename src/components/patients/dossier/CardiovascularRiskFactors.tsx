import React, { useState, useEffect, useCallback } from 'react';
import { Heart, AlertTriangle, Loader2, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RiskFactor {
  id: string;
  label: string;
  description: string;
  present: boolean;
  weight: number;
}

interface CardiovascularRiskFactorsProps {
  patientId: string;
}

const DEFAULT_RISK_FACTORS: RiskFactor[] = [
  { id: 'hypertension', label: 'Hypertension artérielle', description: 'PAS >= 140 mmHg ou PAD >= 90 mmHg', present: false, weight: 15 },
  { id: 'diabetes', label: 'Diabète', description: 'Glycémie à jeun >= 1.26 g/L', present: false, weight: 15 },
  { id: 'dyslipidemia', label: 'Dyslipidémie', description: 'LDL > 1.6 g/L ou HDL < 0.4 g/L', present: false, weight: 12 },
  { id: 'smoking', label: 'Tabagisme actif', description: 'Consommation actuelle de tabac', present: false, weight: 15 },
  { id: 'family_history', label: 'AF cardiovasculaire précoce', description: 'IDM < 55 ans (H) ou < 65 ans (F) chez parent au 1er degré', present: false, weight: 10 },
  { id: 'obesity', label: 'Obésité', description: 'IMC >= 30 kg/m²', present: false, weight: 8 },
  { id: 'sedentary', label: 'Sédentarité', description: 'Moins de 150 min/semaine d\'activité modérée', present: false, weight: 5 },
  { id: 'age', label: 'Age à risque', description: 'Homme > 50 ans ou Femme > 60 ans', present: false, weight: 10 },
  { id: 'microalbuminuria', label: 'Microalbuminurie', description: '30-300 mg/24h', present: false, weight: 5 },
  { id: 'renal_insufficiency', label: 'Insuffisance rénale', description: 'DFG < 60 mL/min', present: false, weight: 5 },
];

function getRiskLevel(score: number): { label: string; color: string; bgClass: string } {
  if (score === 0) return { label: 'Non évalué', color: 'text-muted-foreground', bgClass: 'bg-muted' };
  if (score <= 20) return { label: 'Faible', color: 'text-green-700', bgClass: 'bg-green-100' };
  if (score <= 40) return { label: 'Modéré', color: 'text-yellow-700', bgClass: 'bg-yellow-100' };
  if (score <= 60) return { label: 'Élevé', color: 'text-orange-700', bgClass: 'bg-orange-100' };
  return { label: 'Très élevé', color: 'text-red-700', bgClass: 'bg-red-100' };
}

const CardiovascularRiskFactors: React.FC<CardiovascularRiskFactorsProps> = ({ patientId }) => {
  const [factors, setFactors] = useState<RiskFactor[]>(DEFAULT_RISK_FACTORS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [ldlValue, setLdlValue] = useState('');
  const [hdlValue, setHdlValue] = useState('');

  const totalScore = factors
    .filter(f => f.present)
    .reduce((sum, f) => sum + f.weight, 0);

  const riskLevel = getRiskLevel(totalScore);
  const progressValue = Math.min(totalScore, 100);

  const fetchRiskFactors = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('cardiovascular_risk_factors')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle();

      if (error) throw error;

      if (data && data.factors) {
        const savedFactors = data.factors as unknown as Array<{ id: string; present: boolean }>;
        if (Array.isArray(savedFactors)) {
          setFactors(prev =>
            prev.map(f => {
              const saved = savedFactors.find(s => s.id === f.id);
              return saved ? { ...f, present: saved.present } : f;
            })
          );
        }
        if (data.ldl_value) setLdlValue(String(data.ldl_value));
        if (data.hdl_value) setHdlValue(String(data.hdl_value));
      }
    } catch (error) {
      console.error('Error fetching cardiovascular risk factors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchRiskFactors();
  }, [fetchRiskFactors]);

  const handleToggleFactor = (factorId: string) => {
    setFactors(prev =>
      prev.map(f => f.id === factorId ? { ...f, present: !f.present } : f)
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        patient_id: patientId,
        factors: factors.map(f => ({ id: f.id, present: f.present })),
        total_score: totalScore,
        risk_level: riskLevel.label,
        ldl_value: ldlValue ? parseFloat(ldlValue) : null,
        hdl_value: hdlValue ? parseFloat(hdlValue) : null,
        updated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from('cardiovascular_risk_factors')
        .select('id')
        .eq('patient_id', patientId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('cardiovascular_risk_factors')
          .update(payload)
          .eq('patient_id', patientId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cardiovascular_risk_factors')
          .insert(payload);
        if (error) throw error;
      }

      toast.success('Facteurs de risque cardiovasculaire enregistrés');
    } catch (error) {
      console.error('Error saving cardiovascular risk factors:', error);
      toast.error('Erreur lors de l\'enregistrement des FRV');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500" />
            Facteurs de risque cardiovasculaire
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Enregistrer
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Score global */}
        <div className="p-4 rounded-lg border bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Niveau de risque global</span>
            <Badge className={cn('font-medium', riskLevel.bgClass, riskLevel.color)}>
              {totalScore > 60 && <AlertTriangle className="h-3 w-3 mr-1" />}
              {riskLevel.label} ({totalScore}%)
            </Badge>
          </div>
          <Progress value={progressValue} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {factors.filter(f => f.present).length} facteur(s) de risque identifié(s) sur {factors.length}
          </p>
        </div>

        {/* Valeurs biologiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs">LDL cholestérol (g/L)</Label>
            <Input
              type="number"
              step="0.01"
              value={ldlValue}
              onChange={(e) => setLdlValue(e.target.value)}
              placeholder="1.30"
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">HDL cholestérol (g/L)</Label>
            <Input
              type="number"
              step="0.01"
              value={hdlValue}
              onChange={(e) => setHdlValue(e.target.value)}
              placeholder="0.55"
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Liste des facteurs */}
        <div className="space-y-2">
          {factors.map((factor) => (
            <div
              key={factor.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-colors',
                factor.present ? 'bg-red-50/50 border-red-200' : 'bg-card'
              )}
            >
              <div className="flex-1 min-w-0 mr-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{factor.label}</span>
                  {factor.present && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                      +{factor.weight}%
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{factor.description}</p>
              </div>
              <Switch
                checked={factor.present}
                onCheckedChange={() => handleToggleFactor(factor.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CardiovascularRiskFactors;
