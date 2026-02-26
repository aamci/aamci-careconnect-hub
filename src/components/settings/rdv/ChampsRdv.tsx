import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface RdvFieldConfig {
  id: string;
  label: string;
  isVisibleInAgenda: boolean;
  isRequired: boolean;
  hasInfo?: boolean;
  infoText?: string;
}

const initialFields: RdvFieldConfig[] = [
  { id: 'f-1', label: '1er prenom de naissance', isVisibleInAgenda: false, isRequired: false, hasInfo: true, infoText: 'Prenom figurant sur l\'acte de naissance' },
  { id: 'f-2', label: 'Email', isVisibleInAgenda: false, isRequired: false, hasInfo: true, infoText: 'Adresse email du patient' },
  { id: 'f-3', label: 'Sexe', isVisibleInAgenda: false, isRequired: false },
  { id: 'f-4', label: 'Date de naissance', isVisibleInAgenda: false, isRequired: false },
  { id: 'f-5', label: 'Lieu de naissance', isVisibleInAgenda: false, isRequired: false },
  { id: 'f-6', label: 'Telephone portable', isVisibleInAgenda: false, isRequired: false },
  { id: 'f-7', label: 'Telephone fixe', isVisibleInAgenda: true, isRequired: false },
  { id: 'f-8', label: 'Adresse postale', isVisibleInAgenda: false, isRequired: false },
  { id: 'f-9', label: 'Provenance / Adressage', isVisibleInAgenda: true, isRequired: false },
  { id: 'f-10', label: 'Comptabilite', isVisibleInAgenda: false, isRequired: false, hasInfo: true, infoText: 'Mode de facturation du patient' },
  { id: 'f-11', label: 'Type de sejour', isVisibleInAgenda: false, isRequired: false, hasInfo: true, infoText: 'Type de sejour hospitalier' },
  { id: 'f-12', label: 'Identifiant externe', isVisibleInAgenda: false, isRequired: false },
  { id: 'f-13', label: 'Nom de naissance', isVisibleInAgenda: false, isRequired: false },
  { id: 'f-14', label: 'Type d\'assurance', isVisibleInAgenda: false, isRequired: false, hasInfo: true, infoText: 'Assurance maladie du patient' },
  { id: 'f-15', label: 'Prenom utilise', isVisibleInAgenda: false, isRequired: false },
];

const ChampsRdv: React.FC = () => {
  const { toast } = useToast();
  const [fields, setFields] = useState<RdvFieldConfig[]>(initialFields);

  const handleToggleVisible = (id: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, isVisibleInAgenda: !f.isVisibleInAgenda } : f)));
  };

  const handleToggleRequired = (id: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, isRequired: !f.isRequired } : f)));
  };

  const handleSave = () => {
    toast({ title: 'Champs enregistres', description: 'Les champs de prise de RDV ont ete mis a jour.' });
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl">
        <h1 className="text-lg font-bold text-foreground mb-6">
          Champs de prise de rendez-vous
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800 space-y-1">
          <p className="font-medium">Nouvelle experience de prise de rendez-vous</p>
          <p>
            Cette selection de champs permet d'utiliser la nouvelle experience de reservation.
            Veuillez noter que certains champs ne peuvent pas etre affiches dans la carte de rendez-vous.
          </p>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
            <span>Libelle du champ</span>
            <span className="w-36 text-center">Visible dans l'agenda</span>
            <span className="w-28 text-center">Champ requis</span>
          </div>

          {fields.map((field) => (
            <div
              key={field.id}
              className="grid grid-cols-[1fr_auto_auto] gap-4 px-4 py-2.5 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{field.label}</span>
                {field.hasInfo && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{field.infoText}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <div className="w-36 flex justify-center">
                <Switch
                  checked={field.isVisibleInAgenda}
                  onCheckedChange={() => handleToggleVisible(field.id)}
                />
              </div>
              <div className="w-28 flex justify-center">
                <Switch
                  checked={field.isRequired}
                  onCheckedChange={() => handleToggleRequired(field.id)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Valider</Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default ChampsRdv;
