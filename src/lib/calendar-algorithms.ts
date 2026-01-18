/**
 * Calendar Positioning & Clipping Algorithms
 *
 * Core algorithms for:
 * - Event positioning (Y coordinate, height)
 * - Time range clipping
 * - Collision detection & column layout
 * - Out-of-range indicator calculation
 */

import { format, parseISO, differenceInMinutes, startOfDay, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ZOOM_CONFIG, ZoomLevel } from '@/types/calendar-preferences';

// ============================================================
// TYPES
// ============================================================

export interface CalendarEvent {
  id: string;
  startTime: Date;
  endTime: Date;
  title: string;
  // ... other fields
}

export interface PositionedEvent extends CalendarEvent {
  // Visual positioning
  top: number;           // px from grid top
  height: number;        // px height
  left: number;          // % from left (0-100)
  width: number;         // % width (0-100)

  // Clipping info
  isClippedTop: boolean;
  isClippedBottom: boolean;
  isOutOfRange: boolean;

  // Collision info
  column: number;        // 0-indexed column
  totalColumns: number;  // total columns in this time block
}

export interface GridConfig {
  startMinute: number;   // e.g., 420 (07:00)
  endMinute: number;     // e.g., 1140 (19:00)
  zoomLevel: ZoomLevel;
  slotMinutes: number;   // e.g., 30
  dayDate: Date;         // The day being rendered
}

export interface OutOfRangeIndicator {
  position: 'top' | 'bottom';
  count: number;
  events: CalendarEvent[];
}

// ============================================================
// CORE ALGORITHMS
// ============================================================

/**
 * Convert a datetime to minutes since midnight (in local timezone)
 */
export function dateToMinuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

/**
 * Get pixels per minute based on zoom level
 */
export function getPixelsPerMinute(zoomLevel: ZoomLevel, slotMinutes: number = 30): number {
  const { slotHeight } = ZOOM_CONFIG[zoomLevel];
  return slotHeight / slotMinutes;
}

/**
 * Calculate the total grid height in pixels
 */
export function calculateGridHeight(config: GridConfig): number {
  const { startMinute, endMinute, zoomLevel, slotMinutes } = config;
  const totalMinutes = endMinute - startMinute;
  const ppm = getPixelsPerMinute(zoomLevel, slotMinutes);
  return totalMinutes * ppm;
}

/**
 * Convert minute-of-day to Y position (pixels from grid top)
 *
 * Formula: y = (minuteOfDay - startRange) * pixelsPerMinute
 */
export function minuteToY(
  minuteOfDay: number,
  config: GridConfig
): number {
  const { startMinute, zoomLevel, slotMinutes } = config;
  const ppm = getPixelsPerMinute(zoomLevel, slotMinutes);
  return (minuteOfDay - startMinute) * ppm;
}

/**
 * Convert Y position to minute-of-day (for click handling)
 */
export function yToMinute(
  y: number,
  config: GridConfig
): number {
  const { startMinute, zoomLevel, slotMinutes } = config;
  const ppm = getPixelsPerMinute(zoomLevel, slotMinutes);
  return Math.round(startMinute + (y / ppm));
}

/**
 * Clip an event to the visible time range
 *
 * Returns: { startClip, endClip, isClippedTop, isClippedBottom, isOutOfRange }
 */
export function clipEventToRange(
  eventStartMinute: number,
  eventEndMinute: number,
  rangeStart: number,
  rangeEnd: number
): {
  startClip: number;
  endClip: number;
  isClippedTop: boolean;
  isClippedBottom: boolean;
  isOutOfRange: boolean;
} {
  // Completely out of range
  if (eventEndMinute <= rangeStart || eventStartMinute >= rangeEnd) {
    return {
      startClip: rangeStart,
      endClip: rangeStart,
      isClippedTop: false,
      isClippedBottom: false,
      isOutOfRange: true,
    };
  }

  const startClip = Math.max(eventStartMinute, rangeStart);
  const endClip = Math.min(eventEndMinute, rangeEnd);

  return {
    startClip,
    endClip,
    isClippedTop: eventStartMinute < rangeStart,
    isClippedBottom: eventEndMinute > rangeEnd,
    isOutOfRange: false,
  };
}

/**
 * Position a single event within the grid
 */
