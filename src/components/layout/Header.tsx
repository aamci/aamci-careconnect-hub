import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Users, HelpCircle, Settings, ChevronDown, Headphones, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { currentPractitioner } from '@/data/mockData';

interface HeaderProps {
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  onSearch, 
  searchPlaceholder = "Rechercher un patient" 
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <TooltipProvider delayDuration={100}>
      <header className="h-14 bg-sidebar px-4 flex items-center justify-between relative z-50">
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 max-w-xl"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 focus-within:bg-white/15 transition-colors">
            <Search className="w-4 h-4 text-white/60 flex-shrink-0" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearch}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm text-white placeholder:text-white/50 w-full h-auto py-0"
            />
          </div>
        </motion.div>

        {/* Right Actions */}
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 flex-shrink-0 ml-4"
        >
          {/* Contact Support */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full px-4 h-9 hidden md:flex"
          >
            <Headphones className="w-4 h-4" />
            <span className="text-sm font-medium">Contacter le support</span>
          </Button>

          {/* Icon buttons */}
          <div className="flex items-center gap-1">
            {/* Notifications */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <Bell className="w-[18px] h-[18px]" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning rounded-full" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground text-background">
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>

            {/* Team/Collaboration */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="relative h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                >
                  <Users className="w-[18px] h-[18px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground text-background">
                <p>Équipe</p>
              </TooltipContent>
            </Tooltip>

            {/* Lock/Security */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full hidden sm:flex"
                >
                  <Lock className="w-[18px] h-[18px]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-foreground text-background">
                <p>Sécurité</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* User Avatar */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 ml-2"
          >
            <Avatar className="w-9 h-9 ring-2 ring-white/20 hover:ring-white/40 transition-all">
              <AvatarFallback className="bg-gradient-to-br from-primary-light to-accent text-white text-sm font-semibold">
                {currentPractitioner.firstName[0]}{currentPractitioner.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </motion.button>
        </motion.div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
