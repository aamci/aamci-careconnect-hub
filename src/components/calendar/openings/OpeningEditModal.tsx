import React, { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  X, Calendar, Clock, Repeat, List, Check, AlertTriangle, 
  Copy, History, Trash2, HelpCircle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useMotifs } from '@/hooks/data/useAppointments';
import { usePractitioners } from '@/hooks/data/usePractitioners';
import { 
  useUpdateOpening, 
  useUpdateOpeningSeries, 
  useDeleteOpening,
  type PractitionerOpening, 
  type UpdateOpeningInput 
} from '@/hooks/data/useOpenings';
import { useToast } from '@/hooks/use-toast';
import DeleteOpeningDialog from './DeleteOpeningDialog';
import OpeningHistoryPanel from './OpeningHistoryPanel';

interface OpeningEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  opening: PractitionerOpening;
  onCopy?: (opening: PractitionerOpening) => void;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6;
  const minute = (i % 2) * 30;
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}).filter(t => {
  const hour = parseInt(t.split(':')[0]);
  return hour >= 6 && hour <= 21;
});

const COLORS = [
  '#FFFFFF', '#FECACA', '#FED7AA', '#FDE68A', '#D9F99D',
  '#BBF7D0', '#A7F3D0', '#99F6E4', '#BAE6FD', '#C7D2FE',
  '#DDD6FE', '#F5D0FE',
];

const RECURRENCE_OPTIONS = [
  { value: 'none', label: 'Non' },
  { value: 'weekly', label: 'Toutes les semaines' },
  { value: 'biweekly', label: 'Toutes les deux semaines' },
  { value: 'weekdays', label: 'Tous les jours de la semaine' },
];

