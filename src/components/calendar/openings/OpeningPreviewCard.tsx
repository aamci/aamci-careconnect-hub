import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, Repeat, User } from 'lucide-react';
import { PractitionerOpening } from '@/services/supabase/openingsService';
import { cn } from '@/lib/utils';

interface OpeningPreviewCardProps {
  opening: PractitionerOpening | null;
  isVisible: boolean;
  onClick?: () => void;
}

const OpeningPreviewCard: React.FC<OpeningPreviewCardProps> = ({
  opening,
  isVisible,
  onClick,
}) => {
  if (!opening) return null;

  // Generate recurrence label
  const getRecurrenceLabel = () => {
    if (!opening.isRecurring) return 'Ouverture exceptionnelle';
    
    const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const recDays = opening.recurrenceDays || [];
    
    if (recDays.length === 5 && !recDays.includes(0) && !recDays.includes(6)) {
      return 'Tous les jours de la semaine (lun-ven)';
    }
    
    if (recDays.length === 1) {
      return `Tous les ${days[recDays[0]]}s`;
    }
    
    return `Ouverture récurrente`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          {/* Main Card */}
          <div
            className="panel-card overflow-hidden cursor-pointer group relative border-l-4 border-l-amber-400"
            onClick={onClick}
            role="article"
            aria-label={`Aperçu: ${opening.title}`}
            tabIndex={0}
          >
            <div className="p-3 space-y-2.5 bg-amber-50/50 dark:bg-amber-950/20">
              {/* Title */}
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-foreground leading-tight">
                  {opening.title}
                </h4>
                {opening.isRecurring && (
                  <Repeat className="w-4 h-4 text-amber-600 flex-shrink-0" />
                )}
              </div>

              {/* Recurrence info */}
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                {getRecurrenceLabel()}
              </p>

              {/* Date & Time */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground capitalize">
                    {format(opening.openingDate, 'EEE d MMM', { locale: fr })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <p className="text-xs font-medium text-primary">
                    {opening.startTime} → {opening.endTime}
                  </p>
                </div>
              </div>

              {/* Motifs de consultation */}
              {opening.motifs && opening.motifs.length > 0 && (
                <div className="pt-2 border-t border-border">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                    Motifs de consultation
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {opening.motifs.map((motif) => (
                      <span
                        key={motif.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-background border border-border"
                      >
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: motif.color }}
                        />
                        {motif.shortName || motif.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Practitioner Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted/80 text-xs text-foreground font-medium">
            <User className="w-4 h-4 text-muted-foreground" />
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: opening.practitioner.color }}
            />
            <span>
              {opening.practitioner.firstName} {opening.practitioner.lastName}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OpeningPreviewCard;
