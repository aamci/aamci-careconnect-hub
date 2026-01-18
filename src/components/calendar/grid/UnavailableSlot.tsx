import React from 'react';
import { cn } from '@/lib/utils';

interface UnavailableSlotProps {
  startHour: number;
  endHour: number;
  slotHeight: number;
  gridStartHour: number;
  topOffset?: number;
  className?: string;
}

const UnavailableSlot: React.FC<UnavailableSlotProps> = ({
  startHour,
  endHour,
  slotHeight,
  gridStartHour,
  topOffset = 0,
  className,
}) => {
  const top = (startHour - gridStartHour) * slotHeight + topOffset;
  const height = (endHour - startHour) * slotHeight;

  if (height <= 0) return null;

  return (
    <div
      className={cn(
        'absolute left-0 right-0 unavailable-slot opacity-40 pointer-events-none',
        className
      )}
      style={{ top: `${top}px`, height: `${height}px` }}
    />
  );
};

export default UnavailableSlot;
