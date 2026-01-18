/**
 * EnhancedAntecedentFormModal - Smart Medical Input with Coding Support
 * Enterprise-grade antecedent entry form with CIM-10/CISP-2/CCAM suggestions
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Loader2,
  Shield,
  AlertTriangle,
  Star,
  Users,
  Info,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import SmartMedicalInput from '@/components/medical/SmartMedicalInput';
import type { SearchMode } from '@/components/medical/SmartMedicalInput';
import type {
  CodedValue,
  TerminologySuggestion,
  Severity,
  ClinicalStatus,
  VerificationStatus,
  FamilyRelative,
} from '@/types/medicalHistory';

// ============================================================================
// TYPES
// ============================================================================

export type EnhancedAntecedentCategory =
  | 'medical'
  | 'cardiovascular'
  | 'surgical'
  | 'family'
  | 'lifestyle'
  | 'perinatal'
  | 'gynecological'
  | 'device';

export interface EnhancedAntecedentFormData {
  // Common fields
  title: string;
  description?: string;
  coding?: CodedValue;
  occurrenceDate?: Date;
  endDate?: Date;
  severity: Severity;
  clinicalStatus: ClinicalStatus;
  verificationStatus: VerificationStatus;
  notes?: string;
  isPinned: boolean;

  // ALD fields (for medical conditions)
  isALD?: boolean;
  aldStartDate?: Date;
  aldEndDate?: Date;

  // Family history specific
  familyRelative?: FamilyRelative;
  relativeAgeAtOnset?: number;
  relativeYearOfOnset?: number;

  // Lifestyle specific
  lifestyleCategory?: string;
  lifestyleValue?: string;
  lifestyleQuantity?: string;
}

interface EnhancedAntecedentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EnhancedAntecedentFormData) => Promise<void>;
  category: EnhancedAntecedentCategory;
  isLoading?: boolean;
  initialData?: Partial<EnhancedAntecedentFormData>;
  patientGender?: 'male' | 'female' | 'other';
  patientAge?: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const categoryConfig: Record<
  EnhancedAntecedentCategory,
  {
    label: string;
    searchMode: SearchMode;
    placeholder: string;
    description: string;
    showALD: boolean;
    showFamilyFields: boolean;
    showLifestyleFields: boolean;
  }
> = {
  medical: {
    label: 'Antecedent medical',
    searchMode: 'conditions',
    placeholder: 'Ex: Diabete type 2, HTA, BPCO...',
    description: 'Saisissez le diagnostic ou utilisez les raccourcis (HTA, DT2, AVC...)',
    showALD: true,
    showFamilyFields: false,
    showLifestyleFields: false,
  },
  cardiovascular: {
    label: 'Appareil cardiovasculaire',
    searchMode: 'conditions',
    placeholder: 'Ex: Insuffisance cardiaque, FA, IDM...',
    description: 'Pathologies cardiovasculaires (IDM, FA, IC, AOMI...)',
    showALD: true,
    showFamilyFields: false,
    showLifestyleFields: false,
  },
  surgical: {
    label: 'Antecedent chirurgical',
    searchMode: 'procedures',
    placeholder: 'Ex: Appendicectomie, PTH, cholecystectomie...',
    description: 'Interventions chirurgicales avec code CCAM si disponible',
    showALD: false,
    showFamilyFields: false,
    showLifestyleFields: false,
  },
  family: {
    label: 'Antecedent familial',
    searchMode: 'conditions',
    placeholder: 'Ex: Cancer du sein, diabete...',
    description: 'Pathologies familiales avec lien de parente',
    showALD: false,
    showFamilyFields: true,
    showLifestyleFields: false,
  },
  lifestyle: {
    label: 'Mode de vie',
    searchMode: 'all',
    placeholder: 'Ex: Tabagisme, alcool, activite physique...',
    description: 'Habitudes et facteurs de risque lies au mode de vie',
    showALD: false,
    showFamilyFields: false,
    showLifestyleFields: true,
  },
  perinatal: {
    label: 'Information perinatale',
    searchMode: 'conditions',
    placeholder: 'Ex: Prematurite, complications neonatales...',
    description: 'Informations a la naissance (0-3 ans)',
    showALD: false,
    showFamilyFields: false,
    showLifestyleFields: false,
  },
  gynecological: {
    label: 'Antecedent gynecologique',
    searchMode: 'conditions',
    placeholder: 'Ex: Endometriose, fibrome...',
    description: 'Pathologies gynecologiques et obstetricales',
    showALD: true,
    showFamilyFields: false,
    showLifestyleFields: false,
  },
  device: {
    label: 'Dispositif medical',
    searchMode: 'all',
    placeholder: 'Ex: Pacemaker, stent, prothese...',
    description: 'Dispositifs medicaux implantes ou portes',
    showALD: false,
    showFamilyFields: false,
    showLifestyleFields: false,
  },
};

const severityOptions: Array<{ value: Severity; label: string; className: string }> = [
  { value: 'low', label: 'Faible', className: 'bg-muted text-muted-foreground' },
  { value: 'medium', label: 'Modere', className: 'bg-warning/20 text-warning' },
  { value: 'high', label: 'Eleve', className: 'bg-orange-100 text-orange-700' },
  { value: 'critical', label: 'Critique', className: 'bg-destructive/20 text-destructive' },
];

const clinicalStatusOptions: Array<{ value: ClinicalStatus; label: string }> = [
  { value: 'active', label: 'Actif' },
  { value: 'resolved', label: 'Resolu' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'recurrence', label: 'Recidive' },
  { value: 'remission', label: 'Remission' },
];

const verificationStatusOptions: Array<{ value: VerificationStatus; label: string }> = [
  { value: 'confirmed', label: 'Confirme' },
  { value: 'suspected', label: 'Suspecte' },
  { value: 'refuted', label: 'Refute' },
];

const familyRelativeOptions: Array<{ value: FamilyRelative; label: string }> = [
  { value: 'mother', label: 'Mere' },
  { value: 'father', label: 'Pere' },
  { value: 'sibling', label: 'Frere/Soeur' },
  { value: 'child', label: 'Enfant' },
  { value: 'maternal_grandmother', label: 'Grand-mere maternelle' },
  { value: 'maternal_grandfather', label: 'Grand-pere maternel' },
  { value: 'paternal_grandmother', label: 'Grand-mere paternelle' },
  { value: 'paternal_grandfather', label: 'Grand-pere paternel' },
  { value: 'maternal_aunt', label: 'Tante maternelle' },
  { value: 'maternal_uncle', label: 'Oncle maternel' },
  { value: 'paternal_aunt', label: 'Tante paternelle' },
  { value: 'paternal_uncle', label: 'Oncle paternel' },
  { value: 'cousin', label: 'Cousin(e)' },
  { value: 'other', label: 'Autre' },
];

// ============================================================================
// FORM SCHEMA
// ============================================================================

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Le titre est requis')
    .max(200, 'Maximum 200 caracteres'),
  description: z.string().trim().max(1000).optional(),
  occurrenceDate: z.date().optional(),
  endDate: z.date().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  clinicalStatus: z
    .enum(['active', 'resolved', 'inactive', 'recurrence', 'remission'])
    .default('active'),
  verificationStatus: z
    .enum(['confirmed', 'suspected', 'refuted', 'entered_in_error'])
    .default('confirmed'),
  notes: z.string().trim().max(500).optional(),
  isPinned: z.boolean().default(false),
  isALD: z.boolean().optional(),
  aldStartDate: z.date().optional(),
  aldEndDate: z.date().optional(),
  familyRelative: z
    .enum([
      'mother',
      'father',
      'sibling',
      'child',
      'maternal_grandmother',
      'maternal_grandfather',
      'paternal_grandmother',
      'paternal_grandfather',
      'maternal_aunt',
      'maternal_uncle',
      'paternal_aunt',
      'paternal_uncle',
      'cousin',
      'other',
    ])
    .optional(),
  relativeAgeAtOnset: z.number().min(0).max(120).optional(),
  relativeYearOfOnset: z.number().min(1900).max(2100).optional(),
  lifestyleCategory: z.string().optional(),
  lifestyleValue: z.string().optional(),
  lifestyleQuantity: z.string().optional(),
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const EnhancedAntecedentFormModal: React.FC<EnhancedAntecedentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading = false,
  initialData,
  patientGender,
  patientAge,
}) => {
  const config = categoryConfig[category];
  const [coding, setCoding] = useState<CodedValue | null>(initialData?.coding || null);
  const [searchValue, setSearchValue] = useState(initialData?.title || '');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      severity: initialData?.severity || 'low',
      clinicalStatus: initialData?.clinicalStatus || 'active',
      verificationStatus: initialData?.verificationStatus || 'confirmed',
      notes: initialData?.notes || '',
      isPinned: initialData?.isPinned || false,
      isALD: initialData?.isALD || false,
      familyRelative: initialData?.familyRelative,
      relativeAgeAtOnset: initialData?.relativeAgeAtOnset,
      relativeYearOfOnset: initialData?.relativeYearOfOnset,
      lifestyleCategory: initialData?.lifestyleCategory,
      lifestyleValue: initialData?.lifestyleValue,
      lifestyleQuantity: initialData?.lifestyleQuantity,
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        title: initialData?.title || '',
        description: initialData?.description || '',
        severity: initialData?.severity || 'low',
        clinicalStatus: initialData?.clinicalStatus || 'active',
        verificationStatus: initialData?.verificationStatus || 'confirmed',
        notes: initialData?.notes || '',
        isPinned: initialData?.isPinned || false,
        isALD: initialData?.isALD || false,
      });
      setSearchValue(initialData?.title || '');
      setCoding(initialData?.coding || null);
    }
  }, [isOpen, initialData, form]);

  const handleSuggestionSelect = (suggestion: TerminologySuggestion) => {
    const { concept } = suggestion;
    setSearchValue(concept.display);
    form.setValue('title', concept.display);

    if (concept.system !== 'FREE_TEXT') {
      setCoding({
        system: concept.system,
        code: concept.code,
        display: concept.display,
        userSelected: true,
      });
    } else {
      setCoding(null);
    }
  };

  const handleFreeTextSubmit = (text: string) => {
    setSearchValue(text);
    form.setValue('title', text);
    setCoding(null);
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData: EnhancedAntecedentFormData = {
      ...data,
      coding: coding || undefined,
    };
    await onSubmit(formData);
    form.reset();
    setSearchValue('');
    setCoding(null);
  };

  const handleClose = () => {
    form.reset();
    setSearchValue('');
    setCoding(null);
    onClose();
  };

  const isALDChecked = form.watch('isALD');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            Ajouter - {config.label}
            {coding && (
              <Badge variant="outline" className="ml-2 text-xs">
                <Shield className="h-3 w-3 mr-1 text-green-600" />
                Code
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Smart Medical Input */}
            <div className="space-y-2">
              <FormLabel className="text-sm font-medium">
                Diagnostic / Intitule <span className="text-destructive">*</span>
              </FormLabel>
              <SmartMedicalInput
                value={searchValue}
                onChange={(value) => {
                  setSearchValue(value);
                  form.setValue('title', value);
                }}
                onSelect={handleSuggestionSelect}
                onFreeTextSubmit={handleFreeTextSubmit}
                selectedCoding={coding}
                onCodingChange={setCoding}
                mode={config.searchMode}
                placeholder={config.placeholder}
                allowFreeText={true}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">{config.description}</p>
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            {/* Family History Fields */}
            {config.showFamilyFields && (
              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4 text-primary" />
                  Lien de parente
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="familyRelative"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Proche</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selectionnez un proche" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {familyRelativeOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="relativeAgeAtOnset"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Age de survenue</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Age"
                            min={0}
                            max={120}
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value ? parseInt(e.target.value) : undefined
                              )
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="relativeYearOfOnset"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Annee de survenue (alternative)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Ex: 2015"
                          min={1900}
                          max={2100}
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? parseInt(e.target.value) : undefined
                            )
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Details supplementaires..."
                      className="resize-none min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Status Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="occurrenceDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Date de debut</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: fr })
                            ) : (
                              <span>Selectionner</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clinicalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Statut clinique</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clinicalStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Severity and Verification Row */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Severite</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {severityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  opt.value === 'low' && 'bg-muted-foreground',
                                  opt.value === 'medium' && 'bg-warning',
                                  opt.value === 'high' && 'bg-orange-500',
                                  opt.value === 'critical' && 'bg-destructive'
                                )}
                              />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="verificationStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Verification</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {verificationStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ALD Section */}
            {config.showALD && (
              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                <FormField
                  control={form.control}
                  name="isALD"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium">
                          Affection de Longue Duree (ALD)
                        </FormLabel>
                        <FormDescription className="text-xs">
                          Cochez si cette pathologie est reconnue en ALD
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {isALDChecked && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <FormField
                      control={form.control}
                      name="aldStartDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm">Debut ALD</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal text-sm',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'dd/MM/yyyy', { locale: fr })
                                  ) : (
                                    <span>Date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                locale={fr}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="aldEndDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm">Fin ALD</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full pl-3 text-left font-normal text-sm',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, 'dd/MM/yyyy', { locale: fr })
                                  ) : (
                                    <span>Date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                locale={fr}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Notes complementaires
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes internes..."
                      className="resize-none min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pin Option */}
            <FormField
              control={form.control}
              name="isPinned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="flex items-center gap-2">
                    <Star
                      className={cn(
                        'h-4 w-4',
                        field.value ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'
                      )}
                    />
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      Epingler en haut de la liste
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Coding indicator */}
            {coding && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Code {coding.system}: <strong>{coding.code}</strong> - {coding.display}
                </span>
              </div>
            )}

            {!coding && searchValue && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-sm text-amber-800">
                  Texte libre - non code. La securisation ordonnance ne sera pas active.
                </span>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAntecedentFormModal;
