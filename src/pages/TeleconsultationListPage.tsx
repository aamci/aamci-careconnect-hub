import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Video,
  Calendar,
  Clock,
  User,
  Search,
  X,
  ChevronRight,
  Loader2,
  AlertCircle,
  Hourglass,
  Circle,
  Copy,
  CheckCircle2,
  Link2,
  TriangleAlert,
} from 'lucide-react';
import { format, isToday, isAfter, startOfDay, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTeleconsultations } from '@/hooks/data/useTeleconsultation';
import type { TeleconsultationWithRelations, TeleconsultationStatus } from '@/types/teleconsultation';
import { TeleconsultationStatsBar, FilterTab } from '@/components/teleconsultation/TeleconsultationStatsBar';
import { WaitingRoomSection } from '@/components/teleconsultation/WaitingRoomSection';
import { TeleconsultationDetailPanel } from '@/components/teleconsultation/TeleconsultationDetailPanel';
import { StatusWorkflowBadge } from '@/components/teleconsultation/StatusWorkflowBadge';

const filterLabels: Record<FilterTab, string> = {
  today: "Aujourd'hui",
  upcoming: 'A venir',
  past: 'Passees',
  all: 'Toutes',
};

const TeleconsultationListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [activeFilter, setActiveFilter] = useState<FilterTab>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTc, setSelectedTc] = useState<TeleconsultationWithRelations | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Data
  const { data: teleconsultations = [], isLoading, error } = useTeleconsultations();

  // Waiting patients
  const waitingPatients = useMemo(
    () => teleconsultations.filter((tc) => tc.status === 'waiting' || tc.status === 'ready'),
    [teleconsultations]
  );

  // Filtered list
  const filtered = useMemo(() => {
    const tomorrowStart = startOfDay(addDays(new Date(), 1));

    return teleconsultations.filter((tc) => {
      const scheduledDate = new Date(tc.scheduled_start);

      // Tab filter
      let matchesTab = true;
      switch (activeFilter) {
        case 'today':
          matchesTab = isToday(scheduledDate) || tc.status === 'in_progress';
          break;
        case 'upcoming':
          matchesTab =
            isAfter(scheduledDate, tomorrowStart) &&
            !['completed', 'cancelled', 'failed'].includes(tc.status);
          break;
        case 'past':
          matchesTab = ['completed', 'cancelled', 'failed'].includes(tc.status);
          break;
        case 'all':
          matchesTab = true;
          break;
      }

      // Search filter
      const matchesSearch =
        !searchQuery ||
        `${tc.patient?.firstName || ''} ${tc.patient?.lastName || ''} ${tc.consultation_reason || ''}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [teleconsultations, activeFilter, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    const tomorrowStart = startOfDay(addDays(new Date(), 1));
    const counts: Record<FilterTab, number> = { today: 0, upcoming: 0, past: 0, all: teleconsultations.length };

    for (const tc of teleconsultations) {
      const scheduledDate = new Date(tc.scheduled_start);
      if (isToday(scheduledDate) || tc.status === 'in_progress') counts.today++;
      if (isAfter(scheduledDate, tomorrowStart) && !['completed', 'cancelled', 'failed'].includes(tc.status))
        counts.upcoming++;
      if (['completed', 'cancelled', 'failed'].includes(tc.status)) counts.past++;
    }

    return counts;
  }, [teleconsultations]);

  // Detect scheduling conflicts (two active teleconsultations overlapping)
  const conflictIds = useMemo(() => {
    const ids = new Set<string>();
    const activeStatuses = ['scheduled', 'waiting', 'ready', 'in_progress'];
    const activeTcs = teleconsultations.filter((tc) => activeStatuses.includes(tc.status));

    for (let i = 0; i < activeTcs.length; i++) {
      for (let j = i + 1; j < activeTcs.length; j++) {
        const a = activeTcs[i];
        const b = activeTcs[j];
        const aStart = new Date(a.scheduled_start).getTime();
        const aEnd = aStart + (a.duration_minutes || 20) * 60 * 1000;
        const bStart = new Date(b.scheduled_start).getTime();
        const bEnd = bStart + (b.duration_minutes || 20) * 60 * 1000;

        if (aStart < bEnd && bStart < aEnd) {
          ids.add(a.id);
          ids.add(b.id);
        }
      }
    }
    return ids;
  }, [teleconsultations]);

  // Handlers
  const openDetail = (tc: TeleconsultationWithRelations) => {
    setSelectedTc(tc);
    setDetailOpen(true);
  };

  const handleJoin = (teleconsultationId: string) => {
    const tc = teleconsultations.find((t) => t.id === teleconsultationId);
    if (!tc) return;
    navigate(`/visio/${teleconsultationId}?token=${tc.room_token}&type=practitioner`);
  };

  const handleCopyLink = (tc: TeleconsultationWithRelations) => {
    navigator.clipboard.writeText(tc.patient_link);
    toast.success('Lien patient copie');
  };

  const getStatusDot = (status: TeleconsultationStatus) => {
    if (status === 'in_progress') return 'bg-green-500 animate-pulse';
    if (status === 'waiting' || status === 'ready') return 'bg-amber-500 animate-pulse';
    if (status === 'completed') return 'bg-muted-foreground/40';
    if (status === 'cancelled' || status === 'failed') return 'bg-destructive/60';
    return 'bg-blue-500';
  };

  return (
    <MainLayout activeNav="teleconsult" onNavChange={(nav) => navigate(nav === 'agenda' ? '/' : `/${nav}`)}>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* ======== STICKY HEADER ======== */}
        <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="px-6 py-4">
            {/* Title row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Video className="h-4.5 w-4.5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Teleconsultations</h1>
                  <p className="text-xs text-muted-foreground">
                    {teleconsultations.length} session{teleconsultations.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate('/')} className="gap-2" size="sm">
                <Calendar className="h-4 w-4" />
                Creer depuis l'agenda
              </Button>
            </div>

            {/* Stats cards */}
            <TeleconsultationStatsBar
              teleconsultations={teleconsultations}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />

            {/* Search + filter tabs */}
            <div className="flex items-center gap-2 mt-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un patient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex gap-1 ml-auto">
                {(Object.keys(filterLabels) as FilterTab[]).map((tab) => (
                  <Button
                    key={tab}
                    variant={activeFilter === tab ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveFilter(tab)}
                    className="gap-1 h-8 text-xs"
                  >
                    {filterLabels[tab]}
                    {tabCounts[tab] > 0 && (
                      <Badge
                        variant={activeFilter === tab ? 'secondary' : 'outline'}
                        className="ml-0.5 h-4 min-w-4 px-1 text-[10px]"
                      >
                        {tabCounts[tab]}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 px-6 py-1.5 bg-muted/30 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-t border-border/50">
            <span className="w-5" />
            <span className="flex-1 min-w-0">Patient</span>
            <span className="w-36 hidden md:block">Date / Heure</span>
            <span className="w-40 hidden lg:block">Motif</span>
            <span className="w-24 text-center">Statut</span>
            <span className="w-20 text-center hidden md:block">Duree</span>
            <span className="w-20 text-center hidden md:block">Actions</span>
            <span className="w-5" />
          </div>
        </div>

        {/* ======== SCROLLABLE CONTENT ======== */}
        <div className="flex-1 overflow-y-auto">
          {/* Waiting room section */}
          {waitingPatients.length > 0 && (
            <div className="px-6 py-3 border-b border-border bg-teal-50/20">
              <WaitingRoomSection waitingPatients={waitingPatients} onJoin={handleJoin} />
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-sm font-medium text-destructive">Erreur de chargement</p>
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                Reessayer
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center">
                <Video className="h-7 w-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {activeFilter === 'today' && "Aucune teleconsultation prevue aujourd'hui"}
                {activeFilter === 'upcoming' && 'Aucune teleconsultation a venir'}
                {activeFilter === 'past' && 'Aucun historique de teleconsultation'}
                {activeFilter === 'all' && 'Aucune teleconsultation'}
              </p>
              <p className="text-xs text-muted-foreground">
                Creez une teleconsultation depuis l'agenda
              </p>
              <Button onClick={() => navigate('/')} variant="outline" size="sm" className="gap-1.5 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                Aller a l'agenda
              </Button>
            </div>
          )}

          {/* Session list */}
          {!isLoading && !error && filtered.length > 0 && (
            <div className="divide-y divide-border/50">
              {filtered.map((tc) => {
                const scheduledDate = new Date(tc.scheduled_start);
                const canJoin = ['waiting', 'ready', 'in_progress'].includes(tc.status);
                const isSelected = selectedTc?.id === tc.id && detailOpen;

                // Compute duration for completed sessions
                let durationDisplay = '';
                if (tc.actual_start && tc.actual_end) {
                  const mins = Math.round(
                    (new Date(tc.actual_end).getTime() - new Date(tc.actual_start).getTime()) / 60000
                  );
                  durationDisplay = `${mins} min`;
                } else if (tc.status === 'in_progress' && tc.actual_start) {
                  const mins = Math.round(
                    (Date.now() - new Date(tc.actual_start).getTime()) / 60000
                  );
                  durationDisplay = `${mins} min`;
                } else if (tc.duration_minutes) {
                  durationDisplay = `~${tc.duration_minutes} min`;
                }

                return (
                  <div
                    key={tc.id}
                    onClick={() => openDetail(tc)}
                    className={cn(
                      'flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-muted/40 group transition-all',
                      isSelected && 'bg-primary/5 border-l-2 border-l-primary'
                    )}
                  >
                    {/* Status dot */}
                    <div className="w-5 flex items-center justify-center">
                      <div className={cn('h-2.5 w-2.5 rounded-full', getStatusDot(tc.status))} />
                    </div>

                    {/* Patient name + RDV link + conflict */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">
                          {tc.patient?.firstName} {tc.patient?.lastName}
                        </p>
                        {conflictIds.has(tc.id) && (
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                            <TriangleAlert className="h-2.5 w-2.5" />
                            Conflit
                          </span>
                        )}
                      </div>
                      {tc.appointment_id ? (
                        <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                          <Link2 className="h-2.5 w-2.5 flex-shrink-0" />
                          Lie au RDV du {format(scheduledDate, 'dd/MM a HH:mm', { locale: fr })}
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/60 truncate md:hidden">
                          {tc.consultation_reason || 'Orpheline (sans RDV)'}
                        </p>
                      )}
                    </div>

                    {/* Date/time */}
                    <div className="w-36 hidden md:block">
                      <p className="text-sm">
                        {isToday(scheduledDate)
                          ? format(scheduledDate, 'HH:mm', { locale: fr })
                          : format(scheduledDate, 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>

                    {/* Motif */}
                    <div className="w-40 hidden lg:block">
                      <p className="text-sm text-muted-foreground truncate">
                        {tc.consultation_reason || '-'}
                      </p>
                    </div>

                    {/* Status badge */}
                    <div className="w-28 text-center">
                      <StatusWorkflowBadge status={tc.status} size="sm" />
                    </div>

                    {/* Duration */}
                    <div className="w-20 text-center hidden md:block">
                      <span className="text-xs text-muted-foreground">{durationDisplay || '-'}</span>
                    </div>

                    {/* Quick actions */}
                    <div className="w-20 text-center hidden md:flex items-center justify-center gap-1">
                      {canJoin && (
                        <Button
                          variant="default"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoin(tc.id);
                          }}
                        >
                          <Video className="h-3 w-3" />
                          Visio
                        </Button>
                      )}
                      {!canJoin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyLink(tc);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      )}
                    </div>

                    {/* Chevron */}
                    <div className="w-5 flex items-center justify-center">
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======== DETAIL SHEET ======== */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-6">
          <SheetHeader className="sr-only">
            <SheetTitle>Detail teleconsultation</SheetTitle>
          </SheetHeader>
          {selectedTc && (
            <TeleconsultationDetailPanel
              teleconsultation={selectedTc}
              onClose={() => setDetailOpen(false)}
              onJoin={handleJoin}
            />
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default TeleconsultationListPage;
