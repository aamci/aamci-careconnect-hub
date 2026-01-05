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
import { ScrollArea } from '@/components/ui/scroll-area';
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="h-full flex flex-col bg-card border-l border-border"
    >
      {/* Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">
                  {displayLastName.toUpperCase()} {displayName}
                </h2>
                {hasVipAlert && (
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                )}
              </div>
              <p className="text-muted-foreground">
                {age} ans • {patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Autre'} • 
                Né(e) le {format(patient.dateOfBirth, 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button onClick={onNewAppointment} size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            Nouveau RDV
          </Button>
          <Button onClick={onNewNote} variant="outline" size="sm" className="gap-1.5">
            <FileText className="w-4 h-4" />
            Ajouter note
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {patient.alerts && patient.alerts.length > 0 && (
        <div className="px-6 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Alertes patient</p>
              <ul className="mt-1 space-y-1">
                {patient.alerts.map((alert) => (
                  <li key={alert.id} className="text-sm text-amber-700 dark:text-amber-300">
                    • {alert.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-6 mt-4 bg-muted/50">
          <TabsTrigger value="info" className="gap-1.5">
            <User className="w-4 h-4" />
            Informations
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

        <ScrollArea className="flex-1">
          {/* Info Tab */}
          <TabsContent value="info" className="p-6 space-y-6">
            {/* Contact */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Contact
              </h3>
              <div className="space-y-3">
                {patient.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{patient.phone}</p>
                      <p className="text-xs text-muted-foreground">Principal</p>
                    </div>
                  </div>
                )}
                {patient.phoneSecondary && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{patient.phoneSecondary}</p>
                      <p className="text-xs text-muted-foreground">Secondaire</p>
                    </div>
                  </div>
                )}
                {patient.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{patient.email}</p>
                      <p className="text-xs text-muted-foreground">Email</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Address */}
            {(patient.address || patient.city) && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Adresse
                </h3>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    {patient.address && <p className="text-sm text-foreground">{patient.address}</p>}
                    <p className="text-sm text-foreground">
                      {patient.postalCode} {patient.city}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Medical Info */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Informations médicales
              </h3>
              <div className="space-y-3">
                {patient.referringDoctor && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Heart className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{patient.referringDoctor}</p>
                      <p className="text-xs text-muted-foreground">Médecin traitant</p>
                    </div>
                  </div>
                )}
                {patient.insuranceProvider && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{patient.insuranceProvider}</p>
                      <p className="text-xs text-muted-foreground">Couverture santé</p>
                    </div>
                  </div>
                )}
                {patient.insuranceNumber && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{patient.insuranceNumber}</p>
                      <p className="text-xs text-muted-foreground">N° Sécurité Sociale</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Administrative */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Administratif
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Créé le</p>
                  <p className="font-medium">{format(patient.createdAt, 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Modifié le</p>
                  <p className="font-medium">{format(patient.updatedAt, 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
                {patient.birthPlace && (
                  <div>
                    <p className="text-muted-foreground">Lieu de naissance</p>
                    <p className="font-medium">{patient.birthPlace}</p>
                  </div>
                )}
              </div>
            </section>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="p-6 space-y-6">
            {/* Upcoming */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
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
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
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
          <TabsContent value="notes" className="p-6 space-y-4">
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
        </ScrollArea>
      </Tabs>
    </motion.div>
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
