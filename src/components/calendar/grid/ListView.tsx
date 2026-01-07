import React, { useMemo } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { motion } from 'framer-motion';
import { Clock, User, Stethoscope, Calendar } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ListViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentHover?: (appointment: Appointment) => void;
  onAppointmentLeave?: () => void;
}

const ListView: React.FC<ListViewProps> = ({
  appointments,
  onAppointmentClick,
  onAppointmentHover,
  onAppointmentLeave,
}) => {
  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    
    // Sort all appointments by start time
    const sorted = [...appointments].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    sorted.forEach(apt => {
      const dateKey = format(apt.startTime, 'yyyy-MM-dd');
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(apt);
    });

    return groups;
  }, [appointments]);

  const dateKeys = Object.keys(groupedAppointments).sort();

  if (appointments.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-card rounded-lg border border-border">
        <div className="text-center text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun rendez-vous pour cette période</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-lg border border-border">
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {dateKeys.map(dateKey => {
            const dayAppointments = groupedAppointments[dateKey];
            const date = new Date(dateKey);
            const isTodayDate = isToday(date);

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date header */}
                <div className={cn(
                  'sticky top-0 z-10 flex items-center gap-2 py-2 px-3 -mx-3 bg-muted/50 backdrop-blur-sm border-b border-border',
                  isTodayDate && 'bg-accent/10'
                )}>
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex flex-col items-center justify-center',
                    isTodayDate ? 'bg-accent text-accent-foreground' : 'bg-muted'
                  )}>
                    <span className="text-[10px] font-medium uppercase leading-none">
                      {format(date, 'EEE', { locale: fr })}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {format(date, 'd')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className={cn(
                      'text-sm font-medium capitalize',
                      isTodayDate ? 'text-accent' : 'text-foreground'
                    )}>
                      {format(date, 'EEEE d MMMM', { locale: fr })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dayAppointments.length} rendez-vous
                    </div>
                  </div>
                </div>

                {/* Appointments for this day */}
                <div className="space-y-1.5 pl-12">
                  {dayAppointments.map((apt) => (
                    <ListViewItem
                      key={apt.id}
                      appointment={apt}
                      onClick={() => onAppointmentClick(apt)}
                      onMouseEnter={() => onAppointmentHover?.(apt)}
                      onMouseLeave={onAppointmentLeave}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

const ListViewItem: React.FC<{
  appointment: Appointment;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}> = ({ appointment, onClick, onMouseEnter, onMouseLeave }) => {
  const getTypeColor = () => {
    switch (appointment.type) {
      case 'consultation': return 'border-l-amber-500 bg-amber-50/50';
      case 'followup': return 'border-l-sky-500 bg-sky-50/50';
      case 'emergency': return 'border-l-red-500 bg-red-50/50';
      case 'procedure': return 'border-l-purple-500 bg-purple-50/50';
      case 'checkup': return 'border-l-emerald-500 bg-emerald-50/50';
      default: return 'border-l-amber-500 bg-amber-50/50';
    }
  };

  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'waiting':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">En attente</span>;
      case 'in-progress':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700">En cours</span>;
      case 'completed':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">Terminé</span>;
      case 'cancelled':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">Annulé</span>;
      case 'absent-excused':
      case 'absent-unexcused':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">Absent</span>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.005, x: 2 }}
      className={cn(
        'flex items-center gap-3 p-2.5 rounded-lg border-l-3 cursor-pointer transition-all hover:shadow-sm',
        getTypeColor(),
        appointment.status === 'cancelled' && 'opacity-50'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Time */}
      <div className="flex items-center gap-1.5 w-20 shrink-0">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-sm font-semibold">
          {format(appointment.startTime, 'HH:mm')}
        </span>
      </div>

      {/* Patient */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium truncate">
          {appointment.patient.lastName.toUpperCase()} {appointment.patient.firstName}
        </span>
      </div>

      {/* Motif */}
      <div className="flex items-center gap-1.5 w-32 shrink-0 hidden sm:flex">
        <Stethoscope className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground truncate">
          {appointment.motif.shortName}
        </span>
      </div>

      {/* Duration */}
      <div className="text-xs text-muted-foreground w-12 text-right shrink-0">
        {appointment.duration}min
      </div>

      {/* Status */}
      <div className="w-16 flex justify-end shrink-0">
        {getStatusBadge()}
      </div>
    </motion.div>
  );
};

export default ListView;
