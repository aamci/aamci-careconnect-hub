import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  CalendarPlus,
  CircleCheck,
  ListTodo,
  MessageSquare,
  Ban,
  Clock,
  Forward,
  Printer,
  Archive,
  Trash2,
} from 'lucide-react';
import { Patient } from '@/types';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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
  requiresConfirmation?: boolean;
}

const ActionsPanel: React.FC<ActionsPanelProps> = ({ patient }) => {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleTakeAppointment = () => {
    navigate('/', { state: { preselectedPatient: patient } });
  };

  const handlePlanMultipleAppointments = () => {
    navigate('/', { state: { preselectedPatient: patient, multipleMode: true } });
    toast.success(`Planification série pour ${patient.firstName} ${patient.lastName}`);
  };

  const handleAddTask = () => {
    navigate('/tasks', { state: { newTask: true, patientName: `${patient.firstName} ${patient.lastName}` } });
  };

  const handleViewTasks = () => {
    navigate('/tasks', { state: { filterPatient: `${patient.firstName} ${patient.lastName}` } });
  };

  const handleDiscussPatient = () => {
    navigate('/messages', { state: { newConversation: true, subject: `Patient ${patient.firstName} ${patient.lastName}` } });
  };

  const handleBlockAppointments = () => {
    toast.warning(`Prise de rendez-vous en ligne bloquée pour ${patient.firstName} ${patient.lastName}`);
  };

  const handleTakeAppointmentNow = () => {
    const now = new Date();
    navigate('/', { state: { preselectedPatient: patient, appointmentTime: now.toISOString() } });
    toast.success('Rendez-vous immédiat créé');
  };

  const handleReferColleague = () => {
    navigate('/messages', { state: { newEmail: true, subject: `Adressage patient : ${patient.firstName} ${patient.lastName}` } });
  };

  const handlePrintAppointments = () => {
    window.print();
  };

  const handleArchive = () => {
    setArchiveDialogOpen(true);
  };

  const confirmArchive = () => {
    toast.success('Dossier archivé');
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
    toast.success('Patient supprimé');
    setDeleteDialogOpen(false);
    navigate('/patients');
  };

  const actions: ActionItem[] = [
    { 
      id: 'take-appointment', 
      label: 'Prendre un rendez-vous', 
      icon: Calendar,
      onClick: handleTakeAppointment,
    },
    { 
      id: 'plan-multiple', 
      label: 'Planifier plusieurs rendez-vous', 
      icon: CalendarPlus,
      onClick: handlePlanMultipleAppointments,
    },
    { 
      id: 'add-task', 
      label: 'Ajouter une tâche', 
      icon: CircleCheck,
      onClick: handleAddTask,
    },
    { 
      id: 'view-tasks', 
      label: 'Voir les tâches', 
      icon: ListTodo,
      onClick: handleViewTasks,
    },
    { 
      id: 'discuss', 
      label: "Discuter d'un patient", 
      icon: MessageSquare,
      onClick: handleDiscussPatient,
    },
    { 
      id: 'block', 
      label: 'Bloquer la prise de rendez-vous', 
      icon: Ban,
      onClick: handleBlockAppointments,
    },
    { 
      id: 'take-now', 
      label: 'Prendre un rendez-vous pour maintenant', 
      icon: Clock,
      onClick: handleTakeAppointmentNow,
    },
    { 
      id: 'refer', 
      label: 'Adresser chez un confrère', 
      icon: Forward,
      onClick: handleReferColleague,
    },
    { 
      id: 'print', 
      label: 'Imprimer les rendez-vous', 
      icon: Printer,
      onClick: handlePrintAppointments,
    },
    { 
      id: 'archive', 
      label: 'Archiver le dossier', 
      icon: Archive,
      onClick: handleArchive,
      requiresConfirmation: true,
    },
    { 
      id: 'delete', 
      label: 'Supprimer le patient', 
      icon: Trash2,
      onClick: handleDelete,
      destructive: true,
      requiresConfirmation: true,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 border-b border-border">
        <h3 className="text-sm font-bold text-foreground tracking-wide uppercase">
          Actions
        </h3>
      </div>

      {/* Actions List */}
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
                  'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                  'hover:bg-muted/50',
                  action.disabled && 'opacity-50 cursor-not-allowed',
                  action.destructive 
                    ? 'text-destructive hover:bg-destructive/5' 
                    : 'text-foreground'
                )}
              >
                <Icon className={cn(
                  'h-4 w-4 flex-shrink-0 mt-0.5',
                  action.destructive ? 'text-destructive' : 'text-muted-foreground'
                )} />
                <span className="text-sm leading-tight">{action.label}</span>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Archive Dialog */}
      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archiver le dossier</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir archiver le dossier de {patient.firstName} {patient.lastName} ?
              Le dossier pourra être restauré ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>
              Archiver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Supprimer le patient
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Êtes-vous sûr de vouloir supprimer définitivement le dossier de{' '}
                <strong>{patient.firstName} {patient.lastName}</strong> ?
              </p>
              <p className="text-destructive font-medium">
                Cette action est irréversible.
              </p>
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
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActionsPanel;
