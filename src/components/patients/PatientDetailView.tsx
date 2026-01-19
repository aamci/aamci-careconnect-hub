import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Patient, Appointment, Note } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  AlertTriangle,
  Star,
  Edit,
  Plus,
  Clock,
  ChevronRight,
  Shield,
  Heart,
  Building,
  X,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { usePatientHistory } from '@/hooks/data/usePatientHistory';
import { useNotesByPatient } from '@/hooks/data/useNotes';
import { Loader2 } from 'lucide-react';

interface PatientDetailViewProps {
  patient: Patient;
  onClose: () => void;
  onEdit: () => void;
  onNewAppointment: () => void;
  onNewNote: () => void;
}

const PatientDetailView: React.FC<PatientDetailViewProps> = ({
  patient,
  onClose,
  onEdit,
  onNewAppointment,
  onNewNote
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const navigate = useNavigate();

  // Fetch real data from Supabase
  const { data: historyData, isLoading: loadingHistory } = usePatientHistory(patient.id);
  const { data: notesData, isLoading: loadingNotes } = useNotesByPatient(patient.id);

  const age = differenceInYears(new Date(), patient.dateOfBirth);
  const displayName = patient.usedFirstName || patient.firstName;
  const displayLastName = patient.usedLastName || patient.lastName;

  const hasVipAlert = patient.alerts?.some(a => a.type === 'vip');

  // Get patient appointments from real data
  const upcomingAppointments = historyData?.upcoming ?? [];
  const pastAppointments = historyData?.past?.flatMap(g => g.items) ?? [];
  const patientAppointments = [...upcomingAppointments, ...pastAppointments];

  // Get patient notes from real data
  const patientNotes = notesData ?? [];

  const handleOpenFullDossier = () => {
    navigate(`/patients/${patient.id}/home`);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 h-full w-full sm:w-96 md:w-[420px] lg:max-w-md bg-card border-l border-border shadow-xl z-40 flex flex-col"
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 p-5 border-b border-border bg-gradient-to-b from-card to-muted/20">
          <div className="flex items-start justify-between mb-4 gap-3">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <Avatar className="h-14 w-14 border-2 border-primary/30 flex-shrink-0">
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {displayName[0]}{displayLastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {patient.gender === 'male' ? 'Monsieur' : 'Madame'}
                  </span>
                  {hasVipAlert && (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  )}
                </div>
                <h2 className="text-lg font-bold text-foreground leading-tight truncate">
                  {displayLastName.toUpperCase()} {displayName}
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

          {/* Open Full Dossier Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenFullDossier}
            className="w-full mb-3 gap-2 justify-center text-sm font-medium border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
          >
            <ExternalLink className="h-4 w-4" />
            Ouvrir le dossier complet
          </Button>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button onClick={onNewAppointment} size="sm" className="gap-1.5 flex-1 font-medium">
              <Plus className="w-4 h-4" />
              Nouveau RDV
            </Button>
            <Button onClick={onNewNote} variant="outline" size="sm" className="gap-1.5 flex-1 font-medium">
              <FileText className="w-4 h-4" />
              Ajouter note
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {patient.alerts && patient.alerts.length > 0 && (
          <div className="px-5 py-3 bg-warning/10 border-b border-warning/20">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-warning">Alertes patient</p>
                <ul className="mt-1 space-y-1">
                  {patient.alerts.map((alert) => (
                    <li key={alert.id} className="text-sm text-warning/80">
                      • {alert.message}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
            <TabsList className="mx-5 mt-4 bg-muted/50">
              <TabsTrigger value="info" className="gap-1.5 font-medium">
                <User className="w-4 h-4" />
                Infos
              </TabsTrigger>
              <TabsTrigger value="appointments" className="gap-1.5 font-medium">
                <Calendar className="w-4 h-4" />
                RDV ({loadingHistory ? '...' : patientAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1.5 font-medium">
                <FileText className="w-4 h-4" />
                Notes ({loadingNotes ? '...' : patientNotes.length})
              </TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="p-5 space-y-6 flex-1">
              {/* Contact */}
              <section>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Contact
                </h3>
                <div className="space-y-2.5">
                  {patient.phone && (
                    <a 
                      href={`tel:${patient.phone}`}
                      className="flex items-center gap-3 text-sm p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Phone className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      <span className="font-medium text-accent group-hover:text-primary">
                        {patient.phone}
                      </span>
                    </a>
                  )}
                  {patient.phoneSecondary && (
                    <div className="flex items-center gap-3 text-sm p-2.5 rounded-lg bg-muted/30">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{patient.phoneSecondary}</span>
                    </div>
                  )}
                  {patient.email && (
                    <a 
                      href={`mailto:${patient.email}`}
                      className="flex items-center gap-3 text-sm p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <Mail className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                      <span className="font-medium text-accent group-hover:text-primary truncate">
                        {patient.email}
                      </span>
                    </a>
                  )}
                  {(patient.address || patient.city) && (
                    <div className="flex items-start gap-3 text-sm p-2.5 rounded-lg bg-muted/30">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <span className="text-foreground">
                        {patient.address && `${patient.address}, `}
                        {patient.postalCode} {patient.city}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* Medical Info */}
              <section>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Informations médicales
                </h3>
                <div className="space-y-3">
                  {patient.referringDoctor && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">Médecin traitant</span>
                      <span className="text-sm font-semibold text-foreground">{patient.referringDoctor}</span>
                    </div>
                  )}
                  {patient.insuranceProvider && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">Couverture</span>
                      <span className="text-sm font-semibold text-foreground">{patient.insuranceProvider}</span>
                    </div>
                  )}
                  {patient.insuranceNumber && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">N° SS</span>
                      <span className="text-sm font-medium text-foreground">{patient.insuranceNumber}</span>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* Administrative */}
              <section>
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                  Administratif
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground">Créé le</span>
                    <span className="text-sm font-medium text-foreground">{format(patient.createdAt, 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm text-muted-foreground">Modifié le</span>
                    <span className="text-sm font-medium text-foreground">{format(patient.updatedAt, 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                  {patient.birthPlace && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-muted-foreground">Lieu de naissance</span>
                      <span className="text-sm font-medium text-foreground">{patient.birthPlace}</span>
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="p-5 space-y-6 flex-1">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  {/* Upcoming */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                      À venir ({upcomingAppointments.length})
                    </h3>
                    {upcomingAppointments.length > 0 ? (
                      <div className="space-y-2">
                        {upcomingAppointments.map((apt) => (
                          <AppointmentItem key={apt.id} appointment={apt} isUpcoming />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-6 text-center bg-muted/30 rounded-lg">
                        Aucun rendez-vous à venir
                      </p>
                    )}
                  </section>

                  {/* Past */}
                  <section>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
                      Historique ({pastAppointments.length})
                    </h3>
                    {pastAppointments.length > 0 ? (
                      <div className="space-y-2">
                        {pastAppointments.slice(0, 10).map((apt) => (
                          <AppointmentItem key={apt.id} appointment={apt} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-6 text-center bg-muted/30 rounded-lg">
                        Aucun historique
                      </p>
                    )}
                  </section>
                </>
              )}
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="p-5 space-y-4 flex-1">
              {loadingNotes ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : patientNotes.length > 0 ? (
                patientNotes.map((note) => (
                  <NoteItem key={note.id} note={note} />
                ))
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Aucune note pour ce patient</p>
                  <Button variant="outline" size="sm" className="gap-1.5 font-medium" onClick={onNewNote}>
                    <Plus className="w-4 h-4" />
                    Ajouter une note
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border flex gap-3 bg-card">
          <Button variant="outline" className="flex-1 font-medium" onClick={onClose}>
            Fermer
          </Button>
          <Button className="flex-1 font-medium" onClick={handleOpenFullDossier}>
            Dossier complet
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Appointment Item Component
const AppointmentItem: React.FC<{ appointment: Appointment; isUpcoming?: boolean }> = ({ 
  appointment, 
  isUpcoming 
}) => {
  const statusColors: Record<string, string> = {
    'scheduled': 'bg-blue-100 text-blue-700',
    'completed': 'bg-success/20 text-success',
    'cancelled': 'bg-destructive/20 text-destructive',
    'absent-excused': 'bg-warning/20 text-warning',
    'absent-unexcused': 'bg-destructive/20 text-destructive',
    'in-progress': 'bg-primary/10 text-primary',
    'waiting': 'bg-warning/20 text-warning',
  };

  const statusLabels: Record<string, string> = {
    'scheduled': 'Programmé',
    'completed': 'Terminé',
    'cancelled': 'Annulé',
    'absent-excused': 'Absent excusé',
    'absent-unexcused': 'Absent non excusé',
    'in-progress': 'En cours',
    'waiting': 'En attente',
  };

  return (
    <div className={cn(
      'p-3.5 rounded-lg border transition-colors hover:border-primary/30 cursor-pointer',
      isUpcoming ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
    )}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div 
            className="w-1 h-12 rounded-full flex-shrink-0"
            style={{ backgroundColor: appointment.motif.color }}
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm text-foreground capitalize truncate">
              {format(appointment.startTime, 'EEEE d MMMM', { locale: fr })}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')} • {appointment.motif.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={cn('text-xs font-medium', statusColors[appointment.status])}>
            {statusLabels[appointment.status]}
          </Badge>
        </div>
      </div>
    </div>
  );
};

// Note Item Component
const NoteItem: React.FC<{ note: Note }> = ({ note }) => {
  return (
    <div className={cn(
      'p-4 rounded-lg border',
      note.isUrgent ? 'bg-destructive/5 border-destructive/20' : 'bg-card border-border'
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {note.isUrgent && (
            <Badge variant="destructive" className="text-xs font-semibold">Urgent</Badge>
          )}
          <span className="text-xs text-muted-foreground font-medium">
            {format(note.createdAt, 'dd/MM/yyyy HH:mm', { locale: fr })}
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">{note.authorName}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{note.content}</p>
    </div>
  );
};

export default PatientDetailView;
