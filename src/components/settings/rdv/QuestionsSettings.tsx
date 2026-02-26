import React, { useState } from 'react';
import { Plus, Edit, Trash2, MessageCircleQuestion, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { mockQuestions } from '@/data/settingsMockData';
import { PatientQuestion } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const typeLabels: Record<string, string> = {
  text: 'Texte libre',
  yesno: 'Oui/Non',
  choice: 'Choix multiple',
  number: 'Nombre',
};

const specialties = ['Toutes', 'Medecine Generale', 'Cardiologie', 'Dermatologie', 'Pediatrie', 'Gynecologie'];
const agendas = ['Tous', 'Dr Martin Dupont', 'Dr Sophie Laurent', 'Salle ECG'];
const motifs = ['Tous', 'Consultation de suivi', 'Premiere consultation', 'Urgence', 'Vaccination', 'Bilan annuel'];

const QuestionsSettings: React.FC = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<PatientQuestion[]>(mockQuestions);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    question: '',
    type: 'text' as PatientQuestion['type'],
    isRequired: false,
  });
  const [specialtyFilter, setSpecialtyFilter] = useState('Toutes');
  const [agendaFilter, setAgendaFilter] = useState('Tous');
  const [motifFilter, setMotifFilter] = useState('Tous');
  const [typeFilter, setTypeFilter] = useState('all');

  const openEditDialog = (q: PatientQuestion) => {
    setEditingId(q.id);
    setForm({ question: q.question, type: q.type, isRequired: q.isRequired });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.question) return;
    if (editingId) {
      setQuestions((prev) => prev.map((q) => (q.id === editingId ? { ...q, ...form } : q)));
      toast({ title: 'Question modifiee' });
    } else {
      const q: PatientQuestion = { id: `q-${Date.now()}`, ...form, motifIds: [], isActive: true };
      setQuestions((prev) => [...prev, q]);
      toast({ title: 'Question ajoutee' });
    }
    setShowDialog(false);
    setForm({ question: '', type: 'text', isRequired: false });
    setEditingId(null);
  };

  const handleToggle = (id: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, isActive: !q.isActive } : q)));
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast({ title: 'Question supprimee' });
  };

  const filtered = questions.filter((q) => {
    if (typeFilter !== 'all' && q.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Questions</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Les questions sont posees aux patients lors de la prise de rendez-vous en ligne.
          Elles vous permettent de collecter des informations importantes avant la consultation.
        </p>
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une question
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
        <Select value={motifFilter} onValueChange={setMotifFilter}>
          <SelectTrigger className="w-44">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {motifs.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="text">Texte libre</SelectItem>
            <SelectItem value="yesno">Oui/Non</SelectItem>
            <SelectItem value="choice">Choix multiple</SelectItem>
            <SelectItem value="number">Nombre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Result count */}
      <p className="text-xs text-muted-foreground mb-3">
        {filtered.length} question{filtered.length > 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircleQuestion className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune question configuree.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <div
              key={q.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{q.question}</p>
                    {q.isActive ? (
                      <Badge variant="default" className="text-xs">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{typeLabels[q.type]}</Badge>
                    {q.isRequired && (
                      <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Switch checked={q.isActive} onCheckedChange={() => handleToggle(q.id)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(q)} aria-label={`Modifier ${q.question}`}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingId(null); setForm({ question: '', type: 'text', isRequired: false }); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier la question' : 'Ajouter une question'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Question</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm((p) => ({ ...p, question: e.target.value }))}
                placeholder="Votre question..."
              />
            </div>
            <div>
              <Label>Type de reponse</Label>
              <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as PatientQuestion['type'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Texte libre</SelectItem>
                  <SelectItem value="yesno">Oui/Non</SelectItem>
                  <SelectItem value="choice">Choix multiple</SelectItem>
                  <SelectItem value="number">Nombre</SelectItem>
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
            <div>
              <Label>Motif associe</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les motifs" />
                </SelectTrigger>
                <SelectContent>
                  {motifs.filter((m) => m !== 'Tous').map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.isRequired}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isRequired: !!v }))}
              />
              <Label>Reponse obligatoire</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.question}>{editingId ? 'Enregistrer' : 'Ajouter'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionsSettings;
