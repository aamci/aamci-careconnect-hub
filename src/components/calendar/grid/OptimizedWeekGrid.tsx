import React, { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import TimeAxis from './TimeAxis';
import DayHeaderRow from './DayHeaderRow';
import NowIndicator from './NowIndicator';
import UnavailableSlot from './UnavailableSlot';
import EventCard from './EventCard';
import { useOverlapLayout, getEventPosition } from '@/hooks/useOverlapLayout';
import { useGridDensity } from '@/hooks/useGridDensity';

interface OptimizedWeekGridProps {
  days: Date[];
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentHover?: (appointment: Appointment) => void;
  onAppointmentLeave?: () => void;
  onSlotClick?: (date: Date, hour: number) => void;
  onDayClick?: (date: Date) => void;
  startHour?: number;
  endHour?: number;
  unavailableSlots?: Array<{ dayIndex: number; startHour: number; endHour: number }>;
}

const OptimizedWeekGrid: React.FC<OptimizedWeekGridProps> = ({
  days,
  appointments,
  onAppointmentClick,
  onAppointmentHover,
  onAppointmentLeave,
  onSlotClick,
  onDayClick,
  startHour = 7,
  endHour = 20,
  unavailableSlots = [],
}) => {
  const { config, isCompact } = useGridDensity();
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Group appointments by day
  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      grouped[key] = appointments.filter(apt =>
        format(apt.startTime, 'yyyy-MM-dd') === key
      );
    });
    return grouped;
  }, [days, appointments]);

  // Calculate counts for header
  const appointmentCounts = useMemo(() => {
    const counts: Record<string, { current: number; total: number }> = {};
    days.forEach(day => {
      const key = format(day, 'yyyy-MM-dd');
      counts[key] = {
        current: appointmentsByDay[key]?.length || 0,
        total: 20, // Configurable max
      };
    });
    return counts;
  }, [days, appointmentsByDay]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-card rounded-lg border border-border">
      {/* Sticky Header */}
      <DayHeaderRow
        days={days}
        appointmentCounts={appointmentCounts}
        onDayClick={onDayClick}
        showTimeAxisSpacer
      />

      {/* Scrollable Grid Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex">
          {/* Time Axis */}
          <TimeAxis
            startHour={startHour}
            endHour={endHour}
            slotHeight={config.slotHeight}
          />

          {/* Day Columns */}
          {days.map((day, dayIndex) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayAppointments = appointmentsByDay[dateKey] || [];
            const isTodayDate = isToday(day);

            return (
              <DayColumn
                key={dayIndex}
                day={day}
                dayIndex={dayIndex}
                appointments={dayAppointments}
                hours={hours}
                startHour={startHour}
                slotHeight={config.slotHeight}
                isToday={isTodayDate}
                isCompact={isCompact}
                unavailableSlots={unavailableSlots.filter(s => s.dayIndex === dayIndex)}
                onSlotClick={onSlotClick}
                onAppointmentClick={onAppointmentClick}
                onAppointmentHover={onAppointmentHover}
                onAppointmentLeave={onAppointmentLeave}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Separate component for better memoization
interface DayColumnProps {
  day: Date;
  dayIndex: number;
  appointments: Appointment[];
  hours: number[];
  startHour: number;
  slotHeight: number;
  isToday: boolean;
  isCompact: boolean;
  unavailableSlots: Array<{ startHour: number; endHour: number }>;
  onSlotClick?: (date: Date, hour: number) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentHover?: (appointment: Appointment) => void;
  onAppointmentLeave?: () => void;
}

const DayColumn: React.FC<DayColumnProps> = React.memo(({
  day,
  dayIndex,
  appointments,
  hours,
  startHour,
  slotHeight,
  isToday: isTodayDate,
  isCompact,
  unavailableSlots,
  onSlotClick,
  onAppointmentClick,
  onAppointmentHover,
  onAppointmentLeave,
}) => {
  // Use overlap layout hook
  const layoutedEvents = useOverlapLayout(appointments);

  return (
    <div
      className={cn(
        'flex-1 min-w-[100px] relative border-r border-border last:border-r-0',
        isTodayDate && 'bg-accent/[0.02]'
      )}
    >
      {/* Hour slots (clickable) */}
      {hours.map((hour) => (
        <div
          key={hour}
          className="border-b border-border/40 cursor-pointer hover:bg-muted/30 transition-colors"
          style={{ height: `${slotHeight}px` }}
          onClick={() => onSlotClick?.(day, hour)}
        />
      ))}

      {/* Unavailable slots overlay */}
      {unavailableSlots.map((slot, idx) => (
        <UnavailableSlot
          key={idx}
          startHour={slot.startHour}
          endHour={slot.endHour}
          slotHeight={slotHeight}
          gridStartHour={startHour}
        />
      ))}

      {/* Now indicator */}
      {isTodayDate && (
        <NowIndicator startHour={startHour} slotHeight={slotHeight} />
      )}

      {/* Events */}
      {layoutedEvents.map(({ appointment, columnIndex, totalColumns }) => {
        const { top, height } = getEventPosition(appointment, startHour, slotHeight);

        return (
          <EventCard
            key={appointment.id}
            appointment={appointment}
            style={{ top: `${top}px`, height: `${height}px` }}
            onClick={() => onAppointmentClick(appointment)}
            onMouseEnter={() => onAppointmentHover?.(appointment)}
            onMouseLeave={onAppointmentLeave}
            compact={isCompact}
            columnIndex={columnIndex}
            totalColumns={totalColumns}
          />
        );
      })}
    </div>
  );
});

DayColumn.displayName = 'DayColumn';

export default OptimizedWeekGrid;
