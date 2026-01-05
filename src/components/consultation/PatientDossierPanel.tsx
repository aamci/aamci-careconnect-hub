import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  AlertTriangle, 
  Info, 
  Eye, 
  Search,
  FileDown,
  Link as LinkIcon,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { consultationPatient, mockAntecedents } from '@/data/consultationMockData';
import { Antecedent } from '@/types/consultation';

interface PatientDossierPanelProps {
  onExportDossier?: () => void;
  onSearch?: (query: string) => void;
}

const PatientDossierPanel: React.FC<PatientDossierPanelProps> = ({
  onExportDossier,
  onSearch
}) => {
  const [isInfosOpen, setIsInfosOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAntecedentsOpen, setIsAntecedentsOpen] = useState(true);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const patient = consultationPatient;
  const antecedents = mockAntecedents;

  // Group antecedents by category
  const medicalAntecedents = antecedents.filter(a => a.category === 'medical');
  const cardiovascularAntecedents = antecedents.filter(a => a.category === 'cardiovascular');
  const surgicalAntecedents = antecedents.filter(a => a.category === 'surgical');
  const allergies = antecedents.filter(a => a.category === 'allergy');
  const familyAntecedents = antecedents.filter(a => a.category === 'family');
  const lifestyle = antecedents.filter(a => a.category === 'lifestyle');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const AntecedentCategory: React.FC<{
    title: string;
    items: Antecedent[];
    showSettings?: boolean;
  }> = ({ title, items, showSettings }) => (
    <div className="py-2">
      <div className="flex items-center justify-between group">
        <span className="text-sm text-primary font-medium">{title}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {showSettings && (
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>
      {items.length > 0 ? (
        <ul className="mt-1 space-y-0.5">
          {items.map((item) => (
            <li key={item.id} className="text-sm text-foreground pl-2 py-0.5 hover:bg-muted/50 rounded cursor-pointer">
              {item.label}
              {item.icdCode && (
                <span className="text-xs text-muted-foreground ml-1">({item.icdCode})</span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

  const AddLink: React.FC<{ text: string }> = ({ text }) => (
    <button className="flex items-center gap-1 text-sm text-primary hover:text-primary-light transition-colors py-1">
      <Plus className="w-3.5 h-3.5" />
      <span>{text}</span>
    </button>
  );

  return (
    <div className="w-[320px] h-full bg-card border-r border-border flex flex-col">
      {/* Patient Identity Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{patient.civility}</p>
            <h2 className="text-lg font-bold text-foreground">{patient.lastName}</h2>
            <p className="text-base font-medium text-foreground">{patient.firstName}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {patient.dateOfBirth.toLocaleDateString('fr-FR')} ({patient.age} ans)
            </p>
            <p className="text-sm text-muted-foreground">
              MT: <a href="#" className="text-primary hover:underline">{patient.referringDoctor}</a>{' '}
              <Info className="inline w-3.5 h-3.5 text-muted-foreground" />
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant="destructive" className="rounded-full w-6 h-6 p-0 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </Badge>
            <Badge className="rounded-full w-6 h-6 p-0 flex items-center justify-center bg-primary">
              <span className="text-[10px] font-bold">D</span>
            </Badge>
          </div>
        </div>

        {/* Import Alert */}
        {!patient.hasImportedDossier && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Aucun dossier importé retrouvé. Si un dossier importé existe, vous pouvez le rechercher afin de fusionner les dossiers depuis{' '}
                <a href="#" className="text-primary font-medium hover:underline">la liste de patients</a>.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Search in dossier */}
      <div className="px-4 py-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher dans le dossier..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* CONSULTATION EN COURS */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">
              CONSULTATION EN COURS
            </h3>
          </div>

          {/* INFOS ADMINISTRATIVES */}
          <Collapsible open={isInfosOpen} onOpenChange={setIsInfosOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded transition-colors">
              {isInfosOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">INFOS ADMINISTRATIVES</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 pb-2">
              <p className="text-sm text-muted-foreground">Informations administratives du patient...</p>
            </CollapsibleContent>
          </Collapsible>

          {/* HISTORIQUE */}
          <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded transition-colors">
              {isHistoryOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">HISTORIQUE</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-6 pb-2">
              <p className="text-sm text-muted-foreground">Voir l'historique complet...</p>
            </CollapsibleContent>
          </Collapsible>

          {/* ANTÉCÉDENTS ET MODE DE VIE */}
          <Collapsible open={isAntecedentsOpen} onOpenChange={setIsAntecedentsOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded transition-colors">
              {isAntecedentsOpen ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium text-foreground">ANTÉCÉDENTS ET MODE DE VIE</span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-2 pb-2">
              <AntecedentCategory title="Antécédents médicaux" items={medicalAntecedents} />
              <AntecedentCategory title="Appareil cardiovasculaire" items={cardiovascularAntecedents} />
              <AntecedentCategory title="Antécédents chirurgicaux" items={surgicalAntecedents} showSettings />
              <AntecedentCategory title="Allergies" items={allergies} showSettings />
              
              <div className="py-2">
                <span className="text-sm text-primary font-medium">Antécédents familiaux</span>
                <AddLink text="Ajouter un antécédent familial" />
              </div>

              <div className="py-2">
                <span className="text-sm text-primary font-medium">Mode de vie</span>
                <AddLink text="Ajouter une information" />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>

      {/* Memo Section */}
      <div className="border-t border-border p-4">
        <Collapsible open={isMemoOpen} onOpenChange={setIsMemoOpen}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Mémo</span>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary-light">
                Ouvrir
                <ChevronDown className={cn(
                  "w-4 h-4 ml-1 transition-transform",
                  isMemoOpen && "rotate-180"
                )} />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="mt-2">
            <textarea 
              className="w-full h-24 p-2 text-sm border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              placeholder="Notes personnelles sur le patient..."
            />
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Team Section */}
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] text-primary-foreground font-medium">DT</span>
            </div>
            <span className="text-sm font-medium text-foreground">Doctolib Team</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </Button>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDossierPanel;
