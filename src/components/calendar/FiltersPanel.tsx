import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { mockMotifs, mockPractitioners } from '@/data/mockData';
import { ChevronDown, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MiniCalendar from './MiniCalendar';

interface FiltersPanelProps {
  selectedMotifs: string[];
  onMotifsChange: (motifs: string[]) => void;
  selectedStatuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  selectedPractitioners: string[];
  onPractitionersChange: (practitioners: string[]) => void;
  currentDate?: Date;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  appointments?: any[];
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  selectedMotifs,
  onMotifsChange,
  selectedStatuses,
  onStatusesChange,
  selectedPractitioners,
  onPractitionersChange,
  currentDate = new Date(),
  selectedDate = new Date(),
  onSelectDate,
  appointments = [],
}) => {
  const [expandedSections, setExpandedSections] = React.useState({
    agendas: true,
    statuses: true,
    motifs: false,
  });

  const statuses = [
    { id: 'all', label: 'Tous', color: 'bg-primary' },
    { id: 'scheduled', label: 'À venir', color: 'bg-muted-foreground' },
    { id: 'waiting', label: 'En salle d\'attente', color: 'bg-warning' },
    { id: 'in-progress', label: 'En consultation', color: 'bg-primary-light' },
    { id: 'completed', label: 'Vu', color: 'bg-success' },
    { id: 'absent-unexcused', label: 'Absent non excusé', color: 'bg-destructive' },
    { id: 'absent-excused', label: 'Absent excusé', color: 'bg-muted-foreground/50' },
    { id: 'to-reschedule', label: 'À déplacer', color: 'bg-warning-light' },
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
    if (statusId === 'all') {
      const allStatusIds = statuses.filter(s => s.id !== 'all').map(s => s.id);
      if (selectedStatuses.length === allStatusIds.length) {
        onStatusesChange([]);
      } else {
        onStatusesChange(allStatusIds);
      }
      return;
    }
    
    if (selectedStatuses.includes(statusId)) {
      onStatusesChange(selectedStatuses.filter(id => id !== statusId));
    } else {
      onStatusesChange([...selectedStatuses, statusId]);
    }
  };

  const togglePractitioner = (practId: string) => {
    if (selectedPractitioners.includes(practId)) {
      onPractitionersChange(selectedPractitioners.filter(id => id !== practId));
    } else {
      onPractitionersChange([...selectedPractitioners, practId]);
    }
  };

  const toggleAllPractitioners = () => {
    if (selectedPractitioners.length === mockPractitioners.length) {
      onPractitionersChange([]);
    } else {
      onPractitionersChange(mockPractitioners.map(p => p.id));
    }
  };

  const toggleAllMotifs = () => {
    if (selectedMotifs.length === mockMotifs.length) {
      onMotifsChange([]);
    } else {
      onMotifsChange(mockMotifs.map(m => m.id));
    }
  };

  const allStatusesSelected = selectedStatuses.length === statuses.filter(s => s.id !== 'all').length;

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Primary Action Button */}
      <div className="p-4 border-b border-border">
        <Button 
          className="w-full bg-accent hover:bg-accent-light text-accent-foreground font-semibold py-2.5 rounded-md flex items-center justify-center gap-2"
        >
          TROUVER UN CRÉNEAU
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>

      {/* Mini Calendar */}
      <div className="px-4 py-3 border-b border-border">
        <MiniCalendar
          currentDate={currentDate}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate || (() => {})}
          appointments={appointments}
        />
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* AGENDAS Section */}
        <div className="border-b border-border">
          <button 
            onClick={() => toggleSection('agendas')}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <span>Agendas</span>
            {expandedSections.agendas ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSections.agendas && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-2">
                  {/* Select All */}
                  <label className="flex items-center gap-3 cursor-pointer group py-1">
                    <Checkbox 
                      checked={selectedPractitioners.length === mockPractitioners.length}
                      onCheckedChange={toggleAllPractitioners}
                      className="h-4 w-4 rounded border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Tous ({mockPractitioners.length}/{mockPractitioners.length})
                    </span>
                  </label>

                  {mockPractitioners.map((pract) => (
                    <label 
                      key={pract.id}
                      className="flex items-center gap-3 cursor-pointer group py-1"
                    >
                      <Checkbox 
                        checked={selectedPractitioners.includes(pract.id)}
                        onCheckedChange={() => togglePractitioner(pract.id)}
                        className="h-4 w-4 rounded border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: pract.color }}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {pract.title} {pract.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* STATUTS PATIENT Section */}
        <div className="border-b border-border">
          <button 
            onClick={() => toggleSection('statuses')}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <span>Statuts patient</span>
            {expandedSections.statuses ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSections.statuses && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-1">
                  {statuses.map((status) => (
                    <label 
                      key={status.id}
                      className="flex items-center gap-3 cursor-pointer group py-1.5"
                    >
                      <Checkbox 
                        checked={status.id === 'all' ? allStatusesSelected : selectedStatuses.includes(status.id)}
                        onCheckedChange={() => toggleStatus(status.id)}
                        className="h-4 w-4 rounded border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', status.color)} />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                        {status.label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* MOTIFS DE CONSULTATION Section */}
        <div className="border-b border-border">
          <button 
            onClick={() => toggleSection('motifs')}
            className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
          >
            <span>Motifs de consultation</span>
            {expandedSections.motifs ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedSections.motifs && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-1">
                  {/* Select All */}
                  <label className="flex items-center gap-3 cursor-pointer group py-1.5 border-b border-border mb-2 pb-2">
                    <Checkbox 
                      checked={selectedMotifs.length === mockMotifs.length}
                      onCheckedChange={toggleAllMotifs}
                      className="h-4 w-4 rounded border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <span className="text-sm font-medium text-foreground">
                      Tous ({selectedMotifs.length}/{mockMotifs.length})
                    </span>
                  </label>

                  {mockMotifs.map((motif) => (
                    <label 
                      key={motif.id}
                      className="flex items-center gap-3 cursor-pointer group py-1.5"
                    >
                      <Checkbox 
                        checked={selectedMotifs.includes(motif.id)}
                        onCheckedChange={() => toggleMotif(motif.id)}
                        className="h-4 w-4 rounded border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span 
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0" 
                        style={{ backgroundColor: motif.color }}
                      />
                      <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate">
                        {motif.name}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;