export function positionEvent(
  event: CalendarEvent,
  config: GridConfig
): PositionedEvent {
  const eventStartMinute = dateToMinuteOfDay(event.startTime);
  const eventEndMinute = dateToMinuteOfDay(event.endTime);

  const clipping = clipEventToRange(
    eventStartMinute,
    eventEndMinute,
    config.startMinute,
    config.endMinute
  );

  if (clipping.isOutOfRange) {
    return {
      ...event,
      top: 0,
      height: 0,
      left: 0,
      width: 100,
      isClippedTop: false,
      isClippedBottom: false,
      isOutOfRange: true,
      column: 0,
      totalColumns: 1,
    };
  }

  const ppm = getPixelsPerMinute(config.zoomLevel, config.slotMinutes);

  const top = (clipping.startClip - config.startMinute) * ppm;
  const height = (clipping.endClip - clipping.startClip) * ppm;

  return {
    ...event,
    top,
    height: Math.max(height, ZOOM_CONFIG[config.zoomLevel].slotHeight / 2), // Min height
    left: 0,
    width: 100,
    isClippedTop: clipping.isClippedTop,
    isClippedBottom: clipping.isClippedBottom,
    isOutOfRange: false,
    column: 0,
    totalColumns: 1,
  };
}

// ============================================================
// COLLISION DETECTION & COLUMN LAYOUT
// ============================================================

interface EventInterval {
  id: string;
  start: number;
  end: number;
  event: CalendarEvent;
}

/**
 * Detect collisions and assign columns using sweep line algorithm
 *
 * Algorithm:
 * 1. Create events for start and end of each interval
 * 2. Sort by time, with starts before ends
 * 3. Sweep through, tracking active intervals
 * 4. Assign columns greedily
 */
