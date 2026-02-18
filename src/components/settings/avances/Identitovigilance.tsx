import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Identitovigilance: React.FC = () => {
  const { toast } = useToast();
  const [doubleCheckEnabled, setDoubleCheckEnabled] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('name-dob');

  const handleSave = () => {
    toast({ title: 'Parametres enregistres', description: 'Les parametres d\'identitovigilance ont ete mis a jour.' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Identitovigilance</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-2 text-sm text-amber-800">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          L'identitovigilance permet de securiser l'identification des patients et d'eviter les erreurs
          lors de la prise en charge. Ces parametres s'appliquent a tous les utilisateurs de l'etablissement.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Double verification d'identite</CardTitle>
              </div>
              <Switch checked={doubleCheckEnabled} onCheckedChange={setDoubleCheckEnabled} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Demande une confirmation d'identite avant chaque consultation.
              Le praticien doit verifier l'identite du patient avant de commencer.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Mode strict</CardTitle>
              </div>
              <Switch checked={strictMode} onCheckedChange={setStrictMode} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              En mode strict, la consultation ne peut pas commencer tant que l'identite n'est pas verifiee.
              En mode normal, un avertissement est affiche mais la consultation peut demarrer.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-3">
            <Label>Methode de verification</Label>
            <Select value={verificationMethod} onValueChange={setVerificationMethod}>
              <SelectTrigger className="max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-dob">Nom + Date de naissance</SelectItem>
                <SelectItem value="name-dob-ins">Nom + Date de naissance + INS</SelectItem>
                <SelectItem value="card">Carte vitale</SelectItem>
                <SelectItem value="id-document">Piece d'identite</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Methode utilisee pour verifier l'identite du patient.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>Valider</Button>
      </div>
    </div>
  );
};

export default Identitovigilance;
