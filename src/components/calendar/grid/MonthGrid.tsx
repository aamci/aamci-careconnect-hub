import React, { useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { motion } from 'framer-motion';

interface MonthGridProps {
  currentDate: Date;
  selectedDate: Date;
  appointments: Appointment[];
  onDayClick: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  maxEventsPerCell?: number;
}

const MonthGrid: React.FC<MonthGridProps> = ({
  currentDate,
  selectedDate,
  appointments,
  onDayClick,
  onAppointmentClick,
  maxEventsPerCell = 3,
}) => {
  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach(apt => {
      const key = format(apt.startTime, 'yyyy-MM-dd');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(apt);
    });
    // Sort each day by start time
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    });
    return grouped;
  }, [appointments]);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Split days into weeks
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      result.push(calendarDays.slice(i, i + 7));
    }
    return result;
  }, [calendarDays]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-lg border border-border">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={cn(
              'py-2 text-center text-xs font-medium text-muted-foreground border-r border-border last:border-r-0',
              (idx === 5 || idx === 6) && 'text-muted-foreground/60'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-[repeat(auto-fill,minmax(100px,1fr))] overflow-y-auto custom-scrollbar">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 border-b border-border last:border-b-0">
            {week.map((day, dayIdx) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayAppointments = appointmentsByDay[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isTodayDate = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              const hasMore = dayAppointments.length > maxEventsPerCell;
              const displayedEvents = dayAppointments.slice(0, maxEventsPerCell);
              const moreCount = dayAppointments.length - maxEventsPerCell;

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    'min-h-[100px] p-1 border-r border-border last:border-r-0 cursor-pointer transition-colors hover:bg-muted/30',
                    !isCurrentMonth && 'bg-muted/20',
                    isTodayDate && 'bg-accent/5',
                    isSelected && 'ring-2 ring-inset ring-accent'
                  )}
                  onClick={() => onDayClick(day)}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                      !isCurrentMonth && 'text-muted-foreground/50',
                      isTodayDate && 'bg-accent text-accent-foreground font-bold',
                      isSelected && !isTodayDate && 'bg-primary/10 text-primary'
                    )}>
                      {format(day, 'd')}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        {dayAppointments.length}
                      </span>
                    )}
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {displayedEvents.map((apt) => (
                      <MonthEventPill
                        key={apt.id}
                        appointment={apt}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(apt);
                        }}
                      />
                    ))}
                    {hasMore && (
                      <div className="text-[10px] text-muted-foreground font-medium pl-1">
                        +{moreCount} autres
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Compact event pill for month view
const MonthEventPill: React.FC<{
  appointment: Appointment;
  onClick: (e: React.MouseEvent) => void;
}> = ({ appointment, onClick }) => {
  const getColorClass = () => {
    switch (appointment.type) {
      case 'consultation': return 'bg-amber-100 border-l-amber-500';
      case 'followup': return 'bg-sky-100 border-l-sky-500';
      case 'emergency': return 'bg-red-100 border-l-red-500';
      case 'procedure': return 'bg-purple-100 border-l-purple-500';
      case 'checkup': return 'bg-emerald-100 border-l-emerald-500';
      default: return 'bg-amber-100 border-l-amber-500';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        'text-[10px] px-1 py-0.5 rounded-sm border-l-2 truncate cursor-pointer hover:opacity-80 transition-opacity',
        getColorClass(),
        appointment.status === 'completed' && 'opacity-50',
        appointment.status === 'cancelled' && 'opacity-30 line-through'
      )}
      onClick={onClick}
      title={`${format(appointment.startTime, 'HH:mm')} - ${appointment.patient.lastName} ${appointment.patient.firstName}`}
    >
      <span className="font-medium">{format(appointment.startTime, 'HH:mm')}</span>{' '}
      <span className="opacity-80">{appointment.patient.lastName}</span>
    </motion.div>
  );
};

export default MonthGrid;
