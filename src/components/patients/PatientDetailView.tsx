import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { mockAppointments, mockNotes } from '@/data/mockData';

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
  
  const age = differenceInYears(new Date(), patient.dateOfBirth);
  const displayName = patient.usedFirstName || patient.firstName;
  const displayLastName = patient.usedLastName || patient.lastName;
  
  const hasVipAlert = patient.alerts?.some(a => a.type === 'vip');
  
  // Get patient appointments
  const patientAppointments = mockAppointments
    .filter(apt => apt.patientId === patient.id)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  
  const upcomingAppointments = patientAppointments.filter(apt => apt.startTime > new Date());
  const pastAppointments = patientAppointments.filter(apt => apt.startTime <= new Date());
  
  // Get patient notes
  const patientNotes = mockNotes.filter(note => note.patientId === patient.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-screen w-full max-w-md bg-card border-l border-border shadow-lg z-50 flex flex-col"
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 z-10 p-4 border-b border-border bg-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-primary/30">
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {displayName[0]}{displayLastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {patient.gender === 'male' ? 'Monsieur' : 'Madame'}
                  </span>
                  {hasVipAlert && (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  )}
                </div>
                <h2 className="font-semibold text-lg">
                  {displayLastName.toUpperCase()} {displayName}
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

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button onClick={onNewAppointment} size="sm" className="gap-1.5 flex-1">
              <Plus className="w-4 h-4" />
              Nouveau RDV
            </Button>
            <Button onClick={onNewNote} variant="outline" size="sm" className="gap-1.5 flex-1">
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
          <div className="px-4 py-3 bg-warning/10 border-b border-warning/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-warning">Alertes patient</p>
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
            <TabsList className="mx-4 mt-4 bg-muted/50">
              <TabsTrigger value="info" className="gap-1.5">
                <User className="w-4 h-4" />
                Infos
              </TabsTrigger>
              <TabsTrigger value="appointments" className="gap-1.5">
                <Calendar className="w-4 h-4" />
                RDV ({patientAppointments.length})
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-1.5">
                <FileText className="w-4 h-4" />
                Notes ({patientNotes.length})
              </TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="p-4 space-y-6 flex-1">
              {/* Contact */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Contact
                </h3>
                <div className="space-y-2">
                  {patient.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${patient.phone}`} className="text-accent hover:underline">
                        {patient.phone}
                      </a>
                    </div>
                  )}
                  {patient.phoneSecondary && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{patient.phoneSecondary}</span>
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
                  {(patient.address || patient.city) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>
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
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Informations médicales
                </h3>
                <div className="space-y-3">
                  {patient.referringDoctor && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Médecin traitant</span>
                      <span className="text-sm font-medium">{patient.referringDoctor}</span>
                    </div>
                  )}
                  {patient.insuranceProvider && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Couverture</span>
                      <span className="text-sm font-medium">{patient.insuranceProvider}</span>
                    </div>
                  )}
                  {patient.insuranceNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">N° SS</span>
                      <span className="text-sm font-medium">{patient.insuranceNumber}</span>
                    </div>
                  )}
                </div>
              </section>

              <Separator />

              {/* Administrative */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Administratif
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Créé le</span>
                    <span className="text-sm">{format(patient.createdAt, 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Modifié le</span>
                    <span className="text-sm">{format(patient.updatedAt, 'dd/MM/yyyy', { locale: fr })}</span>
                  </div>
                  {patient.birthPlace && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Lieu de naissance</span>
                      <span className="text-sm">{patient.birthPlace}</span>
                    </div>
                  )}
                </div>
              </section>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="p-4 space-y-6 flex-1">
              {/* Upcoming */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  À venir ({upcomingAppointments.length})
                </h3>
                {upcomingAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingAppointments.map((apt) => (
                      <AppointmentItem key={apt.id} appointment={apt} isUpcoming />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-lg">
                    Aucun rendez-vous à venir
                  </p>
                )}
              </section>

              {/* Past */}
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Historique ({pastAppointments.length})
                </h3>
                {pastAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {pastAppointments.slice(0, 10).map((apt) => (
                      <AppointmentItem key={apt.id} appointment={apt} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center bg-muted/30 rounded-lg">
                    Aucun historique
                  </p>
                )}
              </section>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="p-4 space-y-4 flex-1">
              {patientNotes.length > 0 ? (
                patientNotes.map((note) => (
                  <NoteItem key={note.id} note={note} />
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucune note pour ce patient</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={onNewNote}>
                    <Plus className="w-4 h-4 mr-1.5" />
                    Ajouter une note
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Fermer
          </Button>
          <Button className="flex-1" onClick={onEdit}>
            Modifier le dossier
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
    'completed': 'bg-green-100 text-green-700',
    'cancelled': 'bg-red-100 text-red-700',
    'absent-excused': 'bg-amber-100 text-amber-700',
    'absent-unexcused': 'bg-red-100 text-red-700',
    'in-progress': 'bg-primary/10 text-primary',
    'waiting': 'bg-amber-100 text-amber-700',
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
      'p-3 rounded-lg border transition-colors hover:border-primary/30',
      isUpcoming ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-1 h-10 rounded-full"
            style={{ backgroundColor: appointment.motif.color }}
          />
          <div>
            <p className="font-medium text-foreground">
              {format(appointment.startTime, 'EEEE d MMMM', { locale: fr })}
            </p>
            <p className="text-sm text-muted-foreground">
              {format(appointment.startTime, 'HH:mm')} - {format(appointment.endTime, 'HH:mm')} • {appointment.motif.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('text-xs', statusColors[appointment.status])}>
            {statusLabels[appointment.status]}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
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
            <Badge variant="destructive" className="text-xs">Urgent</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {format(note.createdAt, 'dd/MM/yyyy HH:mm', { locale: fr })}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{note.authorName}</span>
      </div>
      <p className="text-sm text-foreground">{note.content}</p>
    </div>
  );
};

export default PatientDetailView;
