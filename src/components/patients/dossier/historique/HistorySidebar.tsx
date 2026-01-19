/**
 * HistorySidebar - Sidebar for the history tab
 * Contains stats, reminders, tasks, and quick actions
 */

import React, { useState } from 'react';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  CalendarCheck,
  CalendarX,
  Ban,
  Bell,
  CheckSquare,
  Plus,
  Calendar,
  FileText,
  StickyNote,
  MessageSquare,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { PatientAttendanceStats, PatientReminder, PatientTask } from '@/types/timeline';

interface HistorySidebarProps {
  patientId: string;
  stats?: PatientAttendanceStats | null;
  statsLoading?: boolean;
  reminders?: PatientReminder[];
  remindersLoading?: boolean;
  tasks?: PatientTask[];
  tasksLoading?: boolean;
  onCompleteReminder?: (reminderId: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onCreateReminder?: (title: string, dueDate: string, description?: string) => void;
  onNewAppointment?: () => void;
  onNewDocument?: () => void;
  onNewNote?: () => void;
  className?: string;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  patientId,
  stats,
  statsLoading,
  reminders = [],
  remindersLoading,
  tasks = [],
  tasksLoading,
  onCompleteReminder,
  onCompleteTask,
  onCreateReminder,
  onNewAppointment,
  onNewDocument,
  onNewNote,
  className,
}) => {
  const [showReminderDialog, setShowReminderDialog] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState('');
  const [newReminderDescription, setNewReminderDescription] = useState('');

  const handleCreateReminder = () => {
    if (newReminderTitle && newReminderDate && onCreateReminder) {
      onCreateReminder(newReminderTitle, newReminderDate, newReminderDescription || undefined);
      setShowReminderDialog(false);
      setNewReminderTitle('');
      setNewReminderDate('');
      setNewReminderDescription('');
    }
  };

  // Get reminder urgency
  const getReminderUrgency = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) {
      return { color: 'text-red-600', label: 'En retard', bgColor: 'bg-red-100' };
    }
    const daysUntil = differenceInDays(date, new Date());
    if (daysUntil <= 7) {
      return { color: 'text-orange-600', label: `Dans ${daysUntil}j`, bgColor: 'bg-orange-100' };
    }
    if (daysUntil <= 30) {
      return { color: 'text-amber-600', label: `Dans ${daysUntil}j`, bgColor: 'bg-amber-100' };
    }
    return { color: 'text-muted-foreground', label: format(date, 'dd/MM'), bgColor: 'bg-muted' };
  };

  // Get task priority color
  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-amber-600 bg-amber-100';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Attendance Stats Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Présence aux RDV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {statsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : stats ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm">RDV honorés</span>
                </div>
                <span className="text-sm font-semibold">{stats.completed_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarX className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">Absences exc.</span>
                </div>
                <span className="text-sm font-semibold">{stats.absent_excused_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ban className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Non honorés</span>
                </div>
                <span className="text-sm font-semibold">{stats.no_show_count}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taux de présence</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-semibold',
                      stats.attendance_rate >= 80
                        ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                        : stats.attendance_rate >= 60
                        ? 'text-amber-600 border-amber-200 bg-amber-50'
                        : 'text-red-600 border-red-200 bg-red-50'
                    )}
                  >
                    {stats.attendance_rate}%
                  </Badge>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune donnée</p>
          )}
        </CardContent>
      </Card>

      {/* Tasks Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              À faire
            </CardTitle>
            {tasks.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                {tasks.filter((t) => t.status !== 'done').length}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {tasksLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : tasks.length > 0 ? (
            <ScrollArea className="max-h-40">
              <div className="space-y-2">
                {tasks
                  .filter((t) => t.status !== 'done')
                  .slice(0, 5)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={task.status === 'done'}
                        onCheckedChange={() => onCompleteTask?.(task.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{task.title}</p>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(task.due_date), 'dd/MM', { locale: fr })}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] px-1 h-4', getTaskPriorityColor(task.priority))}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Aucune tâche
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reminders Card */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Rappels
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowReminderDialog(true)}
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {remindersLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : reminders.length > 0 ? (
            <ScrollArea className="max-h-40">
              <div className="space-y-2">
                {reminders
                  .filter((r) => r.status === 'pending')
                  .slice(0, 5)
                  .map((reminder) => {
                    const urgency = getReminderUrgency(reminder.due_date);
                    return (
                      <div
                        key={reminder.id}
                        className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 transition-colors"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 flex-shrink-0"
                          onClick={() => onCompleteReminder?.(reminder.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{reminder.title}</p>
                          {reminder.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {reminder.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] px-1.5 h-4 flex-shrink-0', urgency.bgColor, urgency.color)}
                        >
                          {urgency.label}
                        </Badge>
                      </div>
                    );
                  })}
              </div>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Aucun rappel
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Actions rapides
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onNewAppointment}
          >
            <Calendar className="h-4 w-4" />
            Nouveau RDV
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onNewDocument}
          >
            <FileText className="h-4 w-4" />
            Ajouter document
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onNewNote}
          >
            <StickyNote className="h-4 w-4" />
            Ajouter note
          </Button>
        </CardContent>
      </Card>

      {/* Create Reminder Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau rappel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-title">Titre</Label>
              <Input
                id="reminder-title"
                placeholder="Ex: Mammographie de contrôle"
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-date">Date d'échéance</Label>
              <Input
                id="reminder-date"
                type="date"
                value={newReminderDate}
                onChange={(e) => setNewReminderDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminder-desc">Description (optionnelle)</Label>
              <Textarea
                id="reminder-desc"
                placeholder="Notes supplémentaires..."
                value={newReminderDescription}
                onChange={(e) => setNewReminderDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReminderDialog(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateReminder}
              disabled={!newReminderTitle || !newReminderDate}
            >
              Créer le rappel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistorySidebar;
