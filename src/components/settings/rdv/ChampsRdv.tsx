import React, { useState } from 'react';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { mockRdvFields } from '@/data/settingsMockData';
import { RdvField } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const ChampsRdv: React.FC = () => {
  const { toast } = useToast();
  const [fields, setFields] = useState<RdvField[]>(mockRdvFields);

  const handleToggle = (id: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, isActive: !f.isActive } : f)));
  };

  const handleToggleRequired = (id: string) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, isRequired: !f.isRequired } : f)));
  };

  const handleSave = () => {
    toast({ title: 'Champs enregistres', description: 'Les champs de prise de RDV ont ete mis a jour.' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">
        Champs de prise de rendez-vous
      </h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <p>
          Configurez les champs affiches dans le formulaire de prise de rendez-vous en ligne.
          Vous pouvez activer/desactiver et rendre obligatoire chaque champ.
        </p>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
          <span className="w-6" />
          <span>Champ</span>
          <span className="w-16 text-center">Type</span>
          <span className="w-24 text-center">Obligatoire</span>
          <span className="w-16 text-center">Actif</span>
        </div>

        {fields.map((field) => (
          <div
            key={field.id}
            className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <span className="text-sm font-medium">{field.label}</span>
            <Badge variant="outline" className="w-16 justify-center text-xs capitalize">
              {field.type}
            </Badge>
            <div className="w-24 flex justify-center">
              <Switch
                checked={field.isRequired}
                onCheckedChange={() => handleToggleRequired(field.id)}
              />
            </div>
            <div className="w-16 flex justify-center">
              <Switch
                checked={field.isActive}
                onCheckedChange={() => handleToggle(field.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>Valider</Button>
      </div>
    </div>
  );
};

export default ChampsRdv;
