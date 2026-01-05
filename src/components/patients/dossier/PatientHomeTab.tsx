import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Clock,
  ChevronRight,
  Plus,
  User,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAppointments, mockNotes } from '@/data/mockData';

interface OutletContext {
  patient: Patient;
}

const PatientHomeTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  
  const patientAppointments = mockAppointments
    .filter(apt => apt.patientId === patient.id)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    
  const upcomingAppointments = patientAppointments.filter(apt => apt.startTime > new Date()).slice(0, 3);
  const recentNotes = mockNotes.filter(note => note.patientId === patient.id).slice(0, 3);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{patientAppointments.length}</p>
                    <p className="text-xs text-muted-foreground">RDV Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</p>
                    <p className="text-xs text-muted-foreground">À venir</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{recentNotes.length}</p>
                    <p className="text-xs text-muted-foreground">Notes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{patient.alerts?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Alertes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Prochains rendez-vous
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Voir tout
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div 
                      key={apt.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div 
                        className="w-1 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: apt.motif.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {format(apt.startTime, 'EEEE d MMMM', { locale: fr })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(apt.startTime, 'HH:mm')} - {format(apt.endTime, 'HH:mm')} • {apt.motif.name}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {apt.practitioner.title} {apt.practitioner.lastName}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun rendez-vous à venir</p>
                  <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                    <Plus className="h-4 w-4" />
                    Planifier un RDV
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Notes */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Notes récentes
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  Voir tout
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {recentNotes.length > 0 ? (
                <div className="space-y-3">
                  {recentNotes.map((note) => (
                    <div 
                      key={note.id}
                      className="p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {format(note.createdAt, 'dd/MM/yyyy HH:mm', { locale: fr })}
                        </span>
                        <span className="text-xs text-muted-foreground">{note.authorName}</span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucune note</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Coordonnées
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {patient.phone && (
                <a 
                  href={`tel:${patient.phone}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-accent">{patient.phone}</span>
                </a>
              )}
              {patient.email && (
                <a 
                  href={`mailto:${patient.email}`}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-accent truncate">{patient.email}</span>
                </a>
              )}
              {(patient.address || patient.city) && (
                <div className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/30">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm text-foreground">
                    {patient.address && `${patient.address}, `}
                    {patient.postalCode} {patient.city}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <Button className="w-full justify-start gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Nouveau rendez-vous
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <FileText className="h-4 w-4" />
                Ajouter une note
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                <Mail className="h-4 w-4" />
                Envoyer un message
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientHomeTab;
