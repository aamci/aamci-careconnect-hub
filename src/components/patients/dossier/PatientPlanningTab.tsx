import React, { useState, useCallback } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { format, addDays, startOfWeek, isToday, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, X, Check, CalendarPlus } from 'lucide-react';
import { Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAppointments, useMotifs, useCreateAppointment } from '@/hooks/data/useAppointments';
import { usePatients } from '@/hooks/data/usePatients';
import { usePractitioners } from '@/hooks/data/usePractitioners';
import { CreateAppointmentModal } from '@/components/appointments/CreateAppointmentModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DossierPageLayout from './shared/DossierPageLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OutletContext {
  patient: Patient;
}

interface SelectedSlot {
  id: string;
  date: Date;
  hour: number;
  motifId: string;
  duration: number;
}

const PLANNING_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const makeSlotId = (date: Date, hour: number) =>
  `${format(date, 'yyyy-MM-dd')}_${hour}`;

const PatientPlanningTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const { toast: toastUI } = useToast();
  const location = useLocation();
  const isMultiMode = (location.state as { mode?: string } | null)?.mode === 'multi';

  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date | null>(null);
  const [selectedSlotHour, setSelectedSlotHour] = useState<number | null>(null);

  // Multi-selection state
  const [selectedSlots, setSelectedSlots] = useState<SelectedSlot[]>([]);
  const [isSubmittingMulti, setIsSubmittingMulti] = useState(false);

  const { data: allAppointments = [] } = useAppointments();
  const { data: allPatients = [] } = usePatients();
  const { data: motifs = [] } = useMotifs();
  const { data: practitioners = [] } = usePractitioners();
  const createAppointmentMutation = useCreateAppointment();

  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  const getSlotAppointments = useCallback(
    (date: Date, hour: number) => {
      return allAppointments.filter((apt) => {
        const aptStart = new Date(apt.startTime);
        const aptEnd = new Date(apt.endTime);
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = new Date(date);
        slotEnd.setHours(hour + 1, 0, 0, 0);
        return aptStart < slotEnd && aptEnd > slotStart;
      });
    },
    [allAppointments]
  );

  const isSlotPast = (date: Date, hour: number) => {
    const slotTime = new Date(date);
    slotTime.setHours(hour, 0, 0, 0);
    return isBefore(slotTime, new Date());
  };

  const handleSelectSlot = (date: Date, hour: number) => {
    if (isMultiMode) {
      const slotId = makeSlotId(date, hour);
      const alreadySelected = selectedSlots.find((s) => s.id === slotId);
      if (alreadySelected) {
        setSelectedSlots((prev) => prev.filter((s) => s.id !== slotId));
      } else {
        setSelectedSlots((prev) => [
          ...prev,
          { id: slotId, date, hour, motifId: '', duration: 30 },
        ]);
      }
      return;
    }
    setSelectedSlotDate(date);
    setSelectedSlotHour(hour);
    setAppointmentModalOpen(true);
  };

  const handleRemoveSlot = (slotId: string) => {
    setSelectedSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleUpdateSlotMotif = (slotId: string, motifId: string) => {
    setSelectedSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, motifId } : s))
    );
  };

  const handleUpdateSlotDuration = (slotId: string, duration: number) => {
    setSelectedSlots((prev) =>
      prev.map((s) => (s.id === slotId ? { ...s, duration } : s))
    );
  };

  const isSlotSelected = (date: Date, hour: number) => {
    return selectedSlots.some((s) => s.id === makeSlotId(date, hour));
  };

  const allSlotsValid = selectedSlots.length >= 2 && selectedSlots.every((s) => s.motifId !== '');

  const handleSubmitMultiAppointments = async () => {
    if (!allSlotsValid) return;

    setIsSubmittingMulti(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserPractitioner = practitioners.find(
        (p) => p.userId === userData?.user?.id
      );
      const practitionerId = currentUserPractitioner?.id || practitioners[0]?.id;

      if (!practitionerId) {
        toastUI({ title: 'Aucun praticien disponible', variant: 'destructive' });
        return;
      }

      for (const slot of selectedSlots) {
        const startTime = new Date(slot.date);
        startTime.setHours(slot.hour, 0, 0, 0);
        const endTime = new Date(startTime);
        endTime.setMinutes(startTime.getMinutes() + slot.duration);

        await createAppointmentMutation.mutateAsync({
          patientId: patient.id,
          practitionerId,
          motifId: slot.motifId,
          startTime,
          endTime,
          duration: slot.duration,
          status: 'scheduled',
          type: 'consultation',
          isFirstVisit: false,
          isOnWaitingList: false,
          roomId: null,
          referredBy: null,
          notes: null,
          internalNotes: null,
        });
      }

      toast.success(`${selectedSlots.length} rendez-vous crees avec succes`);
      setSelectedSlots([]);
    } catch (error) {
      toast.error('Erreur lors de la creation des rendez-vous');
    } finally {
      setIsSubmittingMulti(false);
    }
  };

  const handleCreateAppointment = async (data: {
    patient: Patient;
    date: Date;
    hour: number;
    motif: string;
    duration: number;
    createTeleconsultation?: boolean;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const currentUserPractitioner = practitioners.find(
        (p) => p.userId === userData?.user?.id
      );
      const practitionerId = currentUserPractitioner?.id || practitioners[0]?.id;

      if (!practitionerId) {
        toastUI({ title: 'Aucun praticien disponible', variant: 'destructive' });
        return;
      }

      const startTime = new Date(data.date);
      startTime.setHours(data.hour, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setMinutes(startTime.getMinutes() + data.duration);

      await createAppointmentMutation.mutateAsync({
        patientId: data.patient.id,
        practitionerId,
        motifId: data.motif,
        startTime,
        endTime,
        duration: data.duration,
        status: 'scheduled',
        type: 'consultation',
        isFirstVisit: false,
        isOnWaitingList: false,
        roomId: null,
        referredBy: null,
        notes: null,
        internalNotes: null,
      });

      toast.success('Rendez-vous cree avec succes');
      setAppointmentModalOpen(false);
    } catch (error) {
      toast.error('Erreur lors de la creation du rendez-vous');
    }
  };

  const goToPreviousWeek = () => setWeekStart((prev) => addDays(prev, -7));
  const goToNextWeek = () => setWeekStart((prev) => addDays(prev, 7));
  const goToCurrentWeek = () =>
    setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  return (
    <DossierPageLayout
      patient={patient}
      title={isMultiMode ? 'Planning - Planifier plusieurs rendez-vous' : 'Planning - Prendre un rendez-vous'}
      breadcrumbLabel="Planning"
      fitScreen
    >
      <div className="flex flex-col h-full">
        {/* Week navigation bar */}
        <div className="flex items-center justify-between pb-3 border-b mb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="sm" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-sm font-semibold text-foreground">
            {format(weekStart, 'd MMMM', { locale: fr })} -{' '}
            {format(addDays(weekStart, 5), 'd MMMM yyyy', { locale: fr })}
          </h2>

          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded border-2 border-emerald-400 bg-emerald-50" />
              Disponible
            </div>
            {isMultiMode && (
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded border-2 border-blue-500 bg-blue-100" />
                Selectionne
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-slate-300" />
              Occupe
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-muted/60 border border-border" />
              Passe
            </div>
          </div>
        </div>

        {/* Info banner */}
        <div className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-lg border mb-3 flex-shrink-0",
          isMultiMode
            ? "bg-blue-50 border-blue-200"
            : "bg-primary/5 border-primary/20"
        )}>
          {isMultiMode ? (
            <CalendarPlus className="h-4 w-4 text-blue-600 flex-shrink-0" />
          ) : (
            <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
          )}
          <p className={cn("text-xs", isMultiMode ? "text-blue-700" : "text-primary")}>
            {isMultiMode ? (
              <>
                Cliquez sur les creneaux disponibles pour selectionner plusieurs rendez-vous pour{' '}
                <span className="font-semibold">
                  {patient.lastName} {patient.firstName}
                </span>
                {' '}<span className="text-blue-500">(minimum 2 creneaux)</span>
              </>
            ) : (
              <>
                Cliquez sur un creneau disponible pour prendre un rendez-vous pour{' '}
                <span className="font-semibold">
                  {patient.lastName} {patient.firstName}
                </span>
              </>
            )}
          </p>
        </div>

        {/* Weekly grid */}
        <div className="flex-1 overflow-auto border rounded-lg">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-card">
                <th className="w-16 p-2 text-right text-xs text-muted-foreground font-medium border-b border-r bg-card" />
                {weekDays.map((day) => {
                  const dayIsSunday = day.getDay() === 0;
                  return (
                    <th
                      key={day.toISOString()}
                      className={cn(
                        'p-2 text-center border-b border-r last:border-r-0 font-medium',
                        isToday(day) && 'bg-primary/5',
                        dayIsSunday && 'bg-muted/30'
                      )}
                    >
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {format(day, 'EEEE', { locale: fr })}
                      </div>
                      <div
                        className={cn(
                          'text-lg mt-0.5 font-semibold',
                          isToday(day)
                            ? 'text-primary'
                            : dayIsSunday
                            ? 'text-muted-foreground'
                            : 'text-foreground'
                        )}
                      >
                        {format(day, 'd')}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {format(day, 'MMM', { locale: fr })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PLANNING_HOURS.map((hour) => (
                <tr key={hour} className="group/row">
                  <td className="p-0 text-right text-xs text-muted-foreground font-medium pr-3 align-top pt-3 border-r border-b bg-card w-16">
                    {`${String(hour).padStart(2, '0')}:00`}
                  </td>
                  {weekDays.map((day) => {
                    const slotApts = getSlotAppointments(day, hour);
                    const isBusy = slotApts.length > 0;
                    const isPast = isSlotPast(day, hour);
                    const isSunday = day.getDay() === 0;

                    if (isSunday) {
                      return (
                        <td
                          key={day.toISOString()}
                          className="border-b border-r last:border-r-0 bg-muted/30 p-1"
                        />
                      );
                    }

                    if (isPast && !isBusy) {
                      return (
                        <td
                          key={day.toISOString()}
                          className="border-b border-r last:border-r-0 bg-muted/10 p-1 h-12"
                        />
                      );
                    }

                    if (isPast && isBusy) {
                      const apt = slotApts[0];
                      return (
                        <td
                          key={day.toISOString()}
                          className="border-b border-r last:border-r-0 bg-muted/10 p-1 h-12"
                        >
                          <div className="rounded px-2 py-1 text-[10px] text-muted-foreground bg-muted/40 truncate">
                            {apt?.motif?.name || 'Occupe'}
                          </div>
                        </td>
                      );
                    }

                    if (isBusy) {
                      const apt = slotApts[0];
                      const motifColor = apt?.motif?.color || '#94a3b8';
                      const aptPatientName = (() => {
                        const p = allPatients.find((pat) => pat.id === apt.patientId);
                        return p ? `${p.lastName} ${p.firstName}` : '';
                      })();

                      return (
                        <td
                          key={day.toISOString()}
                          className="border-b border-r last:border-r-0 p-1 h-12"
                        >
                          <div
                            className="rounded px-2 py-1.5 text-white h-full flex flex-col justify-center"
                            style={{ backgroundColor: motifColor }}
                            title={`${apt?.motif?.name || 'RDV'} - ${aptPatientName} - ${format(new Date(apt.startTime), 'HH:mm')} a ${format(new Date(apt.endTime), 'HH:mm')}`}
                          >
                            <span className="text-[11px] font-semibold truncate">
                              {apt?.motif?.name || 'Occupe'}
                            </span>
                            {aptPatientName && (
                              <span className="text-[9px] opacity-80 truncate">
                                {aptPatientName}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    }

                    // Free slot - clickable
                    const selected = isMultiMode && isSlotSelected(day, hour);
                    return (
                      <td
                        key={day.toISOString()}
                        className={cn(
                          'border-b border-r last:border-r-0 p-0.5 h-12',
                          isToday(day) && 'bg-primary/[0.02]'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectSlot(day, hour)}
                          className={cn(
                            'w-full h-full rounded-md transition-all cursor-pointer group flex items-center justify-center',
                            selected
                              ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset'
                              : 'hover:bg-emerald-50 hover:ring-2 hover:ring-emerald-400 hover:ring-inset'
                          )}
                        >
                          {selected ? (
                            <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              {`${String(hour).padStart(2, '0')}:00`}
                            </span>
                          ) : (
                            <span className="text-xs text-transparent group-hover:text-emerald-600 font-medium transition-colors">
                              {`${String(hour).padStart(2, '0')}:00`}
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Multi-selection recap panel */}
        {isMultiMode && selectedSlots.length > 0 && (
          <div className="flex-shrink-0 mt-3 border rounded-lg bg-card">
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-blue-50/50">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarPlus className="h-4 w-4 text-blue-600" />
                Rendez-vous selectionnes ({selectedSlots.length})
              </h3>
              {selectedSlots.length < 2 && (
                <span className="text-xs text-amber-600 font-medium">
                  Selectionnez au moins 2 creneaux
                </span>
              )}
            </div>
            <div className="max-h-[180px] overflow-y-auto">
              {selectedSlots
                .sort((a, b) => {
                  const dateA = new Date(a.date);
                  dateA.setHours(a.hour);
                  const dateB = new Date(b.date);
                  dateB.setHours(b.hour);
                  return dateA.getTime() - dateB.getTime();
                })
                .map((slot, index) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-3 px-4 py-2 border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-shrink-0 text-sm font-medium w-[180px]">
                      <span className="capitalize">
                        {format(slot.date, 'EEEE d MMM', { locale: fr })}
                      </span>
                      {' '}a {String(slot.hour).padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <Select
                        value={slot.motifId}
                        onValueChange={(v) => handleUpdateSlotMotif(slot.id, v)}
                      >
                        <SelectTrigger className="h-8 text-xs flex-1">
                          <SelectValue placeholder="Motif..." />
                        </SelectTrigger>
                        <SelectContent>
                          {motifs.map((m) => (
                            <SelectItem key={m.id} value={m.id}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: m.color }}
                                />
                                <span>{m.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={slot.duration.toString()}
                        onValueChange={(v) => handleUpdateSlotDuration(slot.id, Number(v))}
                      >
                        <SelectTrigger className="h-8 text-xs w-[100px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 min</SelectItem>
                          <SelectItem value="30">30 min</SelectItem>
                          <SelectItem value="45">45 min</SelectItem>
                          <SelectItem value="60">1h</SelectItem>
                          <SelectItem value="90">1h30</SelectItem>
                          <SelectItem value="120">2h</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSlot(slot.id)}
                      className="flex-shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSlots([])}
                className="text-xs"
              >
                Tout effacer
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitMultiAppointments}
                disabled={!allSlotsValid || isSubmittingMulti}
                className="gap-1.5"
              >
                {isSubmittingMulti ? (
                  'Creation en cours...'
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Valider {selectedSlots.length} rendez-vous
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Official appointment creation modal (single mode only) */}
      {!isMultiMode && (
        <CreateAppointmentModal
          open={appointmentModalOpen}
          onOpenChange={setAppointmentModalOpen}
          selectedDate={selectedSlotDate}
          selectedHour={selectedSlotHour}
          patients={allPatients}
          motifs={motifs}
          preselectedPatient={patient}
          onCreateNewPatient={() => setAppointmentModalOpen(false)}
          onCreateAppointment={handleCreateAppointment}
        />
      )}
    </DossierPageLayout>
  );
};

export default PatientPlanningTab;
