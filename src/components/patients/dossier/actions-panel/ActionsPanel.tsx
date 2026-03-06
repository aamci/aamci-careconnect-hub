import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CalendarPlus,
  CircleCheck,
  ListTodo,
  Send,
  Forward,
  Printer,
  Archive,
  Trash2,
} from 'lucide-react';
import { Patient } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAppointments } from '@/hooks/data/useAppointments';
import { usePatients } from '@/hooks/data/usePatients';
import { useCreateTask } from '@/hooks/data/useTasks';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TaskFormDialog, TaskFormData } from '@/components/tasks/TaskFormDialog';

interface ActionsPanelProps {
  patient: Patient;
}

interface ActionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({ patient }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);

  const { data: allAppointments = [] } = useAppointments();
  const { data: allPatients = [] } = usePatients();
  const createTaskMutation = useCreateTask();

  // Appointment handlers
  const handleTakeAppointment = () => {
    navigate(`/patients/${patient.id}/planning`);
  };

  const handleOpenMultiAppointment = () => {
    navigate(`/patients/${patient.id}/planning`, { state: { mode: 'multi' } });
  };

  // Task handlers
  const handleOpenTaskDialog = () => {
    setTaskDialogOpen(true);
  };

  const handleSaveTask = (data: TaskFormData) => {
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
  };

  const handleViewTasks = () => {
    navigate('/tasks', { state: { filterPatient: `${patient.lastName} ${patient.firstName}` } });
  };

  const handleSendMessage = () => {
    navigate(`/patients/${patient.id}/messagerie`);
  };

  const handleReferColleague = () => {
    navigate('/messages', { state: { newEmail: true, subject: `Adressage patient : ${patient.firstName} ${patient.lastName}` } });
  };

  const handlePrintAppointments = useCallback(() => {
    const patientAppointments = allAppointments
      .filter((a) => a.patientId === patient.id)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const age = Math.floor(
      (Date.now() - new Date(patient.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const rows = patientAppointments.map((apt) => {
      const start = new Date(apt.startTime);
      const end = new Date(apt.endTime);
      const dateStr = format(start, 'dd/MM/yyyy', { locale: fr });
      const dayStr = format(start, 'EEEE', { locale: fr });
      const timeStr = `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
      const motifName = apt.motif?.name || '-';
      const praticien = apt.practitioner
        ? `${apt.practitioner.title || ''} ${apt.practitioner.firstName} ${apt.practitioner.lastName}`.trim()
        : '-';
      const statusMap: Record<string, string> = {
        scheduled: 'Planifie',
        waiting: "En salle d'attente",
        'in-progress': 'En cours',
        completed: 'Termine',
        cancelled: 'Annule',
        'absent-excused': 'Absent excuse',
        'absent-unexcused': 'Absent non excuse',
      };
      const status = statusMap[apt.status] || apt.status;
      return `<tr>
        <td>${dateStr}<br/><small style="color:#666;text-transform:capitalize">${dayStr}</small></td>
        <td>${timeStr}</td>
        <td>${apt.duration || '-'} min</td>
        <td>${motifName}</td>
        <td>${praticien}</td>
        <td><span class="status-${apt.status}">${status}</span></td>
      </tr>`;
    }).join('');

    printWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rendez-vous - ${patient.lastName} ${patient.firstName}</title>
<style>
  @page { size: A4; margin: 15mm 12mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1a1a1a; line-height: 1.4; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
  .header h1 { font-size: 18px; color: #0d9488; font-weight: 700; }
  .header .date { font-size: 10px; color: #666; text-align: right; }
  .patient-info { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; background: #f8fafb; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; }
  .patient-info .field { font-size: 10px; }
  .patient-info .field .label { color: #666; display: block; }
  .patient-info .field .value { font-weight: 600; color: #1a1a1a; }
  .summary { display: flex; gap: 16px; margin-bottom: 14px; font-size: 10px; }
  .summary .stat { background: #f1f5f9; border-radius: 4px; padding: 6px 12px; }
  .summary .stat strong { color: #0d9488; font-size: 14px; display: block; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  thead th { background: #0d9488; color: white; padding: 8px 6px; text-align: left; font-weight: 600; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
  tbody td { padding: 7px 6px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
  tbody tr:nth-child(even) { background: #f8fafb; }
  .status-completed { color: #059669; font-weight: 600; }
  .status-cancelled, .status-absent-excused, .status-absent-unexcused { color: #dc2626; font-weight: 600; }
  .status-scheduled { color: #2563eb; }
  .status-in-progress, .status-waiting { color: #d97706; }
  .footer { margin-top: 20px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 9px; color: #999; text-align: center; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Historique des rendez-vous</h1>
      <p style="font-size:10px;color:#666;margin-top:2px;">CareConnect Hub - Dossier patient</p>
    </div>
    <div class="date">
      <p>Edite le ${format(new Date(), 'dd/MM/yyyy a HH:mm', { locale: fr })}</p>
    </div>
  </div>
  <div class="patient-info">
    <div class="field"><span class="label">Nom</span><span class="value">${patient.lastName.toUpperCase()} ${patient.firstName}</span></div>
    <div class="field"><span class="label">Date de naissance</span><span class="value">${format(new Date(patient.dateOfBirth), 'dd/MM/yyyy')} (${age} ans)</span></div>
    <div class="field"><span class="label">Telephone</span><span class="value">${patient.phone || '-'}</span></div>
    <div class="field"><span class="label">Email</span><span class="value">${patient.email || '-'}</span></div>
    <div class="field"><span class="label">Ville</span><span class="value">${patient.city || '-'}</span></div>
    <div class="field"><span class="label">N Dossier</span><span class="value">${patient.id}</span></div>
  </div>
  <div class="summary">
    <div class="stat"><strong>${patientAppointments.length}</strong>Total rendez-vous</div>
    <div class="stat"><strong>${patientAppointments.filter((a) => a.status === 'completed').length}</strong>Termines</div>
    <div class="stat"><strong>${patientAppointments.filter((a) => a.status === 'cancelled' || a.status === 'absent-excused' || a.status === 'absent-unexcused').length}</strong>Annules / Absents</div>
    <div class="stat"><strong>${patientAppointments.filter((a) => a.status === 'scheduled').length}</strong>A venir</div>
  </div>
  ${
    patientAppointments.length === 0
      ? '<p style="text-align:center;padding:40px;color:#666;">Aucun rendez-vous enregistre pour ce patient.</p>'
      : `<table><thead><tr>
        <th style="width:15%">Date</th><th style="width:13%">Horaire</th><th style="width:8%">Duree</th>
        <th style="width:24%">Motif</th><th style="width:22%">Praticien</th><th style="width:18%">Statut</th>
      </tr></thead><tbody>${rows}</tbody></table>`
  }
  <div class="footer">
    <p>Document genere automatiquement par CareConnect Hub. Ce document est confidentiel et destine exclusivement au personnel medical autorise.</p>
  </div>
</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }, [patient, allAppointments]);

  const handleArchive = () => setArchiveDialogOpen(true);
  const confirmArchive = () => {
    toast.success('Dossier archive');
    setArchiveDialogOpen(false);
    navigate('/patients');
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    setConfirmText('');
  };
  const confirmDelete = () => {
    if (confirmText !== 'SUPPRIMER') {
      toast.error('Veuillez saisir SUPPRIMER pour confirmer');
      return;
    }
    toast.success('Patient supprime');
    setDeleteDialogOpen(false);
    navigate('/patients');
  };

  const actions: ActionItem[] = [
    { id: 'take-appointment', label: 'Prendre un rendez-vous', icon: Calendar, onClick: handleTakeAppointment },
    { id: 'plan-multiple', label: 'Planifier plusieurs rendez-vous', icon: CalendarPlus, onClick: handleOpenMultiAppointment },
    { id: 'add-task', label: 'Ajouter une tache', icon: CircleCheck, onClick: handleOpenTaskDialog },
    { id: 'view-tasks', label: 'Voir les taches', icon: ListTodo, onClick: handleViewTasks },
    { id: 'send-message', label: 'Envoyer un message', icon: Send, onClick: handleSendMessage },
    { id: 'refer', label: 'Adresser chez un confrere', icon: Forward, onClick: handleReferColleague },
    { id: 'print', label: 'Imprimer les rendez-vous', icon: Printer, onClick: handlePrintAppointments },
    { id: 'archive', label: 'Archiver le dossier', icon: Archive, onClick: handleArchive },
    { id: 'delete', label: 'Supprimer le patient', icon: Trash2, onClick: handleDelete, destructive: true },
  ];

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      <div className="flex-shrink-0 px-4 py-4 border-b border-border">
        <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">Actions</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50',
                  action.disabled && 'opacity-50 cursor-not-allowed',
                  action.destructive ? 'text-destructive hover:bg-destructive/5' : 'text-foreground'
                )}
              >
                <Icon className={cn('h-4 w-4 flex-shrink-0 mt-0.5', action.destructive ? 'text-destructive' : 'text-muted-foreground')} />
                <span className="text-sm leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Shared task creation dialog */}
      <TaskFormDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSave={handleSaveTask}
        patients={allPatients}
        preselectedPatient={{ id: patient.id, name: `${patient.lastName} ${patient.firstName}` }}
      />

      {/* === Archive Dialog === */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver le dossier</AlertDialogTitle>
            <AlertDialogDescription>
              Etes-vous sur de vouloir archiver le dossier de {patient.firstName} {patient.lastName} ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>Archiver</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* === Delete Dialog === */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Supprimer le patient</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Etes-vous sur de vouloir supprimer definitivement le dossier de{' '}
                <strong>{patient.firstName} {patient.lastName}</strong> ?
              </p>
              <p className="text-destructive font-medium">Cette action est irreversible.</p>
              <div className="pt-2">
                <label className="text-sm font-medium text-foreground">
                  Tapez <span className="font-bold">SUPPRIMER</span> pour confirmer :
                </label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={confirmText !== 'SUPPRIMER'}
            >
              Supprimer definitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActionsPanel;
