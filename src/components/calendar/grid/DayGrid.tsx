import React, { useMemo, useState, useCallback } from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';
import { type PractitionerOpening } from '@/services/supabase/openingsService';
import TimeAxis from './TimeAxis';
import NowIndicator from './NowIndicator';
import UnavailableSlot from './UnavailableSlot';
import EventCard from './EventCard';
import OpeningSlot from '../openings/OpeningSlot';
import { useOverlapLayout, getEventPosition } from '@/hooks/useOverlapLayout';
import { useGridDensity } from '@/hooks/useGridDensity';

interface DayGridProps {
  day: Date;
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
  startHour?: number;
  endHour?: number;
  unavailableSlots?: Array<{ startHour: number; endHour: number }>;
}

const DayGrid: React.FC<DayGridProps> = ({
  day,
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

  // Filter openings for this day
  const dayOpenings = useMemo(() => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return openings.filter(op =>
      format(op.openingDate, 'yyyy-MM-dd') === dateKey && !op.isCancelled
    );
  }, [day, openings]);

  // Use overlap layout
  const layoutedEvents = useOverlapLayout(dayAppointments);

  const appointmentCount = dayAppointments.length;

  // Drag state for creating openings
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ hour: number; minutes: number } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ hour: number; minutes: number } | null>(null);

  const slotHeight = config.slotHeight;

  // Calculate position from mouse event
  const getTimeFromMouseY = useCallback((clientY: number, containerRect: DOMRect) => {
    const relativeY = clientY - containerRect.top;
    const totalMinutes = (relativeY / slotHeight) * 60;
    const hour = Math.floor(totalMinutes / 60) + startHour;
    const minutes = Math.round((totalMinutes % 60) / 15) * 15;
    return { hour: Math.max(startHour, Math.min(hour, 20)), minutes: minutes % 60 };
  }, [slotHeight, startHour]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isOpeningEditMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const time = getTimeFromMouseY(e.clientY, rect);
    setIsDragging(true);
    setDragStart(time);
    setDragEnd(time);
  }, [isOpeningEditMode, getTimeFromMouseY]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !isOpeningEditMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const time = getTimeFromMouseY(e.clientY, rect);
    setDragEnd(time);
  }, [isDragging, isOpeningEditMode, getTimeFromMouseY]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
      return;
    }

    const start = dragStart.hour * 60 + dragStart.minutes;
    const end = dragEnd.hour * 60 + dragEnd.minutes;
    
    const actualStart = Math.min(start, end);
    const actualEnd = Math.max(start, end);
    
    if (actualEnd - actualStart >= 30) {
      const startHr = Math.floor(actualStart / 60);
      const startMin = actualStart % 60;
      const endHr = Math.floor(actualEnd / 60);
      const endMin = actualEnd % 60;
      
      const startTime = `${startHr.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      const endTime = `${endHr.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      onOpeningDragCreate?.(day, startTime, endTime);
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, day, onOpeningDragCreate]);

  // Calculate drag selection position
  const dragSelectionStyle = useMemo(() => {
    if (!isDragging || !dragStart || !dragEnd) return null;
    
    const start = (dragStart.hour - startHour) * slotHeight + (dragStart.minutes / 60) * slotHeight;
    const end = (dragEnd.hour - startHour) * slotHeight + (dragEnd.minutes / 60) * slotHeight;
    
    const top = Math.min(start, end);
    const height = Math.abs(end - start);
    
    return { top, height: Math.max(height, slotHeight / 2) };
  }, [isDragging, dragStart, dragEnd, startHour, slotHeight]);

  // Calculate opening position
  const getOpeningPosition = (opening: PractitionerOpening) => {
    const [startH, startM] = opening.startTime.split(':').map(Number);
    const [endH, endM] = opening.endTime.split(':').map(Number);
    
    const startMinutes = (startH - startHour) * 60 + startM;
    const endMinutes = (endH - startHour) * 60 + endM;
    
    const top = (startMinutes / 60) * slotHeight;
    const height = ((endMinutes - startMinutes) / 60) * slotHeight;
    
    return { top, height: Math.max(height, 20) };
  };

  return (
    <div className={cn(
      "flex-1 flex flex-col overflow-hidden bg-card rounded-lg border",
      isOpeningEditMode ? "border-amber-400 border-2" : "border-border"
    )}>
      {/* Edit mode indicator */}
      {isOpeningEditMode && (
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs px-4 py-1.5 font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          Mode édition des plages d'ouverture — Cliquez sur une plage pour la modifier ou glissez pour en créer une nouvelle
        </div>
      )}

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
            slotHeight={slotHeight}
          />

          {/* Single Day Column - takes full width */}
          <div 
            className={cn(
              'flex-1 relative',
              isTodayDate && 'bg-accent/[0.02]',
              isOpeningEditMode && 'cursor-crosshair'
            )}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isDragging) handleMouseUp();
            }}
          >
            {/* Hour slots */}
            {hours.map((hour) => (
              <div
                key={hour}
                className={cn(
                  "border-b border-border/40 transition-colors",
                  isOpeningEditMode 
                    ? "hover:bg-amber-50 dark:hover:bg-amber-950/20" 
                    : "cursor-pointer hover:bg-muted/30"
                )}
                style={{ height: `${slotHeight}px` }}
                onClick={(e) => {
                  if (!isDragging) {
                    e.stopPropagation();
                    onSlotClick?.(day, hour);
                  }
                }}
              />
            ))}

            {/* Opening slots - show in edit mode */}
            {isOpeningEditMode && dayOpenings.map((opening) => {
              const { top, height } = getOpeningPosition(opening);
              return (
                <OpeningSlot
                  key={opening.id}
                  opening={opening}
                  style={{ top: `${top}px`, height: `${height}px` }}
                  isEditMode={isOpeningEditMode}
                  onEdit={onOpeningEdit}
                  onCopy={onOpeningCopy}
                  onMouseEnter={onOpeningHover}
                  onMouseLeave={onOpeningLeave}
                />
              );
            })}

            {/* Drag selection preview */}
            {isDragging && dragSelectionStyle && (
              <div
                className="absolute left-1 right-1 bg-amber-200/60 dark:bg-amber-700/40 border-2 border-dashed border-amber-500 rounded-md pointer-events-none z-10"
                style={{
                  top: `${dragSelectionStyle.top}px`,
                  height: `${dragSelectionStyle.height}px`,
                }}
              >
                <div className="px-2 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                  {dragStart && dragEnd && (() => {
                    const start = Math.min(
                      dragStart.hour * 60 + dragStart.minutes,
                      dragEnd.hour * 60 + dragEnd.minutes
                    );
                    const end = Math.max(
                      dragStart.hour * 60 + dragStart.minutes,
                      dragEnd.hour * 60 + dragEnd.minutes
                    );
                    const startH = Math.floor(start / 60);
                    const startM = start % 60;
                    const endH = Math.floor(end / 60);
                    const endM = end % 60;
                    return `${startH.toString().padStart(2, '0')}:${startM.toString().padStart(2, '0')} - ${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                  })()}
                </div>
              </div>
            )}

            {/* Unavailable slots */}
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

            {/* Events with overlap handling */}
            {layoutedEvents.map(({ appointment, columnIndex, totalColumns }) => {
              const { top, height } = getEventPosition(appointment, startHour, slotHeight);

              return (
                <EventCard
                  key={appointment.id}
                  appointment={appointment}
                  style={{ 
                    top: `${top}px`, 
                    height: `${height}px`,
                    opacity: isOpeningEditMode ? 0.4 : 1,
                    pointerEvents: isOpeningEditMode ? 'none' : 'auto',
                  }}
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
