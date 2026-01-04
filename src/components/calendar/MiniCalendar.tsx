import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Appointment } from '@/types';

interface MiniCalendarProps {
  currentDate: Date;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  appointments?: Appointment[];
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  currentDate,
  selectedDate,
  onSelectDate,
  appointments = [],
}) => {
  const [viewDate, setViewDate] = React.useState(currentDate);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

  const hasAppointments = (date: Date) => {
    return appointments.some(apt => 
      format(apt.startTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  const getAppointmentCount = (date: Date) => {
    return appointments.filter(apt => 
      format(apt.startTime, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
  };

  return (
    <div className="panel-card p-3">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        
        <span className="text-sm font-semibold capitalize">
          {format(viewDate, 'MMMM yyyy', { locale: fr })}
        </span>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="text-center text-[10px] font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isTodayDate = isToday(day);
          const isCurrentMonth = isSameMonth(day, viewDate);
          const hasApts = hasAppointments(day);
          const aptCount = getAppointmentCount(day);

          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(day)}
              className={cn(
                'mini-calendar-day relative',
                isSelected && 'mini-calendar-day-selected',
                isTodayDate && !isSelected && 'ring-2 ring-accent/50 ring-offset-1',
                !isCurrentMonth && 'text-muted-foreground/40',
                isCurrentMonth && !isSelected && 'mini-calendar-day-hover text-foreground',
              )}
            >
              <span className={cn(
                'text-xs',
                isSelected && 'font-semibold'
              )}>
                {format(day, 'd')}
              </span>
              
              {/* Appointment indicator */}
              {hasApts && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
