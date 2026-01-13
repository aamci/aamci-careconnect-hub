import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useAgendaPreferences,
  type ZoomLevel,
  type StatsMode,
  type HoverGranularity,
  type SchoolHolidayRegion,
} from '@/hooks/useAgendaPreferences';

interface AgendaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate time options from 00:00 to 23:00
const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const HOVER_GRANULARITY_OPTIONS: { value: HoverGranularity; label: string }[] = [
  { value: 'default', label: 'Valeur par défaut' },
  { value: 5, label: '5 minutes' },
  { value: 10, label: '10 minutes' },
  { value: 12, label: '12 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 20, label: '20 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
];

const SCHOOL_HOLIDAY_REGIONS: { value: SchoolHolidayRegion; label: string }[] = [
  { value: null, label: 'Veuillez sélectionner une région' },
  { value: 'A', label: 'Zone A' },
  { value: 'B', label: 'Zone B' },
  { value: 'C', label: 'Zone C' },
  { value: 'corse', label: 'Corse' },
];

const DAY_NAMES = [
  { index: 0, label: 'lun' },
  { index: 1, label: 'mar' },
  { index: 2, label: 'mer' },
  { index: 3, label: 'jeu' },
  { index: 4, label: 'ven' },
  { index: 5, label: 'sam' },
  { index: 6, label: 'dim' },
];

const AgendaSettingsModal: React.FC<AgendaSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    preferences,
    updatePreference,
    toggleDayVisibility,
  } = useAgendaPreferences();

  // Convert zoom level to slider value (0-100)
  const zoomToSlider = (zoom: ZoomLevel): number => {
    switch (zoom) {
      case 'minimum': return 0;
      case 'standard': return 50;
      case 'maximum': return 100;
      default: return 50;
    }
  };

  const sliderToZoom = (value: number): ZoomLevel => {
    if (value <= 25) return 'minimum';
    if (value >= 75) return 'maximum';
    return 'standard';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0 bg-background"
        hideCloseButton={false}
        aria-describedby="agenda-settings-description"
      >
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0 bg-background">
          <DialogTitle className="text-xl font-semibold text-center">
            Affichage de l'agenda
          </DialogTitle>
          <p id="agenda-settings-description" className="sr-only">
            Paramètres d'affichage de l'agenda pour personnaliser la vue
          </p>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-background">
          {/* Info Banner */}
          <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg border border-primary/20">
            <Info className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">
              Ces paramètres ne concernent que l'agenda de ce compte.
            </span>
          </div>

          {/* Section 1: Densité de l'information */}
          <SettingsSection title="Densité de l'information">
            <p className="text-sm text-muted-foreground mb-4">
              Sélectionnez comment les heures sont affichées dans la vue jour/semaine.
            </p>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Zoom</Label>
              <Slider
                value={[zoomToSlider(preferences.zoomLevel)]}
                onValueChange={([value]) => updatePreference('zoomLevel', sliderToZoom(value))}
                min={0}
                max={100}
                step={50}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className={cn(preferences.zoomLevel === 'minimum' && 'text-primary font-medium')}>
                  Minimum
                </span>
                <span className={cn(preferences.zoomLevel === 'standard' && 'text-primary font-medium')}>
                  Standard
                </span>
                <span className={cn(preferences.zoomLevel === 'maximum' && 'text-primary font-medium')}>
                  Maximum
                </span>
              </div>
            </div>
          </SettingsSection>

          {/* Section 2: Plage horaire affichée */}
          <SettingsSection title="Plage horaire affichée">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">de</Label>
                <Select
                  value={preferences.displayStartTime}
                  onValueChange={(value) => updatePreference('displayStartTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">à</Label>
                <Select
                  value={preferences.displayEndTime}
                  onValueChange={(value) => updatePreference('displayEndTime', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-primary mt-2">
              Les rendez-vous pris en dehors de cette plage ne seront pas affichés
            </p>
          </SettingsSection>

          {/* Section 3: Précision de la souris */}
          <SettingsSection title="Précision de la souris">
            <p className="text-sm text-muted-foreground mb-4">
              Personnalisez la taille des créneaux horaires surlignés quand vous passez la souris sur l'agenda.
            </p>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Durée</Label>
              <Select
                value={String(preferences.hoverGranularityMinutes)}
                onValueChange={(value) => {
                  const numValue = value === 'default' ? 'default' : parseInt(value) as HoverGranularity;
                  updatePreference('hoverGranularityMinutes', numValue);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOVER_GRANULARITY_OPTIONS.map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Par exemple, si vous sélectionnez 5 minutes, vous pouvez faire commencer un rendez-vous à 11h05, 11h10, 11h15 etc. La valeur par défaut est la durée du motif de consultation concerné.
            </p>
          </SettingsSection>

          {/* Section 4: Vacances scolaires */}
          <SettingsSection title="Vacances scolaires">
            <p className="text-sm text-muted-foreground mb-4">
              Affichez ces vacances scolaires sur votre agenda
            </p>
            <Select
              value={preferences.schoolHolidaysRegion || 'none'}
              onValueChange={(value) => 
                updatePreference('schoolHolidaysRegion', value === 'none' ? null : value as SchoolHolidayRegion)
              }
            >
              <SelectTrigger className="w-full max-w-sm">
                <SelectValue placeholder="Veuillez sélectionner une région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Veuillez sélectionner une région</SelectItem>
                {SCHOOL_HOLIDAY_REGIONS.filter(r => r.value !== null).map((region) => (
                  <SelectItem key={region.value || 'none'} value={region.value || 'none'}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-3 mt-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="holidays-mini"
                  checked={preferences.showHolidaysMiniCalendar}
                  onCheckedChange={(checked) => 
                    updatePreference('showHolidaysMiniCalendar', checked as boolean)
                  }
                />
                <Label htmlFor="holidays-mini" className="text-sm cursor-pointer">
                  Afficher les vacances scolaires dans le mini agenda
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="holidays-main"
                  checked={preferences.showHolidaysMainCalendar}
                  onCheckedChange={(checked) => 
                    updatePreference('showHolidaysMainCalendar', checked as boolean)
                  }
                />
                <Label htmlFor="holidays-main" className="text-sm cursor-pointer">
                  Afficher les vacances scolaires dans l'agenda principal
                </Label>
              </div>
            </div>
          </SettingsSection>

          {/* Section 5: Options d'affichage */}
          <SettingsSection title="Options d'affichage">
            <p className="text-sm text-muted-foreground mb-4">
              Sélectionnez les jours affichés dans la vue semaine.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {DAY_NAMES.map((day) => {
                const isSelected = preferences.weekVisibleDays.includes(day.index);
                return (
                  <Button
                    key={day.index}
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDayVisibility(day.index)}
                    className={cn(
                      'min-w-[60px]',
                      isSelected && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {day.label}
                  </Button>
                );
              })}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="upcoming-days"
                  checked={preferences.showOnlyUpcomingDays}
                  onCheckedChange={(checked) => 
                    updatePreference('showOnlyUpcomingDays', checked as boolean)
                  }
                />
                <Label htmlFor="upcoming-days" className="text-sm cursor-pointer">
                  Afficher uniquement les jours à venir dans la vue semaine
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="consultation-reasons"
                  checked={preferences.showConsultationReasonsInDayView}
                  onCheckedChange={(checked) => 
                    updatePreference('showConsultationReasonsInDayView', checked as boolean)
                  }
                />
                <Label htmlFor="consultation-reasons" className="text-sm cursor-pointer">
                  Afficher les motifs de consultation dans la vue jour
                </Label>
              </div>
            </div>
          </SettingsSection>

          {/* Section 6: Statistiques */}
          <SettingsSection title="Statistiques">
            <p className="text-sm text-muted-foreground mb-4">
              Affichez le nombre de rendez-vous par créneau disponible en haut de l'agenda.
            </p>
            <RadioGroup
              value={preferences.statsMode}
              onValueChange={(value) => updatePreference('statsMode', value as StatsMode)}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="hidden" id="stats-hidden" />
                <Label htmlFor="stats-hidden" className="text-sm cursor-pointer">
                  Masquées
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="perDay" id="stats-day" />
                <Label htmlFor="stats-day" className="text-sm cursor-pointer">
                  Par journée
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="perHalfDay" id="stats-halfday" />
                <Label htmlFor="stats-halfday" className="text-sm cursor-pointer">
                  Par demi-journée
                </Label>
              </div>
            </RadioGroup>
            
            {preferences.statsMode === 'perHalfDay' && (
              <div className="mt-4 space-y-2">
                <Label className="text-sm">Heure de début d'après-midi</Label>
                <Select
                  value={preferences.afternoonStartTime}
                  onValueChange={(value) => updatePreference('afternoonStartTime', value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00'].map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </SettingsSection>

          {/* Section 7: Autres options */}
          <SettingsSection title="Autres options">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="notifications"
                  checked={preferences.notificationsOnlineBookings}
                  onCheckedChange={(checked) => 
                    updatePreference('notificationsOnlineBookings', checked as boolean)
                  }
                />
                <Label htmlFor="notifications" className="text-sm cursor-pointer">
                  Activer les notifications lorsque de nouveaux rendez-vous sont pris en ligne
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="waiting-sound"
                  checked={preferences.waitingRoomSound}
                  onCheckedChange={(checked) => 
                    updatePreference('waitingRoomSound', checked as boolean)
                  }
                />
                <Label htmlFor="waiting-sound" className="text-sm cursor-pointer">
                  Émettre un son lorsqu'un patient arrive en salle d'attente
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="blur-names"
                  checked={preferences.enablePatientNameBlurOption}
                  onCheckedChange={(checked) => 
                    updatePreference('enablePatientNameBlurOption', checked as boolean)
                  }
                />
                <Label htmlFor="blur-names" className="text-sm cursor-pointer">
                  Afficher l'option floutage du nom des patients
                </Label>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex-shrink-0 flex justify-end bg-background">
          <Button onClick={onClose} className="bg-primary hover:bg-primary/90">
            REVENIR À L'AGENDA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Reusable section component
const SettingsSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <h3 className="font-semibold text-base mb-3">{title}</h3>
    {children}
  </div>
);

export default AgendaSettingsModal;
