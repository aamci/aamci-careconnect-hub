import React from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { mockMotifs, mockPractitioners } from '@/data/mockData';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FiltersPanelProps {
  selectedMotifs: string[];
  onMotifsChange: (motifs: string[]) => void;
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  selectedPractitioners: string[];
  onPractitionersChange: (practitioners: string[]) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  selectedMotifs,
  onMotifsChange,
  selectedStatuses,
  onStatusesChange,
  selectedPractitioners,
  onPractitionersChange,
}) => {
  const [expandedSections, setExpandedSections] = React.useState({
    statuses: true,
    motifs: true,
    practitioners: false,
  });

  const statuses = [
    { id: 'scheduled', label: 'Planifié', color: 'bg-muted' },
    { id: 'waiting', label: 'En salle d\'attente', color: 'bg-warning' },
    { id: 'in-progress', label: 'En consultation', color: 'bg-primary-light' },
    { id: 'completed', label: 'Vu', color: 'bg-success' },
    { id: 'absent-excused', label: 'Absent excusé', color: 'bg-muted-foreground' },
    { id: 'absent-unexcused', label: 'Absent non excusé', color: 'bg-destructive' },
  ];

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

  return (
    <div className="space-y-4">
      {/* Status Filters */}
      <div className="panel-card">
        <button 
          onClick={() => toggleSection('statuses')}
          className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide"
        >
          Statuts
          {expandedSections.statuses ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.statuses && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-3 pb-3 space-y-2"
          >
            {statuses.map((status) => (
              <label 
                key={status.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <Checkbox 
                  checked={selectedStatuses.includes(status.id)}
                  onCheckedChange={() => toggleStatus(status.id)}
                  className="h-4 w-4"
                />
                <span className={cn('w-2 h-2 rounded-full', status.color)} />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {status.label}
                </span>
              </label>
            ))}
          </motion.div>
        )}
      </div>

      {/* Motif Filters */}
      <div className="panel-card">
        <button 
          onClick={() => toggleSection('motifs')}
          className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide"
        >
          Motifs de consultation
          {expandedSections.motifs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.motifs && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-3 pb-3 space-y-2"
          >
            {/* Select All */}
            <label className="flex items-center gap-2 cursor-pointer group pb-2 border-b border-border">
              <Checkbox 
                checked={selectedMotifs.length === mockMotifs.length}
                onCheckedChange={toggleAllMotifs}
                className="h-4 w-4"
              />
              <span className="text-xs font-medium group-hover:text-foreground transition-colors">
                Tous
              </span>
            </label>

            {mockMotifs.map((motif) => (
              <label 
                key={motif.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <Checkbox 
                  checked={selectedMotifs.includes(motif.id)}
                  onCheckedChange={() => toggleMotif(motif.id)}
                  className="h-4 w-4"
                />
                <span 
                  className="w-2.5 h-2.5 rounded-sm" 
                  style={{ backgroundColor: motif.color }}
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate">
                  {motif.name}
                </span>
              </label>
            ))}
          </motion.div>
        )}
      </div>

      {/* Practitioners Filter */}
      <div className="panel-card">
        <button 
          onClick={() => toggleSection('practitioners')}
          className="w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wide"
        >
          Praticiens
          {expandedSections.practitioners ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {expandedSections.practitioners && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="px-3 pb-3 space-y-2"
          >
            {mockPractitioners.map((pract) => (
              <label 
                key={pract.id}
                className="flex items-center gap-2 cursor-pointer group"
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
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: pract.color }}
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                  {pract.title} {pract.lastName}
                </span>
              </label>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FiltersPanel;
