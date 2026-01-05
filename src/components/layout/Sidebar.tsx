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
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-16 sm:w-[72px] h-screen bg-gradient-sidebar flex flex-col items-center py-3 sm:py-4 border-r border-sidebar-border flex-shrink-0"
    >
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sidebar-primary flex items-center justify-center"
        >
          <span className="text-sidebar-primary-foreground font-bold text-base sm:text-lg">M</span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 sm:gap-1 w-full px-1.5 sm:px-2 overflow-y-auto">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavClick(item)}
            className={cn(
              'relative flex flex-col items-center gap-0.5 sm:gap-1 py-2 sm:py-2.5 px-1 rounded-lg transition-all duration-200',
              currentActiveItem === item.id
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <div className="relative">
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              {item.badge && (
                <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-accent text-[9px] sm:text-[10px] font-semibold flex items-center justify-center text-accent-foreground">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium leading-tight text-center">{item.label}</span>
            
            {/* Active indicator */}
            {currentActiveItem === item.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 sm:h-8 bg-sidebar-primary rounded-r-full"
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Bottom Section - Only Settings and Help */}
      <div className="flex flex-col gap-1 sm:gap-2 w-full px-1.5 sm:px-2 pt-2 border-t border-sidebar-border mt-2">
        <button className="flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px]">Paramètres</span>
        </button>
        
        <button className="flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
          <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-[9px] sm:text-[10px]">Aide</span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
