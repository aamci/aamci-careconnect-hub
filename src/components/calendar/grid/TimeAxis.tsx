import React from 'react';
import { cn } from '@/lib/utils';

interface TimeAxisProps {
  startHour: number;
  endHour: number;
  slotHeight: number;
  className?: string;
}

const TimeAxis: React.FC<TimeAxisProps> = ({
  startHour,
  endHour,
  slotHeight,
  className,
}) => {
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  return (
    <div className={cn('w-[52px] flex-shrink-0 border-r border-border bg-muted/20 pt-2', className)}>
      {hours.map((hour, index) => (
        <div
          key={hour}
          className="flex items-start justify-end pr-2"
          style={{ height: `${slotHeight}px` }}
        >
          <span className={cn(
            "text-[10px] text-muted-foreground font-medium select-none",
            index > 0 && "-mt-2"
          )}>
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      ))}
    </div>
  );
};

export default TimeAxis;
