/**
 * SmartMedicalInput - Intelligent Medical Term Input with Suggestions
 * Supports CIM-10, CISP-2, CCAM, ATC coding with abbreviations and synonyms
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Shield, FileText, Loader2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { TerminologySuggestion, TerminologySystem, CodedValue } from '@/types/medicalHistory';
import { searchTerminology, searchConditions, searchProcedures, searchAllergens } from '@/services/terminology';

// ============================================================================
// TYPES
// ============================================================================

export type SearchMode = 'conditions' | 'procedures' | 'allergens' | 'all';

export interface SmartMedicalInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: TerminologySuggestion) => void;
  onFreeTextSubmit?: (text: string) => void;
  selectedCoding?: CodedValue | null;
  onCodingChange?: (coding: CodedValue | null) => void;
  mode?: SearchMode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showCodeBadge?: boolean;
  allowFreeText?: boolean;
  autoFocus?: boolean;
}

interface SuggestionItemProps {
  suggestion: TerminologySuggestion;
  isSelected: boolean;
  onClick: () => void;
  query: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getSystemLabel(system: TerminologySystem): string {
  const labels: Record<TerminologySystem, string> = {
    CIM10: 'CIM-10',
    CISP2: 'CISP-2',
    CCAM: 'CCAM',
    ATC: 'ATC',
    LOINC: 'LOINC',
    SNOMED: 'SNOMED',
    FREE_TEXT: 'Texte libre',
  };
  return labels[system] || system;
}

function getSystemColor(system: TerminologySystem): string {
  const colors: Record<TerminologySystem, string> = {
    CIM10: 'bg-blue-100 text-blue-700 border-blue-200',
    CISP2: 'bg-green-100 text-green-700 border-green-200',
    CCAM: 'bg-purple-100 text-purple-700 border-purple-200',
    ATC: 'bg-orange-100 text-orange-700 border-orange-200',
    LOINC: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    SNOMED: 'bg-pink-100 text-pink-700 border-pink-200',
    FREE_TEXT: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[system] || 'bg-gray-100 text-gray-700';
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;

  const normalizedQuery = query.toLowerCase();
  const normalizedText = text.toLowerCase();
  const startIndex = normalizedText.indexOf(normalizedQuery);

  if (startIndex === -1) return text;

  const beforeMatch = text.slice(0, startIndex);
  const match = text.slice(startIndex, startIndex + query.length);
  const afterMatch = text.slice(startIndex + query.length);

  return (
    <>
      {beforeMatch}
      <span className="font-semibold text-primary bg-primary/10 rounded px-0.5">
        {match}
      </span>
      {afterMatch}
    </>
  );
}

// ============================================================================
// SUGGESTION ITEM COMPONENT
// ============================================================================

const SuggestionItem: React.FC<SuggestionItemProps> = ({
  suggestion,
  isSelected,
  onClick,
  query,
}) => {
  const { concept, matchType } = suggestion;
  const isCoded = concept.system !== 'FREE_TEXT';

  return (
    <button
      type="button"
      className={cn(
        'w-full text-left px-3 py-2.5 transition-colors',
        'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
        'border-b border-border/50 last:border-b-0',
        isSelected && 'bg-muted'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {isCoded && (
              <Shield className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-foreground truncate">
              {highlightText(concept.display, query)}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0', getSystemColor(concept.system))}
            >
              {getSystemLabel(concept.system)}
              {concept.code && concept.system !== 'FREE_TEXT' && ` - ${concept.code}`}
            </Badge>
            {matchType === 'abbreviation' && (
              <span className="text-[10px] text-muted-foreground">
                via abreviation
              </span>
            )}
            {matchType === 'synonym' && (
              <span className="text-[10px] text-muted-foreground">
                via synonyme
              </span>
            )}
          </div>
        </div>
        {isSelected && (
          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
        )}
      </div>
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SmartMedicalInput: React.FC<SmartMedicalInputProps> = ({
  value,
  onChange,
  onSelect,
  onFreeTextSubmit,
  selectedCoding,
  onCodingChange,
  mode = 'conditions',
  placeholder = 'Rechercher...',
  disabled = false,
  className,
  showCodeBadge = true,
  allowFreeText = true,
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  // Search function based on mode
  const searchFn = useCallback(
    async (query: string) => {
      if (!query || query.length < 2) return [];
      switch (mode) {
        case 'conditions':
          return searchConditions(query);
        case 'procedures':
          return searchProcedures(query);
        case 'allergens':
          return searchAllergens(query);
        default:
          return searchTerminology(query);
      }
    },
    [mode]
  );

  // React Query for suggestions
  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['terminology-search', mode, debouncedQuery],
    queryFn: () => searchFn(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(0);
    setIsOpen(true);
    // Clear coding when user types
    if (selectedCoding && onCodingChange) {
      onCodingChange(null);
    }
  };

  // Handle suggestion selection
  const handleSelect = (suggestion: TerminologySuggestion) => {
    const { concept } = suggestion;
    onChange(concept.display);
    setIsOpen(false);

    if (onSelect) {
      onSelect(suggestion);
    }

    if (onCodingChange && concept.system !== 'FREE_TEXT') {
      onCodingChange({
        system: concept.system,
        code: concept.code,
        display: concept.display,
        userSelected: true,
      });
    }
  };

  // Handle free text submission
  const handleFreeTextSubmit = () => {
    if (value.trim() && allowFreeText && onFreeTextSubmit) {
      onFreeTextSubmit(value.trim());
      setIsOpen(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex === suggestions.length && allowFreeText) {
          handleFreeTextSubmit();
        } else if (suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear selected coding
  const handleClearCoding = () => {
    if (onCodingChange) {
      onCodingChange(null);
    }
    onChange('');
    inputRef.current?.focus();
  };

  const showDropdown =
    isOpen && (suggestions.length > 0 || (allowFreeText && value.length >= 2));

  return (
    <div className={cn('relative', className)}>
      {/* Input with coding badge */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => value.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={cn(
            'pl-9 pr-4',
            selectedCoding && showCodeBadge && 'pr-24'
          )}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {selectedCoding && showCodeBadge && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5', getSystemColor(selectedCoding.system))}
            >
              <Shield className="h-3 w-3 mr-1" />
              {selectedCoding.code}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={handleClearCoding}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-background border border-border rounded-lg shadow-lg overflow-hidden"
        >
          <ScrollArea className="max-h-[300px]">
            {suggestions.map((suggestion, index) => (
              <SuggestionItem
                key={suggestion.concept.id}
                suggestion={suggestion}
                isSelected={index === selectedIndex}
                onClick={() => handleSelect(suggestion)}
                query={value}
              />
            ))}

            {/* Free text option */}
            {allowFreeText && value.length >= 2 && (
              <button
                type="button"
                className={cn(
                  'w-full text-left px-3 py-2.5 transition-colors',
                  'hover:bg-muted/50 focus:bg-muted/50 focus:outline-none',
                  'border-t border-border bg-muted/20',
                  selectedIndex === suggestions.length && 'bg-muted'
                )}
                onClick={handleFreeTextSubmit}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Ajouter "<span className="font-medium">{value}</span>" en
                    texte libre
                  </span>
                </div>
              </button>
            )}
          </ScrollArea>

          {/* Helper text */}
          <div className="px-3 py-2 text-[10px] text-muted-foreground border-t border-border bg-muted/30">
            <div className="flex items-center gap-4">
              <span>
                <Shield className="h-3 w-3 inline mr-1 text-green-600" />
                = Code securise ordonnance
              </span>
              <span>Raccourcis: HTA, DT2, AVC, BPCO...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMedicalInput;
