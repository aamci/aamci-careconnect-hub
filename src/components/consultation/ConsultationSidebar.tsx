import React from 'react';
import { 
  Calendar, 
  Mail, 
  FileText, 
  Users, 
  Upload, 
  Activity,
  MoreHorizontal,
  StickyNote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive?: boolean;
}

const navItems: NavItem[] = [
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'team', label: 'Doctolib Team', icon: Users },
  { id: 'patients', label: 'Gestion des patients', icon: FileText },
  { id: 'emails', label: 'E-mails', icon: Mail },
  { id: 'import', label: 'Import de documents', icon: Upload },
  { id: 'activity', label: 'Mon activité', icon: Activity },
];

interface ConsultationSidebarProps {
  activeItem?: string;
  onItemClick?: (id: string) => void;
  userInitials?: string;
}

const ConsultationSidebar: React.FC<ConsultationSidebarProps> = ({
  activeItem = 'agenda',
  onItemClick,
  userInitials = 'JN'
}) => {
  return (
    <div className="w-[72px] h-full bg-[hsl(201,80%,18%)] flex flex-col items-center py-4">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-[hsl(201,70%,25%)] flex items-center justify-center mb-6">
        <span className="text-xl font-bold text-primary-foreground">D</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {navItems.map((item) => (
          <Tooltip key={item.id} delayDuration={100}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onItemClick?.(item.id)}
                className={cn(
                  'w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg transition-all duration-200',
                  'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                  activeItem === item.id && 'bg-sidebar-accent text-sidebar-foreground'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] text-center leading-tight">{item.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover text-popover-foreground">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* More button */}
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <button className="w-full flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
            Autres
          </TooltipContent>
        </Tooltip>
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-3 mt-auto pt-4">
        {/* Team indicator */}
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-medium text-foreground">
          GD
        </div>
        
        {/* Support indicator */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-primary-foreground" />
        </div>

        {/* User avatar */}
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-accent-foreground">
          {userInitials}
        </div>
      </div>
    </div>
  );
};

export default ConsultationSidebar;
