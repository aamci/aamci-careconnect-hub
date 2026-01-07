import React from 'react';
import { CalendarView } from '@/hooks/useCalendar';
import { Appointment } from '@/types';
import OptimizedWeekGrid from './OptimizedWeekGrid';
import DayGrid from './DayGrid';
import MonthGrid from './MonthGrid';
import ListView from './ListView';

interface AgendaGridProps {
  view: CalendarView;
  days: Date[];
  currentDate: Date;
  selectedDate: Date;
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentHover?: (appointment: Appointment) => void;
  onAppointmentLeave?: () => void;
  onSlotClick?: (date: Date, hour: number) => void;
  onDayClick?: (date: Date) => void;
  startHour?: number;
  endHour?: number;
}

const AgendaGrid: React.FC<AgendaGridProps> = ({
  view,
  days,
  currentDate,
  selectedDate,
  appointments,
  onAppointmentClick,
  onAppointmentHover,
  onAppointmentLeave,
  onSlotClick,
  onDayClick,
  startHour = 7,
  endHour = 20,
}) => {
  switch (view) {
    case 'day':
      return (
        <DayGrid
          day={selectedDate}
          appointments={appointments}
          onAppointmentClick={onAppointmentClick}
          onAppointmentHover={onAppointmentHover}
          onAppointmentLeave={onAppointmentLeave}
          onSlotClick={onSlotClick}
          startHour={startHour}
          endHour={endHour}
        />
      );

    case 'week':
      return (
        <OptimizedWeekGrid
          days={days}
          appointments={appointments}
          onAppointmentClick={onAppointmentClick}
          onAppointmentHover={onAppointmentHover}
          onAppointmentLeave={onAppointmentLeave}
          onSlotClick={onSlotClick}
          onDayClick={onDayClick}
          startHour={startHour}
          endHour={endHour}
        />
      );

    case 'month':
      return (
        <MonthGrid
          currentDate={currentDate}
          selectedDate={selectedDate}
          appointments={appointments}
          onDayClick={onDayClick || (() => {})}
          onAppointmentClick={onAppointmentClick}
        />
      );

    case 'list':
      return (
        <ListView
          appointments={appointments}
          onAppointmentClick={onAppointmentClick}
          onAppointmentHover={onAppointmentHover}
          onAppointmentLeave={onAppointmentLeave}
        />
      );

    default:
      return (
        <OptimizedWeekGrid
          days={days}
          appointments={appointments}
          onAppointmentClick={onAppointmentClick}
          onAppointmentHover={onAppointmentHover}
          onAppointmentLeave={onAppointmentLeave}
          onSlotClick={onSlotClick}
          startHour={startHour}
          endHour={endHour}
        />
      );
  }
};

export default AgendaGrid;
