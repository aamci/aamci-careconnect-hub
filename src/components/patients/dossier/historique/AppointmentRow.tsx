import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarCheck, CalendarX, Ban, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';
import { cn } from '@/lib/utils';

interface AppointmentRowProps {
  appointment: Appointment;
  onOpen: (appointment: Appointment) => void;
}

const AppointmentRow: React.FC<AppointmentRowProps> = ({ appointment, onOpen }) => {
  const getStatusConfig = (status: Appointment['status']) => {
    switch (status) {
      case 'completed':
        return {
          icon: CalendarCheck,
          textClass: '',
          iconClass: 'text-muted-foreground',
          strikethrough: false,
          showOpen: true,
        };
      case 'cancelled':
        return {
          icon: CalendarX,
          textClass: 'text-muted-foreground line-through',
          iconClass: 'text-muted-foreground',
          strikethrough: true,
          showOpen: false,
          label: 'Annulé',
        };
      case 'absent-unexcused':
        return {
          icon: Ban,
          textClass: 'text-destructive line-through',
          iconClass: 'text-destructive',
          strikethrough: true,
          showOpen: true,
        };
      case 'absent-excused':
        return {
          icon: CalendarX,
          textClass: 'text-muted-foreground line-through',
          iconClass: 'text-muted-foreground',
          strikethrough: true,
          showOpen: true,
        };
      default:
        return {
          icon: Calendar,
          textClass: '',
          iconClass: 'text-muted-foreground',
          strikethrough: false,
          showOpen: true,
        };
    }
  };

  const config = getStatusConfig(appointment.status);
  const Icon = config.icon;
  
  // Format: "mar. 21 nov. 10:00"
  const dateStr = format(appointment.startTime, "EEE d MMM", { locale: fr });
  const timeStr = format(appointment.startTime, "HH:mm");
  const dateTimeStr = `${dateStr} ${timeStr}`;

  // Get practitioner display name
  const practitionerName = appointment.practitioner 
    ? `${appointment.practitioner.firstName} ${appointment.practitioner.lastName}`
    : '';

  return (
    <div 
      className={cn(
        'flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors',
        config.strikethrough && 'bg-muted/10'
      )}
    >
      {/* Date */}
      <div className={cn('w-32 flex-shrink-0 text-sm', config.textClass)}>
        {dateTimeStr}
      </div>
      
      {/* Color indicator + Motif */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div 
          className="w-1 h-8 rounded-full flex-shrink-0"
          style={{ backgroundColor: appointment.motif?.color || '#3B82F6' }}
        />
        <span className={cn('font-medium text-sm truncate', config.textClass)}>
          {appointment.motif?.name || 'Consultation'}
        </span>
      </div>
      
      {/* Location / Practitioner */}
      <div className={cn('text-sm text-muted-foreground w-40 truncate', config.textClass)}>
        {practitionerName}
      </div>
      
      {/* Status Icon */}
      <div className="w-8 flex justify-center">
        <Icon className={cn('h-5 w-5', config.iconClass)} />
      </div>
      
      {/* Cancelled by info or Open button */}
      <div className="w-28 flex justify-end">
        {config.showOpen ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10 font-medium"
            onClick={() => onOpen(appointment)}
          >
            Ouvrir
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            {config.label || ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default AppointmentRow;
