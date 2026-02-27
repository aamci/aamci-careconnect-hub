import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Info, AlertTriangle } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { IdentityDocType, IDENTITY_DOC_OPTIONS } from './types';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface IdentityValidationSectionProps {
  value: IdentityDocType;
  onValueChange: (value: IdentityDocType) => void;
  disabled?: boolean;
}

const IdentityValidationSection: React.FC<IdentityValidationSectionProps> = ({
  value,
  onValueChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleReportIdentity = () => {
    toast.warning('Signalement d\'identité douteuse enregistré. Le service qualité sera notifié.');
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-border rounded-lg bg-card">
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors rounded-t-lg">
        <h3 className="text-base font-semibold text-foreground">
          Validation de l'identité du patient
        </h3>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="px-4 pb-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Pour permettre le partage de documents au Dossier Médical Partagé du patient, validez son identité.
          </p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Type de pièce d'identité vérifiée
            </label>
            
            <Select
              value={value || undefined}
              onValueChange={(val) => onValueChange(val as IdentityDocType)}
              disabled={disabled}
            >
              <SelectTrigger className="w-full max-w-md h-10 bg-muted/30">
                <SelectValue placeholder="Sélectionner la pièce d'identité" />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {/* Information item - non-selectable */}
                <div className="px-3 py-3 text-xs text-muted-foreground border-b border-border bg-muted/20 leading-relaxed">
                  J'atteste déjà connaître l'identité de cette personne et sa correspondance aux traits d'identité INSi. Cela me permet de partager ses données en toute sécurité.
                </div>
                
                {IDENTITY_DOC_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        {option.level}
                      </span>
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <button
            type="button"
            onClick={handleReportIdentity}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <span>Signaler une identité douteuse ou fictive</span>
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default IdentityValidationSection;
