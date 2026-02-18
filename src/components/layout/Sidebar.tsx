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
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { currentPractitioner } from '@/data/mockData';

interface SidebarProps {
  activeItem: string;
  onItemChange: (item: string) => void;
}

const navItems = [
  { id: 'agenda', label: 'Planning', icon: Calendar, path: '/' },
  { id: 'notes', label: 'Notes', icon: FileText, path: '/notes' },
  { id: 'tasks', label: 'Tâches', icon: CheckSquare, badge: 3, path: '/tasks' },
  { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
  { id: 'messages', label: 'Messagerie', icon: MessageSquare, badge: 2, path: '/messages' },
  { id: 'teleconsult', label: 'Visio', icon: Video, path: '/teleconsult' },
  { id: 'stats', label: 'Activité', icon: BarChart3, path: '/stats' },
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
    <TooltipProvider delayDuration={100}>
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-[72px] h-screen bg-sidebar flex flex-col items-center py-4 flex-shrink-0"
      >
        {/* Logo */}
        <div className="mb-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <span className="text-white font-bold text-xl">M</span>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 w-full px-2 overflow-hidden">
          {navItems.map((item) => {
            const isActive = currentActiveItem === item.id;
            
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleNavClick(item)}
                    className={cn(
                      'relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg transition-all duration-150 group w-full',
                      isActive
                        ? 'text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {/* Active indicator - left bar */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-white rounded-r-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}

                    <div className="relative">
                      <item.icon className={cn(
                        "w-5 h-5 transition-all duration-150",
                        isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
                      )} />
                      
                      {/* Badge notification */}
                      {item.badge && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-warning text-[10px] font-bold flex items-center justify-center text-warning-foreground">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    
                    <span className={cn(
                      "text-[10px] font-medium leading-tight text-center max-w-full px-0.5",
                      isActive ? "font-semibold" : ""
                    )}>
                      {item.label}
                    </span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="bg-foreground text-background">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="flex flex-col gap-1 w-full px-2 pt-3 border-t border-white/10 mt-2">
          {/* Settings */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate('/settings')}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 rounded-lg transition-all duration-150 w-full',
                  location.pathname.startsWith('/settings')
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <Settings className="w-5 h-5 stroke-[1.5px]" />
                <span className="text-[10px] font-medium">Parametres</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="bg-foreground text-background">
              <p>Parametres</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Help */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex flex-col items-center gap-1 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-150 w-full">
                <HelpCircle className="w-5 h-5 stroke-[1.5px]" />
                <span className="text-[10px] font-medium">Aide</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8} className="bg-foreground text-background">
              <p>Aide</p>
            </TooltipContent>
          </Tooltip>

          {/* User Avatar */}
          <div className="pt-3 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Avatar className="w-10 h-10 ring-2 ring-white/20 hover:ring-white/40 transition-all cursor-pointer">
                    <AvatarFallback className="bg-gradient-to-br from-primary-light to-accent text-white text-sm font-semibold">
                      {currentPractitioner.firstName[0]}{currentPractitioner.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={8} className="bg-foreground text-background">
                <p>{currentPractitioner.title} {currentPractitioner.firstName} {currentPractitioner.lastName}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
};

export default Sidebar;