export function assignEventColumns(
  events: CalendarEvent[],
  config: GridConfig
): Map<string, { column: number; totalColumns: number }> {
  const result = new Map<string, { column: number; totalColumns: number }>();

  if (events.length === 0) return result;

  // Convert to intervals (in minutes)
  const intervals: EventInterval[] = events.map((event) => ({
    id: event.id,
    start: dateToMinuteOfDay(event.startTime),
    end: dateToMinuteOfDay(event.endTime),
    event,
  }));

  // Sort by start time, then by duration (longer first), then by id (deterministic)
  intervals.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    const durA = a.end - a.start;
    const durB = b.end - b.start;
    if (durA !== durB) return durB - durA; // Longer first
    return a.id.localeCompare(b.id);
  });

  // Group overlapping events into clusters
  const clusters: EventInterval[][] = [];
  let currentCluster: EventInterval[] = [];
  let clusterEnd = 0;

  for (const interval of intervals) {
    if (currentCluster.length === 0 || interval.start < clusterEnd) {
      // Add to current cluster
      currentCluster.push(interval);
      clusterEnd = Math.max(clusterEnd, interval.end);
    } else {
      // Start new cluster
      if (currentCluster.length > 0) {
        clusters.push(currentCluster);
      }
      currentCluster = [interval];
      clusterEnd = interval.end;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // Process each cluster
  for (const cluster of clusters) {
    const columns: EventInterval[][] = [];

    for (const interval of cluster) {
      // Find first column where this event fits
      let placed = false;
      for (let col = 0; col < columns.length; col++) {
        const lastInColumn = columns[col][columns[col].length - 1];
        if (lastInColumn.end <= interval.start) {
          columns[col].push(interval);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([interval]);
      }
    }

    // Assign column numbers
    const totalColumns = columns.length;
    for (let col = 0; col < columns.length; col++) {
      for (const interval of columns[col]) {
        result.set(interval.id, { column: col, totalColumns });
      }
    }
  }

  return result;
}

/**
 * Position all events with collision handling
 */
export function positionAllEvents(
  events: CalendarEvent[],
  config: GridConfig
): PositionedEvent[] {
  // Filter to events on the target day
  const dayStart = startOfDay(config.dayDate);
  const dayEnd = addMinutes(dayStart, 24 * 60);

  const dayEvents = events.filter((e) => {
    return e.startTime >= dayStart && e.startTime < dayEnd;
  });

  // Get column assignments
  const columnMap = assignEventColumns(dayEvents, config);

  // Position each event
  return dayEvents.map((event) => {
    const positioned = positionEvent(event, config);

    const columnInfo = columnMap.get(event.id) || { column: 0, totalColumns: 1 };

    // Calculate width and left based on columns
    const width = 100 / columnInfo.totalColumns;
    const left = columnInfo.column * width;

    return {
      ...positioned,
      left,
      width: width - 1, // 1% gap between columns
      column: columnInfo.column,
      totalColumns: columnInfo.totalColumns,
    };
  });
}

// ============================================================
// OUT-OF-RANGE INDICATORS
// ============================================================

/**
 * Calculate out-of-range indicators
 *
 * Returns events that fall completely outside the visible range
 */
export function calculateOutOfRangeIndicators(
  events: CalendarEvent[],
  config: GridConfig
): { top: OutOfRangeIndicator | null; bottom: OutOfRangeIndicator | null } {
  const topEvents: CalendarEvent[] = [];
  const bottomEvents: CalendarEvent[] = [];

  // Filter to events on the target day
  const dayStart = startOfDay(config.dayDate);
  const dayEnd = addMinutes(dayStart, 24 * 60);

  for (const event of events) {
    // Check if event is on this day
    if (event.startTime < dayStart || event.startTime >= dayEnd) {
      continue;
    }

    const startMinute = dateToMinuteOfDay(event.startTime);
    const endMinute = dateToMinuteOfDay(event.endTime);

    // Completely before visible range
    if (endMinute <= config.startMinute) {
      topEvents.push(event);
    }
    // Completely after visible range
    else if (startMinute >= config.endMinute) {
      bottomEvents.push(event);
    }
  }

  return {
    top: topEvents.length > 0
      ? { position: 'top', count: topEvents.length, events: topEvents }
      : null,
    bottom: bottomEvents.length > 0
      ? { position: 'bottom', count: bottomEvents.length, events: bottomEvents }
      : null,
  };
}

// ============================================================
// TIME SLOT GENERATION
// ============================================================

export interface TimeSlot {
  minute: number;
  label: string;
  isHour: boolean;
  y: number;
  height: number;
}

/**
 * Generate time slots for the grid
 */
export function generateTimeSlots(config: GridConfig): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const ppm = getPixelsPerMinute(config.zoomLevel, config.slotMinutes);
  const { slotHeight } = ZOOM_CONFIG[config.zoomLevel];

  for (let minute = config.startMinute; minute < config.endMinute; minute += config.slotMinutes) {
    const isHour = minute % 60 === 0;
    const hours = Math.floor(minute / 60);
    const mins = minute % 60;

    slots.push({
      minute,
      label: isHour ? `${hours.toString().padStart(2, '0')}:00` : `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`,
      isHour,
      y: (minute - config.startMinute) * ppm,
      height: slotHeight,
    });
  }

  return slots;
}

// ============================================================
// MULTI-DAY / ALL-DAY EVENTS
// ============================================================

export interface AllDayEvent extends CalendarEvent {
  spansDays: number;
  startDayOffset: number; // Days from view start
}

/**
 * Identify all-day or multi-day events
 * These are rendered in a separate banner, not in the time grid
 */
export function identifyAllDayEvents(
  events: CalendarEvent[],
  viewStartDate: Date,
  viewEndDate: Date
): AllDayEvent[] {
  const allDayEvents: AllDayEvent[] = [];

  for (const event of events) {
    const durationMinutes = differenceInMinutes(event.endTime, event.startTime);

    // Consider all-day if >= 23 hours or if it spans midnight
    const startsAtMidnight = event.startTime.getHours() === 0 && event.startTime.getMinutes() === 0;
    const endsAtMidnight = event.endTime.getHours() === 0 && event.endTime.getMinutes() === 0;
    const spansMultipleDays = startOfDay(event.startTime).getTime() !== startOfDay(event.endTime).getTime();

    if (durationMinutes >= 23 * 60 || (startsAtMidnight && endsAtMidnight) || spansMultipleDays) {
      const startDayOffset = Math.floor(
        differenceInMinutes(event.startTime, viewStartDate) / (24 * 60)
      );
      const spansDays = Math.ceil(durationMinutes / (24 * 60));

      allDayEvents.push({
        ...event,
        spansDays: Math.max(1, spansDays),
        startDayOffset: Math.max(0, startDayOffset),
      });
    }
  }

  return allDayEvents;
}

// ============================================================
// EXPORTS
// ============================================================

export const calendarAlgorithms = {
  dateToMinuteOfDay,
  getPixelsPerMinute,
  calculateGridHeight,
  minuteToY,
  yToMinute,
  clipEventToRange,
  positionEvent,
  assignEventColumns,
  positionAllEvents,
  calculateOutOfRangeIndicators,
  generateTimeSlots,
  identifyAllDayEvents,
};

export default calendarAlgorithms;
