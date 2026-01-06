import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Users, HelpCircle, Lock, ChevronDown, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { currentPractitioner } from '@/data/mockData';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  searchPlaceholder = "Rechercher un patient",
  onToggleSidebar
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="h-14 bg-primary px-4 flex items-center justify-between relative z-50">
      {/* Left Section - Menu + Search */}
      <div className="flex items-center gap-3 flex-1">
        {/* Hamburger Menu */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-light/30"
          onClick={onToggleSidebar}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search Bar - Doctolib Style */}
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 max-w-xl"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-primary-foreground/50" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 h-9 bg-primary-light/20 border-0 rounded-full text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-1 focus-visible:ring-primary-foreground/30 focus-visible:bg-primary-light/30"
            />
          </div>
        </motion.div>
      </div>

      {/* Right Section - Actions */}
      <motion.div 
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1"
      >
        {/* Contact Support */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-light/30 hidden md:flex h-9 px-3"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Contacter le support</span>
        </Button>

        {/* Icon Buttons */}
        <div className="flex items-center gap-0.5">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-light/30"
          >
            <Bell className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-light/30"
          >
            <Users className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-light/30"
          >
            <Lock className="w-4 h-4" />
          </Button>
        </div>

        {/* User Avatar */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 ml-2 px-2 py-1 rounded-full hover:bg-primary-light/30 transition-all duration-150"
        >
          <Avatar className="w-8 h-8 ring-2 ring-primary-foreground/20">
            <AvatarFallback className="bg-accent text-accent-foreground text-xs font-semibold">
              {currentPractitioner.firstName[0]}{currentPractitioner.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </motion.button>
      </motion.div>
    </header>
  );
};

export default Header;