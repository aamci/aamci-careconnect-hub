import React, { useMemo } from 'react';
import { CalendarDays, Hourglass, Video, CheckCircle2 } from 'lucide-react';
import { isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { TeleconsultationWithRelations } from '@/types/teleconsultation';

export type FilterTab = 'today' | 'upcoming' | 'past' | 'all';

interface TeleconsultationStatsBarProps {
  teleconsultations: TeleconsultationWithRelations[];
  activeFilter: FilterTab;
  onFilterChange: (filter: FilterTab) => void;
}

const statsConfig: {
  key: FilterTab | 'waiting' | 'in_progress';
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  filterTarget?: FilterTab;
}[] = [
  { key: 'today', label: "Aujourd'hui", icon: CalendarDays, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', filterTarget: 'today' },
  { key: 'waiting', label: 'En attente', icon: Hourglass, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  { key: 'in_progress', label: 'En cours', icon: Video, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  { key: 'past', label: 'Terminees', icon: CheckCircle2, iconBg: 'bg-muted', iconColor: 'text-muted-foreground', filterTarget: 'past' },
];

export function TeleconsultationStatsBar({
  teleconsultations,
  activeFilter,
  onFilterChange,
}: TeleconsultationStatsBarProps) {
  const counts = useMemo(() => {
    let today = 0;
    let waiting = 0;
    let inProgress = 0;
    let completed = 0;

    for (const tc of teleconsultations) {
      if (isToday(new Date(tc.scheduled_start)) || tc.status === 'in_progress') {
        today++;
      }
      if (tc.status === 'waiting' || tc.status === 'ready') {
        waiting++;
      }
      if (tc.status === 'in_progress') {
        inProgress++;
      }
      if (tc.status === 'completed') {
        completed++;
      }
    }

    return { today, waiting, in_progress: inProgress, past: completed };
  }, [teleconsultations]);

  return (
    <div className="grid grid-cols-4 gap-2">
      {statsConfig.map(({ key, label, icon: Icon, iconBg, iconColor, filterTarget }) => {
        const count = counts[key as keyof typeof counts] ?? 0;
        const isActive = filterTarget && activeFilter === filterTarget;
        const isWaitingPulsing = key === 'waiting' && count > 0;

        return (
          <button
            key={key}
            onClick={() => filterTarget && onFilterChange(filterTarget)}
            className={cn(
              'bg-card border rounded-lg p-2.5 flex items-center gap-2.5 transition-all text-left',
              filterTarget && 'cursor-pointer hover:shadow-sm',
              !filterTarget && 'cursor-default',
              isActive && 'border-primary/50 ring-1 ring-primary/30 bg-primary/5'
            )}
          >
            <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
              <Icon className={cn('h-4 w-4', iconColor, isWaitingPulsing && 'animate-pulse')} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-bold leading-tight">{count}</p>
              <p className="text-[10px] text-muted-foreground truncate">{label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
