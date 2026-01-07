import React from 'react';
import { motion } from 'framer-motion';
import { format, isSameDay, isToday, getHours, getMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';

interface WeekGridProps {
  days: Date[];
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentHover?: (appointment: Appointment) => void;
  onAppointmentLeave?: () => void;
  onSlotClick?: (date: Date, hour: number) => void;
  startHour?: number;
  endHour?: number;
}

const HOUR_HEIGHT = 60; // pixels per hour

const WeekGrid: React.FC<WeekGridProps> = ({
  days,
  appointments,
  onAppointmentClick,
  onAppointmentHover,
  onAppointmentLeave,
  onSlotClick,
  startHour = 8,
  endHour = 19,
}) => {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => 
      format(apt.startTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getAppointmentStyle = (apt: Appointment) => {
    const startMinutes = (getHours(apt.startTime) - startHour) * 60 + getMinutes(apt.startTime);
    const top = (startMinutes / 60) * HOUR_HEIGHT;
    const height = (apt.duration / 60) * HOUR_HEIGHT;
    
    return {
      top: `${top}px`,
      height: `${Math.max(height - 2, 20)}px`,
    };
  };

  const getAppointmentColor = (type: Appointment['type']) => {
    switch (type) {
      case 'consultation': return 'appointment-consultation';
      case 'followup': return 'appointment-followup';
      case 'emergency': return 'appointment-emergency';
      case 'procedure': return 'appointment-procedure';
      case 'checkup': return 'appointment-checkup';
      default: return 'appointment-consultation';
    }
  };

  const getCountForDay = (date: Date) => {
    return getAppointmentsForDay(date).length;
  };

  const currentTimePosition = () => {
    const now = new Date();
    const currentMinutes = (getHours(now) - startHour) * 60 + getMinutes(now);
    return (currentMinutes / 60) * HOUR_HEIGHT;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-xl border border-border">
      {/* Header - Days */}
      <div className="flex border-b border-border bg-muted/30">
        {/* Time column spacer */}
        <div className="w-16 flex-shrink-0 border-r border-border" />
        
        {/* Day columns */}
        {days.map((day, index) => {
          const count = getCountForDay(day);
          const isTodayDate = isToday(day);
          
          return (
            <div
              key={index}
              className={cn(
                'flex-1 min-w-[120px] py-3 px-2 text-center border-r border-border last:border-r-0',
                isTodayDate && 'bg-accent/5'
              )}
            >
              <div className="text-xs text-muted-foreground capitalize mb-0.5">
                {format(day, 'EEE', { locale: fr })}. {format(day, 'd')}
              </div>
              <div className={cn(
                'text-[10px]',
                isTodayDate ? 'text-accent font-medium' : 'text-muted-foreground/60'
              )}>
                {count} / {appointments.length > 0 ? Math.floor(appointments.length / 5) + 10 : 20}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex">
          {/* Time Column */}
          <div className="w-16 flex-shrink-0 border-r border-border">
            {hours.map((hour) => (
              <div 
                key={hour} 
                className="h-[60px] flex items-start justify-end pr-2 pt-0"
              >
                <span className="text-[10px] text-muted-foreground -mt-2">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map((day, dayIndex) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isTodayDate = isToday(day);

            return (
              <div
                key={dayIndex}
                className={cn(
                  'flex-1 min-w-[120px] relative border-r border-border last:border-r-0',
                  isTodayDate && 'bg-accent/[0.02]'
                )}
              >
                {/* Hour lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-border/50 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => onSlotClick?.(day, hour)}
                  />
                ))}

                {/* Current time indicator */}
                {isTodayDate && (
                  <div 
                    className="absolute left-0 right-0 flex items-center z-20 pointer-events-none"
                    style={{ top: `${currentTimePosition()}px` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-destructive -ml-1" />
                    <div className="flex-1 h-[2px] bg-destructive" style={{ 
                      background: 'linear-gradient(to right, hsl(var(--destructive)), transparent)'
                    }} />
                  </div>
                )}

                {/* Appointments */}
                {dayAppointments.map((apt) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02, zIndex: 30 }}
                    className={cn(
                      'appointment-card absolute left-1 right-1 z-10 overflow-hidden',
                      getAppointmentColor(apt.type),
                      apt.status === 'completed' && 'opacity-60',
                      apt.status === 'cancelled' && 'opacity-40 line-through'
                    )}
                    style={getAppointmentStyle(apt)}
                    onClick={() => onAppointmentClick(apt)}
                    onMouseEnter={() => onAppointmentHover?.(apt)}
                    onMouseLeave={() => onAppointmentLeave?.()}
                    onFocus={() => onAppointmentHover?.(apt)}
                    onBlur={() => onAppointmentLeave?.()}
                    tabIndex={0}
                    role="button"
                    aria-label={`${apt.patient.lastName} ${apt.patient.firstName} - ${format(apt.startTime, 'HH:mm')} - ${apt.motif.shortName}`}
                  >
                    <div className="flex items-start gap-1">
                      <span className="font-semibold text-[10px]">
                        {format(apt.startTime, 'HH:mm')}
                      </span>
                      <span className="truncate text-[10px]">
                        {apt.patient.lastName.toUpperCase()}
                      </span>
                    </div>
                    {apt.duration >= 30 && (
                      <div className="text-[9px] opacity-80 truncate">
                        {apt.motif.shortName}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekGrid;
