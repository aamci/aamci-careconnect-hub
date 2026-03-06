import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import {
  Plus,
  Circle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Search,
  Calendar as CalendarIcon,
  User,
  X,
  Filter,
  Pencil,
  Tag,
  Flag,
  UserCheck,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { usePatients } from '@/hooks/data/usePatients';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/data/useTasks';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  TaskFormDialog,
  TaskFormData,
  TaskPriority,
  TaskCategory,
  categoryConfig,
} from '@/components/tasks/TaskFormDialog';

type TaskStatus = 'todo' | 'in-progress' | 'done';
type FilterStatus = 'all' | TaskStatus;

const statusConfig: Record<TaskStatus, { label: string; icon: React.ElementType; color: string; textColor: string; bgColor: string; borderColor: string }> = {
  'todo': { label: 'A faire', icon: Circle, color: 'text-amber-600', textColor: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  'in-progress': { label: 'En cours', icon: Clock, color: 'text-blue-600', textColor: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  'done': { label: 'Termine', icon: CheckCircle2, color: 'text-green-600', textColor: 'text-green-700', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
};

const priorityDisplay: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline'; color: string; bgColor: string; borderColor: string }> = {
  urgent: { label: 'Urgent', variant: 'destructive', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200' },
  high: { label: 'Haute', variant: 'destructive', color: 'text-red-700', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  medium: { label: 'Moyenne', variant: 'default', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200' },
  low: { label: 'Basse', variant: 'outline', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
};

function taskToFormData(task: Task): TaskFormData {
  const categoryMap: Record<string, TaskCategory> = {
    'rendez-vous': 'rendez-vous', 'patient-contact': 'patient-contact', 'document': 'document',
    'facturation': 'facturation', 'resultats': 'resultats', 'autre': 'autre',
    'call': 'patient-contact', 'preparation': 'autre', 'followup': 'rendez-vous',
    'administrative': 'facturation', 'other': 'autre',
  };
  return {
    title: task.title, description: task.description || '',
    priority: task.priority as TaskPriority, category: categoryMap[task.type] || 'autre',
    dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : '',
    assignee: task.assigneeName || 'Dr Dupont', patientName: task.patientName || '',
    patientId: task.patientId || '', isPersonal: task.isPersonal || false, unlinkPatient: false,
  };
}

function formatDateFr(date: Date): string {
  try {
    return format(date, "EEEE d MMMM yyyy", { locale: fr });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function formatDateShort(date: Date): string {
  try {
    return format(date, "dd MMM yyyy", { locale: fr });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function getRelativeDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Demain';
  if (diffDays === -1) return 'Hier';
  if (diffDays < -1) return `Il y a ${Math.abs(diffDays)} jours`;
  if (diffDays > 1 && diffDays <= 7) return `Dans ${diffDays} jours`;
  return '';
}

// ========== TASK DETAIL PANEL ==========

interface TaskDetailPanelProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onDelete: () => void;
}

function TaskDetailPanel({ task, onClose, onEdit, onStatusChange, onDelete }: TaskDetailPanelProps) {
  const sConfig = statusConfig[task.status as TaskStatus] || statusConfig.todo;
  const pConfig = priorityDisplay[task.priority] || priorityDisplay.medium;
  const StatusIcon = sConfig.icon;
  const taskCategory = (task.type || 'autre') as TaskCategory;
  const cConfig = categoryConfig[taskCategory] || categoryConfig.autre;
  const isOverdue = task.status !== 'done' && task.dueDate && task.dueDate.toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Header with status badge */}
      <div className="flex-shrink-0">
        <div className={cn('flex items-center gap-2 px-1 py-2 rounded-lg mb-4', sConfig.bgColor)}>
          <StatusIcon className={cn('h-5 w-5', sConfig.color)} />
          <span className={cn('text-sm font-semibold', sConfig.textColor)}>{sConfig.label}</span>
          {isOverdue && (
            <span className="ml-auto text-[11px] font-semibold text-red-600 px-2 py-0.5 bg-red-100 rounded-full border border-red-200">
              En retard
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className={cn(
          'text-lg font-bold leading-snug mb-2',
          task.status === 'done' && 'line-through text-muted-foreground'
        )}>
          {task.title}
        </h2>

        {/* Priority + Category badges */}
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border', pConfig.bgColor, pConfig.borderColor, pConfig.color)}>
            <Flag className="h-3 w-3" />
            {pConfig.label}
          </span>
          <span className={cn('inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border', cConfig.color)}>
            <Tag className="h-3 w-3 mr-1" />
            {cConfig.label}
          </span>
        </div>
      </div>

      <Separator />

      {/* Details grid */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5">
        {/* Description */}
        {task.description && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed pl-6 whitespace-pre-wrap">
              {task.description}
            </p>
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Echeance */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Echeance</span>
            </div>
            <div className="pl-6">
              {task.dueDate ? (
                <>
                  <p className={cn('text-sm font-medium', isOverdue ? 'text-red-600' : 'text-foreground')}>
                    {formatDateShort(task.dueDate)}
                  </p>
                  <p className={cn('text-xs', isOverdue ? 'text-red-500 font-medium' : 'text-muted-foreground')}>
                    {getRelativeDate(task.dueDate)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">Non definie</p>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assigne a</span>
            </div>
            <div className="pl-6">
              <p className="text-sm font-medium text-foreground">{task.assigneeName || 'Non assigne'}</p>
            </div>
          </div>

          {/* Patient */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Patient</span>
            </div>
            <div className="pl-6">
              {task.patientName ? (
                <p className="text-sm font-medium text-foreground">{task.patientName}</p>
              ) : task.isPersonal ? (
                <p className="text-sm text-muted-foreground italic">Tache personnelle</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Aucun patient</p>
              )}
            </div>
          </div>

          {/* Creation date */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Creee le</span>
            </div>
            <div className="pl-6">
              <p className="text-sm text-foreground">{formatDateShort(task.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Completion info */}
        {task.status === 'done' && task.completedAt && (
          <div className="rounded-lg border border-green-200 bg-green-50/50 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Terminee le {formatDateFr(task.completedAt)}
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Status change section */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">
            Changer le statut
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(statusConfig) as [TaskStatus, typeof statusConfig['todo']][]).map(([key, cfg]) => {
              const Icon = cfg.icon;
              const isCurrent = task.status === key;
              return (
                <button
                  key={key}
                  onClick={() => { if (!isCurrent) onStatusChange(key); }}
                  disabled={isCurrent}
                  className={cn(
                    'flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border-2 transition-all text-xs font-medium',
                    isCurrent
                      ? cn(cfg.bgColor, cfg.borderColor, cfg.textColor, 'ring-2 ring-offset-1', `ring-${cfg.borderColor.replace('border-', '')}`)
                      : 'border-border text-muted-foreground hover:border-border/80 hover:bg-muted/30 cursor-pointer'
                  )}
                >
                  <Icon className={cn('h-5 w-5', isCurrent ? cfg.color : 'text-muted-foreground/60')} />
                  {cfg.label}
                  {isCurrent && <span className="text-[10px] opacity-70">Actuel</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <Separator />
      <div className="flex-shrink-0 flex items-center gap-2 pt-4">
        <Button onClick={onEdit} className="flex-1 gap-2">
          <Pencil className="h-4 w-4" />
          Modifier
        </Button>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive hover:bg-destructive/5"
          onClick={() => setDeleteConfirmOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette tache ?</AlertDialogTitle>
            <AlertDialogDescription>
              La tache "{task.title}" sera supprimee definitivement. Cette action est irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { setDeleteConfirmOpen(false); onDelete(); }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ========== MAIN PAGE ==========

const TasksPage: React.FC = () => {
  const { toast } = useToast();
  const location = useLocation();
  const { data: patients = [] } = usePatients();
  const { data: tasks = [], isLoading } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [activeNav, setActiveNav] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('todo');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingFormData, setEditingFormData] = useState<TaskFormData | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const state = location.state as { filterPatient?: string } | null;
    if (state?.filterPatient) {
      setSearchQuery(state.filterPatient);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Keep selectedTask in sync with tasks data
  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((t) => t.id === selectedTask.id);
      if (updated) setSelectedTask(updated);
      else { setSelectedTask(null); setDetailOpen(false); }
    }
  }, [tasks, selectedTask?.id]);

  const counts = useMemo(() => ({
    all: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    'in-progress': tasks.filter((t) => t.status === 'in-progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  }), [tasks]);

  const overdue = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate.toISOString().slice(0, 10) < today).length;
  }, [tasks]);

  const dueToday = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return tasks.filter((t) => t.status !== 'done' && t.dueDate && t.dueDate.toISOString().slice(0, 10) === today).length;
  }, [tasks]);

  const completionRate = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round((counts.done / tasks.length) * 100);
  }, [tasks, counts.done]);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesSearch = searchQuery
        ? `${t.title} ${t.description || ''} ${t.assigneeName || ''} ${t.patientName || ''}`.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchesStatus && matchesSearch && matchesPriority;
    });
  }, [tasks, statusFilter, searchQuery, priorityFilter]);

  // Open detail panel
  const openDetail = (task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  };

  // Open create form
  const openNewDialog = () => {
    setEditingTaskId(null);
    setEditingFormData(null);
    setShowFormDialog(true);
  };

  // Open edit form from detail panel
  const openEditFromDetail = () => {
    if (!selectedTask) return;
    setEditingTaskId(selectedTask.id);
    setEditingFormData(taskToFormData(selectedTask));
    setDetailOpen(false);
    setShowFormDialog(true);
  };

  const handleSave = (data: TaskFormData) => {
    if (editingTaskId) {
      updateTaskMutation.mutate({
        id: editingTaskId,
        updates: {
          title: data.title,
          description: data.description || undefined,
          type: data.category as any,
          priority: data.priority,
          assigneeName: data.assignee,
          patientId: data.patientId || undefined,
          patientName: data.patientName || undefined,
          isPersonal: data.isPersonal,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
      });
    } else {
      createTaskMutation.mutate({
        title: data.title,
        description: data.description || undefined,
        type: data.category as any,
        priority: data.priority,
        status: 'todo',
        assigneeName: data.assignee,
        patientId: data.patientId || undefined,
        patientName: data.patientName || undefined,
        isPersonal: data.isPersonal,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
    }
    setEditingTaskId(null);
    setEditingFormData(null);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: {
        status: newStatus,
        ...(newStatus === 'done' ? { completedAt: new Date() } : {}),
      },
    });
    toast({ title: `Statut mis a jour : ${statusConfig[newStatus].label}` });
  };

  const handleDeleteTask = (id: string) => {
    deleteTaskMutation.mutate(id);
    setDetailOpen(false);
    setSelectedTask(null);
  };

  const formatDateISO = (date: Date) => date.toISOString().slice(0, 10);

  return (
    <MainLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sticky header bar */}
        <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-foreground">Taches</h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {counts.todo} a faire, {counts['in-progress']} en cours, {counts.done} terminee{counts.done > 1 ? 's' : ''}
                </p>
              </div>
              <Button onClick={openNewDialog} className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Ajouter une tache
              </Button>
            </div>

            {/* Stats cards - compact, clickable */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => setStatusFilter('todo')}
                className={cn(
                  'bg-card border rounded-lg p-2.5 flex items-center gap-2.5 transition-all hover:shadow-sm text-left',
                  statusFilter === 'todo' ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/30' : 'border-border'
                )}
              >
                <div className="h-8 w-8 rounded-md bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Circle className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground leading-none">{counts.todo}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">A faire</p>
                </div>
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={cn(
                  'bg-card border rounded-lg p-2.5 flex items-center gap-2.5 transition-all hover:shadow-sm text-left',
                  'border-border'
                )}
              >
                <div className="h-8 w-8 rounded-md bg-red-50 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground leading-none">{overdue}</p>
                  <p className="text-[10px] text-red-500 font-medium mt-0.5">En retard</p>
                </div>
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className="bg-card border border-border rounded-lg p-2.5 flex items-center gap-2.5 transition-all hover:shadow-sm text-left"
              >
                <div className="h-8 w-8 rounded-md bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-3.5 w-3.5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground leading-none">{dueToday}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Aujourd'hui</p>
                </div>
              </button>
              <button
                onClick={() => setStatusFilter('done')}
                className={cn(
                  'bg-card border rounded-lg p-2.5 flex items-center gap-2.5 transition-all hover:shadow-sm text-left',
                  statusFilter === 'done' ? 'border-green-300 ring-1 ring-green-200 bg-green-50/30' : 'border-border'
                )}
              >
                <div className="h-8 w-8 rounded-md bg-green-50 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg font-bold text-foreground leading-none">{completionRate}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Completees</p>
                </div>
              </button>
            </div>

            {/* Search + Filters - single compact row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                {(['all', 'todo', 'in-progress', 'done'] as const).map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStatusFilter(s)}
                    className={cn('gap-1 h-8 text-xs', statusFilter !== s && 'text-muted-foreground')}
                  >
                    {s === 'all' ? 'Toutes' : statusConfig[s].label}
                    <Badge variant={statusFilter === s ? 'outline' : 'secondary'} className="ml-0.5 text-[10px] h-4 min-w-[16px] justify-center px-1">
                      {s === 'all' ? counts.all : counts[s]}
                    </Badge>
                  </Button>
                ))}
              </div>
              <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as 'all' | TaskPriority)}>
                <SelectTrigger className="w-[130px] h-8 text-xs">
                  <Filter className="h-3 w-3 mr-1 text-muted-foreground" />
                  <SelectValue placeholder="Priorite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Column header row */}
          <div className="flex items-center gap-3 px-6 py-2 bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-t border-border/50">
            <span className="w-5" />
            <span className="flex-1">Tache</span>
            <span className="w-20 text-center hidden md:block">Priorite</span>
            <span className="w-24 text-center hidden md:block">Echeance</span>
            <span className="w-24 hidden lg:block">Assigne</span>
            <span className="w-28 hidden lg:block">Patient</span>
            <span className="w-5" />
          </div>
        </div>

        {/* Scrollable tasks list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-30 animate-pulse" />
                <p className="text-sm">Chargement des taches...</p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Aucune tache</p>
                <p className="text-xs mt-1">
                  {statusFilter !== 'all'
                    ? `Aucune tache "${statusConfig[statusFilter as TaskStatus]?.label || ''}" trouvee.`
                    : 'Creez votre premiere tache pour commencer.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filtered.map((task) => {
                const sConfig = statusConfig[task.status as TaskStatus] || statusConfig.todo;
                const StatusIcon = sConfig.icon;
                const pConfig = priorityDisplay[task.priority] || priorityDisplay.medium;
                const isOverdue = task.status !== 'done' && task.dueDate && formatDateISO(task.dueDate) < formatDateISO(new Date());
                const isDueToday = task.status !== 'done' && task.dueDate && formatDateISO(task.dueDate) === formatDateISO(new Date());
                const isSelected = selectedTask?.id === task.id && detailOpen;

                return (
                  <div
                    key={task.id}
                    onClick={() => openDetail(task)}
                    className={cn(
                      'flex items-center gap-3 px-6 py-3 cursor-pointer transition-all hover:bg-muted/40 group',
                      isOverdue && 'bg-red-50/40',
                      isDueToday && !isOverdue && 'bg-orange-50/30',
                      isSelected && 'bg-primary/5 border-l-2 border-l-primary'
                    )}
                  >
                    {/* Status icon */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="flex-shrink-0 focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                          title={`Statut : ${sConfig.label}`}
                        >
                          <StatusIcon className={cn('h-5 w-5 hover:scale-110 transition-transform', sConfig.color)} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-44" onClick={(e) => e.stopPropagation()}>
                        {(Object.entries(statusConfig) as [TaskStatus, typeof statusConfig['todo']][]).map(([key, cfg]) => {
                          const Icon = cfg.icon;
                          return (
                            <DropdownMenuItem
                              key={key}
                              onClick={() => handleStatusChange(task.id, key)}
                              className={cn('gap-2', task.status === key && 'font-semibold bg-muted')}
                            >
                              <Icon className={cn('h-4 w-4', cfg.color)} />
                              {cfg.label}
                              {task.status === key && <span className="ml-auto text-[10px] text-muted-foreground">actuel</span>}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Title + description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
                        )}>
                          {task.title}
                        </p>
                        {isOverdue && (
                          <span className="flex-shrink-0 text-[9px] font-semibold text-red-600 px-1.5 py-0.5 bg-red-100 rounded border border-red-200">
                            En retard
                          </span>
                        )}
                        {isDueToday && !isOverdue && (
                          <span className="flex-shrink-0 text-[9px] font-semibold text-orange-600 px-1.5 py-0.5 bg-orange-100 rounded border border-orange-200">
                            Aujourd'hui
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{task.description}</p>
                      )}
                    </div>

                    {/* Priority badge */}
                    <div className="w-20 text-center flex-shrink-0 hidden md:flex justify-center">
                      <Badge variant={pConfig.variant} className="text-[10px] px-2 py-0">
                        {pConfig.label}
                      </Badge>
                    </div>

                    {/* Due date */}
                    <div className="w-24 text-center flex-shrink-0 hidden md:block">
                      {task.dueDate ? (
                        <span className={cn('text-xs', isOverdue ? 'text-red-600 font-semibold' : 'text-muted-foreground')}>
                          {formatDateShort(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">-</span>
                      )}
                    </div>

                    {/* Assignee */}
                    <div className="w-24 flex-shrink-0 hidden lg:block">
                      <span className="text-xs text-muted-foreground truncate block">{task.assigneeName || '-'}</span>
                    </div>

                    {/* Patient */}
                    <div className="w-28 flex-shrink-0 hidden lg:block">
                      {task.patientName ? (
                        <span className="text-xs font-medium text-foreground/70 truncate block flex items-center gap-1">
                          <User className="h-3 w-3 flex-shrink-0" />
                          {task.patientName}
                        </span>
                      ) : task.isPersonal ? (
                        <span className="text-xs text-muted-foreground/60 italic">Personnelle</span>
                      ) : (
                        <span className="text-xs text-muted-foreground/40">-</span>
                      )}
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {(task.priority === 'high' || task.priority === 'urgent') && task.status !== 'done' && (
                        <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Detail panel (Sheet) */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6">
          <SheetHeader className="sr-only">
            <SheetTitle>Detail de la tache</SheetTitle>
          </SheetHeader>
          {selectedTask && (
            <TaskDetailPanel
              task={selectedTask}
              onClose={() => setDetailOpen(false)}
              onEdit={openEditFromDetail}
              onStatusChange={(status) => handleStatusChange(selectedTask.id, status)}
              onDelete={() => handleDeleteTask(selectedTask.id)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Create/Edit form dialog */}
      <TaskFormDialog
        open={showFormDialog}
        onOpenChange={(open) => {
          setShowFormDialog(open);
          if (!open) {
            setEditingTaskId(null);
            setEditingFormData(null);
          }
        }}
        onSave={handleSave}
        patients={patients}
        preselectedPatient={null}
        editingTask={editingFormData}
        dialogTitle={editingTaskId ? 'Modifier la tache' : undefined}
      />
    </MainLayout>
  );
};

export default TasksPage;
