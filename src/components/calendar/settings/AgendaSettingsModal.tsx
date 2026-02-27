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
import { Switch } from '@/components/ui/switch';
import {
  useAgendaPreferences,
  type ZoomLevel,
  type StatsMode,
  type HoverGranularity,
  type SchoolHolidayRegion,
  type TimeFormat,
  type SlotHeightMode,
  type SecondaryLineContent,
  type AgendaTheme,
  ZOOM_MIN,
  ZOOM_STANDARD,
  ZOOM_MAX,
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
  { value: 'A', label: 'Zone A (Besançon, Bordeaux, Clermont-Ferrand, Dijon, Grenoble, Limoges, Lyon, Poitiers)' },
  { value: 'B', label: 'Zone B (Aix-Marseille, Amiens, Lille, Nancy-Metz, Nantes, Nice, Orléans-Tours, Reims, Rennes, Rouen, Strasbourg)' },
  { value: 'C', label: 'Zone C (Créteil, Montpellier, Paris, Toulouse, Versailles)' },
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

// New premium options
const TIME_FORMAT_OPTIONS: { value: TimeFormat; label: string }[] = [
  { value: '24h', label: '24 heures (14:00)' },
  { value: '12h', label: '12 heures (2:00 PM)' },
];

const FIRST_DAY_OPTIONS: { value: 0 | 1; label: string }[] = [
  { value: 1, label: 'Lundi' },
  { value: 0, label: 'Dimanche' },
];

const SLOT_HEIGHT_OPTIONS: { value: SlotHeightMode; label: string }[] = [
  { value: 'auto', label: 'Automatique (suit le zoom)' },
  { value: 'small', label: 'Petit (24px)' },
  { value: 'medium', label: 'Moyen (40px)' },
  { value: 'large', label: 'Grand (64px)' },
];

const SECONDARY_LINE_OPTIONS: { value: SecondaryLineContent; label: string }[] = [
  { value: 'motif', label: 'Motif de consultation' },
  { value: 'location', label: 'Lieu' },
  { value: 'tags', label: 'Tags' },
  { value: 'none', label: 'Aucun' },
];

const THEME_OPTIONS: { value: AgendaTheme; label: string; description: string }[] = [
  { value: 'standard', label: 'Standard', description: 'Couleurs équilibrées' },
  { value: 'high-contrast', label: 'Contraste élevé', description: 'Accessibilité renforcée' },
  { value: 'pastel', label: 'Pastel', description: 'Couleurs douces' },
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

  // Zoom is now a numeric value from 0-20
  // 0 = Minimum, 10 = Standard, 20 = Maximum
  // 10 steps between Minimum and Standard, 10 steps between Standard and Maximum

  // Handle zoom change with immediate effect
  const handleZoomChange = ([value]: number[]) => {
    updatePreference('zoomLevel', value);
  };

  // Determine which label should be highlighted
  const isMinimumActive = preferences.zoomLevel <= 3;
  const isStandardActive = preferences.zoomLevel >= 7 && preferences.zoomLevel <= 13;
  const isMaximumActive = preferences.zoomLevel >= 17;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl h-[90vh] flex flex-col p-0 gap-0 bg-background"
        hideCloseButton={false}
        aria-describedby="agenda-settings-description"
      >
        <DialogHeader className="px-6 py-4 border-b border-border flex-shrink-0 bg-background">
          <DialogTitle className="text-xl font-semibold text-center">
            Apparence & affichage
          </DialogTitle>
          <p id="agenda-settings-description" className="sr-only">
            Paramètres d'apparence et d'affichage de l'agenda
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
                value={[preferences.zoomLevel]}
                onValueChange={handleZoomChange}
                min={ZOOM_MIN}
                max={ZOOM_MAX}
                step={1}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className={cn(isMinimumActive && 'text-primary font-medium')}>
                  Minimum
                </span>
                <span className={cn(isStandardActive && 'text-primary font-medium')}>
                  Standard
                </span>
                <span className={cn(isMaximumActive && 'text-primary font-medium')}>
                  Maximum
                </span>
              </div>
            </div>
          </SettingsSection>

          {/* Section 2: Format & Affichage */}
          <SettingsSection title="Format & affichage">
            <div className="space-y-4">
              {/* Time Format */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Format d'heure</Label>
                  <p className="text-xs text-muted-foreground">
                    Choisissez le format d'affichage des heures
                  </p>
                </div>
                <Select
                  value={preferences.timeFormat}
                  onValueChange={(value) => updatePreference('timeFormat', value as TimeFormat)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_FORMAT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* First Day of Week */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Premier jour de la semaine</Label>
                  <p className="text-xs text-muted-foreground">
                    Définissez le premier jour affiché
                  </p>
                </div>
                <Select
                  value={String(preferences.firstDayOfWeek)}
                  onValueChange={(value) => updatePreference('firstDayOfWeek', Number(value) as 0 | 1)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIRST_DAY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Show Weekends */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Afficher les week-ends</Label>
                  <p className="text-xs text-muted-foreground">
                    Affiche samedi et dimanche dans la vue semaine
                  </p>
                </div>
                <Switch
                  checked={preferences.showWeekends}
                  onCheckedChange={(checked) => updatePreference('showWeekends', checked)}
                />
              </div>

              {/* Show Week Numbers */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Numéro de semaine</Label>
                  <p className="text-xs text-muted-foreground">
                    Affiche le numéro de semaine (ex: S03)
                  </p>
                </div>
                <Switch
                  checked={preferences.showWeekNumbers}
                  onCheckedChange={(checked) => updatePreference('showWeekNumbers', checked)}
                />
              </div>

              {/* Slot Height Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Hauteur des créneaux</Label>
                  <p className="text-xs text-muted-foreground">
                    Mode automatique ou hauteur fixe
                  </p>
                </div>
                <Select
                  value={preferences.slotHeightMode}
                  onValueChange={(value) => updatePreference('slotHeightMode', value as SlotHeightMode)}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SLOT_HEIGHT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SettingsSection>

          {/* Section 3: Plage horaire affichée */}
          <SettingsSection title="Plage horaire affichée">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm">de</Label>
                <Select
                  value={preferences.displayStartTime}
                  onValueChange={(value) => {
                    updatePreference('displayStartTime', value);
                  }}
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
                  onValueChange={(value) => {
                    updatePreference('displayEndTime', value);
                  }}
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

            {/* Hide non-working hours */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <div>
                <Label className="text-sm font-medium">Masquer les heures non ouvrées</Label>
                <p className="text-xs text-muted-foreground">
                  Grise ou masque les créneaux hors plage de travail
                </p>
              </div>
              <Switch
                checked={preferences.hideNonWorkingHours}
                onCheckedChange={(checked) => updatePreference('hideNonWorkingHours', checked)}
              />
            </div>
          </SettingsSection>

          {/* Section 4: Précision de la souris */}
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
              <SelectTrigger className="w-full max-w-md">
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

          {/* Section 6: Informations affichées */}
          <SettingsSection title="Informations affichées">
            <p className="text-sm text-muted-foreground mb-4">
              Personnalisez les informations visibles sur les rendez-vous.
            </p>
            <div className="space-y-4">
              {/* Status Icons */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Icônes de statut</Label>
                  <p className="text-xs text-muted-foreground">
                    Affiche les badges de statut (confirmé, annulé, etc.)
                  </p>
                </div>
                <Switch
                  checked={preferences.showStatusIcons}
                  onCheckedChange={(checked) => updatePreference('showStatusIcons', checked)}
                />
              </div>

              {/* Daily Load Indicator */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Indicateurs de charge</Label>
                  <p className="text-xs text-muted-foreground">
                    Affiche le nombre de RDV par jour (ex: 12/20)
                  </p>
                </div>
                <Switch
                  checked={preferences.showDailyLoadIndicator}
                  onCheckedChange={(checked) => updatePreference('showDailyLoadIndicator', checked)}
                />
              </div>

              {/* Secondary Line Content */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Ligne secondaire</Label>
                  <p className="text-xs text-muted-foreground">
                    Information affichée sous le nom du patient
                  </p>
                </div>
                <Select
                  value={preferences.secondaryLineContent}
                  onValueChange={(value) => updatePreference('secondaryLineContent', value as SecondaryLineContent)}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECONDARY_LINE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SettingsSection>

          {/* Section 7: Confort visuel */}
          <SettingsSection title="Confort visuel">
            <p className="text-sm text-muted-foreground mb-4">
              Personnalisez le thème et les effets visuels de l'agenda.
            </p>
            <div className="space-y-4">
              {/* Agenda Theme */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Thème de l'agenda</Label>
                  <p className="text-xs text-muted-foreground">
                    Choisissez le style de couleurs
                  </p>
                </div>
                <Select
                  value={preferences.agendaTheme}
                  onValueChange={(value) => updatePreference('agendaTheme', value as AgendaTheme)}
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex flex-col">
                          <span>{opt.label}</span>
                          <span className="text-xs text-muted-foreground">{opt.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Concentration Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Mode concentration</Label>
                  <p className="text-xs text-muted-foreground">
                    Masque les éléments non essentiels
                  </p>
                </div>
                <Switch
                  checked={preferences.concentrationMode}
                  onCheckedChange={(checked) => updatePreference('concentrationMode', checked)}
                />
              </div>

              {/* Enable Animations */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Animations</Label>
                  <p className="text-xs text-muted-foreground">
                    Active les transitions et animations fluides
                  </p>
                </div>
                <Switch
                  checked={preferences.enableAnimations}
                  onCheckedChange={(checked) => updatePreference('enableAnimations', checked)}
                />
              </div>
            </div>
          </SettingsSection>

          {/* Section 8: Statistiques */}
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