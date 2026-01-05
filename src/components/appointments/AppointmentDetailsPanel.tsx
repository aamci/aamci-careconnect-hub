import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  AlertCircle,
  ChevronRight,
  Move,
  Copy,
  Printer,
  FileText,
  Share2,
  Ban,
  Check,
  UserCheck,
  UserX,
  ClipboardList
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface AppointmentDetailsPanelProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: Appointment['status']) => void;
}

const AppointmentDetailsPanel: React.FC<AppointmentDetailsPanelProps> = ({
  appointment,
  isOpen,
  onClose,
  onStatusChange,
}) => {
  if (!appointment) return null;

  const patient = appointment.patient;
  const age = differenceInYears(new Date(), patient.dateOfBirth);

  const statusOptions = [
    { id: 'waiting', label: 'En salle d\'attente', icon: UserCheck, color: 'text-warning' },
    { id: 'in-progress', label: 'En consultation', icon: User, color: 'text-primary-light' },
    { id: 'completed', label: 'Vu', icon: Check, color: 'text-success' },
    { id: 'absent-excused', label: 'Absent excusé', icon: Calendar, color: 'text-muted-foreground' },
    { id: 'absent-unexcused', label: 'Absent non excusé', icon: UserX, color: 'text-destructive' },
  ];

  const actions = [
    { id: 'move', label: 'Déplacer le RDV', icon: Move },
    { id: 'copy', label: 'Copier le RDV', icon: Copy },
    { id: 'print', label: 'Imprimer le RDV', icon: Printer },
    { id: 'note', label: 'Ajouter une note', icon: FileText },
    { id: 'task', label: 'Ajouter une tâche', icon: ClipboardList },
    { id: 'share', label: 'Partager des documents', icon: Share2 },
    { id: 'block', label: 'Bloquer la prise de RDV', icon: Ban },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 h-full w-full sm:w-96 md:w-[420px] lg:max-w-md bg-card border-l border-border shadow-xl z-40 flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2" style={{ borderColor: appointment.motif.color }}>
                  <AvatarFallback className="text-lg font-semibold bg-muted">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {patient.gender === 'male' ? 'Monsieur' : 'Madame'}
                    </span>
                    {patient.alerts?.map(alert => (
                      <span 
                        key={alert.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-destructive/10 text-destructive"
                      >
                        <AlertCircle className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                  <h2 className="font-semibold text-lg">
                    {patient.lastName.toUpperCase()} {patient.firstName}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {patient.gender === 'male' ? 'H' : 'F'}, {format(patient.dateOfBirth, 'dd/MM/yyyy')} ({age} ans)
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-3 divide-x divide-border">
              {/* Left Column - Patient Info */}
              <div className="col-span-2 p-4 space-y-6">
                {/* Appointment Details */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Détails du rendez-vous
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Agenda</span>
                      <span className="text-sm font-medium">{appointment.practitioner.title} {appointment.practitioner.lastName}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Motif</span>
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-sm"
                          style={{ backgroundColor: appointment.motif.color }}
                        />
                        <span className="text-sm">{appointment.motif.name}</span>
                        <span className="text-xs text-muted-foreground">{appointment.duration} mn</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Horaire</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{format(appointment.startTime, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                        <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                        <span className="text-sm">{format(appointment.startTime, 'HH:mm')}</span>
                      </div>
                    </div>

                    {appointment.isFirstVisit && (
                      <div className="flex items-center gap-2 text-sm text-accent">
                        <Check className="w-4 h-4" />
                        Premier rendez-vous avec ce patient
                      </div>
                    )}
                  </div>
                </section>

                <Separator />

                {/* Patient Info Section */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Infos administratives
                  </h3>

                  {patient.alerts?.map(alert => (
                    <div 
                      key={alert.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 text-warning mb-3"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{alert.message}</span>
                    </div>
                  ))}
                  
                  <div className="space-y-2">
                    {patient.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${patient.phone}`} className="text-accent hover:underline">
                          {patient.phone}
                        </a>
                      </div>
                    )}
                    {patient.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${patient.email}`} className="text-accent hover:underline">
                          {patient.email}
                        </a>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{patient.address}, {patient.postalCode} {patient.city}</span>
                      </div>
                    )}
                  </div>
                </section>

                <Separator />

                {/* History */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Historique
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {appointment.history.length} modification(s)
                  </div>
                </section>
              </div>

              {/* Right Column - Status & Actions */}
              <div className="p-4 space-y-6 bg-muted/30">
                {/* Status */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Statut du RDV
                  </h3>
                  <div className="space-y-1">
                    {statusOptions.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => onStatusChange?.(status.id as Appointment['status'])}
                        className={cn(
                          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors text-left',
                          appointment.status === status.id
                            ? 'bg-accent/10 text-accent font-medium'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <status.icon className={cn('w-4 h-4', status.color)} />
                        {status.label}
                      </button>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* Actions */}
                <section>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Actions
                  </h3>
                  <div className="space-y-1">
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                      >
                        <action.icon className="w-4 h-4" />
                        {action.label}
                        <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex gap-2">
            <Button variant="outline" className="flex-1">
              Annuler le RDV
            </Button>
            <Button className="flex-1 bg-accent hover:bg-accent-light text-accent-foreground">
              Modifier le RDV
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentDetailsPanel;
