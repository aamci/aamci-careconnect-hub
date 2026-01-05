import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { History, Calendar, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAppointments } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface OutletContext {
  patient: Patient;
}

const PatientHistoriqueTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  
  const pastAppointments = mockAppointments
    .filter(apt => apt.patientId === patient.id && apt.startTime <= new Date())
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  const statusLabels: Record<string, string> = {
    'scheduled': 'Programmé',
    'completed': 'Terminé',
    'cancelled': 'Annulé',
    'absent-excused': 'Absent excusé',
    'absent-unexcused': 'Absent non excusé',
    'in-progress': 'En cours',
    'waiting': 'En attente',
  };

  const statusColors: Record<string, string> = {
    'scheduled': 'bg-blue-100 text-blue-700',
    'completed': 'bg-success/20 text-success',
    'cancelled': 'bg-destructive/20 text-destructive',
    'absent-excused': 'bg-warning/20 text-warning',
    'absent-unexcused': 'bg-destructive/20 text-destructive',
    'in-progress': 'bg-primary/20 text-primary',
    'waiting': 'bg-warning/20 text-warning',
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Historique</h2>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Filter className="h-4 w-4" />
          Filtrer
        </Button>
      </div>

      {pastAppointments.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {pastAppointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <div 
                    className="w-1 h-14 rounded-full flex-shrink-0"
                    style={{ backgroundColor: apt.motif.color }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm text-foreground">
                        {format(apt.startTime, 'EEEE d MMMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(apt.startTime, 'HH:mm')} - {format(apt.endTime, 'HH:mm')} • {apt.motif.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {apt.practitioner.title} {apt.practitioner.firstName} {apt.practitioner.lastName}
                    </p>
                  </div>

                  <Badge className={cn('text-xs', statusColors[apt.status])}>
                    {statusLabels[apt.status]}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucun historique
            </h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Ce patient n'a pas encore d'historique de consultations ou rendez-vous passés.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientHistoriqueTab;
