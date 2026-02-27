import React, { useState, useMemo } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  CheckSquare,
  Plus,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';

type TaskStatus = 'todo' | 'in_progress' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Valider les resultats labo de Mme Martin', description: 'Bilan sanguin complet a verifier', status: 'todo', priority: 'high', dueDate: '2026-02-26', assignee: 'Dr Dupont' },
  { id: '2', title: 'Rediger le compte-rendu operatoire', description: 'Intervention du 24/02 - patient Leroy', status: 'in_progress', priority: 'high', dueDate: '2026-02-27', assignee: 'Dr Dupont' },
  { id: '3', title: 'Appeler la pharmacie pour ordonnance', description: 'Renouvellement traitement patient Bernard', status: 'todo', priority: 'medium', dueDate: '2026-02-28', assignee: 'Secretariat' },
  { id: '4', title: 'Mettre a jour le dossier vaccination', description: 'Patients de plus de 65 ans - campagne grippe', status: 'todo', priority: 'low', dueDate: '2026-03-01', assignee: 'Infirmiere' },
  { id: '5', title: 'Commander fournitures cabinet', description: 'Gants, masques, desinfectant', status: 'done', priority: 'low', dueDate: '2026-02-25', assignee: 'Secretariat' },
  { id: '6', title: 'Preparer la teleconsultation de 14h', description: 'Verifier la connexion et les documents du patient', status: 'done', priority: 'medium', dueDate: '2026-02-26', assignee: 'Dr Dupont' },
];

const statusConfig: Record<TaskStatus, { label: string; icon: React.ElementType; color: string }> = {
  todo: { label: 'A faire', icon: Circle, color: 'text-muted-foreground' },
  in_progress: { label: 'En cours', icon: Clock, color: 'text-blue-600' },
  done: { label: 'Termine', icon: CheckCircle2, color: 'text-green-600' },
};

const priorityConfig: Record<TaskPriority, { label: string; variant: 'default' | 'destructive' | 'outline' }> = {
  high: { label: 'Haute', variant: 'destructive' },
  medium: { label: 'Moyenne', variant: 'default' },
  low: { label: 'Basse', variant: 'outline' },
};

const statusCycle: TaskStatus[] = ['todo', 'in_progress', 'done'];
const assignees = ['Dr Dupont', 'Secretariat', 'Infirmiere', 'Dr Laurent'];

const TasksPage: React.FC = () => {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState('tasks');
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<'all' | TaskStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    status: 'todo' as TaskStatus,
    dueDate: '',
    assignee: 'Dr Dupont',
  });

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }), [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesFilter = filter === 'all' || t.status === filter;
      const matchesSearch = searchQuery
        ? `${t.title} ${t.description} ${t.assignee}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filter, searchQuery]);

  const openEditDialog = (task: Task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      assignee: task.assignee,
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    if (editingId) {
      setTasks((prev) => prev.map((t) => t.id === editingId ? { ...t, ...form } : t));
      toast({ title: 'Tache modifiee' });
    } else {
      const task: Task = { id: `task-${Date.now()}`, ...form };
      setTasks((prev) => [...prev, task]);
      toast({ title: 'Tache creee' });
    }
    setShowDialog(false);
    setEditingId(null);
    setForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignee: 'Dr Dupont' });
  };

  const handleCycleStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = statusCycle.indexOf(t.status);
        const next = statusCycle[(idx + 1) % statusCycle.length];
        return { ...t, status: next };
      })
    );
  };

  const handleDelete = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast({ title: 'Tache supprimee' });
  };

  return (
    <MainLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Taches</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {counts.todo} a faire, {counts.in_progress} en cours, {counts.done} terminee{counts.done > 1 ? 's' : ''}
              </p>
            </div>
            <Button onClick={() => setShowDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nouvelle tache
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <div className="flex gap-1.5">
              {(['all', 'todo', 'in_progress', 'done'] as const).map((s) => (
                <Button
                  key={s}
                  variant={filter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(s)}
                  className="gap-1.5 h-8"
                >
                  {s === 'all' ? 'Toutes' : statusConfig[s].label}
                  <Badge variant="secondary" className="ml-0.5 text-xs h-5 min-w-[20px] justify-center">
                    {counts[s]}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CheckSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-sm">Aucune tache dans cette categorie.</p>
              <p className="text-xs mt-1">Creez votre premiere tache pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((task) => {
                const StatusIcon = statusConfig[task.status].icon;
                const pConfig = priorityConfig[task.priority];
                return (
                  <Card
                    key={task.id}
                    className="hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => openEditDialog(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <button
                          className="mt-0.5 flex-shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleCycleStatus(task.id); }}
                          aria-label={`Changer le statut de ${task.title}`}
                          title={`Statut actuel : ${statusConfig[task.status].label}. Cliquer pour changer.`}
                        >
                          <StatusIcon className={`h-5 w-5 ${statusConfig[task.status].color} hover:scale-110 transition-transform`} />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {task.title}
                            </p>
                            <Badge variant={pConfig.variant} className="text-xs">
                              {pConfig.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.dueDate}
                            </span>
                            <span>{task.assignee}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {task.priority === 'high' && task.status !== 'done' && (
                            <AlertCircle className="h-4 w-4 text-destructive" />
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}
                            aria-label="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) { setEditingId(null); setForm({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignee: 'Dr Dupont' }); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier la tache' : 'Nouvelle tache'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Titre de la tache"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description (optionnel)"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priorite</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((p) => ({ ...p, priority: v as TaskPriority }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as TaskStatus }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">A faire</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="done">Termine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Echeance</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Assigne a</Label>
                <Select value={form.assignee} onValueChange={(v) => setForm((p) => ({ ...p, assignee: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!form.title}>
              {editingId ? 'Enregistrer' : 'Creer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default TasksPage;
