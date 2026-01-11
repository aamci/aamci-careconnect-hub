import React, { useState, useEffect, useMemo } from 'react';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, ChevronLeft, Calendar, Clock, Repeat, List, Check, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useMotifs } from '@/hooks/data/useAppointments';
import { useCreateOpening, useUpdateOpening, useUpdateOpeningSeries, type PractitionerOpening, type CreateOpeningInput } from '@/hooks/data/useOpenings';
import { useToast } from '@/hooks/use-toast';

interface OpeningWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  practitionerId: string;
  initialDate?: Date;
  initialStartTime?: string;
  initialEndTime?: string;
  editingOpening?: PractitionerOpening | null;
}

type WizardStep = 'schedule' | 'motifs' | 'summary';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2) + 6; // Start at 6:00
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

const OpeningWizardModal: React.FC<OpeningWizardModalProps> = ({
  isOpen,
  onClose,
  practitionerId,
  initialDate,
  initialStartTime,
  initialEndTime,
  editingOpening,
}) => {
  const { toast } = useToast();
  const { data: motifs = [] } = useMotifs();
  const createOpening = useCreateOpening();
  const updateOpening = useUpdateOpening();
  const updateSeries = useUpdateOpeningSeries();

  const [step, setStep] = useState<WizardStep>('schedule');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [startTime, setStartTime] = useState(initialStartTime || '08:00');
  const [endTime, setEndTime] = useState(initialEndTime || '18:30');
  const [title, setTitle] = useState('Ouverture');
  const [color, setColor] = useState('#FFFFFF');
  
  // Recurrence
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurrenceType, setRecurrenceType] = useState<'weekly' | 'weekdays' | 'biweekly' | 'custom'>('weekly');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([1]); // Default Monday
  const [recurrenceEndType, setRecurrenceEndType] = useState<'never' | 'date'>('never');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | undefined>();
  
  // Motifs
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);
  const [limitByMotif, setLimitByMotif] = useState(false);

  // For series updates
  const [updateChoice, setUpdateChoice] = useState<'single' | 'series'>('single');

  // Initialize from editing opening
  useEffect(() => {
    if (editingOpening) {
      setSelectedDate(editingOpening.openingDate);
      setStartTime(editingOpening.startTime);
      setEndTime(editingOpening.endTime);
      setTitle(editingOpening.title);
      setColor(editingOpening.color);
      setIsRecurring(editingOpening.isRecurring);
      if (editingOpening.recurrenceType && editingOpening.recurrenceType !== 'none') {
        setRecurrenceType(editingOpening.recurrenceType as 'weekly' | 'weekdays' | 'biweekly' | 'custom');
      }
      setRecurrenceDays(editingOpening.recurrenceDays || [selectedDate.getDay()]);
      setSelectedMotifs(editingOpening.motifs.map(m => m.id));
    } else if (initialDate) {
      setRecurrenceDays([initialDate.getDay()]);
    }
  }, [editingOpening, initialDate]);

  // Reset on open
  useEffect(() => {
    if (isOpen && !editingOpening) {
      setStep('schedule');
      setSelectedDate(initialDate || new Date());
      setStartTime(initialStartTime || '08:00');
      setEndTime(initialEndTime || '18:30');
      setTitle('Ouverture');
      setColor('#FFFFFF');
      setIsRecurring(true);
      setRecurrenceType('weekly');
      setRecurrenceDays([initialDate?.getDay() || 1]);
      setSelectedMotifs(motifs.map(m => m.id));
      setLimitByMotif(false);
    }
  }, [isOpen, initialDate, initialStartTime, initialEndTime, motifs, editingOpening]);

  // Get day name from date
  const dayName = useMemo(() => {
    return format(selectedDate, 'EEEE', { locale: fr });
  }, [selectedDate]);

  // Get recurrence label
  const recurrenceLabel = useMemo(() => {
    const dayOfWeek = selectedDate.getDay();
    const dayNames: Record<number, string> = {
      0: 'dimanche', 1: 'lundi', 2: 'mardi', 3: 'mercredi',
      4: 'jeudi', 5: 'vendredi', 6: 'samedi',
    };

    switch (recurrenceType) {
      case 'weekly':
        return `Toutes les semaines le ${dayNames[dayOfWeek]}`;
      case 'weekdays':
        return 'Tous les jours de la semaine (du lundi au vendredi)';
      case 'biweekly':
        return `Toutes les deux semaines, le ${dayNames[dayOfWeek]}`;
      case 'custom':
        return 'Personnaliser';
      default:
        return '';
    }
  }, [recurrenceType, selectedDate]);

  // Handle submit
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingOpening) {
        // Update existing
        if (editingOpening.seriesId && updateChoice === 'series') {
          await updateSeries.mutateAsync({
            seriesId: editingOpening.seriesId,
            input: {
              startTime,
              endTime,
              title,
              color,
              motifIds: selectedMotifs,
              recurrenceType: isRecurring ? recurrenceType : 'none',
              recurrenceDays,
              recurrenceEndDate: recurrenceEndType === 'date' ? recurrenceEndDate?.toISOString().split('T')[0] : null,
            },
          });
        } else {
          await updateOpening.mutateAsync({
            id: editingOpening.id,
            startTime,
            endTime,
            title,
            color,
            motifIds: selectedMotifs,
          });
        }
        toast({ title: 'Plage modifiée', description: 'La plage d\'ouverture a été mise à jour.' });
      } else {
        // Create new
        const input: CreateOpeningInput = {
          practitionerId,
          openingDate: format(selectedDate, 'yyyy-MM-dd'),
          startTime,
          endTime,
          title,
          color,
          isRecurring,
          recurrenceType: isRecurring ? recurrenceType : 'none',
          recurrenceDays: isRecurring ? (recurrenceType === 'weekdays' ? [1,2,3,4,5] : recurrenceDays) : [],
          recurrenceInterval: recurrenceType === 'biweekly' ? 2 : 1,
          recurrenceEndDate: recurrenceEndType === 'date' ? recurrenceEndDate?.toISOString().split('T')[0] : undefined,
          motifIds: selectedMotifs,
        };
        await createOpening.mutateAsync(input);
        toast({ title: 'Plage créée', description: 'La nouvelle plage d\'ouverture a été créée.' });
      }
      onClose();
    } catch (error) {
      console.error('Error saving opening:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder la plage.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!editingOpening;
  const modalTitle = isEditing ? 'Modifier la plage d\'ouverture' : 'Créer une nouvelle ouverture';

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl h-[85vh] p-0 flex flex-col" hideCloseButton>
        {/* Header */}
        <div className="bg-amber-400 text-amber-950 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            {step !== 'schedule' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-950 hover:bg-amber-500"
                onClick={() => setStep(step === 'summary' ? 'motifs' : 'schedule')}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Retour
              </Button>
            )}
          </div>
          <DialogTitle className="text-lg font-semibold">{modalTitle}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="text-amber-950 hover:bg-amber-500"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Schedule */}
            {step === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Date and Time */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-background rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Le</span>
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
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">de</span>
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
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">à</span>
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

                {/* Recurrence */}
                <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Repeat className="w-4 h-4 text-sky-600" />
                    <h3 className="font-medium text-sky-900 dark:text-sky-100">
                      Voulez-vous répéter cette plage d'ouverture ?
                    </h3>
                  </div>

                  <RadioGroup
                    value={isRecurring ? 'yes' : 'no'}
                    onValueChange={(v) => setIsRecurring(v === 'yes')}
                    className="flex items-center gap-6 mb-4"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="recurring-yes" />
                      <Label htmlFor="recurring-yes">Oui</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="recurring-no" />
                      <Label htmlFor="recurring-no">Non</Label>
                    </div>

                    {isRecurring && (
                      <Select value={recurrenceType} onValueChange={(v: any) => setRecurrenceType(v)}>
                        <SelectTrigger className="w-[280px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Toutes les semaines le {dayName}</SelectItem>
                          <SelectItem value="weekdays">Tous les jours de la semaine (du lundi au vendredi)</SelectItem>
                          <SelectItem value="biweekly">Toutes les deux semaines, le {dayName}</SelectItem>
                          <SelectItem value="custom">Personnaliser</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </RadioGroup>

                  {/* Custom recurrence options */}
                  {isRecurring && recurrenceType === 'custom' && (
                    <div className="mt-4 space-y-4 pt-4 border-t border-sky-200 dark:border-sky-800">
                      <div className="flex items-center gap-4">
                        <Label className="w-24 text-sm">Fréquence</Label>
                        <Select defaultValue="weekly">
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Toutes les semaines</SelectItem>
                            <SelectItem value="biweekly">Toutes les 2 semaines</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-start gap-4">
                        <Label className="w-24 text-sm pt-2">Répéter le</Label>
                        <div className="flex flex-wrap gap-2">
                          {DAYS_OF_WEEK.map(day => (
                            <label
                              key={day.value}
                              className={cn(
                                'flex items-center gap-2 px-3 py-1.5 rounded border cursor-pointer transition-colors',
                                recurrenceDays.includes(day.value)
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-background border-border hover:bg-muted'
                              )}
                            >
                              <Checkbox
                                checked={recurrenceDays.includes(day.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setRecurrenceDays([...recurrenceDays, day.value]);
                                  } else {
                                    setRecurrenceDays(recurrenceDays.filter(d => d !== day.value));
                                  }
                                }}
                                className="sr-only"
                              />
                              <span className="text-sm">{day.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Label className="w-24 text-sm">Se termine</Label>
                        <RadioGroup
                          value={recurrenceEndType}
                          onValueChange={(v: any) => setRecurrenceEndType(v)}
                          className="flex items-center gap-4"
                        >
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="never" id="end-never" />
                            <Label htmlFor="end-never">Jamais</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <RadioGroupItem value="date" id="end-date" />
                            <Label htmlFor="end-date">Le</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={recurrenceEndType !== 'date'}
                                  className="w-[150px]"
                                >
                                  {recurrenceEndDate
                                    ? format(recurrenceEndDate, 'dd/MM/yyyy')
                                    : 'Date de fin'}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={recurrenceEndDate}
                                  onSelect={setRecurrenceEndDate}
                                  locale={fr}
                                  disabled={(date) => date < selectedDate}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Motifs */}
            {step === 'motifs' && (
              <motion.div
                key="motifs"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-800">
                  <h3 className="font-medium text-sky-900 dark:text-sky-100 mb-4">
                    Sélectionnez les motifs de consultation réservables le {dayName} de {startTime} à {endTime}
                    {isRecurring && recurrenceType !== 'weekdays' && ', toutes les semaines'}
                    {isRecurring && recurrenceType === 'weekdays' && ', du lundi au vendredi'}
                    {' ?'}
                  </h3>

                  <div className="mb-4">
                    <Input
                      type="text"
                      placeholder="Rechercher..."
                      className="max-w-xs"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-2 rounded hover:bg-sky-100 dark:hover:bg-sky-900/30 cursor-pointer border-b border-sky-200 dark:border-sky-800 pb-3 mb-2">
                      <Checkbox
                        checked={selectedMotifs.length === motifs.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMotifs(motifs.map(m => m.id));
                          } else {
                            setSelectedMotifs([]);
                          }
                        }}
                      />
                      <span className="font-medium text-sm">SÉLECTIONNER TOUT</span>
                    </label>

                    {motifs.map((motif) => (
                      <label
                        key={motif.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-sky-100 dark:hover:bg-sky-900/30 cursor-pointer"
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
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: motif.color }}
                        />
                        <span className="text-sm">{motif.name}</span>
                        {motif.isOnlineBookable && (
                          <span className="text-xs text-muted-foreground">@</span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-sky-50 dark:bg-sky-950/30 rounded-lg border border-sky-200 dark:border-sky-800">
                  <h3 className="font-medium text-sky-900 dark:text-sky-100 mb-3">
                    Voulez-vous limiter le nombre de rendez-vous par motif de consultation ? (Précisez lesquels à l'étape suivante)
                  </h3>
                  <RadioGroup
                    value={limitByMotif ? 'yes' : 'no'}
                    onValueChange={(v) => setLimitByMotif(v === 'yes')}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="yes" id="limit-yes" />
                      <Label htmlFor="limit-yes">Oui</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="no" id="limit-no" />
                      <Label htmlFor="limit-no">Non</Label>
                    </div>
                  </RadioGroup>
                </div>
              </motion.div>
            )}

            {/* Step 3: Summary */}
            {step === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Color picker */}
                <div className="flex items-center gap-4">
                  <Label className="w-20">Couleur</Label>
                  <div className="flex gap-1">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={cn(
                          'w-7 h-7 rounded border-2 transition-all',
                          color === c ? 'border-primary scale-110' : 'border-border hover:scale-105'
                        )}
                        style={{ backgroundColor: c }}
                      >
                        {color === c && <Check className="w-4 h-4 mx-auto text-foreground" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule summary */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium capitalize">
                      {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {startTime} → {endTime}
                    </p>
                  </div>
                </div>

                {/* Recurrence summary */}
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <Repeat className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <RadioGroup
                        value={isRecurring ? 'yes' : 'no'}
                        onValueChange={(v) => setIsRecurring(v === 'yes')}
                        className="flex items-center gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="sum-recurring-yes" />
                          <Label htmlFor="sum-recurring-yes">Oui</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="sum-recurring-no" />
                          <Label htmlFor="sum-recurring-no">Non</Label>
                        </div>
                      </RadioGroup>
                      {isRecurring && (
                        <span className="text-sm text-muted-foreground">{recurrenceLabel}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Motifs summary */}
                <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                  <List className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Motifs de consultation</p>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-primary p-0 h-auto"
                        onClick={() => setStep('motifs')}
                      >
                        ÉDITER
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {motifs
                        .filter(m => selectedMotifs.includes(m.id))
                        .map(motif => (
                          <div key={motif.id} className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-sm"
                              style={{ backgroundColor: motif.color }}
                            />
                            <span className="text-sm">{motif.name}</span>
                            {motif.isOnlineBookable && (
                              <span className="text-xs text-muted-foreground">@</span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Update choice for series */}
                {isEditing && editingOpening?.seriesId && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-amber-900 dark:text-amber-100">
                        Cette plage fait partie d'une série récurrente
                      </span>
                    </div>
                    <RadioGroup
                      value={updateChoice}
                      onValueChange={(v: any) => setUpdateChoice(v)}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="single" id="update-single" />
                        <Label htmlFor="update-single">Modifier uniquement cette occurrence</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="series" id="update-series" />
                        <Label htmlFor="update-series">Modifier toute la série</Label>
                      </div>
                    </RadioGroup>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/50 border-t flex justify-end flex-shrink-0">
          <Button
            onClick={() => {
              if (step === 'schedule') setStep('motifs');
              else if (step === 'motifs') setStep('summary');
              else handleSubmit();
            }}
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold px-8"
            disabled={isSubmitting}
          >
            {step === 'summary' ? 'VALIDER' : 'SUIVANT'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OpeningWizardModal;
