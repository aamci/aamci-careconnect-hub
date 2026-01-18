/**
 * Unit Tests for Calendar Positioning Algorithms
 *
 * Test categories:
 * 1. Time conversions
 * 2. Clipping logic
 * 3. Collision detection
 * 4. Out-of-range indicators
 * 5. Edge cases (DST, midnight, etc.)
 */

import { describe, it, expect } from 'vitest';
import {
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
  CalendarEvent,
  GridConfig,
} from '../calendar-algorithms';

// ============================================================
// 1. TIME CONVERSIONS
// ============================================================

describe('dateToMinuteOfDay', () => {
  it('converts midnight to 0', () => {
    const date = new Date('2026-01-18T00:00:00');
    expect(dateToMinuteOfDay(date)).toBe(0);
  });

  it('converts 07:00 to 420', () => {
    const date = new Date('2026-01-18T07:00:00');
    expect(dateToMinuteOfDay(date)).toBe(420);
  });

  it('converts 19:00 to 1140', () => {
    const date = new Date('2026-01-18T19:00:00');
    expect(dateToMinuteOfDay(date)).toBe(1140);
  });

  it('converts 23:59 to 1439', () => {
    const date = new Date('2026-01-18T23:59:00');
    expect(dateToMinuteOfDay(date)).toBe(1439);
  });

  it('handles mid-hour times correctly', () => {
    const date = new Date('2026-01-18T14:30:00');
    expect(dateToMinuteOfDay(date)).toBe(870); // 14*60 + 30
  });
});

describe('getPixelsPerMinute', () => {
  it('calculates correctly for MINIMUM zoom', () => {
    const ppm = getPixelsPerMinute('MINIMUM', 30);
    expect(ppm).toBe(24 / 30); // 0.8
  });

  it('calculates correctly for STANDARD zoom', () => {
    const ppm = getPixelsPerMinute('STANDARD', 30);
    expect(ppm).toBe(36 / 30); // 1.2
  });

  it('calculates correctly for MAXIMUM zoom', () => {
    const ppm = getPixelsPerMinute('MAXIMUM', 30);
    expect(ppm).toBe(60 / 30); // 2.0
  });

  it('handles different slot durations', () => {
    const ppm = getPixelsPerMinute('STANDARD', 15);
    expect(ppm).toBe(36 / 15); // 2.4
  });
});

describe('minuteToY / yToMinute', () => {
  const config: GridConfig = {
    startMinute: 420,  // 07:00
    endMinute: 1140,   // 19:00
    zoomLevel: 'STANDARD',
    slotMinutes: 30,
    dayDate: new Date('2026-01-18'),
  };

  it('converts start of range to Y=0', () => {
    expect(minuteToY(420, config)).toBe(0);
  });

  it('converts minute to correct Y position', () => {
    // 08:00 = 480 minutes, offset = 60 minutes from 07:00
    // PPM = 36/30 = 1.2
    // Y = 60 * 1.2 = 72
    expect(minuteToY(480, config)).toBe(72);
  });

  it('yToMinute is inverse of minuteToY', () => {
    const minute = 600; // 10:00
    const y = minuteToY(minute, config);
    expect(yToMinute(y, config)).toBe(minute);
  });
});

// ============================================================
// 2. CLIPPING LOGIC
// ============================================================

