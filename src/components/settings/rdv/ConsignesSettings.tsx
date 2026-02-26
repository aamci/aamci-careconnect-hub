import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockConsignes } from '@/data/settingsMockData';
import { PatientConsigne } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const specialties = ['Toutes', 'Medecine Generale', 'Cardiologie', 'Dermatologie', 'Pediatrie', 'Gynecologie'];
const agendas = ['Tous', 'Dr Martin Dupont', 'Dr Sophie Laurent', 'Salle ECG'];

const ConsignesSettings: React.FC = () => {
  const { toast } = useToast();
  const [consignes, setConsignes] = useState<PatientConsigne[]>(mockConsignes);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'before' as PatientConsigne['type'] });
  const [specialtyFilter, setSpecialtyFilter] = useState('Toutes');
  const [agendaFilter, setAgendaFilter] = useState('Tous');
  const [typeFilter, setTypeFilter] = useState('all');

  const handleCreate = () => {
    if (!form.title || !form.content) return;
    const c: PatientConsigne = {
      id: `cons-${Date.now()}`,
      ...form,
      motifIds: [],
      isActive: true,
    };
    setConsignes((prev) => [...prev, c]);
    setShowDialog(false);
    setForm({ title: '', content: '', type: 'before' });
    toast({ title: 'Consigne creee' });
  };

  const handleToggle = (id: string) => {
    setConsignes((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const handleDelete = (id: string) => {
    setConsignes((prev) => prev.filter((c) => c.id !== id));
    toast({ title: 'Consigne supprimee' });
  };

  const typeLabels: Record<string, string> = {
    before: 'Avant le RDV',
    after: 'Apres le RDV',
    both: 'Avant et apres',
  };

  const filtered = consignes.filter((c) => {
    if (typeFilter !== 'all' && c.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Consignes</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Les consignes sont envoyees aux patients avant ou apres leur rendez-vous.
          Elles permettent de leur rappeler des informations importantes.
        </p>
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une consigne
        </Button>
        <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
          <SelectTrigger className="w-44">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {specialties.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={agendaFilter} onValueChange={setAgendaFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {agendas.map((a) => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="before">Avant le RDV</SelectItem>
            <SelectItem value="after">Apres le RDV</SelectItem>
            <SelectItem value="both">Avant et apres</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground mb-3">
        {filtered.length} consigne{filtered.length > 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune consigne configuree.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{c.title}</p>
                    <Badge variant="outline" className="text-xs">{typeLabels[c.type]}</Badge>
                    {c.isActive ? (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{c.content}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={c.isActive} onCheckedChange={() => handleToggle(c.id)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(c.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une consigne</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>Contenu</Label>
              <Textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} rows={4} />
            </div>
            <div>
              <Label>Quand envoyer</Label>
              <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as PatientConsigne['type'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Avant le RDV</SelectItem>
                  <SelectItem value="after">Apres le RDV</SelectItem>
                  <SelectItem value="both">Avant et apres</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Specialite associee</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les specialites" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.filter((s) => s !== 'Toutes').map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={!form.title || !form.content}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsignesSettings;
