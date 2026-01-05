import React from 'react';
import { motion } from 'framer-motion';
import { Patient } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle, 
  Star, 
  Calendar,
  ChevronRight 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PatientCardProps {
  patient: Patient;
  isSelected?: boolean;
  onClick: () => void;
  appointmentCount?: number;
}

const PatientCard: React.FC<PatientCardProps> = ({ 
  patient, 
  isSelected, 
  onClick,
  appointmentCount = 0 
}) => {
  const age = differenceInYears(new Date(), patient.dateOfBirth);
  const displayName = patient.usedFirstName || patient.firstName;
  const displayLastName = patient.usedLastName || patient.lastName;

  const hasVipAlert = patient.alerts?.some(a => a.type === 'vip');
  const hasCriticalAlert = patient.alerts?.some(a => a.severity === 'critical');

  return (
    <motion.div
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'group relative p-4 rounded-xl border cursor-pointer transition-all duration-200',
        isSelected 
          ? 'bg-primary/5 border-primary shadow-sm' 
          : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Patient Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">
              {displayLastName.toUpperCase()} {displayName}
            </h3>
            {hasVipAlert && (
              <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
            )}
            {hasCriticalAlert && (
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
            <span>{age} ans</span>
            <span className="text-muted-foreground/40">•</span>
            <span>{format(patient.dateOfBirth, 'dd/MM/yyyy')}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="capitalize">{patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : 'Autre'}</span>
          </div>

          <div className="space-y-1">
            {patient.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-3.5 h-3.5" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{patient.email}</span>
              </div>
            )}
            {patient.city && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" />
                <span>{patient.city} {patient.postalCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-2">
          {appointmentCount > 0 && (
            <Badge variant="secondary" className="gap-1">
              <Calendar className="w-3 h-3" />
              {appointmentCount} RDV
            </Badge>
          )}
          <ChevronRight className={cn(
            'w-5 h-5 text-muted-foreground/40 transition-colors',
            isSelected && 'text-primary'
          )} />
        </div>
      </div>

      {/* Alerts Preview */}
      {patient.alerts && patient.alerts.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex flex-wrap gap-1.5">
            {patient.alerts.slice(0, 2).map((alert) => (
              <Badge 
                key={alert.id}
                variant="outline"
                className={cn(
                  'text-xs',
                  alert.severity === 'critical' && 'border-destructive/50 text-destructive bg-destructive/5',
                  alert.type === 'vip' && 'border-amber-500/50 text-amber-600 bg-amber-50'
                )}
              >
                {alert.message.length > 30 ? `${alert.message.slice(0, 30)}...` : alert.message}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PatientCard;
