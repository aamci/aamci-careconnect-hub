import React, { useState } from 'react';
import { Plus, GripVertical, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockMotifCategories } from '@/data/settingsMockData';
import { MotifCategory } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const CategoriesMotifs: React.FC = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<MotifCategory[]>(mockMotifCategories);

  const handleAdd = () => {
    setCategories((prev) => [
      ...prev,
      { id: `cat-${Date.now()}`, name: '', order: prev.length + 1 },
    ]);
  };

  const handleNameChange = (id: string, name: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name } : c)));
  };

  const handleDelete = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSave = () => {
    const valid = categories.filter((c) => c.name.trim());
    setCategories(valid);
    toast({ title: 'Categories enregistrees' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">
        Categories de motifs de consultation
      </h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800 space-y-1">
        <p>Vous pouvez creer des categories pour regrouper vos motifs de consultation.</p>
        <p>Cela facilitera la prise de rendez-vous sur l'agenda et apportera un complement d'information aux patients qui prennent rendez-vous en ligne.</p>
        <p>Vous pouvez glisser-deposer chaque ligne pour reordonner les categories.</p>
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-primary px-4">Nom</div>

        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab flex-shrink-0" />
            <Input
              value={cat.name}
              onChange={(e) => handleNameChange(cat.id, e.target.value)}
              className="flex-1"
              placeholder="Nom de la categorie"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => handleDelete(cat.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button variant="outline" onClick={handleAdd} className="gap-2 text-primary">
          <Plus className="h-4 w-4" />
          Ajouter une nouvelle categorie
        </Button>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>Valider</Button>
      </div>
    </div>
  );
};

export default CategoriesMotifs;
