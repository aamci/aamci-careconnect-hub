import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Users, HelpCircle, Settings, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { currentPractitioner } from '@/data/mockData';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  searchPlaceholder = "Rechercher un patient (nom, téléphone, date de naissance...)" 
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="h-16 bg-card border-b border-border px-4 md:px-6 flex items-center justify-between relative z-50 shadow-sm">
      {/* Search Bar - Responsive */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 max-w-2xl mr-4"
      >
        <div className="search-bar group">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0 group-focus-within:text-primary transition-colors" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm placeholder:text-muted-foreground/60 w-full"
          />
        </div>
      </motion.div>

      {/* Right Actions - Responsive */}
      <motion.div 
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1 md:gap-2 flex-shrink-0"
      >
        {/* Help - Hidden on small screens */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/80 hidden lg:flex"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Aide</span>
        </Button>

        {/* Icon buttons */}
        <div className="flex items-center gap-0.5 md:gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <Users className="w-4 h-4" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/80"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full ring-2 ring-card" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/80 hidden md:flex"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Separator */}
        <Separator orientation="vertical" className="h-8 mx-2 hidden sm:block" />

        {/* User Profile - Premium Enterprise Style */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-xl hover:bg-muted/80 transition-all duration-200 group"
        >
          <Avatar className="w-8 h-8 md:w-9 md:h-9 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary-light text-primary-foreground text-sm font-semibold">
              {currentPractitioner.firstName[0]}{currentPractitioner.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-semibold text-foreground leading-tight">
              {currentPractitioner.title} {currentPractitioner.lastName}
            </span>
            <span className="text-xs text-muted-foreground leading-tight">
              {currentPractitioner.specialty}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block group-hover:text-foreground transition-colors" />
        </motion.button>
      </motion.div>
    </header>
  );
};

export default Header;
