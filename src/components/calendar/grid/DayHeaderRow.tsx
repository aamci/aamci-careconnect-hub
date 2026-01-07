import React from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DayHeaderRowProps {
  days: Date[];
  appointmentCounts?: Record<string, { current: number; total: number }>;
  onDayClick?: (date: Date) => void;
  onDayMenu?: (date: Date, event: React.MouseEvent) => void;
  showTimeAxisSpacer?: boolean;
  className?: string;
}

const DayHeaderRow: React.FC<DayHeaderRowProps> = ({
  days,
  appointmentCounts = {},
  onDayClick,
  onDayMenu,
  showTimeAxisSpacer = true,
  className,
}) => {
  return (
    <div className={cn('flex border-b border-border bg-muted/30 sticky top-0 z-20', className)}>
      {/* Time axis spacer */}
      {showTimeAxisSpacer && (
        <div className="w-[52px] flex-shrink-0 border-r border-border" />
      )}

      {/* Day columns */}
      {days.map((day, index) => {
        const dateKey = format(day, 'yyyy-MM-dd');
        const counts = appointmentCounts[dateKey] || { current: 0, total: 20 };
        const isTodayDate = isToday(day);

        return (
          <div
            key={index}
            className={cn(
              'flex-1 min-w-[100px] h-[44px] flex items-center justify-between px-2 border-r border-border last:border-r-0 cursor-pointer hover:bg-muted/50 transition-colors',
              isTodayDate && 'bg-accent/5'
            )}
            onClick={() => onDayClick?.(day)}
          >
            <div className="flex flex-col min-w-0">
              <div className="flex items-baseline gap-1">
                <span className={cn(
                  'text-xs font-medium capitalize',
                  isTodayDate ? 'text-accent' : 'text-foreground'
                )}>
                  {format(day, 'EEE', { locale: fr })}.
                </span>
                <span className={cn(
                  'text-sm font-semibold',
                  isTodayDate ? 'text-accent' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                {counts.current} / {counts.total}
              </span>
            </div>

            {onDayMenu && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDayMenu(day, e);
                }}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DayHeaderRow;
