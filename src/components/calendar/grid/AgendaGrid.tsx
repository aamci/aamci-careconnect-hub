import React from 'react';
import { CalendarView } from '@/hooks/useCalendar';
import { Appointment } from '@/types';
import { type PractitionerOpening } from '@/services/supabase/openingsService';
import { type ZoomLevel } from '@/hooks/useGridDensity';
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
  openings?: PractitionerOpening[];
  isOpeningEditMode?: boolean;
  onAppointmentClick: (appointment: Appointment) => void;
  onAppointmentHover?: (appointment: Appointment) => void;
  onAppointmentLeave?: () => void;
  onOpeningHover?: (opening: PractitionerOpening) => void;
  onOpeningLeave?: () => void;
  onOpeningEdit?: (opening: PractitionerOpening) => void;
  onOpeningCopy?: (opening: PractitionerOpening) => void;
  onOpeningDragCreate?: (date: Date, startTime: string, endTime: string) => void;
  onSlotClick?: (date: Date, hour: number) => void;
  onDayClick?: (date: Date) => void;
  startHour?: number;
  endHour?: number;
  zoomLevel?: ZoomLevel;
}

const AgendaGrid: React.FC<AgendaGridProps> = ({
  view,
  days,
  currentDate,
  selectedDate,
  appointments,
  openings = [],
  isOpeningEditMode = false,
  onAppointmentClick,
  onAppointmentHover,
  onAppointmentLeave,
  onOpeningHover,
  onOpeningLeave,
  onOpeningEdit,
  onOpeningCopy,
  onOpeningDragCreate,
  onSlotClick,
  onDayClick,
  startHour = 7,
  endHour = 20,
  zoomLevel = 'standard',
}) => {
  switch (view) {
    case 'day':
      return (
        <DayGrid
          day={selectedDate}
          appointments={appointments}
          openings={openings}
          isOpeningEditMode={isOpeningEditMode}
          onAppointmentClick={onAppointmentClick}
          onAppointmentHover={onAppointmentHover}
          onAppointmentLeave={onAppointmentLeave}
          onOpeningHover={onOpeningHover}
          onOpeningLeave={onOpeningLeave}
          onOpeningEdit={onOpeningEdit}
          onOpeningCopy={onOpeningCopy}
          onOpeningDragCreate={onOpeningDragCreate}
          onSlotClick={onSlotClick}
          startHour={startHour}
          endHour={endHour}
          zoomLevel={zoomLevel}
        />
      );

    case 'week':
      return (
        <OptimizedWeekGrid
          days={days}
          appointments={appointments}
          openings={openings}
          isOpeningEditMode={isOpeningEditMode}
          onAppointmentClick={onAppointmentClick}
          onAppointmentHover={onAppointmentHover}
          onAppointmentLeave={onAppointmentLeave}
          onOpeningHover={onOpeningHover}
          onOpeningLeave={onOpeningLeave}
          onOpeningEdit={onOpeningEdit}
          onOpeningCopy={onOpeningCopy}
          onOpeningDragCreate={onOpeningDragCreate}
          onSlotClick={onSlotClick}
          onDayClick={onDayClick}
          startHour={startHour}
          endHour={endHour}
          zoomLevel={zoomLevel}
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
          openings={openings}
          isOpeningEditMode={isOpeningEditMode}
          onAppointmentClick={onAppointmentClick}
          onAppointmentHover={onAppointmentHover}
          onAppointmentLeave={onAppointmentLeave}
          onOpeningHover={onOpeningHover}
          onOpeningLeave={onOpeningLeave}
          onOpeningEdit={onOpeningEdit}
          onOpeningCopy={onOpeningCopy}
          onOpeningDragCreate={onOpeningDragCreate}
          onSlotClick={onSlotClick}
          startHour={startHour}
          endHour={endHour}
          zoomLevel={zoomLevel}
        />
      );
  }
};

export default AgendaGrid;
