/**
 * TimelineFilterBar - Filter and search for timeline events
 */

import React, { useState, useCallback } from 'react';
import { Search, X, Filter, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { TimelineFilters, TimelineEventType, EVENT_TYPE_CONFIG } from '@/types/timeline';
import { useDebouncedCallback } from 'use-debounce';

interface TimelineFilterBarProps {
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  totalCount?: number;
  filteredCount?: number;
}

const EVENT_TYPES: { value: TimelineEventType; label: string }[] = [
  { value: 'appointment', label: 'Rendez-vous' },
  { value: 'document_received', label: 'Documents reçus' },
  { value: 'document_created', label: 'Documents créés' },
  { value: 'clinical_note', label: 'Notes cliniques' },
  { value: 'prescription', label: 'Ordonnances' },
  { value: 'lab_result', label: 'Analyses' },
  { value: 'imaging', label: 'Imagerie' },
  { value: 'letter', label: 'Courriers' },
];

const TimelineFilterBar: React.FC<TimelineFilterBarProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}) => {
  const [searchValue, setSearchValue] = useState(filters.searchQuery || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounced search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onFiltersChange({ ...filters, searchQuery: value || undefined });
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleTypeToggle = useCallback(
    (type: TimelineEventType) => {
      const currentTypes = filters.types || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
      onFiltersChange({ ...filters, types: newTypes.length > 0 ? newTypes : undefined });
    },
    [filters, onFiltersChange]
  );

  const handleClearFilter = (filterKey: keyof TimelineFilters) => {
    const newFilters = { ...filters };
    delete newFilters[filterKey];
    onFiltersChange(newFilters);
  };

  const handleClearAllFilters = () => {
    setSearchValue('');
    onFiltersChange({});
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateFrom: date });
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, dateTo: date });
  };

  // Count active filters
  const activeFilterCount =
    (filters.types?.length || 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    (filters.searchQuery ? 1 : 0) +
    (filters.statuses?.length || 0);

  const hasFilters = activeFilterCount > 0;

  return (
    <div className="space-y-3">
      {/* Main filter bar */}
      <div className="flex items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans l'historique..."
            value={searchValue}
            onChange={handleSearchChange}
            className="pl-9 pr-9"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
              onClick={() => {
                setSearchValue('');
                handleClearFilter('searchQuery');
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Type filter dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              Tous les types
              <ChevronDown className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="start">
            <div className="space-y-1">
              {EVENT_TYPES.map((type) => (
                <div
                  key={type.value}
                  className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer"
                  onClick={() => handleTypeToggle(type.value)}
                >
                  <Checkbox
                    checked={filters.types?.includes(type.value) || false}
                    onCheckedChange={() => handleTypeToggle(type.value)}
                  />
                  <Label className="text-sm cursor-pointer flex-1">
                    {type.label}
                  </Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Advanced filters button */}
        <Button
          variant={showAdvanced ? 'secondary' : 'outline'}
          className="gap-2"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <Filter className="h-4 w-4" />
          Filtres
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Clear all */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleClearAllFilters}
          >
            Effacer tout
          </Button>
        )}

        {/* Results count */}
        {filteredCount !== undefined && totalCount !== undefined && (
          <span className="text-sm text-muted-foreground ml-auto">
            {filteredCount === totalCount
              ? `${totalCount} élément${totalCount > 1 ? 's' : ''}`
              : `${filteredCount} sur ${totalCount}`}
          </span>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type filters */}
          {filters.types?.map((type) => {
            const config = EVENT_TYPE_CONFIG[type];
            return (
              <Badge
                key={type}
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
                onClick={() => handleTypeToggle(type)}
              >
                {config.label}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            );
          })}

          {/* Date from */}
          {filters.dateFrom && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => handleClearFilter('dateFrom')}
            >
              Depuis {format(filters.dateFrom, 'dd/MM/yyyy')}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}

          {/* Date to */}
          {filters.dateTo && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => handleClearFilter('dateTo')}
            >
              Jusqu'au {format(filters.dateTo, 'dd/MM/yyyy')}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}

          {/* Search query */}
          {filters.searchQuery && (
            <Badge
              variant="secondary"
              className="gap-1 pr-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => {
                setSearchValue('');
                handleClearFilter('searchQuery');
              }}
            >
              "{filters.searchQuery}"
              <X className="h-3 w-3 ml-1" />
            </Badge>
          )}
        </div>
      )}

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
          <h4 className="text-sm font-medium">Filtres avancés</h4>

          <div className="grid grid-cols-2 gap-4">
            {/* Date from */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">À partir du</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateFrom && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateFrom
                      ? format(filters.dateFrom, 'dd/MM/yyyy')
                      : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateFrom}
                    onSelect={handleDateFromChange}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date to */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Jusqu'au</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !filters.dateTo && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {filters.dateTo
                      ? format(filters.dateTo, 'dd/MM/yyyy')
                      : 'Sélectionner'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateTo}
                    onSelect={handleDateToChange}
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Quick date ranges */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                onFiltersChange({
                  ...filters,
                  dateFrom: startOfMonth,
                  dateTo: undefined,
                });
              }}
            >
              Ce mois
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = new Date();
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                onFiltersChange({
                  ...filters,
                  dateFrom: startOfYear,
                  dateTo: undefined,
                });
              }}
            >
              Cette année
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const now = new Date();
                const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                onFiltersChange({
                  ...filters,
                  dateFrom: oneYearAgo,
                  dateTo: undefined,
                });
              }}
            >
              12 derniers mois
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineFilterBar;
