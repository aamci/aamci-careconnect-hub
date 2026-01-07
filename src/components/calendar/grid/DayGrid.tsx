import React, { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import TimeAxis from './TimeAxis';
import NowIndicator from './NowIndicator';
import UnavailableSlot from './UnavailableSlot';
import EventCard from './EventCard';
import { useOverlapLayout, getEventPosition } from '@/hooks/useOverlapLayout';
import { useGridDensity } from '@/hooks/useGridDensity';

interface DayGridProps {
  day: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentHover?: (appointment: Appointment) => void;
  onAppointmentLeave?: () => void;
  onSlotClick?: (date: Date, hour: number) => void;
  startHour?: number;
  endHour?: number;
  unavailableSlots?: Array<{ startHour: number; endHour: number }>;
}

const DayGrid: React.FC<DayGridProps> = ({
  day,
  appointments,
  onAppointmentClick,
  onAppointmentHover,
  onAppointmentLeave,
  onSlotClick,
  startHour = 7,
  endHour = 20,
  unavailableSlots = [],
}) => {
  const { config, isCompact } = useGridDensity();
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const isTodayDate = isToday(day);

  // Filter appointments for this day
  const dayAppointments = useMemo(() => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return appointments.filter(apt =>
      format(apt.startTime, 'yyyy-MM-dd') === dateKey
    );
  }, [day, appointments]);

  // Use overlap layout
  const layoutedEvents = useOverlapLayout(dayAppointments);

  const appointmentCount = dayAppointments.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-lg border border-border">
      {/* Day Header */}
      <div className={cn(
        'flex items-center justify-between px-4 border-b border-border bg-muted/30 sticky top-0 z-20',
        'h-[44px]'
      )}>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            'text-lg font-semibold capitalize',
            isTodayDate ? 'text-accent' : 'text-foreground'
          )}>
            {format(day, 'EEEE', { locale: fr })}
          </span>
          <span className={cn(
            'text-2xl font-bold',
            isTodayDate ? 'text-accent' : 'text-foreground'
          )}>
            {format(day, 'd')}
          </span>
          <span className="text-sm text-muted-foreground">
            {format(day, 'MMMM yyyy', { locale: fr })}
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          {appointmentCount} rendez-vous
        </div>
      </div>

      {/* Scrollable Grid Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex">
          {/* Time Axis */}
          <TimeAxis
            startHour={startHour}
            endHour={endHour}
            slotHeight={config.slotHeight}
          />

          {/* Single Day Column - takes full width */}
          <div className={cn(
            'flex-1 relative',
            isTodayDate && 'bg-accent/[0.02]'
          )}>
            {/* Hour slots */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-border/40 cursor-pointer hover:bg-muted/30 transition-colors"
                style={{ height: `${config.slotHeight}px` }}
                onClick={() => onSlotClick?.(day, hour)}
              />
            ))}

            {/* Unavailable slots */}
            {unavailableSlots.map((slot, idx) => (
              <UnavailableSlot
                key={idx}
                startHour={slot.startHour}
                endHour={slot.endHour}
                slotHeight={config.slotHeight}
                gridStartHour={startHour}
              />
            ))}

            {/* Now indicator */}
            {isTodayDate && (
              <NowIndicator startHour={startHour} slotHeight={config.slotHeight} />
            )}

            {/* Events with overlap handling */}
            {layoutedEvents.map(({ appointment, columnIndex, totalColumns }) => {
              const { top, height } = getEventPosition(appointment, startHour, config.slotHeight);

              return (
                <EventCard
                  key={appointment.id}
                  appointment={appointment}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  onClick={() => onAppointmentClick(appointment)}
                  onMouseEnter={() => onAppointmentHover?.(appointment)}
                  onMouseLeave={onAppointmentLeave}
                  compact={isCompact}
                  showMotif={true}
                  columnIndex={columnIndex}
                  totalColumns={totalColumns}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayGrid;