describe('clipEventToRange', () => {
  const rangeStart = 420;  // 07:00
  const rangeEnd = 1140;   // 19:00

  it('event fully inside range - no clipping', () => {
    const result = clipEventToRange(480, 540, rangeStart, rangeEnd);
    expect(result).toEqual({
      startClip: 480,
      endClip: 540,
      isClippedTop: false,
      isClippedBottom: false,
      isOutOfRange: false,
    });
  });

  it('event starting before range - clipped top', () => {
    const result = clipEventToRange(360, 540, rangeStart, rangeEnd);
    expect(result).toEqual({
      startClip: 420,
      endClip: 540,
      isClippedTop: true,
      isClippedBottom: false,
      isOutOfRange: false,
    });
  });

  it('event ending after range - clipped bottom', () => {
    const result = clipEventToRange(1080, 1200, rangeStart, rangeEnd);
    expect(result).toEqual({
      startClip: 1080,
      endClip: 1140,
      isClippedTop: false,
      isClippedBottom: true,
      isOutOfRange: false,
    });
  });

  it('event spanning entire range - clipped both', () => {
    const result = clipEventToRange(360, 1200, rangeStart, rangeEnd);
    expect(result).toEqual({
      startClip: 420,
      endClip: 1140,
      isClippedTop: true,
      isClippedBottom: true,
      isOutOfRange: false,
    });
  });

  it('event completely before range - out of range', () => {
    const result = clipEventToRange(300, 360, rangeStart, rangeEnd);
    expect(result.isOutOfRange).toBe(true);
  });

  it('event completely after range - out of range', () => {
    const result = clipEventToRange(1200, 1260, rangeStart, rangeEnd);
    expect(result.isOutOfRange).toBe(true);
  });

  it('event ending exactly at range start - out of range', () => {
    const result = clipEventToRange(360, 420, rangeStart, rangeEnd);
    expect(result.isOutOfRange).toBe(true);
  });

  it('event starting exactly at range end - out of range', () => {
    const result = clipEventToRange(1140, 1200, rangeStart, rangeEnd);
    expect(result.isOutOfRange).toBe(true);
  });
});

// ============================================================
// 3. COLLISION DETECTION
// ============================================================

describe('assignEventColumns', () => {
  const config: GridConfig = {
    startMinute: 420,
    endMinute: 1140,
    zoomLevel: 'STANDARD',
    slotMinutes: 30,
    dayDate: new Date('2026-01-18'),
  };

  const createEvent = (id: string, startHour: number, endHour: number): CalendarEvent => ({
    id,
    startTime: new Date(`2026-01-18T${startHour.toString().padStart(2, '0')}:00:00`),
    endTime: new Date(`2026-01-18T${endHour.toString().padStart(2, '0')}:00:00`),
    title: `Event ${id}`,
  });

  it('non-overlapping events get same column', () => {
    const events = [
      createEvent('1', 9, 10),
      createEvent('2', 11, 12),
    ];

    const result = assignEventColumns(events, config);

    expect(result.get('1')?.column).toBe(0);
    expect(result.get('2')?.column).toBe(0);
    expect(result.get('1')?.totalColumns).toBe(1);
    expect(result.get('2')?.totalColumns).toBe(1);
  });

  it('overlapping events get different columns', () => {
    const events = [
      createEvent('1', 9, 11),
      createEvent('2', 10, 12),
    ];

    const result = assignEventColumns(events, config);

    expect(result.get('1')?.column).not.toBe(result.get('2')?.column);
    expect(result.get('1')?.totalColumns).toBe(2);
    expect(result.get('2')?.totalColumns).toBe(2);
  });

  it('three overlapping events get three columns', () => {
    const events = [
      createEvent('1', 9, 12),
      createEvent('2', 10, 13),
      createEvent('3', 11, 14),
    ];

    const result = assignEventColumns(events, config);

    const columns = new Set([
      result.get('1')?.column,
      result.get('2')?.column,
      result.get('3')?.column,
    ]);

    expect(columns.size).toBe(3);
    expect(result.get('1')?.totalColumns).toBe(3);
  });

  it('deterministic ordering by start, duration, id', () => {
    const events = [
      createEvent('b', 9, 11),
      createEvent('a', 9, 11),
    ];

    const result1 = assignEventColumns(events, config);
    const result2 = assignEventColumns([...events].reverse(), config);

    // Should be deterministic regardless of input order
    expect(result1.get('a')?.column).toBe(result2.get('a')?.column);
    expect(result1.get('b')?.column).toBe(result2.get('b')?.column);
  });
});

// ============================================================
// 4. OUT-OF-RANGE INDICATORS
// ============================================================

