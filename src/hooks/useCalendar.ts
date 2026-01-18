import { useState, useCallback } from 'react';
import { 
  addDays, 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  format
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarDay } from '@/types';

export type CalendarView = 'day' | 'week' | 'month' | 'list';

export interface UseCalendarOptions {
  initialDate?: Date;
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday
}

export function useCalendar(options: UseCalendarOptions | Date = new Date()) {
  // Handle both old signature (Date) and new signature (options object)
  const initialDate = options instanceof Date ? options : (options.initialDate ?? new Date());
  const weekStartsOn = options instanceof Date ? 1 : (options.weekStartsOn ?? 1);

  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [view, setView] = useState<CalendarView>('week');

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate(prev => {
      switch (view) {
        case 'day':
          return addDays(prev, -1);
        case 'week':
          return subWeeks(prev, 1);
        case 'month':
          return addDays(startOfMonth(prev), -1);
        default:
          return subWeeks(prev, 1);
      }
    });
  }, [view]);

  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      switch (view) {
        case 'day':
          return addDays(prev, 1);
        case 'week':
          return addWeeks(prev, 1);
        case 'month':
          return addDays(endOfMonth(prev), 1);
        default:
          return addWeeks(prev, 1);
      }
    });
  }, [view]);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentDate(date);
  }, []);

  const getWeekDays = useCallback((): Date[] => {
    const start = startOfWeek(currentDate, { weekStartsOn });
    const end = endOfWeek(currentDate, { weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [currentDate, weekStartsOn]);

  const getMonthDays = useCallback((): CalendarDay[] => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return days.map(date => ({
      date,
      isToday: isToday(date),
      isSelected: isSameDay(date, selectedDate),
      isCurrentMonth: isSameMonth(date, currentDate),
      hasAppointments: false, // Will be updated with actual data
    }));
  }, [currentDate, selectedDate, weekStartsOn]);

  const getDateRangeLabel = useCallback((): string => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
      case 'week': {
        const start = startOfWeek(currentDate, { weekStartsOn });
        const end = endOfWeek(currentDate, { weekStartsOn });
        return `${format(start, 'd', { locale: fr })} - ${format(end, 'd MMMM yyyy', { locale: fr })}`;
      }
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: fr });
      default:
        return format(currentDate, 'MMMM yyyy', { locale: fr });
    }
  }, [currentDate, view, weekStartsOn]);

  return {
    currentDate,
    selectedDate,
    view,
    setView,
    goToToday,
    goToPrevious,
    goToNext,
    selectDate,
    getWeekDays,
    getMonthDays,
    getDateRangeLabel,
  };
}
