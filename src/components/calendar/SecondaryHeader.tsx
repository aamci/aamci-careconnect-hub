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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarView } from '@/hooks/useCalendar';
import PreferencesPopover from './settings/PreferencesPopover';

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

      {/* Right Section - Preferences Popover */}
      <div className="flex items-center gap-2">
        {/* Show "Return to agenda" button only when in edit mode */}
        {isOpeningEditMode && (
          <Button
            variant="default"
            size="sm"
            className="h-8 gap-2 text-xs bg-amber-400 hover:bg-amber-500 text-amber-950"
            onClick={onToggleOpeningEditMode}
          >
            <CalendarIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Revenir à l'agenda</span>
          </Button>
        )}

        {/* Preferences Popover - contains Disponibilités and Apparence & affichage */}
        <PreferencesPopover
          onOpenAvailability={onToggleOpeningEditMode || (() => {})}
          onOpenAppearance={onOpenSettings || (() => {})}
          isAvailabilityActive={isOpeningEditMode}
        />
      </div>
    </div>
  );
};

export default SecondaryHeader;