const OpeningEditModal: React.FC<OpeningEditModalProps> = ({
  isOpen,
  onClose,
  opening,
  onCopy,
}) => {
  const { toast } = useToast();
  const { data: motifs = [] } = useMotifs();
  const { data: practitioners = [] } = usePractitioners();
  const updateOpening = useUpdateOpening();
  const updateSeries = useUpdateOpeningSeries();
  const deleteOpening = useDeleteOpening();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMotifEditor, setShowMotifEditor] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('#FFFFFF');
  const [substituteId, setSubstituteId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('18:30');
  const [recurrenceType, setRecurrenceType] = useState<string>('none');
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);

  // Initialize from opening
  useEffect(() => {
    if (opening) {
      setTitle(opening.title || '');
      setColor(opening.color || '#FFFFFF');
      setSubstituteId(opening.substituteId || null);
      setSelectedDate(opening.openingDate);
      setStartTime(opening.startTime);
      setEndTime(opening.endTime);
      setRecurrenceType(opening.isRecurring && opening.recurrenceType ? opening.recurrenceType : 'none');
      setSelectedMotifs(opening.motifs.map(m => m.id));
    }
  }, [opening]);

  // Get available substitutes (all practitioners except the opening's practitioner)
  const availableSubstitutes = useMemo(() => {
    return practitioners.filter(p => p.id !== opening?.practitionerId);
  }, [practitioners, opening?.practitionerId]);

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const input: UpdateOpeningInput = {
        id: opening.id,
        startTime,
        endTime,
        title,
        color,
        substituteId: substituteId || null,
        motifIds: selectedMotifs,
      };

      await updateOpening.mutateAsync(input);

      toast({ 
        title: 'Plage modifiée', 
        description: 'La plage d\'ouverture a été mise à jour avec succès.' 
      });
      onClose();
    } catch (error) {
      console.error('Error updating opening:', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de modifier la plage d\'ouverture.', 
        variant: 'destructive' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (deleteChoice: 'single' | 'future' | 'series') => {
    try {
      await deleteOpening.mutateAsync({ 
        id: opening.id, 
        deleteSeries: deleteChoice === 'series' 
      });
      
      toast({ 
        title: 'Plage supprimée', 
        description: deleteChoice === 'series' 
          ? 'Toute la série a été supprimée.' 
          : 'La plage d\'ouverture a été supprimée.' 
      });
      setShowDeleteDialog(false);
      onClose();
    } catch (error) {
      console.error('Error deleting opening:', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de supprimer la plage.', 
        variant: 'destructive' 
      });
    }
  };

  // Handle copy
  const handleCopy = () => {
    onCopy?.(opening);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0">
          <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 flex items-center justify-between border-b">
                <h2 className="text-lg font-semibold">Modifier la plage d'ouverture</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Title */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 w-32 pt-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <Label>Titre</Label>
                  </div>
                  <div className="flex-1">
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Entrer une description (uniquement visible en interne)"
                      className="bg-background"
                    />
                  </div>
                </div>

                {/* Color picker */}
                <div className="flex items-center gap-4">
                  <div className="w-32" />
                  <div className="flex gap-1.5">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={cn(
                          'w-7 h-7 rounded border-2 transition-all',
                          color === c ? 'border-foreground scale-110' : 'border-border hover:scale-105'
                        )}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-4 h-4 mx-auto text-foreground" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Substitute (Remplaçant) */}
                <div className="flex items-start gap-4">
                  <div className="w-32 pt-2">
                    <Label>Remplaçant</Label>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <Select 
                      value={substituteId || 'none'} 
                      onValueChange={(v) => setSubstituteId(v === 'none' ? null : v)}
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Aucun remplaçant" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun remplaçant</SelectItem>
                        {availableSubstitutes.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            Dr. {p.firstName} {p.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs bg-slate-800 text-white p-3">
                          <p className="text-sm">
                            Le nom de votre remplaçant sera annoncé au patient lors de la prise 
                            de rendez-vous et dans les rappels de rendez-vous.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {substituteId && (
                  <div className="flex items-center gap-4 pl-32">
                    <Button variant="link" className="text-primary p-0 h-auto text-sm">
                      Ajouter/supprimer des remplaçants
                    </Button>
                  </div>
                )}

                {/* Schedule (Horaire) */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 w-32 pt-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Label>Horaire</Label>
                  </div>
                  <div className="flex-1 flex flex-wrap items-center gap-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[200px] justify-start">
                          <Calendar className="w-4 h-4 mr-2" />
                          {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>

                    <Select value={startTime} onValueChange={setStartTime}>
                      <SelectTrigger className="w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={endTime} onValueChange={setEndTime}>
                      <SelectTrigger className="w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.filter(t => t > startTime).map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Recurrence (Répéter) */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 w-32 pt-2">
                    <Repeat className="w-4 h-4 text-muted-foreground" />
                    <Label>Répéter</Label>
                  </div>
                  <div className="flex-1">
                    <Select value={recurrenceType} onValueChange={setRecurrenceType}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RECURRENCE_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Motifs de consultation */}
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 w-32 pt-2">
                    <List className="w-4 h-4 text-muted-foreground" />
                    <Label className="text-sm">Motifs de consultation</Label>
                  </div>
                  <div className="flex-1 border rounded-lg p-4 bg-background">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">Motifs de consultation</span>
                      <Button 
                        variant="link" 
                        className="text-primary p-0 h-auto text-sm font-semibold"
                        onClick={() => setShowMotifEditor(!showMotifEditor)}
                      >
                        EDITER
                      </Button>
                    </div>

                    <AnimatePresence mode="wait">
                      {showMotifEditor ? (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          {motifs.map((motif) => (
                            <label
                              key={motif.id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedMotifs.includes(motif.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedMotifs([...selectedMotifs, motif.id]);
                                  } else {
                                    setSelectedMotifs(selectedMotifs.filter(id => id !== motif.id));
                                  }
                                }}
                              />
                              <span
                                className="w-3 h-3 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: motif.color }}
                              />
                              <span className="text-sm">{motif.name}</span>
                              {motif.isOnlineBookable && (
                                <span className="text-xs text-muted-foreground">@</span>
                              )}
                            </label>
                          ))}
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          {motifs
                            .filter(m => selectedMotifs.includes(m.id))
                            .map((motif) => (
                              <div key={motif.id} className="flex items-center gap-2">
                                <span className="text-sm">{motif.name}</span>
                                {motif.isOnlineBookable && (
                                  <span className="text-xs text-muted-foreground">@</span>
                                )}
                              </div>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-t flex justify-end">
                <Button
                  onClick={handleSubmit}
                  className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold px-8"
                  disabled={isSubmitting}
                >
                  VALIDER
                </Button>
              </div>
            </div>

            {/* Side Panel */}
            <div className="w-48 border-l bg-muted/30 flex flex-col">
              <div className="p-2 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-10"
                  onClick={handleCopy}
                >
                  <Copy className="w-4 h-4" />
                  Copier
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-10"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  <History className="w-4 h-4" />
                  Historique des actions
                </Button>
              </div>

              <div className="flex-1" />

              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteOpeningDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        opening={opening}
        onConfirm={handleDelete}
      />

      {/* History Panel */}
      {showHistory && (
        <OpeningHistoryPanel
          opening={opening}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
};

export default OpeningEditModal;
