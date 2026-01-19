/**
 * EventTimeline - Main timeline component
 * Displays events in a chronological timeline grouped by month
 */

import React, { useMemo } from 'react';
import { format, isSameMonth, isSameYear } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { TimelineEvent } from '@/types/timeline';
import TimelineEventCard from './TimelineEventCard';

interface EventTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  onViewDetails?: (event: TimelineEvent) => void;
  onViewDocument?: (documentId: string) => void;
  onDownloadDocument?: (documentId: string) => void;
  searchHighlight?: string;
  emptyMessage?: string;
}

interface GroupedEvents {
  key: string;
  label: string;
  events: TimelineEvent[];
}

const EventTimeline: React.FC<EventTimelineProps> = ({
  events,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  onViewDetails,
  onViewDocument,
  onDownloadDocument,
  searchHighlight,
  emptyMessage = "Aucun événement dans l'historique",
}) => {
  // Group events by month
  const groupedEvents = useMemo((): GroupedEvents[] => {
    if (!events || events.length === 0) return [];

    const groups: Map<string, TimelineEvent[]> = new Map();

    events.forEach((event) => {
      const date = new Date(event.created_at);
      const key = format(date, 'yyyy-MM');
      const existing = groups.get(key) || [];
      existing.push(event);
      groups.set(key, existing);
    });

    return Array.from(groups.entries())
      .map(([key, groupEvents]) => {
        const date = new Date(key + '-01');
        const now = new Date();

        let label: string;
        if (isSameMonth(date, now) && isSameYear(date, now)) {
          label = 'Ce mois-ci';
        } else if (isSameYear(date, now)) {
          label = format(date, 'MMMM', { locale: fr });
        } else {
          label = format(date, 'MMMM yyyy', { locale: fr });
        }

        return {
          key,
          label: label.charAt(0).toUpperCase() + label.slice(1),
          events: groupEvents,
        };
      })
      .sort((a, b) => b.key.localeCompare(a.key));
  }, [events]);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Month header skeleton */}
        <Skeleton className="h-6 w-32" />

        {/* Event cards skeleton */}
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Skeleton className="h-6 w-40" />

        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty state
  if (groupedEvents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <History className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Aucun événement
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvents.map((group) => (
        <div key={group.key}>
          {/* Month header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-sm font-medium text-muted-foreground px-3 py-1 rounded-full bg-muted">
              {group.label}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Events for this month */}
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {group.events.map((event) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  onViewDetails={() => onViewDetails?.(event)}
                  onViewDocument={onViewDocument}
                  onDownloadDocument={onDownloadDocument}
                  searchHighlight={searchHighlight}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Load more button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
            className="gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Charger plus
              </>
            )}
          </Button>
        </div>
      )}

      {/* Loading more indicator */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default EventTimeline;
