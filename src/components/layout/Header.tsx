import React from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, Users, HelpCircle, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { currentUser } from '@/data/mockData';

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
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 max-w-xl"
      >
        <div className="search-bar">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm placeholder:text-muted-foreground/60"
          />
        </div>
      </motion.div>

      {/* Right Actions */}
      <motion.div 
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Aide et contact</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Users className="w-4 h-4 text-muted-foreground" />
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
        </Button>

        <Button variant="ghost" size="icon">
          <Settings className="w-4 h-4 text-muted-foreground" />
        </Button>

        {/* User Avatar */}
        <Avatar className="w-8 h-8 ml-2 cursor-pointer ring-2 ring-transparent hover:ring-accent transition-all">
          <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">
            {currentUser.firstName[0]}{currentUser.lastName[0]}
          </AvatarFallback>
        </Avatar>
      </motion.div>
    </header>
  );
};

export default Header;
