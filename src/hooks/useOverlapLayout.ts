import { useMemo } from 'react';
import { Appointment } from '@/types';
import { getHours, getMinutes } from 'date-fns';

interface LayoutedEvent {
  appointment: Appointment;
  columnIndex: number;
  totalColumns: number;
}

/**
 * Simple overlap algorithm:
 * 1. Sort events by start time
 * 2. For each event, find overlapping events
 * 3. Assign column indices to avoid visual overlap
 */
export function useOverlapLayout(appointments: Appointment[]): LayoutedEvent[] {
  return useMemo(() => {
    if (appointments.length === 0) return [];

    // Sort by start time, then by duration (longer first)
    const sorted = [...appointments].sort((a, b) => {
      const startDiff = a.startTime.getTime() - b.startTime.getTime();
      if (startDiff !== 0) return startDiff;
      return b.duration - a.duration;
    });

    const layouted: LayoutedEvent[] = [];
    const groups: Appointment[][] = [];

    // Group overlapping events
    for (const apt of sorted) {
      let placed = false;
      for (const group of groups) {
        const lastInGroup = group[group.length - 1];
        const lastEnd = lastInGroup.startTime.getTime() + lastInGroup.duration * 60000;
        
        // Check if overlaps with any event in the group
        const overlaps = group.some(existing => {
          const existingEnd = existing.startTime.getTime() + existing.duration * 60000;
          return apt.startTime.getTime() < existingEnd && 
                 (apt.startTime.getTime() + apt.duration * 60000) > existing.startTime.getTime();
        });

        if (overlaps) {
          group.push(apt);
          placed = true;
          break;
        }
      }

      if (!placed) {
        groups.push([apt]);
      }
    }

    // Assign columns within each group
    for (const group of groups) {
      const columns: Appointment[][] = [];
      
      for (const apt of group) {
        let placed = false;
        
        for (let colIdx = 0; colIdx < columns.length; colIdx++) {
          const column = columns[colIdx];
          const lastInCol = column[column.length - 1];
          const lastEnd = lastInCol.startTime.getTime() + lastInCol.duration * 60000;
          
          if (apt.startTime.getTime() >= lastEnd) {
            column.push(apt);
            placed = true;
            break;
          }
        }
        
        if (!placed) {
          columns.push([apt]);
        }
      }

      // Create layouted events with column info
      const totalColumns = columns.length;
      columns.forEach((column, colIdx) => {
        column.forEach(apt => {
          layouted.push({
            appointment: apt,
            columnIndex: colIdx,
            totalColumns,
          });
        });
      });
    }

    return layouted;
  }, [appointments]);
}

export function getEventPosition(
  appointment: Appointment,
  startHour: number,
  slotHeight: number
): { top: number; height: number } {
  const aptHour = getHours(appointment.startTime);
  const aptMinute = getMinutes(appointment.startTime);
  const minutesSinceStart = (aptHour - startHour) * 60 + aptMinute;
  
  const top = (minutesSinceStart / 60) * slotHeight;
  const height = (appointment.duration / 60) * slotHeight;

  return {
    top,
    height: Math.max(height - 2, 20), // Minimum height of 20px
  };
}
