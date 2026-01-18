import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  SlidersHorizontal,
  CalendarClock,
  Palette,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreferencesPopoverProps {
  onOpenAvailability: () => void;
  onOpenAppearance: () => void;
  isAvailabilityActive?: boolean;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  isActive?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  description,
  onClick,
  isActive = false,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
      'hover:bg-muted/80 focus:bg-muted/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      isActive && 'bg-primary/10 text-primary'
    )}
  >
    <span className={cn(
      'flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center',
      isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
    )}>
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <span className={cn(
        'block text-sm font-medium',
        isActive ? 'text-primary' : 'text-foreground'
      )}>
        {label}
      </span>
      {description && (
        <span className="block text-xs text-muted-foreground truncate">
          {description}
        </span>
      )}
    </div>
    <ChevronRight className={cn(
      'w-4 h-4 flex-shrink-0',
      isActive ? 'text-primary' : 'text-muted-foreground'
    )} />
  </button>
);

const PreferencesPopover: React.FC<PreferencesPopoverProps> = ({
  onOpenAvailability,
  onOpenAppearance,
  isAvailabilityActive = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenAvailability = () => {
    setIsOpen(false);
    onOpenAvailability();
  };

  const handleOpenAppearance = () => {
    setIsOpen(false);
    onOpenAppearance();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 gap-2 text-muted-foreground hover:text-foreground',
            isOpen && 'bg-muted text-foreground'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-xs hidden sm:inline">Préférences</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-2"
        sideOffset={8}
      >
        <div className="space-y-1">
          <div className="px-3 py-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Préférences
            </h4>
          </div>

          <MenuItem
            icon={<CalendarClock className="w-4 h-4" />}
            label="Disponibilités"
            description="Gérer les plages d'ouverture"
            onClick={handleOpenAvailability}
            isActive={isAvailabilityActive}
          />

          <MenuItem
            icon={<Palette className="w-4 h-4" />}
            label="Apparence & affichage"
            description="Zoom, plages horaires, options"
            onClick={handleOpenAppearance}
          />
        </div>

        {/* Keyboard shortcut hint */}
        <div className="mt-3 pt-2 border-t border-border">
          <p className="px-3 text-[10px] text-muted-foreground">
            Raccourci: <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">Ctrl</kbd> + <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">,</kbd>
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PreferencesPopover;
