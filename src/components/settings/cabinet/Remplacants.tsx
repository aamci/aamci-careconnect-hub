import React, { useState } from 'react';
import { Plus, Edit, Trash2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { mockReplacements } from '@/data/settingsMockData';
import { Replacement } from '@/types/settings';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const emptyForm = { firstName: '', lastName: '', email: '', specialty: '', phone: '', startDate: '', endDate: '' };

const Remplacants: React.FC = () => {
  const { toast } = useToast();
  const [replacements, setReplacements] = useState<Replacement[]>(mockReplacements);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreateDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowDialog(true);
  };

  const openEditDialog = (repl: Replacement) => {
    setEditingId(repl.id);
    setForm({
      firstName: repl.firstName,
      lastName: repl.lastName,
      email: repl.email,
      specialty: repl.specialty,
      phone: repl.phone || '',
      startDate: format(repl.startDate, 'yyyy-MM-dd'),
      endDate: format(repl.endDate, 'yyyy-MM-dd'),
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.firstName || !form.lastName || !form.email) return;

    if (editingId) {
      setReplacements((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                ...form,
                startDate: new Date(form.startDate),
                endDate: new Date(form.endDate),
                isActive: new Date(form.startDate) <= new Date() && new Date(form.endDate) >= new Date(),
              }
            : r
        )
      );
      toast({ title: 'Remplacant modifie', description: `${form.firstName} ${form.lastName} a ete mis a jour.` });
    } else {
      const newRepl: Replacement = {
        id: `repl-${Date.now()}`,
        ...form,
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        isActive: new Date(form.startDate) <= new Date() && new Date(form.endDate) >= new Date(),
      };
      setReplacements((prev) => [...prev, newRepl]);
      toast({ title: 'Remplacant ajoute', description: `${newRepl.firstName} ${newRepl.lastName} a ete ajoute.` });
    }
    setShowDialog(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setReplacements((prev) => prev.filter((r) => r.id !== id));
    toast({ title: 'Remplacant supprime' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Remplacants</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Gerez les remplacants qui peuvent prendre en charge vos consultations pendant vos absences.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un remplacant
        </Button>
      </div>

      {replacements.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucun remplacant configure.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {replacements.map((repl) => (
            <div
              key={repl.id}
              className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{repl.firstName} {repl.lastName}</p>
                  <Badge variant={repl.isActive ? 'default' : 'secondary'} className="text-xs">
                    {repl.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{repl.specialty} - {repl.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Du {format(repl.startDate, 'dd MMM yyyy', { locale: fr })} au {format(repl.endDate, 'dd MMM yyyy', { locale: fr })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(repl)} aria-label={`Modifier ${repl.firstName} ${repl.lastName}`}>
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(repl.id)}
                  aria-label={`Supprimer ${repl.firstName} ${repl.lastName}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingId(null); setForm(emptyForm); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier le remplacant' : 'Ajouter un remplacant'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prenom</Label>
                <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div>
                <Label>Nom</Label>
                <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label>Specialite</Label>
              <Input value={form.specialty} onChange={(e) => setForm((p) => ({ ...p, specialty: e.target.value }))} />
            </div>
            <div>
              <Label>Telephone</Label>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de debut</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.firstName || !form.lastName || !form.email}>
              {editingId ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Remplacants;
