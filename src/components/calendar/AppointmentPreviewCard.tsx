import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Appointment } from '@/types';
import { Phone, Calendar, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppointmentPreviewCardProps {
  appointment: Appointment | null;
  isVisible: boolean;
  type?: 'appointment' | 'opening' | 'absence' | null;
  onClick?: () => void;
}

const AppointmentPreviewCard: React.FC<AppointmentPreviewCardProps> = ({
  appointment,
  isVisible,
  type = 'appointment',
  onClick,
}) => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  if (!appointment) return null;

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isOpening = type === 'opening';
  const isAbsence = type === 'absence';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
          className="panel-card overflow-hidden cursor-pointer group"
          onClick={onClick}
          role="article"
          aria-label={`Aperçu: ${appointment.motif.name}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.();
            }
          }}
        >
          {/* Accent border on left */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
            style={{ backgroundColor: appointment.motif.color }}
          />
          
          <div className="p-3 pl-4 space-y-2.5">
            {/* Title / Motif */}
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground leading-tight">
                {isOpening ? 'Ouverture récurrente' : isAbsence ? 'Absence' : appointment.motif.name}
              </h4>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>

            {/* Date & Time */}
            <div className="space-y-0.5">
              <p className="text-xs text-muted-foreground capitalize">
                {format(appointment.startTime, 'EEE d MMMM', { locale: fr })}
              </p>
              <p className="text-xs font-medium text-primary">
                {format(appointment.startTime, 'HH:mm')} → {format(appointment.endTime, 'HH:mm')}
              </p>
            </div>

            {/* Patient Info (only for appointments, not openings) */}
            {!isOpening && !isAbsence && appointment.patient && (
              <div className="pt-2 border-t border-border space-y-1.5">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">
                    {appointment.patient.lastName.toUpperCase()} {appointment.patient.firstName}
                  </span>
                </div>
                
                {appointment.patient.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {appointment.patient.phone}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {format(appointment.patient.dateOfBirth, 'dd/MM/yyyy', { locale: fr })} ({calculateAge(appointment.patient.dateOfBirth)} ans)
                  </span>
                </div>
              </div>
            )}

            {/* Practitioner Badge */}
            <div className="pt-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: appointment.practitioner.color }}
                />
                <span>{appointment.practitioner.title} {appointment.practitioner.lastName}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentPreviewCard;
