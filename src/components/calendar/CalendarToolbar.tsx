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
  Menu,
  Settings2,
  PanelLeftClose,
  PanelLeft
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
  onToggleFilters?: () => void;
  showFiltersToggle?: boolean;
}

const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  dateLabel,
  view,
  onViewChange,
  onToday,
  onPrevious,
  onNext,
  onNewAppointment,
  onToggleFilters,
  showFiltersToggle = false,
}) => {
  const viewOptions: { id: CalendarView; label: string; icon: React.ReactNode }[] = [
    { id: 'list', label: 'Liste', icon: <List className="w-4 h-4" /> },
    { id: 'day', label: 'Journée', icon: <Clock className="w-4 h-4" /> },
    { id: 'week', label: 'Semaine', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'month', label: 'Mois', icon: <CalendarIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border bg-card">
      {/* Left Section - Toggle + Navigation */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        {/* Filters Toggle */}
        {showFiltersToggle && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleFilters}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <Button 
          variant="outline" 
          size="sm"
          onClick={onToday}
          className="text-sm font-medium"
        >
          Aujourd'hui
        </Button>

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={onPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8"
            onClick={onNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <span className="text-sm font-medium min-w-[160px] capitalize">
          {dateLabel}
        </span>
      </motion.div>

      {/* Right Section - View Toggle & Settings */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >
        {/* View Toggle */}
        <div className="flex items-center bg-muted rounded-lg p-1">
          {viewOptions.map((option) => (
            <Button
              key={option.id}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(option.id)}
              className={cn(
                'h-8 px-3 gap-1.5 text-sm font-medium transition-all rounded-md',
                view === option.id 
                  ? 'bg-card shadow-sm text-foreground' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Additional Settings */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden lg:inline text-sm">Modifier les plages d'ouverture</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <Settings2 className="w-4 h-4" />
            <span className="hidden lg:inline text-sm">Paramètres d'affichage</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CalendarToolbar;
