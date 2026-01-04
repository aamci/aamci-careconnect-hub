import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarDays, 
  List, 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarView } from '@/hooks/useCalendar';

interface CalendarToolbarProps {
  dateLabel: string;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onNewAppointment?: () => void;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  dateLabel,
  view,
  onViewChange,
  onToday,
  onPrevious,
  onNext,
  onNewAppointment,
}) => {
  const viewOptions: { id: CalendarView; label: string; icon: React.ReactNode }[] = [
    { id: 'list', label: 'Liste', icon: <List className="w-4 h-4" /> },
    { id: 'day', label: 'Journée', icon: <Clock className="w-4 h-4" /> },
    { id: 'week', label: 'Semaine', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'month', label: 'Mois', icon: <CalendarIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      {/* Left Section - New Appointment */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button 
          onClick={onNewAppointment}
          className="action-btn action-btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Trouver un créneau</span>
          <span className="sm:hidden">Nouveau</span>
        </Button>
      </motion.div>

      {/* Center Section - Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <Button 
          variant="outline" 
          size="sm"
          onClick={onToday}
          className="text-xs"
        >
          Aujourd'hui
        </Button>

        <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7"
            onClick={onPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <span className="px-3 text-sm font-medium min-w-[180px] text-center capitalize">
            {dateLabel}
          </span>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7"
            onClick={onNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Right Section - View Toggle & Settings */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        {/* View Toggle */}
        <div className="flex items-center bg-secondary/50 rounded-lg p-1">
          {viewOptions.map((option) => (
            <Button
              key={option.id}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(option.id)}
              className={cn(
                'h-7 px-3 gap-1.5 text-xs font-medium transition-all',
                view === option.id 
                  ? 'bg-card shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Settings */}
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Settings2 className="w-4 h-4" />
          <span className="hidden lg:inline text-xs">Affichage</span>
        </Button>
      </motion.div>
    </div>
  );
};

export default CalendarToolbar;
