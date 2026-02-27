/**
 * PatientConsentsSection - Gestion des consentements patient
 *
 * P0-007: Section RGPD-compliant pour les consentements obligatoires et optionnels
 *
 * Consentements gérés:
 * - Soins: Consentement général aux soins
 * - Communication: Email/SMS pour RDV et suivi
 * - Données: Partage avec autres professionnels
 * - Télésanté: Téléconsultation et télésuivi
 * - Recherche: Participation études cliniques (optionnel)
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileCheck,
  Shield,
  Mail,
  Share2,
  Video,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Check,
  X,
  Clock,
  Info,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Types for consent management
export interface PatientConsent {
  id: string;
  type: ConsentType;
  status: ConsentStatus;
  givenAt?: Date;
  revokedAt?: Date;
  expiresAt?: Date;
  source: 'patient_portal' | 'in_person' | 'phone' | 'paper';
  witnessName?: string;
  notes?: string;
}

export type ConsentType =
  | 'general_care'      // Consentement aux soins
  | 'communication'     // Email/SMS
  | 'data_sharing'      // Partage données santé
  | 'telehealth'        // Téléconsultation
  | 'clinical_research' // Recherche (optionnel)
  | 'third_party_sharing'; // Partage tiers

export type ConsentStatus = 'granted' | 'refused' | 'pending' | 'expired' | 'revoked';

interface ConsentConfig {
  type: ConsentType;
  icon: React.ElementType;
  label: string;
  description: string;
  required: boolean;
  expirationMonths?: number; // null = no expiration
}

const CONSENT_CONFIGS: ConsentConfig[] = [
  {
    type: 'general_care',
    icon: Shield,
    label: 'Consentement aux soins',
    description: 'Autorisation de recevoir des soins médicaux dans notre établissement',
    required: true,
  },
  {
    type: 'communication',
    icon: Mail,
    label: 'Communications électroniques',
    description: 'Recevoir des rappels RDV, résultats et informations par email/SMS',
    required: false,
  },
  {
    type: 'data_sharing',
    icon: Share2,
    label: 'Partage de données médicales',
    description: 'Partage du dossier médical avec les professionnels de santé concernés',
    required: false,
  },
  {
    type: 'telehealth',
    icon: Video,
    label: 'Téléconsultation',
    description: 'Consultations à distance par vidéo sécurisée',
    required: false,
  },
  {
    type: 'clinical_research',
    icon: FlaskConical,
    label: 'Recherche clinique',
    description: 'Utilisation anonymisée des données à des fins de recherche médicale',
    required: false,
    expirationMonths: 24,
  },
];

interface PatientConsentsSectionProps {
  /** Patient ID for data operations */
  patientId?: string;
  /** Initial consents data */
  consents?: PatientConsent[];
  /** Callback when consents change */
  onChange?: (consents: PatientConsent[]) => void;
  /** Read-only mode */
  readOnly?: boolean;
}

const PatientConsentsSection: React.FC<PatientConsentsSectionProps> = ({
  patientId,
  consents: initialConsents = [],
  onChange,
  readOnly = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [consents, setConsents] = useState<PatientConsent[]>(initialConsents);

  // Get consent status for a type
  const getConsent = (type: ConsentType): PatientConsent | undefined => {
    return consents.find((c) => c.type === type);
  };

  // Toggle consent
  const handleToggleConsent = (config: ConsentConfig, granted: boolean) => {
    const existing = getConsent(config.type);
    const now = new Date();

    let updatedConsent: PatientConsent;

    if (granted) {
      updatedConsent = {
        id: existing?.id || crypto.randomUUID(),
        type: config.type,
        status: 'granted',
        givenAt: now,
        expiresAt: config.expirationMonths
          ? new Date(now.setMonth(now.getMonth() + config.expirationMonths))
          : undefined,
        source: 'in_person',
      };
    } else {
      updatedConsent = {
        id: existing?.id || crypto.randomUUID(),
        type: config.type,
        status: existing?.status === 'granted' ? 'revoked' : 'refused',
        revokedAt: existing?.status === 'granted' ? now : undefined,
        source: 'in_person',
      };
    }

    const newConsents = consents.filter((c) => c.type !== config.type);
    newConsents.push(updatedConsent);
    setConsents(newConsents);
    onChange?.(newConsents);

    toast.success(
      granted
        ? `Consentement "${config.label}" accordé`
        : `Consentement "${config.label}" ${existing?.status === 'granted' ? 'révoqué' : 'refusé'}`
    );
  };

  // Count statistics
  const grantedCount = consents.filter((c) => c.status === 'granted').length;
  const requiredMissing = CONSENT_CONFIGS.filter(
    (c) => c.required && getConsent(c.type)?.status !== 'granted'
  );

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between p-4 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">
                  Consentements patient
                </h3>
                <p className="text-xs text-muted-foreground">
                  {grantedCount}/{CONSENT_CONFIGS.length} consentements actifs
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {requiredMissing.length > 0 && (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {requiredMissing.length} obligatoire{requiredMissing.length > 1 ? 's' : ''} manquant{requiredMissing.length > 1 ? 's' : ''}
                </Badge>
              )}
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <Separator />
          <div className="p-4 space-y-3">
            {CONSENT_CONFIGS.map((config, index) => {
              const consent = getConsent(config.type);
              const isGranted = consent?.status === 'granted';
              const isExpired = consent?.expiresAt && new Date(consent.expiresAt) < new Date();
              const Icon = config.icon;

              return (
                <div
                  key={config.type}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border transition-colors',
                    isGranted && !isExpired
                      ? 'bg-green-50/50 border-green-200'
                      : config.required && !isGranted
                        ? 'bg-destructive/5 border-destructive/20'
                        : 'bg-muted/30 border-border'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        'h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        isGranted && !isExpired
                          ? 'bg-green-100 text-green-700'
                          : config.required && !isGranted
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">
                          {config.label}
                        </span>
                        {config.required && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                            Obligatoire
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {config.description}
                      </p>
                      {consent && (
                        <div className="flex items-center gap-2 mt-1">
                          {isGranted && consent.givenAt && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-600" />
                              {format(new Date(consent.givenAt), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                          )}
                          {isExpired && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-50 text-amber-700 border-amber-200">
                              <Clock className="h-2.5 w-2.5 mr-0.5" />
                              Expiré
                            </Badge>
                          )}
                          {consent.status === 'revoked' && consent.revokedAt && (
                            <span className="text-[10px] text-destructive flex items-center gap-1">
                              <X className="h-3 w-3" />
                              Révoqué le {format(new Date(consent.revokedAt), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => toast.info(`Consentement ${isGranted ? 'accordé' : 'refusé'} — dernière mise à jour enregistrée`)}
                        >
                          <History className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Historique</TooltipContent>
                    </Tooltip>
                    <Switch
                      checked={isGranted && !isExpired}
                      onCheckedChange={(checked) => handleToggleConsent(config, checked)}
                      disabled={readOnly}
                      className={cn(
                        isGranted && !isExpired && 'data-[state=checked]:bg-green-600'
                      )}
                    />
                  </div>
                </div>
              );
            })}

            {/* Info footer */}
            <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                Ces consentements sont enregistrés conformément au RGPD et au Code de la santé publique.
                Le patient peut les modifier ou les révoquer à tout moment via son espace personnel ou sur demande.
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PatientConsentsSection;
