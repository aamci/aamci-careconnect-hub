import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MapPin, Globe, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FRENCH_CITIES, COUNTRIES, FrenchCity, Country, BirthPlaceType } from './types';

interface BirthPlaceAutocompleteProps {
  type: BirthPlaceType;
  value: string;
  onValueChange: (value: string, id?: string) => void;
  onClear: () => void;
  disabled?: boolean;
}

const BirthPlaceAutocomplete: React.FC<BirthPlaceAutocompleteProps> = ({
  type,
  value,
  onValueChange,
  onClear,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return type === 'france' ? FRENCH_CITIES.slice(0, 10) : COUNTRIES.slice(0, 10);
    
    if (type === 'france') {
      return FRENCH_CITIES.filter(city => 
        city.name.toLowerCase().includes(query) || 
        city.label.toLowerCase().includes(query)
      ).slice(0, 10);
    } else {
      return COUNTRIES.filter(country => 
        country.name.toLowerCase().includes(query)
      ).slice(0, 10);
    }
  }, [search, type]);

  const handleSelect = (item: FrenchCity | Country) => {
    if (type === 'france') {
      const city = item as FrenchCity;
      setSearch(city.label);
      onValueChange(city.label, city.id);
    } else {
      const country = item as Country;
      setSearch(country.name);
      onValueChange(country.name, country.code);
    }
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setIsOpen(true);
  };

  const handleClear = () => {
    setSearch('');
    onClear();
    inputRef.current?.focus();
  };

  const Icon = type === 'france' ? MapPin : Globe;
  const placeholder = type === 'france' ? 'Ville de naissance' : 'Pays/territoire de naissance';

  if (type === 'unknown') return null;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={search}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-9 pr-9 h-10 bg-muted/30 border-border focus:border-primary focus:ring-1 focus:ring-primary"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-destructive/80 hover:bg-destructive flex items-center justify-center transition-colors"
          >
            <X className="h-3 w-3 text-destructive-foreground" />
          </button>
        )}
      </div>

      {isOpen && filteredItems.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredItems.map((item, index) => {
            const isFrench = type === 'france';
            const label = isFrench ? (item as FrenchCity).label : (item as Country).name;
            const key = isFrench ? (item as FrenchCity).id : (item as Country).code;
            
            // Highlight matching text
            const searchLower = search.toLowerCase();
            const labelLower = label.toLowerCase();
            const matchIndex = labelLower.indexOf(searchLower);
            
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(item)}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors',
                  index === 0 && 'rounded-t-lg',
                  index === filteredItems.length - 1 && 'rounded-b-lg'
                )}
              >
                {matchIndex >= 0 && search ? (
                  <>
                    {label.slice(0, matchIndex)}
                    <span className="text-primary font-medium underline">
                      {label.slice(matchIndex, matchIndex + search.length)}
                    </span>
                    {label.slice(matchIndex + search.length)}
                  </>
                ) : (
                  label
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BirthPlaceAutocomplete;
