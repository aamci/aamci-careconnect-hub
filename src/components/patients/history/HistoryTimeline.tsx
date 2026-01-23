/**
 * HistoryTimeline - Timeline interactive premium pour l'historique patient
 * Features: Filtres avancés, comparaison de périodes, statistiques, animations
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  FileText,
  Stethoscope,
  ClipboardList,
  MessageSquare,
  Video,
  TrendingUp,
  Filter,
  Download,
  BarChart3,
  Clock,
  User,
  Search,
  X,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { format, isToday, isYesterday, isSameDay, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
  HistoryEvent,
  HistoryEventType,
  HistoryEventCategory,
  HistoryTimelineFilters,
  HistoryStats
} from '@/types/history';

interface HistoryTimelineProps {
  events: HistoryEvent[];
  isLoading?: boolean;
  onEventClick?: (event: HistoryEvent) => void;
  showFilters?: boolean;
  showStats?: boolean;
  compactMode?: boolean;
}

// Event type configuration
const EVENT_CONFIG: Record<
  HistoryEventType,
  { icon: React.ComponentType<{ className?: string }>; color: string; label: string }
> = {
  consultation: { icon: Stethoscope, color: 'text-blue-600', label: 'Consultation' },
  document: { icon: FileText, color: 'text-purple-600', label: 'Document' },
  note: { icon: MessageSquare, color: 'text-green-600', label: 'Note' },
  prescription: { icon: ClipboardList, color: 'text-orange-600', label: 'Ordonnance' },
  certificate: { icon: FileText, color: 'text-teal-600', label: 'Certificat' },
  invoice: { icon: FileText, color: 'text-amber-600', label: 'Facture' },
  teleconsultation: { icon: Video, color: 'text-indigo-600', label: 'Téléconsultation' },
  appointment_created: { icon: Calendar, color: 'text-blue-500', label: 'RDV créé' },
  appointment_cancelled: { icon: X, color: 'text-red-500', label: 'RDV annulé' },
  appointment_rescheduled: { icon: Calendar, color: 'text-yellow-500', label: 'RDV déplacé' },
  patient_updated: { icon: User, color: 'text-gray-500', label: 'Fiche modifiée' }
};

const CATEGORY_CONFIG: Record<
  HistoryEventCategory,
  { color: string; label: string }
> = {
  clinical: { color: 'bg-blue-100 text-blue-800', label: 'Clinique' },
  administrative: { color: 'bg-purple-100 text-purple-800', label: 'Administratif' },
  communication: { color: 'bg-green-100 text-green-800', label: 'Communication' }
};

const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  events,
  isLoading = false,
  onEventClick,
  showFilters = true,
  showStats = true,
  compactMode = false
}) => {
  const [filters, setFilters] = useState<HistoryTimelineFilters>({
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
      end: new Date()
    },
    types: [],
    categories: [],
    authors: [],
    searchQuery: ''
  });
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Date range filter
    filtered = filtered.filter(
      (event) =>
        event.timestamp >= filters.dateRange.start &&
        event.timestamp <= filters.dateRange.end
    );

    // Type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter((event) => filters.types.includes(event.type));
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((event) => filters.categories.includes(event.category));
    }

    // Author filter
    if (filters.authors.length > 0) {
      filtered = filtered.filter((event) => filters.authors.includes(event.authorId));
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.authorName.toLowerCase().includes(query)
      );
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events, filters]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const grouped: Record<string, HistoryEvent[]> = {};
    filteredEvents.forEach((event) => {
      const dateKey = format(event.timestamp, 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  // Calculate stats
  const stats = useMemo((): HistoryStats => {
    const eventsByType: Record<string, number> = {};
    const eventsByCategory: Record<string, number> = {};
    const authors = new Set<string>();

    filteredEvents.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1;
      authors.add(event.authorId);
    });

    return {
      totalEvents: filteredEvents.length,
      eventsByType: eventsByType as Record<HistoryEventType, number>,
      eventsByCategory: eventsByCategory as Record<HistoryEventCategory, number>,
      uniqueAuthors: authors.size
    };
  }, [filteredEvents]);

  // Format date header
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Aujourd'hui";
    if (isYesterday(date)) return 'Hier';
    return format(date, 'EEEE d MMMM yyyy', { locale: fr });
  };

  // Export timeline
  const handleExport = () => {
    const csv = filteredEvents
      .map((event) => {
        return [
          format(event.timestamp, 'dd/MM/yyyy HH:mm'),
          EVENT_CONFIG[event.type].label,
          CATEGORY_CONFIG[event.category].label,
          event.title.replace(/,/g, ';'),
          event.authorName,
          event.description?.replace(/,/g, ';') || ''
        ].join(',');
      })
      .join('\n');

    const header = 'Date,Type,Catégorie,Titre,Auteur,Description\n';
    const blob = new Blob([header + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historique-patient-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Historique</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {stats.totalEvents} événement{stats.totalEvents > 1 ? 's' : ''} trouvé{stats.totalEvents > 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtres
              {(filters.types.length > 0 ||
                filters.categories.length > 0 ||
                filters.searchQuery) && (
                <Badge variant="default" className="ml-1 h-5 px-1 text-xs">
                  {filters.types.length + filters.categories.length + (filters.searchQuery ? 1 : 0)}
                </Badge>
              )}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exporter</span>
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Filtres avancés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans l'historique..."
                    value={filters.searchQuery || ''}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
                    }
                    className="pl-9"
                  />
                </div>

                {/* Type filters */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Types d'événements</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(EVENT_CONFIG).map(([type, config]) => (
                      <Badge
                        key={type}
                        variant={
                          filters.types.includes(type as HistoryEventType) ? 'default' : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            types: prev.types.includes(type as HistoryEventType)
                              ? prev.types.filter((t) => t !== type)
                              : [...prev.types, type as HistoryEventType]
                          }));
                        }}
                      >
                        <config.icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Category filters */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Catégories</label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
                      <Badge
                        key={category}
                        variant={
                          filters.categories.includes(category as HistoryEventCategory)
                            ? 'default'
                            : 'outline'
                        }
                        className="cursor-pointer"
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            categories: prev.categories.includes(category as HistoryEventCategory)
                              ? prev.categories.filter((c) => c !== category)
                              : [...prev.categories, category as HistoryEventCategory]
                          }));
                        }}
                      >
                        {config.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Clear filters */}
                {(filters.types.length > 0 ||
                  filters.categories.length > 0 ||
                  filters.searchQuery) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        types: [],
                        categories: [],
                        searchQuery: ''
                      }))
                    }
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Réinitialiser les filtres
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      {showStats && stats.totalEvents > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total événements</p>
                  <p className="text-2xl font-bold">{stats.totalEvents}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Consultations</p>
                  <p className="text-2xl font-bold">
                    {(stats.eventsByType.consultation || 0) +
                      (stats.eventsByType.teleconsultation || 0)}
                  </p>
                </div>
                <Stethoscope className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Documents</p>
                  <p className="text-2xl font-bold">
                    {(stats.eventsByType.document || 0) +
                      (stats.eventsByType.prescription || 0) +
                      (stats.eventsByType.certificate || 0)}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Auteurs</p>
                  <p className="text-2xl font-bold">{stats.uniqueAuthors}</p>
                </div>
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-medium">Aucun événement trouvé</p>
              <p className="text-sm mt-2">
                Essayez d'ajuster vos filtres pour afficher plus de résultats
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([dateStr, dayEvents]) => (
            <div key={dateStr} className="relative">
              {/* Date header */}
              <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold capitalize">
                      {formatDateHeader(dateStr)}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <Badge variant="secondary">{dayEvents.length} événement{dayEvents.length > 1 ? 's' : ''}</Badge>
                </div>
              </div>

              {/* Events */}
              <div className="space-y-4 pl-8 border-l-2 border-border">
                {dayEvents.map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onClick={onEventClick}
                    compact={compactMode}
                    index={index}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Event Card Component
interface EventCardProps {
  event: HistoryEvent;
  onClick?: (event: HistoryEvent) => void;
  compact?: boolean;
  index: number;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick, compact = false, index }) => {
  const config = EVENT_CONFIG[event.type];
  const categoryConfig = CATEGORY_CONFIG[event.category];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="relative -ml-[33px]"
    >
      {/* Timeline dot */}
      <div className={cn(
        'absolute left-0 top-4 w-8 h-8 rounded-full flex items-center justify-center',
        'bg-card border-2 border-border z-10'
      )}>
        <Icon className={cn('h-4 w-4', config.color)} />
      </div>

      {/* Event card */}
      <Card
        className={cn(
          'ml-12 transition-all hover:shadow-md',
          onClick && 'cursor-pointer hover:border-primary/50'
        )}
        onClick={() => onClick?.(event)}
      >
        <CardContent className={cn('p-4', compact && 'p-3')}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{event.title}</h3>
                <Badge variant="secondary" className={cn('text-xs', categoryConfig.color)}>
                  {categoryConfig.label}
                </Badge>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {format(event.timestamp, 'HH:mm')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{event.authorName}</span>
            </div>
            {event.authorRole && (
              <Badge variant="outline" className="text-xs">
                {event.authorRole}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HistoryTimeline;
