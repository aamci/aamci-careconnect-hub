import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CIM10Code {
  code: string;
  label: string;
  category: string;
}

/**
 * Base de données CIM-10 simplifiée pour les pathologies les plus courantes
 * en médecine générale française.
 */
const CIM10_DATABASE: CIM10Code[] = [
  // Maladies infectieuses
  { code: 'A09', label: 'Gastro-entérite infectieuse', category: 'Infectieux' },
  { code: 'A49.9', label: 'Infection bactérienne, sans précision', category: 'Infectieux' },
  { code: 'B34.9', label: 'Infection virale, sans précision', category: 'Infectieux' },
  { code: 'J06.9', label: 'Infection des voies respiratoires supérieures', category: 'Infectieux' },

  // Troubles endocriniens et métaboliques
  { code: 'E11', label: 'Diabète de type 2', category: 'Endocrinien' },
  { code: 'E10', label: 'Diabète de type 1', category: 'Endocrinien' },
  { code: 'E03.9', label: 'Hypothyroïdie, sans précision', category: 'Endocrinien' },
  { code: 'E05.9', label: 'Hyperthyroïdie, sans précision', category: 'Endocrinien' },
  { code: 'E66.0', label: 'Obésité due à un excès calorique', category: 'Endocrinien' },
  { code: 'E78.0', label: 'Hypercholestérolémie pure', category: 'Endocrinien' },
  { code: 'E78.5', label: 'Hyperlipidémie, sans précision', category: 'Endocrinien' },
  { code: 'E87.6', label: 'Hypokaliémie', category: 'Endocrinien' },

  // Troubles mentaux
  { code: 'F32.0', label: 'Épisode dépressif léger', category: 'Psychiatrie' },
  { code: 'F32.1', label: 'Épisode dépressif moyen', category: 'Psychiatrie' },
  { code: 'F32.2', label: 'Épisode dépressif sévère sans psychose', category: 'Psychiatrie' },
  { code: 'F41.0', label: 'Trouble panique', category: 'Psychiatrie' },
  { code: 'F41.1', label: 'Anxiété généralisée', category: 'Psychiatrie' },
  { code: 'F51.0', label: 'Insomnie non organique', category: 'Psychiatrie' },

  // Maladies du système nerveux
  { code: 'G43.9', label: 'Migraine, sans précision', category: 'Neurologie' },
  { code: 'G44.2', label: 'Céphalée de tension', category: 'Neurologie' },
  { code: 'G47.3', label: 'Apnée du sommeil', category: 'Neurologie' },

  // Maladies cardiovasculaires
  { code: 'I10', label: 'Hypertension artérielle essentielle', category: 'Cardiovasculaire' },
  { code: 'I11.9', label: 'Cardiopathie hypertensive sans insuffisance cardiaque', category: 'Cardiovasculaire' },
  { code: 'I20.9', label: 'Angine de poitrine, sans précision', category: 'Cardiovasculaire' },
  { code: 'I25.1', label: 'Cardiopathie ischémique chronique', category: 'Cardiovasculaire' },
  { code: 'I48', label: 'Fibrillation auriculaire', category: 'Cardiovasculaire' },
  { code: 'I50.9', label: 'Insuffisance cardiaque, sans précision', category: 'Cardiovasculaire' },
  { code: 'I63.9', label: 'AVC ischémique, sans précision', category: 'Cardiovasculaire' },
  { code: 'I73.9', label: 'Maladie vasculaire périphérique', category: 'Cardiovasculaire' },
  { code: 'I83.9', label: 'Varices des membres inférieurs', category: 'Cardiovasculaire' },

  // Maladies respiratoires
  { code: 'J02.9', label: 'Pharyngite aiguë, sans précision', category: 'Respiratoire' },
  { code: 'J03.9', label: 'Amygdalite aiguë, sans précision', category: 'Respiratoire' },
  { code: 'J18.9', label: 'Pneumonie, sans précision', category: 'Respiratoire' },
  { code: 'J20.9', label: 'Bronchite aiguë, sans précision', category: 'Respiratoire' },
  { code: 'J30.4', label: 'Rhinite allergique, sans précision', category: 'Respiratoire' },
  { code: 'J44.1', label: 'BPCO avec exacerbation aiguë', category: 'Respiratoire' },
  { code: 'J45.9', label: 'Asthme, sans précision', category: 'Respiratoire' },

  // Maladies digestives
  { code: 'K21.0', label: 'Reflux gastro-oesophagien avec oesophagite', category: 'Digestif' },
  { code: 'K25.9', label: 'Ulcère gastrique', category: 'Digestif' },
  { code: 'K29.7', label: 'Gastrite, sans précision', category: 'Digestif' },
  { code: 'K58.9', label: 'Syndrome du côlon irritable', category: 'Digestif' },
  { code: 'K80.2', label: 'Lithiase vésiculaire sans cholécystite', category: 'Digestif' },

  // Maladies de la peau
  { code: 'L20.9', label: 'Dermatite atopique, sans précision', category: 'Dermatologie' },
  { code: 'L30.9', label: 'Dermatite, sans précision', category: 'Dermatologie' },
  { code: 'L40.0', label: 'Psoriasis vulgaire', category: 'Dermatologie' },
  { code: 'L50.9', label: 'Urticaire, sans précision', category: 'Dermatologie' },

  // Maladies ostéo-articulaires
  { code: 'M17.9', label: 'Gonarthrose, sans précision', category: 'Rhumatologie' },
  { code: 'M16.9', label: 'Coxarthrose, sans précision', category: 'Rhumatologie' },
  { code: 'M54.5', label: 'Lombalgie basse', category: 'Rhumatologie' },
  { code: 'M54.2', label: 'Cervicalgie', category: 'Rhumatologie' },
  { code: 'M79.3', label: 'Panniculite, sans précision', category: 'Rhumatologie' },
  { code: 'M25.5', label: 'Douleur articulaire', category: 'Rhumatologie' },

  // Maladies génito-urinaires
  { code: 'N30.0', label: 'Cystite aiguë', category: 'Urologie' },
  { code: 'N39.0', label: 'Infection urinaire', category: 'Urologie' },
  { code: 'N40', label: 'Hypertrophie bénigne de la prostate', category: 'Urologie' },

  // Chirurgicaux (CCAM)
  { code: 'CCAM-HHFA004', label: 'Appendicectomie', category: 'Chirurgie' },
  { code: 'CCAM-HMFC004', label: 'Cholécystectomie par coelioscopie', category: 'Chirurgie' },
  { code: 'CCAM-NFKA006', label: 'Arthroplastie totale du genou', category: 'Chirurgie' },
  { code: 'CCAM-NEKA020', label: 'Arthroplastie totale de la hanche', category: 'Chirurgie' },
  { code: 'CCAM-LMMA001', label: 'Césarienne', category: 'Chirurgie' },

  // Antécédents familiaux fréquents
  { code: 'Z80.0', label: 'AF: Néoplasme malin des organes digestifs', category: 'Familial' },
  { code: 'Z80.3', label: 'AF: Néoplasme malin du sein', category: 'Familial' },
  { code: 'Z82.4', label: 'AF: Cardiopathie ischémique', category: 'Familial' },
  { code: 'Z83.3', label: 'AF: Diabète sucré', category: 'Familial' },
  { code: 'Z82.1', label: 'AF: AVC', category: 'Familial' },
];

interface CIM10SearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelectCode?: (code: CIM10Code) => void;
  placeholder?: string;
  className?: string;
}

const CIM10Search: React.FC<CIM10SearchProps> = ({
  value,
  onChange,
  onSelectCode,
  placeholder = 'Rechercher un diagnostic CIM-10 ou CCAM...',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const filteredResults = useMemo(() => {
    if (!value || value.length < 2) return [];
    const query = value.toLowerCase();
    return CIM10_DATABASE.filter(
      (item) =>
        item.code.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    ).slice(0, 10);
  }, [value]);

  const handleSelect = (item: CIM10Code) => {
    onChange(`[${item.code}] ${item.label}`);
    onSelectCode?.(item);
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>

      {isOpen && filteredResults.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-[250px] overflow-y-auto">
          {filteredResults.map((item) => (
            <button
              key={item.code}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors border-b last:border-b-0"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(item);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs text-muted-foreground font-mono">{item.code}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CIM10Search;
