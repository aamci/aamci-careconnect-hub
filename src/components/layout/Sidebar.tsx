import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, 
  FileText, 
  Users, 
  CheckSquare, 
  MessageSquare, 
  Video, 
  BarChart3, 
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { currentPractitioner } from '@/data/mockData';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarProps {
  activeItem: string;
  onItemChange: (item: string) => void;
}

const navItems = [
  { id: 'agenda', label: 'Agenda', icon: Calendar, path: '/' },
  { id: 'notes', label: 'Notes', icon: FileText, path: '/notes' },
  { id: 'patients', label: 'Gestion des patients', icon: Users, badge: 2, path: '/patients' },
  { id: 'messages', label: 'Messagerie patients', icon: MessageSquare, path: '/messages' },
  { id: 'teleconsult', label: 'Consultation vidéo', icon: Video, badge: 1, path: '/teleconsult' },
  { id: 'stats', label: 'Mon activité', icon: BarChart3, path: '/stats' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (item: typeof navItems[0]) => {
    onItemChange(item.id);
    navigate(item.path);
  };

  // Determine active item from current path
  const currentActiveItem = navItems.find(item => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(item.path);
  })?.id || activeItem;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[72px] h-screen bg-sidebar-background flex flex-col items-center py-4 flex-shrink-0"
    >
      {/* Logo */}
      <div className="mb-6">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 rounded-xl bg-sidebar-foreground/10 flex items-center justify-center cursor-pointer"
        >
          <span className="text-sidebar-foreground font-bold text-xl italic">M</span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 w-full px-2 overflow-hidden">
        {navItems.map((item) => (
          <Tooltip key={item.id} delayDuration={100}>
            <TooltipTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavClick(item)}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg transition-all duration-150 group w-full',
                  currentActiveItem === item.id
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                )}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" strokeWidth={currentActiveItem === item.id ? 2.5 : 2} />
                  {item.badge && (
                    <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-warning text-[10px] font-bold flex items-center justify-center text-warning-foreground">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-tight text-center line-clamp-2 max-w-[60px]">
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {currentActiveItem === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-sidebar-primary rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-sidebar-background text-sidebar-foreground border-sidebar-border">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-3 w-full px-2 pt-4 border-t border-sidebar-border mt-2">
        {/* Quick Action Button */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-warning text-[10px] font-bold flex items-center justify-center text-warning-foreground">
            +41
          </span>
        </motion.button>
        
        {/* User Avatar */}
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1"
            >
              <Avatar className="w-9 h-9 ring-2 ring-sidebar-border hover:ring-sidebar-primary transition-all">
                <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs font-semibold">
                  {currentPractitioner.firstName[0]}{currentPractitioner.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-sidebar-background text-sidebar-foreground border-sidebar-border">
            {currentPractitioner.title} {currentPractitioner.lastName}
          </TooltipContent>
        </Tooltip>
      </div>
    </motion.aside>
  );
};

export default Sidebar;