describe('calculateOutOfRangeIndicators', () => {
  const config: GridConfig = {
    startMinute: 480,  // 08:00
    endMinute: 1080,   // 18:00
    zoomLevel: 'STANDARD',
    slotMinutes: 30,
    dayDate: new Date('2026-01-18'),
  };

  const createEvent = (id: string, startHour: number, endHour: number): CalendarEvent => ({
    id,
    startTime: new Date(`2026-01-18T${startHour.toString().padStart(2, '0')}:00:00`),
    endTime: new Date(`2026-01-18T${endHour.toString().padStart(2, '0')}:00:00`),
    title: `Event ${id}`,
  });

  it('no out-of-range events returns null indicators', () => {
    const events = [createEvent('1', 9, 10)];
    const result = calculateOutOfRangeIndicators(events, config);

    expect(result.top).toBeNull();
    expect(result.bottom).toBeNull();
  });

  it('event before range appears in top indicator', () => {
    const events = [createEvent('1', 6, 7)];
    const result = calculateOutOfRangeIndicators(events, config);

    expect(result.top?.count).toBe(1);
    expect(result.top?.events[0].id).toBe('1');
    expect(result.bottom).toBeNull();
  });

  it('event after range appears in bottom indicator', () => {
    const events = [createEvent('1', 19, 20)];
    const result = calculateOutOfRangeIndicators(events, config);

    expect(result.top).toBeNull();
    expect(result.bottom?.count).toBe(1);
    expect(result.bottom?.events[0].id).toBe('1');
  });

  it('multiple out-of-range events counted correctly', () => {
    const events = [
      createEvent('1', 5, 6),
      createEvent('2', 6, 7),
      createEvent('3', 19, 20),
    ];
    const result = calculateOutOfRangeIndicators(events, config);

    expect(result.top?.count).toBe(2);
    expect(result.bottom?.count).toBe(1);
  });
});

// ============================================================
// 5. EDGE CASES
// ============================================================

describe('Edge cases', () => {
  describe('Zero-duration events', () => {
    it('handles event with same start and end', () => {
      const config: GridConfig = {
        startMinute: 420,
        endMinute: 1140,
        zoomLevel: 'STANDARD',
        slotMinutes: 30,
        dayDate: new Date('2026-01-18'),
      };

      const event: CalendarEvent = {
        id: '1',
        startTime: new Date('2026-01-18T09:00:00'),
        endTime: new Date('2026-01-18T09:00:00'),
        title: 'Zero duration',
      };

      const positioned = positionEvent(event, config);
      expect(positioned.height).toBeGreaterThan(0); // Should have minimum height
    });
  });

  describe('Grid generation', () => {
    it('generates correct number of slots', () => {
      const config: GridConfig = {
        startMinute: 420,  // 07:00
        endMinute: 1140,   // 19:00 (12 hours = 24 slots at 30min)
        zoomLevel: 'STANDARD',
        slotMinutes: 30,
        dayDate: new Date('2026-01-18'),
      };

      const slots = generateTimeSlots(config);
      expect(slots.length).toBe(24);
    });

    it('marks hour slots correctly', () => {
      const config: GridConfig = {
        startMinute: 420,
        endMinute: 540,
        zoomLevel: 'STANDARD',
        slotMinutes: 30,
        dayDate: new Date('2026-01-18'),
      };

      const slots = generateTimeSlots(config);

      // 07:00 should be hour, 07:30 should not
      expect(slots[0].isHour).toBe(true);
      expect(slots[1].isHour).toBe(false);
      expect(slots[2].isHour).toBe(true); // 08:00
    });
  });

  describe('Grid height calculation', () => {
    it('calculates correctly for different zoom levels', () => {
      const baseConfig = {
        startMinute: 420,
        endMinute: 1140, // 720 minutes total
        slotMinutes: 30,
        dayDate: new Date('2026-01-18'),
      };

      const minHeight = calculateGridHeight({ ...baseConfig, zoomLevel: 'MINIMUM' });
      const stdHeight = calculateGridHeight({ ...baseConfig, zoomLevel: 'STANDARD' });
      const maxHeight = calculateGridHeight({ ...baseConfig, zoomLevel: 'MAXIMUM' });

      // MINIMUM: 720 * (24/30) = 576
      // STANDARD: 720 * (36/30) = 864
      // MAXIMUM: 720 * (60/30) = 1440
      expect(minHeight).toBe(576);
      expect(stdHeight).toBe(864);
      expect(maxHeight).toBe(1440);
    });
  });
});
