import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pencil, Copy, Repeat } from 'lucide-react';
import { PractitionerOpening } from '@/services/supabase/openingsService';
import { cn } from '@/lib/utils';

interface OpeningSlotProps {
  opening: PractitionerOpening;
  style?: React.CSSProperties;
  isEditMode: boolean;
  onEdit?: (opening: PractitionerOpening) => void;
  onCopy?: (opening: PractitionerOpening) => void;
  onMouseEnter?: (opening: PractitionerOpening) => void;
  onMouseLeave?: () => void;
}

const OpeningSlot: React.FC<OpeningSlotProps> = ({
  opening,
  style,
  isEditMode,
  onEdit,
  onCopy,
  onMouseEnter,
  onMouseLeave,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.(opening);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  // Non-edit mode: just show the opening area (white background)
  if (!isEditMode) {
    return null; // In non-edit mode, openings are represented by white (available) slots
  }

  // Edit mode: show the opening with controls
  return (
    <motion.div
      className={cn(
        'absolute left-1 right-1 rounded-md overflow-hidden',
        'bg-white dark:bg-slate-900',
        'border-2 border-dashed border-amber-400',
        'transition-all duration-150',
        isHovered && 'shadow-lg border-solid z-20'
      )}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {/* Opening header with time */}
      <div className="px-2 py-1 bg-amber-100/80 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-amber-800 dark:text-amber-200">
            {opening.startTime} - {opening.endTime}
          </span>
          {opening.isRecurring && (
            <Repeat className="w-3 h-3 text-amber-600" />
          )}
        </div>
        <p className="text-[10px] text-amber-700 dark:text-amber-300 truncate">
          {opening.title}
        </p>
      </div>

      {/* Action buttons (visible on hover in edit mode) */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 dark:bg-slate-900/90"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(opening);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2 text-primary hover:text-primary/80 transition-colors"
          >
            <Pencil className="w-5 h-5" />
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Modifier
            </span>
          </button>
          
          <div className="w-16 h-px bg-border" />
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCopy?.(opening);
            }}
            className="flex flex-col items-center gap-1 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Copy className="w-5 h-5" />
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              Copier
            </span>
          </button>
        </motion.div>
      )}

      {/* Tooltip on hover */}
      {isHovered && !onEdit && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-foreground text-background text-[10px] rounded whitespace-nowrap z-30">
          Modifier cette plage d'ouverture
        </div>
      )}
    </motion.div>
  );
};

export default OpeningSlot;
