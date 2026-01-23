import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Appointment } from '@/types';

interface EventCardProps {
  appointment: Appointment;
  style: React.CSSProperties;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  compact?: boolean;
  showMotif?: boolean;
  columnIndex?: number;
  totalColumns?: number;
}

const getAppointmentColorClass = (type: Appointment['type']) => {
  switch (type) {
    case 'consultation': return 'bg-amber-50 border-l-amber-500 text-amber-900';
    case 'followup': return 'bg-sky-50 border-l-sky-500 text-sky-900';
    case 'emergency': return 'bg-red-50 border-l-red-500 text-red-900';
    case 'procedure': return 'bg-purple-50 border-l-purple-500 text-purple-900';
    case 'checkup': return 'bg-emerald-50 border-l-emerald-500 text-emerald-900';
    default: return 'bg-amber-50 border-l-amber-500 text-amber-900';
  }
};

const EventCard: React.FC<EventCardProps> = ({
  appointment,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
  compact = false,
  showMotif = true,
  columnIndex = 0,
  totalColumns = 1,
}) => {
  const colorClass = getAppointmentColorClass(appointment.type);
  const height = parseInt(String(style.height) || '0', 10);
  const isVeryShort = height < 28;

  // Calculate horizontal positioning for overlapping events
  const widthPercent = totalColumns > 1 ? 100 / totalColumns : 100;
  const leftPercent = columnIndex * widthPercent;

  // Use simpler positioning for narrow screens to avoid calc() issues
  const eventStyle: React.CSSProperties = {
    ...style,
  };

  if (totalColumns > 1) {
    // For overlapping events, use percentage-based positioning
    eventStyle.left = `${leftPercent}%`;
    eventStyle.width = `${widthPercent}%`;
    // Use padding to create visual separation instead of complex calc()
    eventStyle.paddingLeft = columnIndex > 0 ? '1px' : undefined;
    eventStyle.paddingRight = columnIndex < totalColumns - 1 ? '1px' : undefined;
  } else {
    // Single column: simple fixed margins
    eventStyle.left = '2px';
    eventStyle.right = '2px';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, zIndex: 30 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'absolute z-20 cursor-pointer overflow-hidden border-l-3 rounded-r-md transition-shadow hover:shadow-md',
        colorClass,
        appointment.status === 'completed' && 'opacity-60',
        appointment.status === 'cancelled' && 'opacity-40 line-through',
        compact ? 'px-1.5 py-0.5' : 'px-2 py-1'
      )}
      style={eventStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      tabIndex={0}
      role="button"
      aria-label={`${appointment.patient.lastName} ${appointment.patient.firstName} - ${format(appointment.startTime, 'HH:mm')} - ${appointment.motif.shortName}`}
    >
      <div className={cn('flex items-start gap-1', isVeryShort && 'items-center')}>
        <span className={cn('font-semibold shrink-0', compact ? 'text-[9px]' : 'text-[10px]')}>
          {format(appointment.startTime, 'HH:mm')}
        </span>
        <span className={cn('truncate font-medium', compact ? 'text-[9px]' : 'text-[10px]')}>
          {appointment.patient.lastName.toUpperCase()}
        </span>
      </div>
      {!isVeryShort && showMotif && appointment.duration >= 20 && (
        <div className={cn('truncate opacity-80', compact ? 'text-[8px]' : 'text-[9px]')}>
          {appointment.motif.shortName}
        </div>
      )}
    </motion.div>
  );
};

export default EventCard;
