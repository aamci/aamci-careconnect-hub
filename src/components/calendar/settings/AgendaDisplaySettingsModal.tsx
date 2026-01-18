/**
 * AgendaDisplaySettingsModal
 *
 * Modal for configuring agenda display preferences (Doctolib-level)
 * - Density/Zoom slider (Minimum/Standard/Maximum)
 * - Time range pickers (start/end)
 * - Hover precision
 * - Persists to Supabase via useCalendarPreferences
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCalendarPreferences } from '@/hooks/data/useCalendarPreferences';
import {
  ZoomLevel,
  ZOOM_CONFIG,
  minutesToTime,
  timeToMinutes,
} from '@/types/calendar-preferences';

// UI Components
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface AgendaDisplaySettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Time options (every 30 minutes)
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const minutes = i * 30;
  return {
    value: minutes,
    label: minutesToTime(minutes),
  };
});

// Zoom level to slider value mapping
const ZOOM_TO_SLIDER: Record<ZoomLevel, number> = {
  MINIMUM: 0,
  STANDARD: 50,
  MAXIMUM: 100,
};

const SLIDER_TO_ZOOM = (value: number): ZoomLevel => {
  if (value <= 25) return 'MINIMUM';
  if (value <= 75) return 'STANDARD';
  return 'MAXIMUM';
};

// Hover granularity options
const HOVER_OPTIONS = [
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 15, label: '15 minutes (par défaut)' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
] as const;

export function AgendaDisplaySettingsModal({
  open,
  onOpenChange,
}: AgendaDisplaySettingsModalProps) {
  const {
    preferences,
    isUpdating,
    updatePreferences,
    setZoomLevel,
    setTimeRange,
    setHoverGranularity,
  } = useCalendarPreferences();

  // Local state for immediate feedback
  const [localZoom, setLocalZoom] = useState<number>(
    ZOOM_TO_SLIDER[preferences.zoomLevel]
  );
  const [localStartTime, setLocalStartTime] = useState(preferences.timeRangeStartMinute);
  const [localEndTime, setLocalEndTime] = useState(preferences.timeRangeEndMinute);
  const [localHoverGranularity, setLocalHoverGranularity] = useState(
    preferences.hoverGranularityMinutes
  );

  // Sync local state when preferences change
  useEffect(() => {
    setLocalZoom(ZOOM_TO_SLIDER[preferences.zoomLevel]);
    setLocalStartTime(preferences.timeRangeStartMinute);
    setLocalEndTime(preferences.timeRangeEndMinute);
    setLocalHoverGranularity(preferences.hoverGranularityMinutes);
  }, [preferences]);

  // Handle zoom change (debounced save)
  const handleZoomChange = useCallback(
    (value: number[]) => {
      const sliderValue = value[0];
      setLocalZoom(sliderValue);

      // Save when slider stops
      const newZoom = SLIDER_TO_ZOOM(sliderValue);
      if (newZoom !== preferences.zoomLevel) {
        setZoomLevel(newZoom).catch((err) => {
          toast.error('Erreur lors de la sauvegarde du zoom');
          console.error(err);
        });
      }
    },
    [preferences.zoomLevel, setZoomLevel]
  );

  // Handle time range change
  const handleStartTimeChange = useCallback(
    (value: string) => {
      const startMinute = parseInt(value, 10);
      if (startMinute >= localEndTime - 240) {
        toast.error('La plage horaire doit être d\'au moins 4 heures');
        return;
      }
      setLocalStartTime(startMinute);
      setTimeRange(startMinute, localEndTime).catch((err) => {
        toast.error('Erreur lors de la sauvegarde');
        setLocalStartTime(preferences.timeRangeStartMinute);
        console.error(err);
      });
    },
    [localEndTime, setTimeRange, preferences.timeRangeStartMinute]
  );

  const handleEndTimeChange = useCallback(
    (value: string) => {
      const endMinute = parseInt(value, 10);
      if (endMinute <= localStartTime + 240) {
        toast.error('La plage horaire doit être d\'au moins 4 heures');
        return;
      }
      setLocalEndTime(endMinute);
      setTimeRange(localStartTime, endMinute).catch((err) => {
        toast.error('Erreur lors de la sauvegarde');
        setLocalEndTime(preferences.timeRangeEndMinute);
        console.error(err);
      });
    },
    [localStartTime, setTimeRange, preferences.timeRangeEndMinute]
  );

  // Handle hover granularity change
  const handleHoverGranularityChange = useCallback(
    (value: string) => {
      const minutes = parseInt(value, 10) as typeof localHoverGranularity;
      setLocalHoverGranularity(minutes);
      setHoverGranularity(minutes).catch((err) => {
        toast.error('Erreur lors de la sauvegarde');
        setLocalHoverGranularity(preferences.hoverGranularityMinutes);
        console.error(err);
      });
    },
    [setHoverGranularity, preferences.hoverGranularityMinutes]
  );

  // Get zoom label
  const getZoomLabel = (value: number): string => {
    if (value <= 25) return 'Minimum';
    if (value <= 75) return 'Standard';
    return 'Maximum';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Settings2 className="w-5 h-5 text-primary" />
            Affichage de l'agenda
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-3 mb-6 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Ces paramètres ne concernent que l'agenda de ce compte.
            </p>
          </div>

          {/* Section: Density */}
          <section className="mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Densité de l'information
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sélectionnez comment les heures sont affichées dans la vue jour/semaine.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Zoom</span>
                <span className="text-sm text-gray-500">
                  {getZoomLabel(localZoom)}
                </span>
              </div>

              <Slider
                value={[localZoom]}
                onValueChange={handleZoomChange}
                max={100}
                step={1}
                className="w-full"
                disabled={isUpdating}
              />

              <div className="flex justify-between text-xs text-gray-500">
                <span>Minimum</span>
                <span>Standard</span>
                <span>Maximum</span>
              </div>

              {/* Zoom preview */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
                <div className="text-xs text-gray-500 mb-2">Aperçu :</div>
                <div className="flex items-center gap-2">
                  <div
                    className="bg-primary/20 border border-primary/40 rounded"
                    style={{
                      height: ZOOM_CONFIG[SLIDER_TO_ZOOM(localZoom)].slotHeight,
                      width: '100%',
                    }}
                  >
                    <div
                      className="px-2 py-1 text-primary truncate"
                      style={{
                        fontSize: ZOOM_CONFIG[SLIDER_TO_ZOOM(localZoom)].fontSize,
                      }}
                    >
                      Consultation - Dr. Martin
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Time Range */}
          <section className="mb-8 p-4 border rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Plage horaire affichée
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">de</label>
                <Select
                  value={localStartTime.toString()}
                  onValueChange={handleStartTimeChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.filter((t) => t.value < localEndTime - 240).map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">à</label>
                <Select
                  value={localEndTime.toString()}
                  onValueChange={handleEndTimeChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.filter((t) => t.value > localStartTime + 240).map((option) => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded">
              Les rendez-vous pris en dehors de cette plage ne seront pas affichés.
            </p>
          </section>

          {/* Section: Mouse Precision */}
          <section className="mb-6 p-4 border rounded-lg">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Précision de la souris
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Personnalisez la taille des créneaux horaires surlignés quand vous passez
              la souris sur l'agenda.
            </p>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Durée</label>
              <Select
                value={localHoverGranularity.toString()}
                onValueChange={handleHoverGranularityChange}
                disabled={isUpdating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Valeur par défaut" />
                </SelectTrigger>
                <SelectContent>
                  {HOVER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-primary hover:bg-primary/90"
          >
            Revenir à l'agenda
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AgendaDisplaySettingsModal;
