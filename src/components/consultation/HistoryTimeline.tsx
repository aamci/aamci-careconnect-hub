import React, { useState, useMemo } from 'react';
import { Edit2, Filter, Search, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { mockMedicalHistory } from '@/data/consultationMockData';
import { MedicalHistory } from '@/types/consultation';

interface HistoryTimelineProps {
  onEditHistory?: () => void;
  onFilterChange?: (filters: string[]) => void;
}

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  onEditHistory,
  onFilterChange
}) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const history = mockMedicalHistory;

  // Group history by period
  const groupedHistory = useMemo(() => {
    const groups: { [key: string]: MedicalHistory[] } = {};
    
    history.forEach((item) => {
      let periodKey: string;
      
      if (isToday(item.date)) {
        periodKey = "Aujourd'hui";
      } else {
        periodKey = format(item.date, 'MMMM yyyy', { locale: fr });
        // Capitalize first letter
        periodKey = periodKey.charAt(0).toUpperCase() + periodKey.slice(1);
      }
      
      if (!groups[periodKey]) {
        groups[periodKey] = [];
      }
      groups[periodKey].push(item);
    });
    
    return groups;
  }, [history]);

  const getTypeIcon = (type: MedicalHistory['type']) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return format(date, "EEE. d MMM.", { locale: fr });
    }
    return format(date, "EEE. d MMM.", { locale: fr });
  };

  return (
    <div className="w-[380px] h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Historique du patient</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEditHistory}
          >
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>

        {/* Filters */}
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
          Filtres
        </Button>

        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {['Rendez-vous', 'Documents', 'Biologie', 'Imagerie', 'Courriers'].map((filter) => (
              <Badge
                key={filter}
                variant={activeFilters.includes(filter) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  const newFilters = activeFilters.includes(filter)
                    ? activeFilters.filter(f => f !== filter)
                    : [...activeFilters, filter];
                  setActiveFilters(newFilters);
                  onFilterChange?.(newFilters);
                }}
              >
                {filter}
              </Badge>
            ))}
          </div>
        )}

        {/* Search in history */}
        <div className="mt-3 relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="w-full h-8 pl-8 pr-3 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Timeline Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {Object.entries(groupedHistory).map(([period, items]) => (
            <div key={period} className="mb-6">
              {/* Period Header */}
              <h3 className="text-sm font-semibold text-foreground mb-3">{period}</h3>

              {/* Items */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="group p-3 bg-muted/30 hover:bg-muted/50 rounded-lg border border-border/50 cursor-pointer transition-all duration-150"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          {getTypeIcon(item.type)}
                          <span className="sr-only">{item.type}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-muted-foreground">Rendez-vous</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-destructive flex-shrink-0" />
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.title}
                          </p>
                        </div>
                      </div>

                      {/* Date & Practitioner */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(item.date)}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">
                          {item.practitionerName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HistoryTimeline;
