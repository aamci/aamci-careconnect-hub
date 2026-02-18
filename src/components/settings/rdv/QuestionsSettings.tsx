import React, { useState } from 'react';
import { Plus, Edit, Trash2, MessageCircleQuestion } from 'lucide-react';
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

const QuestionsSettings: React.FC = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<PatientQuestion[]>(mockQuestions);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({
    question: '',
    type: 'text' as PatientQuestion['type'],
    isRequired: false,
  });

  const handleCreate = () => {
    if (!form.question) return;
    const q: PatientQuestion = {
      id: `q-${Date.now()}`,
      ...form,
      motifIds: [],
      isActive: true,
    };
    setQuestions((prev) => [...prev, q]);
    setShowDialog(false);
    setForm({ question: '', type: 'text', isRequired: false });
    toast({ title: 'Question ajoutee' });
  };

  const handleToggle = (id: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, isActive: !q.isActive } : q)));
  };

  const handleDelete = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    toast({ title: 'Question supprimee' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Questions</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Les questions sont posees aux patients lors de la prise de rendez-vous en ligne.
          Elles vous permettent de collecter des informations importantes avant la consultation.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <MessageCircleQuestion className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucune question configuree.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{q.question}</p>
                    <Switch checked={q.isActive} onCheckedChange={() => handleToggle(q.id)} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{typeLabels[q.type]}</Badge>
                    {q.isRequired && (
                      <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une question</DialogTitle>
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
            <Button onClick={handleCreate} disabled={!form.question}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionsSettings;
