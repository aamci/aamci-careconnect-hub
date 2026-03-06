import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Users, Headphones, Lock, X, LogOut, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { currentPractitioner } from '@/data/mockData';
import { usePatients } from '@/hooks/data/usePatients';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: patients = [] } = usePatients();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth', { replace: true });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredPatients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 1) return [];
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const reverseName = `${patient.lastName} ${patient.firstName}`.toLowerCase();
      const phone = patient.phone?.replace(/\s/g, '') || '';
      return (
        fullName.includes(q) ||
        reverseName.includes(q) ||
        phone.includes(q.replace(/\s/g, '')) ||
        patient.email?.toLowerCase().includes(q) ||
        patient.city?.toLowerCase().includes(q)
      );
    }).slice(0, 8);
  }, [searchQuery, patients]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPatient = (patientId: string) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(`/patients/${patientId}/home`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || filteredPatients.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filteredPatients.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectPatient(filteredPatients[highlightedIndex].id);
    } else if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  const computeAge = (dob: Date) => {
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };

  const formatDob = (dob: Date) => {
    const d = dob instanceof Date ? dob : new Date(dob);
    return d.toLocaleDateString('fr-FR');
  };

  return (
    <TooltipProvider delayDuration={100}>
      <header className="h-14 bg-sidebar px-4 flex items-center justify-between relative z-50">
        {/* Search Bar */}
        <motion.div
          ref={searchRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 max-w-xl relative"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 focus-within:bg-white/15 transition-colors">
            <Search className="w-4 h-4 text-white/60 flex-shrink-0" />
            <Input
              type="text"
              placeholder="Rechercher un patient"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowResults(true);
                setHighlightedIndex(-1);
              }}
              onFocus={() => { if (searchQuery.trim().length >= 1) setShowResults(true); }}
              onKeyDown={handleKeyDown}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 text-sm text-white placeholder:text-white/50 w-full h-auto py-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(''); setShowResults(false); }}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Patient search results dropdown */}
          <AnimatePresence>
            {showResults && searchQuery.trim().length >= 1 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 bg-popover border border-border rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto z-[60]"
              >
                {filteredPatients.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Aucun patient correspondant
                  </div>
                ) : (
                  <>
                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                      {filteredPatients.length} patient{filteredPatients.length > 1 ? 's' : ''} trouve{filteredPatients.length > 1 ? 's' : ''}
                    </div>
                    {filteredPatients.map((patient, index) => {
                      const dob = patient.dateOfBirth instanceof Date ? patient.dateOfBirth : new Date(patient.dateOfBirth);
                      const age = computeAge(dob);
                      return (
                        <button
                          key={patient.id}
                          type="button"
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted/50 transition-colors',
                            highlightedIndex === index && 'bg-muted/50'
                          )}
                          onMouseDown={(e) => { e.preventDefault(); handleSelectPatient(patient.id); }}
                          onMouseEnter={() => setHighlightedIndex(index)}
                        >
                          <Avatar className="h-9 w-9 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {patient.firstName[0]}{patient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {patient.lastName} {patient.firstName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {age} ans &middot; {formatDob(dob)}
                              {patient.phone && ` \u00B7 ${patient.phone}`}
                            </p>
                          </div>
                          {patient.city && (
                            <span className="text-xs text-muted-foreground flex-shrink-0">{patient.city}</span>
                          )}
                        </button>
                      );
                    })}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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

          {/* User Avatar + Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 ml-2 outline-none"
              >
                <Avatar className="w-9 h-9 ring-2 ring-white/20 hover:ring-white/40 transition-all cursor-pointer">
                  <AvatarFallback className="bg-gradient-to-br from-primary-light to-accent text-white text-sm font-semibold">
                    {currentPractitioner.firstName[0]}{currentPractitioner.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold">
                    {currentPractitioner.title} {currentPractitioner.firstName} {currentPractitioner.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{currentPractitioner.email}</p>
                  <p className="text-xs text-muted-foreground">{currentPractitioner.specialty}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Parametres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Se deconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </header>
    </TooltipProvider>
  );
};

export default Header;
