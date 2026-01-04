import React from 'react';
import { motion } from 'framer-motion';
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
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { currentPractitioner } from '@/data/mockData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SidebarProps {
  activeItem: string;
  onItemChange: (item: string) => void;
}

const navItems = [
  { id: 'agenda', label: 'Planning', icon: Calendar },
  { id: 'notes', label: 'Notes', icon: FileText },
  { id: 'tasks', label: 'Tâches', icon: CheckSquare, badge: 3 },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'messages', label: 'Messagerie', icon: MessageSquare, badge: 2 },
  { id: 'teleconsult', label: 'Visio', icon: Video },
  { id: 'stats', label: 'Activité', icon: BarChart3 },
];

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemChange }) => {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-[72px] h-screen bg-gradient-sidebar flex flex-col items-center py-4 border-r border-sidebar-border"
    >
      {/* Logo */}
      <div className="mb-8">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center"
        >
          <span className="text-sidebar-primary-foreground font-bold text-lg">M</span>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 w-full px-2">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onItemChange(item.id)}
            className={cn(
              'relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg transition-all duration-200',
              activeItem === item.id
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-[10px] font-semibold flex items-center justify-center text-accent-foreground">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
            
            {/* Active indicator */}
            {activeItem === item.id && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-sidebar-primary rounded-r-full"
              />
            )}
          </motion.button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="flex flex-col gap-2 w-full px-2">
        <button className="flex flex-col items-center gap-1 py-2 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Paramètres</span>
        </button>
        
        <button className="flex flex-col items-center gap-1 py-2 text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px]">Aide</span>
        </button>

        {/* User Profile */}
        <div className="pt-4 border-t border-sidebar-border mt-2">
          <button className="w-full flex flex-col items-center gap-1 group">
            <Avatar className="w-9 h-9 border-2 border-sidebar-accent group-hover:border-sidebar-primary transition-colors">
              <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-sm font-medium">
                {currentPractitioner.firstName[0]}{currentPractitioner.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-0.5 text-sidebar-foreground/60 group-hover:text-sidebar-foreground transition-colors">
              <span className="text-[9px]">{currentPractitioner.title}</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
