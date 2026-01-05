import React, { useState } from 'react';
import { Search, Headphones, Users, Bell, HelpCircle, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ConsultationHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  userInitials?: string;
}

const ConsultationHeader: React.FC<ConsultationHeaderProps> = ({
  searchQuery = '',
  onSearchChange,
  userInitials = 'JN'
}) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <header className="h-14 bg-[hsl(201,80%,18%)] flex items-center justify-between px-4 border-b border-sidebar-border">
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un patient"
            value={localSearch}
            onChange={handleSearchChange}
            className="pl-10 bg-[hsl(201,70%,25%)] border-transparent text-primary-foreground placeholder:text-primary-foreground/50 focus:bg-[hsl(201,65%,30%)] focus:border-primary-glow/50 h-9"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-sidebar-accent gap-2"
        >
          <Headphones className="w-4 h-4" />
          <span className="text-sm">Contacter le support</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-sidebar-accent relative"
        >
          <Users className="w-5 h-5" />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[10px] font-medium flex items-center justify-center text-destructive-foreground">
            1
          </span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-sidebar-accent"
        >
          <Bell className="w-5 h-5" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-sidebar-accent"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-sidebar-accent"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-semibold text-accent-foreground ml-2">
          {userInitials}
        </div>
      </div>
    </header>
  );
};

export default ConsultationHeader;
