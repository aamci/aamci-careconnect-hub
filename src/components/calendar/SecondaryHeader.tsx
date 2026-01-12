import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  List, 
  Clock,
  CalendarDays, 
  Calendar as CalendarIcon,
  Settings2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarView } from '@/hooks/useCalendar';

interface SecondaryHeaderProps {
  dateLabel: string;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  onToday: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleSidebar?: () => void;
  isSidebarVisible?: boolean;
  isOpeningEditMode?: boolean;
  onToggleOpeningEditMode?: () => void;
  onOpenSettings?: () => void;
}

const SecondaryHeader: React.FC<SecondaryHeaderProps> = ({
  dateLabel,
  view,
  onViewChange,
  onToday,
  onPrevious,
  onNext,
  onToggleSidebar,
  isSidebarVisible = true,
  isOpeningEditMode = false,
  onToggleOpeningEditMode,
  onOpenSettings,
}) => {
  const viewOptions: { id: CalendarView; label: string }[] = [
    { id: 'list', label: 'Liste' },
    { id: 'day', label: 'Journée' },
    { id: 'week', label: 'Semaine' },
    { id: 'month', label: 'Mois' },
  ];

  return (
    <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4 sticky top-0 z-30">
      {/* Left Section - Toggle, Today, Navigation, Date */}
      <div className="flex items-center gap-2">
        {/* Hamburger - Toggle sidebar */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onToggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Today button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="h-8 text-xs font-medium"
        >
          Aujourd'hui
        </Button>

        {/* Navigation arrows */}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onPrevious}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onNext}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Date range label */}
        <Button
          variant="ghost"
          className="h-8 px-3 text-sm font-semibold capitalize hover:bg-muted"
        >
          {dateLabel}
        </Button>
      </div>

      {/* Center Section - View Selector Pills */}
      <div className="flex items-center bg-muted/50 rounded-lg p-0.5">
        {viewOptions.map((option) => (
          <Button
            key={option.id}
            variant="ghost"
            size="sm"
            onClick={() => onViewChange(option.id)}
            className={cn(
              'h-7 px-3 text-xs font-medium rounded-md transition-all',
              view === option.id
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Right Section - Openings Edit & Display Settings */}
      <div className="flex items-center gap-2">
        <Button
          variant={isOpeningEditMode ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-8 gap-2 text-xs",
            isOpeningEditMode && "bg-amber-400 hover:bg-amber-500 text-amber-950"
          )}
          onClick={onToggleOpeningEditMode}
        >
          <CalendarIcon className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isOpeningEditMode ? 'Revenir à l\'agenda' : 'Modifier les plages d\'ouverture'}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2 text-muted-foreground hover:text-foreground"
          onClick={onOpenSettings}
        >
          <Settings2 className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Affichage de l'agenda</span>
        </Button>
      </div>
    </div>
  );
};

export default SecondaryHeader;
