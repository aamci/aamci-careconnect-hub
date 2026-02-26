import React, { useState } from 'react';
import { Plus, Edit, Trash2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { mockInternalInstructions } from '@/data/settingsMockData';
import { InternalInstruction } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const emptyForm = { title: '', content: '' };

const InstructionsInternes: React.FC = () => {
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<InternalInstruction[]>(mockInternalInstructions);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEditDialog = (instr: InternalInstruction) => {
    setEditingId(instr.id);
    setForm({ title: instr.title, content: instr.content });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.title || !form.content) return;

    if (editingId) {
      setInstructions((prev) =>
        prev.map((i) => (i.id === editingId ? { ...i, ...form } : i))
      );
      toast({ title: 'Instruction modifiee' });
    } else {
      const instr: InternalInstruction = {
        id: `instr-${Date.now()}`,
        title: form.title,
        content: form.content,
        motifIds: [],
        isActive: true,
      };
      setInstructions((prev) => [...prev, instr]);
      toast({ title: 'Instruction creee' });
    }

    setShowDialog(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleToggle = (id: string) => {
    setInstructions((prev) =>
      prev.map((i) => (i.id === id ? { ...i, isActive: !i.isActive } : i))
    );
  };

  const handleDelete = (id: string) => {
    setInstructions((prev) => prev.filter((i) => i.id !== id));
    toast({ title: 'Instruction supprimee' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">
        Instructions internes pour la reservation hors ligne
      </h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Ces instructions sont visibles uniquement par votre equipe lors de la prise de rendez-vous.
          Elles ne sont jamais partagees avec les patients.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une instruction
        </Button>
      </div>

      {instructions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune instruction interne configuree.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {instructions.map((instr) => (
            <div
              key={instr.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{instr.title}</p>
                    <Switch
                      checked={instr.isActive}
                      onCheckedChange={() => handleToggle(instr.id)}
                      aria-label={`Activer ${instr.title}`}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{instr.content}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(instr)} aria-label={`Modifier ${instr.title}`}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(instr.id)}
                    aria-label={`Supprimer ${instr.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier l\'instruction' : 'Ajouter une instruction interne'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Titre de l'instruction"
              />
            </div>
            <div>
              <Label>Contenu</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Detail de l'instruction..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.title || !form.content}>
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructionsInternes;
