import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Info, History, ChevronRight } from 'lucide-react';
import { Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  PatientAdminInfo, 
  DEFAULT_ADMIN_INFO, 
  CivilityType, 
  SexType, 
  BirthPlaceType,
  InsuranceType,
  INSURANCE_OPTIONS,
  COUNTRIES,
} from './types';
import BirthPlaceAutocomplete from './BirthPlaceAutocomplete';
import IdentityValidationSection from './IdentityValidationSection';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface InfosAdministrativesPanelProps {
  patient: Patient;
  onClose: () => void;
}

const InfosAdministrativesPanel: React.FC<InfosAdministrativesPanelProps> = ({
  patient,
  onClose,
}) => {
  const navigate = useNavigate();
  
  // Initialize form with patient data
  const initialData = useMemo((): PatientAdminInfo => ({
    ...DEFAULT_ADMIN_INFO,
    birthName: patient.lastName || '',
    usedName: patient.usedLastName || '',
    birthFirstname: patient.firstName || '',
    usedFirstname: patient.usedFirstName || '',
    birthDate: patient.dateOfBirth ? format(patient.dateOfBirth, 'dd/MM/yyyy') : '',
    birthCity: patient.birthPlace || '',
    phoneMobile: patient.phone || '',
    phoneLandline: patient.phoneSecondary || '',
    email: patient.email || '',
    address: patient.address || '',
    postalCode: patient.postalCode || '',
    city: patient.city || '',
    gpName: patient.referringDoctor?.split(',')[0]?.trim() || '',
    gpCity: patient.referringDoctor?.split(',')[1]?.trim() || '',
    civility: patient.gender === 'male' ? 'M.' : patient.gender === 'female' ? 'Mme' : 'Inconnu',
    sex: patient.gender === 'male' ? 'Homme' : patient.gender === 'female' ? 'Femme' : null,
    remark: patient.notes || '',
  }), [patient]);

  const [formData, setFormData] = useState<PatientAdminInfo>(initialData);
  const [originalData, setOriginalData] = useState<PatientAdminInfo>(initialData);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData(initialData);
    setOriginalData(initialData);
  }, [initialData]);

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);
    setIsDirty(hasChanges);
  }, [formData, originalData]);

  const updateField = <K extends keyof PatientAdminInfo>(
    field: K,
    value: PatientAdminInfo[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsDirty(false);
  };

  const handleSave = async () => {
    // Validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Format email invalide');
      return;
    }

    // TODO: Call API to save
    toast.success('Fiche patient enregistrée');
    setOriginalData(formData);
    setIsDirty(false);
  };

  const handleHistoryClick = () => {
    // TODO: Open history drawer/modal
    toast.info('Historique des modifications à venir');
  };

  const FormRow: React.FC<{ 
    label: string; 
    children: React.ReactNode;
    tooltip?: string;
    className?: string;
  }> = ({ label, children, tooltip, className = '' }) => (
    <div className={`grid grid-cols-[180px_1fr] gap-4 items-start ${className}`}>
      <Label className="text-sm font-medium text-foreground pt-2.5 text-right flex items-center justify-end gap-1">
        {label}
        {tooltip && (
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        )}
      </Label>
      <div className="flex-1">{children}</div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-primary font-medium">Dossier patient</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-semibold">Coordonnées</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Fermer ce dossier patient
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-5 max-w-3xl mx-auto">
          
          {/* INS Section */}
          <FormRow label="Matricule INS">
            <div className="flex gap-3">
              <Input
                value={formData.insNumber}
                onChange={(e) => updateField('insNumber', e.target.value)}
                placeholder=""
                className="flex-1 h-10 bg-muted/30"
              />
              <Input
                value={formData.oid}
                onChange={(e) => updateField('oid', e.target.value)}
                placeholder="OID"
                className="w-32 h-10 bg-muted/50 text-muted-foreground"
              />
            </div>
          </FormRow>

          {/* Civility */}
          <FormRow label="Civilité">
            <div className="bg-muted/30 rounded-lg px-4 py-2.5 border border-border">
              <RadioGroup
                value={formData.civility}
                onValueChange={(val) => updateField('civility', val as CivilityType)}
                className="flex gap-6"
              >
                {(['M.', 'Mme', 'Inconnu'] as CivilityType[]).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`civility-${opt}`} />
                    <Label htmlFor={`civility-${opt}`} className="text-sm cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </FormRow>

          {/* Sex */}
          <FormRow label="Sexe">
            <div className="bg-muted/30 rounded-lg px-4 py-2.5 border border-border">
              <RadioGroup
                value={formData.sex || ''}
                onValueChange={(val) => updateField('sex', val as SexType)}
                className="flex gap-6"
              >
                {(['Homme', 'Femme'] as const).map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <RadioGroupItem value={opt} id={`sex-${opt}`} />
                    <Label htmlFor={`sex-${opt}`} className="text-sm cursor-pointer">
                      {opt}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </FormRow>

          {/* Names */}
          <FormRow label="Nom de naissance">
            <div className="flex gap-3">
              <Input
                value={formData.birthName}
                onChange={(e) => updateField('birthName', e.target.value)}
                className="flex-1 h-10 bg-muted/30"
              />
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-sm font-medium text-foreground whitespace-nowrap">Nom utilisé</Label>
                <Input
                  value={formData.usedName}
                  onChange={(e) => updateField('usedName', e.target.value)}
                  className="flex-1 h-10 bg-muted/30"
                />
              </div>
            </div>
          </FormRow>

          <FormRow label="1er prénom de naissance">
            <div className="flex gap-3">
              <Input
                value={formData.birthFirstname}
                onChange={(e) => updateField('birthFirstname', e.target.value)}
                className="flex-1 h-10 bg-muted/30"
              />
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-sm font-medium text-foreground whitespace-nowrap">Prénom utilisé</Label>
                <Input
                  value={formData.usedFirstname}
                  onChange={(e) => updateField('usedFirstname', e.target.value)}
                  className="flex-1 h-10 bg-muted/30"
                />
              </div>
            </div>
          </FormRow>

          <FormRow label="Prénom(s) de naissance">
            <Input
              value={formData.birthFirstnames}
              onChange={(e) => updateField('birthFirstnames', e.target.value)}
              className="h-10 bg-muted/30"
            />
          </FormRow>

          {/* Birth date */}
          <FormRow label="Date de naissance">
            <Input
              value={formData.birthDate}
              onChange={(e) => updateField('birthDate', e.target.value)}
              placeholder="jj/mm/aaaa"
              className="h-10 bg-muted/30"
            />
          </FormRow>

          {/* Birth place */}
          <FormRow label="Lieu de naissance">
            <div className="space-y-3">
              <div className="bg-muted/30 rounded-lg px-4 py-2.5 border border-border">
                <RadioGroup
                  value={formData.birthPlaceType}
                  onValueChange={(val) => {
                    updateField('birthPlaceType', val as BirthPlaceType);
                    if (val === 'unknown') {
                      updateField('birthCity', '');
                      updateField('birthCityId', '');
                      updateField('birthCountry', '');
                      updateField('birthCountryCode', '');
                    }
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="france" id="birthplace-france" />
                    <Label htmlFor="birthplace-france" className="text-sm cursor-pointer">En France</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="abroad" id="birthplace-abroad" />
                    <Label htmlFor="birthplace-abroad" className="text-sm cursor-pointer">Hors de France</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="unknown" id="birthplace-unknown" />
                    <Label htmlFor="birthplace-unknown" className="text-sm cursor-pointer">Inconnu</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {formData.birthPlaceType !== 'unknown' && (
                <BirthPlaceAutocomplete
                  type={formData.birthPlaceType}
                  value={formData.birthPlaceType === 'france' ? formData.birthCity : formData.birthCountry}
                  onValueChange={(value, id) => {
                    if (formData.birthPlaceType === 'france') {
                      updateField('birthCity', value);
                      updateField('birthCityId', id || '');
                    } else {
                      updateField('birthCountry', value);
                      updateField('birthCountryCode', id || '');
                    }
                  }}
                  onClear={() => {
                    if (formData.birthPlaceType === 'france') {
                      updateField('birthCity', '');
                      updateField('birthCityId', '');
                    } else {
                      updateField('birthCountry', '');
                      updateField('birthCountryCode', '');
                    }
                  }}
                />
              )}
            </div>
          </FormRow>

          {/* Phone */}
          <FormRow label="Téléphone">
            <div className="flex gap-3">
              <Input
                value={formData.phoneMobile}
                onChange={(e) => updateField('phoneMobile', e.target.value)}
                placeholder="Téléphone portable"
                className="flex-1 h-10 bg-muted/30"
              />
              <Input
                value={formData.phoneLandline}
                onChange={(e) => updateField('phoneLandline', e.target.value)}
                placeholder="Téléphone fixe"
                className="flex-1 h-10 bg-muted/30"
              />
            </div>
          </FormRow>

          {/* Email */}
          <FormRow label="E-mail">
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="h-10 bg-muted/30"
            />
          </FormRow>

          {/* Address */}
          <FormRow label="Adresse">
            <Input
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Adresse"
              className="h-10 bg-muted/30"
            />
          </FormRow>

          <FormRow label="">
            <div className="flex gap-3">
              <Input
                value={formData.postalCode}
                onChange={(e) => updateField('postalCode', e.target.value)}
                placeholder="Code postal"
                className="flex-1 h-10 bg-muted/30"
              />
              <Input
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="Ville"
                className="flex-1 h-10 bg-muted/30"
              />
            </div>
          </FormRow>

          {/* Country */}
          <FormRow label="Pays">
            <Select
              value={formData.countryCode}
              onValueChange={(val) => {
                const country = COUNTRIES.find(c => c.code === val);
                updateField('countryCode', val);
                updateField('country', country?.name || '');
              }}
            >
              <SelectTrigger className="h-10 bg-muted/30">
                <SelectValue placeholder="Pays" />
              </SelectTrigger>
              <SelectContent className="bg-popover max-h-60 z-50">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          {/* Digicode */}
          <FormRow label="Digicode">
            <Input
              value={formData.digicode}
              onChange={(e) => updateField('digicode', e.target.value)}
              placeholder="Ex : 123AB"
              className="h-10 bg-muted/30"
            />
          </FormRow>

          {/* Insurance */}
          <FormRow label="Assurance">
            <Select
              value={formData.insuranceType}
              onValueChange={(val) => updateField('insuranceType', val as InsuranceType)}
            >
              <SelectTrigger className="h-10 bg-muted/30">
                <SelectValue placeholder="Assurance" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {INSURANCE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value || 'none'} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormRow>

          {/* Remark */}
          <FormRow label="Remarque" tooltip="Information importante qui apparaîtra lors de la prise de RDV">
            <Input
              value={formData.remark}
              onChange={(e) => updateField('remark', e.target.value)}
              placeholder="Information importante qui apparaîtra lors de la prise de RDV"
              className="h-10 bg-muted/30"
            />
          </FormRow>

          {/* Provenance */}
          <FormRow label="Provenance">
            <Input
              value={formData.provenance}
              onChange={(e) => updateField('provenance', e.target.value)}
              placeholder="Ex : médecin généraliste, dentiste, pharmacien"
              className="h-10 bg-muted/30"
            />
          </FormRow>

          {/* Profession */}
          <FormRow label="Profession">
            <Input
              value={formData.profession}
              onChange={(e) => updateField('profession', e.target.value)}
              placeholder="Profession"
              className="h-10 bg-muted/30"
            />
          </FormRow>

          {/* GP */}
          <FormRow label="Médecin traitant">
            <div className="flex gap-3">
              <Input
                value={formData.gpName}
                onChange={(e) => updateField('gpName', e.target.value)}
                placeholder="Nom"
                className="flex-1 h-10 bg-muted/30"
              />
              <Input
                value={formData.gpCity}
                onChange={(e) => updateField('gpCity', e.target.value)}
                placeholder="Ville"
                className="flex-1 h-10 bg-muted/30"
              />
            </div>
          </FormRow>

          {/* Notifications */}
          <FormRow label="Notifications">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                Envoi de SMS et emails activé
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Active ou désactive l'envoi de SMS et emails au patient
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="bg-muted/30 rounded-lg px-4 py-2 border border-border">
                <RadioGroup
                  value={formData.notificationsEnabled ? 'true' : 'false'}
                  onValueChange={(val) => updateField('notificationsEnabled', val === 'true')}
                  className="flex gap-4"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id="notif-yes" />
                    <Label htmlFor="notif-yes" className="text-sm cursor-pointer">Oui</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="false" id="notif-no" />
                    <Label htmlFor="notif-no" className="text-sm cursor-pointer">Non</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </FormRow>

          {/* History link */}
          <div className="pl-[196px]">
            <button
              type="button"
              onClick={handleHistoryClick}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <History className="h-4 w-4" />
              Voir l'historique des modifications et des notifications (dernière année seulement)
            </button>
          </div>

          {/* Identity Validation Section */}
          <div className="pt-4">
            <IdentityValidationSection
              value={formData.identityDocType}
              onValueChange={(val) => updateField('identityDocType', val)}
            />
          </div>

        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="flex-shrink-0 border-t border-border px-6 py-4 bg-card">
        <div className="flex items-center justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={!isDirty}
            className="text-foreground"
          >
            ANNULER
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6"
          >
            ENREGISTRER LA FICHE PATIENT
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InfosAdministrativesPanel;
