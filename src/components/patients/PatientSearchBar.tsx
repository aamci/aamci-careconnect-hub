import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface PatientSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  resultCount?: number;
}

const PatientSearchBar: React.FC<PatientSearchBarProps> = ({
  value,
  onChange,
  onClear,
  resultCount
}) => {
  return (
    <div className="relative">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher un patient (nom, téléphone, date de naissance...)"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-10 pr-10 h-11 bg-background border-input"
          />
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={onClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        <Button variant="outline" size="icon" className="h-11 w-11">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
      </div>

      {/* Result count */}
      <AnimatePresence>
        {value && resultCount !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 text-sm text-muted-foreground"
          >
            {resultCount} patient{resultCount !== 1 ? 's' : ''} trouvé{resultCount !== 1 ? 's' : ''}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PatientSearchBar;
