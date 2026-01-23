import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  ClipboardList,
  ExternalLink,
  Video
} from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { CreateTeleconsultationDialog } from '@/components/teleconsultation/modals/CreateTeleconsultationDialog';
import { useTeleconsultationByAppointment } from '@/hooks/data/useTeleconsultation';

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
  const navigate = useNavigate();
  const [isCreateVisioOpen, setIsCreateVisioOpen] = useState(false);

  // Vérifier si une téléconsultation existe déjà pour ce rendez-vous
  const { data: existingTeleconsultation } = useTeleconsultationByAppointment(
    appointment?.id || null
  );

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
    {
      id: 'visio',
      label: existingTeleconsultation
        ? 'Rejoindre téléconsultation'
        : 'Créer téléconsultation',
      icon: Video,
      highlighted: true, // Make this action stand out
    },
    { id: 'move', label: 'Déplacer le RDV', icon: Move },
    { id: 'copy', label: 'Copier le RDV', icon: Copy },
    { id: 'print', label: 'Imprimer le RDV', icon: Printer },
    { id: 'note', label: 'Ajouter une note', icon: FileText },
    { id: 'task', label: 'Ajouter une tâche', icon: ClipboardList },
    { id: 'share', label: 'Partager des documents', icon: Share2 },
    { id: 'block', label: 'Bloquer la prise de RDV', icon: Ban },
  ];

  const handleOpenPatientDossier = () => {
    navigate(`/patients/${patient.id}/home`);
    onClose();
  };

  const handleActionClick = (actionId: string) => {
    if (actionId === 'visio') {
      if (existingTeleconsultation) {
        // Ouvrir le lien praticien dans un nouvel onglet
        window.open(existingTeleconsultation.practitioner_link, '_blank');
      } else {
        // Ouvrir le modal de création
        setIsCreateVisioOpen(true);
      }
    }
    // Autres actions à implémenter plus tard
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay - especially for mobile */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 sm:hidden"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:absolute sm:w-96 md:w-[420px] lg:w-[440px] bg-card border-l border-border shadow-2xl z-40 flex flex-col"
          >
          {/* Header */}
          <div className="flex-shrink-0 p-5 border-b border-border bg-gradient-to-b from-card to-muted/20">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <Avatar className="h-14 w-14 border-2 flex-shrink-0" style={{ borderColor: appointment.motif.color }}>
                  <AvatarFallback className="text-lg font-bold bg-muted text-foreground">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {patient.gender === 'male' ? 'Monsieur' : 'Madame'}
                    </span>
                    {patient.alerts?.map(alert => (
                      <span 
                        key={alert.id}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-destructive/15 text-destructive"
                      >
                        <AlertCircle className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                  <h2 className="text-lg font-bold text-foreground leading-tight truncate">
                    {patient.lastName.toUpperCase()} {patient.firstName}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    <span className="font-medium">{patient.gender === 'male' ? 'H' : 'F'}</span>
                    <span className="mx-1.5">•</span>
                    <span>{format(patient.dateOfBirth, 'dd/MM/yyyy')}</span>
                    <span className="mx-1.5">•</span>
                    <span className="font-semibold text-foreground">{age} ans</span>
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 rounded-full hover:bg-muted">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Open Patient Dossier Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenPatientDossier}
              className="w-full mt-4 gap-2 justify-center text-sm font-medium border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir le dossier patient
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-3 divide-x divide-border">
              {/* Left Column - Patient Info */}
              <div className="col-span-2 p-5 space-y-6">
                {/* Appointment Details */}
                <section>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                    Détails du rendez-vous
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">Agenda</span>
                      <span className="text-sm font-semibold text-foreground">
                        {appointment.practitioner.title} {appointment.practitioner.lastName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">Motif</span>
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: appointment.motif.color }}
                        />
                        <span className="text-sm font-medium text-foreground">{appointment.motif.name}</span>
                        <span className="text-xs text-muted-foreground font-medium bg-muted px-1.5 py-0.5 rounded">
                          {appointment.duration} min
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">Date</span>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-foreground capitalize">
                          {format(appointment.startTime, 'EEEE d MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">Horaire</span>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">
                          {format(appointment.startTime, 'HH:mm')}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-sm font-bold text-foreground">
                          {format(appointment.endTime, 'HH:mm')}
                        </span>
                      </div>
                    </div>

                    {appointment.isFirstVisit && (
                      <div className="flex items-center gap-2 text-sm text-accent bg-accent/10 px-3 py-2 rounded-lg mt-2">
                        <Check className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">Premier rendez-vous avec ce patient</span>
                      </div>
                    )}
                  </div>
                </section>

                <Separator />

                {/* Patient Info Section */}
                <section>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                    Coordonnées
                  </h3>

                  {patient.alerts?.map(alert => (
                    <div 
                      key={alert.id}
                      className="flex items-center gap-2.5 p-3 rounded-lg bg-warning/10 text-warning mb-4 border border-warning/20"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                  ))}
                  
                  <div className="space-y-2.5">
                    {patient.phone && (
                      <a 
                        href={`tel:${patient.phone}`}
                        className="flex items-center gap-3 text-sm p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium text-accent group-hover:text-primary transition-colors">
                          {patient.phone}
                        </span>
                      </a>
                    )}
                    {patient.email && (
                      <a 
                        href={`mailto:${patient.email}`}
                        className="flex items-center gap-3 text-sm p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                      >
                        <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="font-medium text-accent group-hover:text-primary transition-colors truncate">
                          {patient.email}
                        </span>
                      </a>
                    )}
                    {patient.address && (
                      <div className="flex items-start gap-3 text-sm p-2.5 rounded-lg bg-muted/30">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{patient.address}, {patient.postalCode} {patient.city}</span>
                      </div>
                    )}
                  </div>
                </section>

                <Separator />

                {/* History */}
                <section>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Historique
                  </h3>
                  <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                    <span className="font-semibold text-foreground">{appointment.history.length}</span> modification(s)
                  </div>
                </section>
              </div>

              {/* Right Column - Status & Actions */}
              <div className="p-4 space-y-6 bg-muted/20">
                {/* Status */}
                <section>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Statut
                  </h3>
                  <div className="space-y-1">
                    {statusOptions.map((status) => (
                      <button
                        key={status.id}
                        onClick={() => onStatusChange?.(status.id as Appointment['status'])}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all text-left',
                          appointment.status === status.id
                            ? 'bg-primary/15 text-primary font-semibold border border-primary/30'
                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        )}
                      >
                        <status.icon className={cn('w-4 h-4 flex-shrink-0', status.color)} />
                        <span className="truncate">{status.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <Separator />

                {/* Actions */}
                <section>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                    Actions
                  </h3>
                  <div className="space-y-1">
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleActionClick(action.id)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-all text-left group',
                          action.id === 'visio' && existingTeleconsultation
                            ? 'text-primary hover:text-primary hover:bg-primary/10 font-medium'
                            : action.id === 'visio' && !existingTeleconsultation
                            ? 'bg-primary/10 text-primary hover:bg-primary/20 font-medium border border-primary/30'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        )}
                      >
                        <action.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate flex-1">{action.label}</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 border-t border-border bg-card flex gap-3">
            <Button variant="outline" className="flex-1 font-medium">
              Annuler le RDV
            </Button>
            <Button className="flex-1 font-medium">
              Modifier le RDV
            </Button>
          </div>
        </motion.div>
        </>
      )}

      {/* Modal de création de téléconsultation */}
      <CreateTeleconsultationDialog
        appointment={appointment}
        open={isCreateVisioOpen}
        onOpenChange={setIsCreateVisioOpen}
      />
    </AnimatePresence>
  );
};

export default AppointmentDetailsPanel;
