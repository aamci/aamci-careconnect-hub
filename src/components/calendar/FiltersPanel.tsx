import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { mockMotifs, mockPractitioners } from '@/data/mockData';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FiltersPanelProps {
  selectedMotifs: string[];
  onMotifsChange: (motifs: string[]) => void;
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  selectedPractitioners: string[];
  onPractitionersChange: (practitioners: string[]) => void;
  isCollapsed?: boolean;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  selectedMotifs,
  onMotifsChange,
  selectedStatuses,
  onStatusesChange,
  selectedPractitioners,
  onPractitionersChange,
  isCollapsed = false,
}) => {
  const [expandedSections, setExpandedSections] = React.useState({
    statuses: false,
    motifs: false,
    agendas: false,
  });

  const [motifSearch, setMotifSearch] = React.useState('');
  const sectionRefs = React.useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const [showCounters, setShowCounters] = React.useState({
    statuses: true,
    motifs: true,
    agendas: true,
  });

  const statuses = [
    { id: 'all', label: 'Tous', color: 'bg-foreground' },
    { id: 'scheduled', label: 'À venir', color: 'bg-muted' },
    { id: 'waiting', label: 'En salle d\'attente', color: 'bg-warning' },
    { id: 'in-progress', label: 'En consultation', color: 'bg-primary-light' },
    { id: 'completed', label: 'Vu', color: 'bg-success' },
    { id: 'absent-excused', label: 'Absent excusé', color: 'bg-muted-foreground' },
    { id: 'absent-unexcused', label: 'Absent non excusé', color: 'bg-destructive' },
    { id: 'to-reschedule', label: 'À déplacer', color: 'bg-accent' },
  ];

  const actualStatuses = statuses.filter(s => s.id !== 'all');

  // Dynamic counter visibility check
  React.useEffect(() => {
    const checkCounterVisibility = () => {
      const headerWidth = 160; // Approximate minimum header text width
      Object.keys(sectionRefs.current).forEach((key) => {
        const ref = sectionRefs.current[key];
        if (ref) {
          const availableWidth = ref.offsetWidth - headerWidth - 48; // 48px for chevron and padding
          setShowCounters(prev => ({
            ...prev,
            [key]: availableWidth > 40, // Need at least 40px for counter
          }));
        }
      });
    };

    checkCounterVisibility();
    window.addEventListener('resize', checkCounterVisibility);
    return () => window.removeEventListener('resize', checkCounterVisibility);
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleMotif = (motifId: string) => {
    if (selectedMotifs.includes(motifId)) {
      onMotifsChange(selectedMotifs.filter(id => id !== motifId));
    } else {
      onMotifsChange([...selectedMotifs, motifId]);
    }
  };

  const toggleStatus = (statusId: string) => {
    if (statusId === 'all') {
      if (selectedStatuses.length === actualStatuses.length) {
        onStatusesChange([]);
      } else {
        onStatusesChange(actualStatuses.map(s => s.id));
      }
      return;
    }
    if (selectedStatuses.includes(statusId)) {
      onStatusesChange(selectedStatuses.filter(id => id !== statusId));
    } else {
      onStatusesChange([...selectedStatuses, statusId]);
    }
  };

  const toggleAllMotifs = () => {
    if (selectedMotifs.length === mockMotifs.length) {
      onMotifsChange([]);
    } else {
      onMotifsChange(mockMotifs.map(m => m.id));
    }
  };

  const toggleAllPractitioners = () => {
    if (selectedPractitioners.length === mockPractitioners.length) {
      onPractitionersChange([]);
    } else {
      onPractitionersChange(mockPractitioners.map(p => p.id));
    }
  };

  const filteredMotifs = mockMotifs.filter(motif =>
    motif.name.toLowerCase().includes(motifSearch.toLowerCase())
  );

  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Status Filters */}
      <div className="panel-card overflow-hidden">
        <button 
          ref={(el) => { sectionRefs.current.statuses = el; }}
          onClick={() => toggleSection('statuses')}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:bg-muted/50 transition-colors"
        >
          <span>Statuts</span>
          <div className="flex items-center gap-2">
            {showCounters.statuses && (
              <span className="text-[10px] font-medium text-muted-foreground/70">
                ({selectedStatuses.length}/{actualStatuses.length})
              </span>
            )}
            {expandedSections.statuses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        
        {expandedSections.statuses && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-3 pb-3 space-y-1.5"
          >
            {statuses.map((status) => {
              const isAll = status.id === 'all';
              const isChecked = isAll 
                ? selectedStatuses.length === actualStatuses.length 
                : selectedStatuses.includes(status.id);
              
              return (
                <label 
                  key={status.id}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer group py-1 px-1 rounded-md hover:bg-muted/50 transition-colors",
                    isAll && "border-b border-border pb-2 mb-1"
                  )}
                >
                  <Checkbox 
                    checked={isChecked}
                    onCheckedChange={() => toggleStatus(status.id)}
                    className="h-4 w-4"
                  />
                  <span className={cn('w-2 h-2 rounded-full', status.color)} />
                  <span className={cn(
                    "text-xs group-hover:text-foreground transition-colors",
                    isAll ? "font-medium text-foreground" : "text-muted-foreground"
                  )}>
                    {status.label}
                  </span>
                </label>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Motif Filters */}
      <div className="panel-card overflow-hidden">
        <button 
          ref={(el) => { sectionRefs.current.motifs = el; }}
          onClick={() => toggleSection('motifs')}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:bg-muted/50 transition-colors"
        >
          <span>Motifs de consultation</span>
          <div className="flex items-center gap-2">
            {showCounters.motifs && (
              <span className="text-[10px] font-medium text-muted-foreground/70">
                ({selectedMotifs.length}/{mockMotifs.length})
              </span>
            )}
            {expandedSections.motifs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        
        {expandedSections.motifs && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-3 pb-3 space-y-2"
          >
            {/* Search field */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={motifSearch}
                onChange={(e) => setMotifSearch(e.target.value)}
                className="h-7 pl-7 text-xs"
              />
            </div>

            {/* Select All */}
            <label className="flex items-center gap-2 cursor-pointer group pb-2 border-b border-border px-1">
              <Checkbox 
                checked={selectedMotifs.length === mockMotifs.length}
                onCheckedChange={toggleAllMotifs}
                className="h-4 w-4"
              />
              <span className="text-xs font-medium group-hover:text-foreground transition-colors">
                Tous
              </span>
            </label>

            {/* Scrollable list */}
            <div className="max-h-[150px] overflow-y-auto custom-scrollbar space-y-1">
              {filteredMotifs.map((motif) => (
                <label 
                  key={motif.id}
                  className="flex items-center gap-2 cursor-pointer group py-1 px-1 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox 
                    checked={selectedMotifs.includes(motif.id)}
                    onCheckedChange={() => toggleMotif(motif.id)}
                    className="h-4 w-4"
                  />
                  <span 
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: motif.color }}
                  />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
                    {motif.name}
                  </span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Agendas Filter (replaces Practitioners) */}
      <div className="panel-card overflow-hidden">
        <button 
          ref={(el) => { sectionRefs.current.agendas = el; }}
          onClick={() => toggleSection('agendas')}
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide hover:bg-muted/50 transition-colors"
        >
          <span>Agendas</span>
          <div className="flex items-center gap-2">
            {showCounters.agendas && (
              <span className="text-[10px] font-medium text-muted-foreground/70">
                ({selectedPractitioners.length}/{mockPractitioners.length})
              </span>
            )}
            {expandedSections.agendas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>
        
        {expandedSections.agendas && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-3 pb-3 space-y-2"
          >
            {/* Select All */}
            <label className="flex items-center gap-2 cursor-pointer group pb-2 border-b border-border px-1">
              <Checkbox 
                checked={selectedPractitioners.length === mockPractitioners.length}
                onCheckedChange={toggleAllPractitioners}
                className="h-4 w-4"
              />
              <span className="text-xs font-medium group-hover:text-foreground transition-colors">
                Tous
              </span>
            </label>

            {/* Practitioners sub-group */}
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider px-1">
                Praticiens
              </span>
              <div className="max-h-[120px] overflow-y-auto custom-scrollbar space-y-1">
                {mockPractitioners.map((pract) => (
                  <label 
                    key={pract.id}
                    className="flex items-center gap-2 cursor-pointer group py-1 px-1 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox 
                      checked={selectedPractitioners.includes(pract.id)}
                      onCheckedChange={() => {
                        if (selectedPractitioners.includes(pract.id)) {
                          onPractitionersChange(selectedPractitioners.filter(id => id !== pract.id));
                        } else {
                          onPractitionersChange([...selectedPractitioners, pract.id]);
                        }
                      }}
                      className="h-4 w-4"
                    />
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: pract.color }}
                    />
                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
                      {pract.title} {pract.lastName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
      </motion.div>
        )}
      </div>
    </div>
  );
};

export default FiltersPanel;
