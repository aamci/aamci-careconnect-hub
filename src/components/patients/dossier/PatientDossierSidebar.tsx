import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { 
  ChevronDown,
  ChevronRight,
  Home,
  Stethoscope,
  FileUser,
  History,
  HeartPulse,
  FileText,
  ClipboardList,
  Pill,
  FlaskConical,
  Syringe,
  Receipt,
  MessageCircle,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Folder,
  CircleDot,
  MapPin,
  Phone,
  Mail,
  UserRound,
  Heart,
  Scissors,
  Users,
  Cigarette,
  ShieldAlert,
  Scale,
  Ruler,
  Activity,
  Thermometer,
  Droplets,
  FileCheck,
  FileClock,
  FileX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import MemoModal from './MemoModal';
import { usePatientAntecedents } from '@/hooks/usePatientAntecedents';
import { usePatientAllergies } from '@/hooks/data/useAllergies';
import { useActivePrescriptions, usePatientPrescriptions } from '@/hooks/data/usePrescriptions';
import { useLatestVitalSigns, usePatientVitalSigns } from '@/hooks/data/useVitalSigns';
import { usePatientLabResults } from '@/hooks/data/useLabResults';

interface PatientDossierSidebarProps {
  patient: Patient;
  onNavigate?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  hasChildren?: boolean;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'HOME', icon: Home, path: 'home' },
  { id: 'consultation', label: 'CONSULTATION EN COURS', icon: Stethoscope, path: 'consultation' },
  { id: 'infos', label: 'INFOS ADMINISTRATIVES', icon: FileUser, path: 'infos-administratives', hasChildren: true },
  { id: 'historique', label: 'HISTORIQUE', icon: History, path: 'historique' },
  { id: 'antecedents', label: 'ANTÉCÉDENTS ET MODE DE VIE', icon: HeartPulse, path: 'antecedents', hasChildren: true },
  { id: 'documents', label: 'DOCUMENTS', icon: FileText, path: 'documents' },
  { id: 'observations', label: 'OBSERVATIONS', icon: ClipboardList, path: 'observations' },
  { id: 'traitement', label: 'TRAITEMENT EN COURS', icon: Pill, path: 'traitement', hasChildren: true },
  { id: 'biologie', label: 'BIOLOGIE ET BIOMÉTRIE', icon: FlaskConical, path: 'biologie', hasChildren: true },
  { id: 'vaccination', label: 'CARNET DE VACCINATION', icon: Syringe, path: 'vaccination' },
  { id: 'factures', label: 'FACTURES', icon: Receipt, path: 'factures' },
  { id: 'messagerie', label: 'MESSAGERIE PATIENT', icon: MessageCircle, path: 'messagerie' },
];

// Info field component for compact display
const InfoField: React.FC<{ 
  icon: React.ElementType; 
  label: string; 
  value?: string | null;
  count?: number;
  onClick?: () => void;
}> = ({ icon: Icon, label, value, count, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-2 py-1.5 text-xs hover:bg-muted/30 rounded px-2 transition-colors text-left"
  >
    <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
    <span className="text-muted-foreground">{label} :</span>
    {count !== undefined ? (
      count > 0 ? (
        <span className="text-primary font-medium">{count} élément{count > 1 ? 's' : ''}</span>
      ) : (
        <span className="text-muted-foreground/70 italic">Aucun</span>
      )
    ) : value ? (
      <span className="text-foreground truncate">{value}</span>
    ) : (
      <span className="text-primary font-medium">Ajouter</span>
    )}
  </button>
);

const PatientDossierSidebar: React.FC<PatientDossierSidebarProps> = ({ patient, onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showSSN, setShowSSN] = useState(false);
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  
  const { memo, saveMemo, isSaving, getAntecedentsByCategory } = usePatientAntecedents(patient.id);
  const { data: allergies = [] } = usePatientAllergies(patient.id);
  const { data: activePrescriptions = [] } = useActivePrescriptions(patient.id);
  const { data: allPrescriptions = [] } = usePatientPrescriptions(patient.id);
  const { data: latestVitals } = useLatestVitalSigns(patient.id);
  const { data: vitalSignsHistory = [] } = usePatientVitalSigns(patient.id);
  const { data: labResults = [] } = usePatientLabResults(patient.id);
  
  const age = differenceInYears(new Date(), patient.dateOfBirth);
  const displayName = patient.usedFirstName || patient.firstName;
  const displayLastName = patient.usedLastName || patient.lastName;
  const civility = patient.gender === 'male' ? 'Monsieur' : 'Madame';
  
  // Mock SSN - in real app would come from patient data
  const ssn = '1 60 03 75 108 142 56';
  const maskedSSN = '1 60 03 ... ... ...';
  
  const hasVipAlert = patient.alerts?.some(a => a.type === 'vip');
  const hasCriticalAlert = patient.alerts?.some(a => a.severity === 'critical');
  const hasImportedRecord = false; // Mock - would come from patient data
  
  const hasMemoContent = memo && memo.content && memo.content.trim().length > 0;

  // Get antecedents counts
  const medicalCount = getAntecedentsByCategory('medical').length;
  const cardiovascularCount = getAntecedentsByCategory('cardiovascular').length;
  const surgicalCount = getAntecedentsByCategory('surgical').length;
  const familyCount = getAntecedentsByCategory('family').length;
  const lifestyleCount = getAntecedentsByCategory('lifestyle').length;
  const allergiesCount = allergies.length;

  // Prescriptions counts
  const activePrescriptionsCount = activePrescriptions.length;
  const stoppedPrescriptionsCount = allPrescriptions.filter(p => p.status === 'stopped').length;
  const expiredPrescriptionsCount = allPrescriptions.filter(p => p.status === 'expired').length;

  // Biology/Biometrics data
  const labResultsCount = labResults.length;
  const vitalSignsCount = vitalSignsHistory.length;

  const handleSaveMemo = async (content: string) => {
    await saveMemo(content);
    setMemoModalOpen(false);
  };

  const handleNavigateToInfos = () => {
    navigate('infos-administratives');
    onNavigate?.();
  };

  const handleNavigateToAntecedents = () => {
    navigate('antecedents');
    onNavigate?.();
  };

  const handleNavigateToTraitement = () => {
    navigate('traitement');
    onNavigate?.();
  };

  const handleNavigateToBiologie = () => {
    navigate('biologie');
    onNavigate?.();
  };

  // Render admin info content inside accordion
  const renderAdminInfoContent = () => (
    <div className="ml-4 py-1.5 space-y-0.5 border-l-2 border-border pl-2">
      <InfoField 
        icon={MapPin} 
        label="Lieu de naissance" 
        value={patient.birthPlace}
        onClick={handleNavigateToInfos}
      />
      <InfoField 
        icon={Phone} 
        label="Tél (portable)" 
        value={patient.phone}
        onClick={handleNavigateToInfos}
      />
      <InfoField 
        icon={Phone} 
        label="Tél (fixe)" 
        value={patient.phoneSecondary}
        onClick={handleNavigateToInfos}
      />
      <InfoField 
        icon={Mail} 
        label="E-mail" 
        value={patient.email}
        onClick={handleNavigateToInfos}
      />
      <InfoField 
        icon={UserRound} 
        label="Médecin traitant" 
        value={patient.referringDoctor}
        onClick={handleNavigateToInfos}
      />
    </div>
  );

  // Render antecedents content inside accordion
  const renderAntecedentsContent = () => (
    <div className="ml-4 py-1.5 space-y-0.5 border-l-2 border-border pl-2">
      <InfoField 
        icon={ShieldAlert} 
        label="Allergies" 
        count={allergiesCount}
        onClick={handleNavigateToAntecedents}
      />
      <InfoField 
        icon={Stethoscope} 
        label="Médicaux" 
        count={medicalCount}
        onClick={handleNavigateToAntecedents}
      />
      <InfoField 
        icon={Heart} 
        label="Cardiovasculaires" 
        count={cardiovascularCount}
        onClick={handleNavigateToAntecedents}
      />
      <InfoField 
        icon={Scissors} 
        label="Chirurgicaux" 
        count={surgicalCount}
        onClick={handleNavigateToAntecedents}
      />
      <InfoField 
        icon={Users} 
        label="Familiaux" 
        count={familyCount}
        onClick={handleNavigateToAntecedents}
      />
      <InfoField 
        icon={Cigarette} 
        label="Mode de vie" 
        count={lifestyleCount}
        onClick={handleNavigateToAntecedents}
      />
    </div>
  );

  // Render traitement content inside accordion
  const renderTraitementContent = () => (
    <div className="ml-4 py-1.5 space-y-0.5 border-l-2 border-border pl-2">
      <InfoField 
        icon={FileCheck} 
        label="En cours" 
        count={activePrescriptionsCount}
        onClick={handleNavigateToTraitement}
      />
      <InfoField 
        icon={FileX} 
        label="Arrêtés" 
        count={stoppedPrescriptionsCount}
        onClick={handleNavigateToTraitement}
      />
      <InfoField 
        icon={FileClock} 
        label="Expirés" 
        count={expiredPrescriptionsCount}
        onClick={handleNavigateToTraitement}
      />
    </div>
  );

  // Render biologie content inside accordion
  const renderBiologieContent = () => {
    const formatBP = () => {
      if (latestVitals?.systolic_bp && latestVitals?.diastolic_bp) {
        return `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp} mmHg`;
      }
      return null;
    };

    return (
      <div className="ml-4 py-1.5 space-y-0.5 border-l-2 border-border pl-2">
        <InfoField 
          icon={Scale} 
          label="Poids" 
          value={latestVitals?.weight_kg ? `${latestVitals.weight_kg} kg` : null}
          onClick={handleNavigateToBiologie}
        />
        <InfoField 
          icon={Ruler} 
          label="Taille" 
          value={latestVitals?.height_cm ? `${latestVitals.height_cm} cm` : null}
          onClick={handleNavigateToBiologie}
        />
        <InfoField 
          icon={Activity} 
          label="Tension" 
          value={formatBP()}
          onClick={handleNavigateToBiologie}
        />
        <InfoField 
          icon={Thermometer} 
          label="Température" 
          value={latestVitals?.temperature_c ? `${latestVitals.temperature_c}°C` : null}
          onClick={handleNavigateToBiologie}
        />
        <InfoField 
          icon={Droplets} 
          label="Résultats labo" 
          count={labResultsCount}
          onClick={handleNavigateToBiologie}
        />
        <InfoField 
          icon={FlaskConical} 
          label="Historique mesures" 
          count={vitalSignsCount}
          onClick={handleNavigateToBiologie}
        />
      </div>
    );
  };

  return (
    <div className="w-72 flex-shrink-0 bg-card border-r border-border flex flex-col h-full">
      {/* Patient Identity Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground">{civility}</p>
            <h2 className="text-lg font-bold text-foreground tracking-wide">
              {displayLastName.toUpperCase()}
            </h2>
            <p className="text-base font-medium text-foreground">
              {displayName}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {format(patient.dateOfBirth, 'dd/MM/yyyy')} ({age} ans)
            </p>
            
            {/* Mutuelle */}
            <p className="text-sm text-muted-foreground mt-1.5">
              MT : <span className="text-primary underline cursor-pointer">
                {patient.insuranceProvider || 'Inconnu'}
              </span>
              <Info className="inline-block ml-1 h-3.5 w-3.5 text-muted-foreground" />
            </p>
          </div>
          
          {/* Status badges */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasCriticalAlert && (
              <div className="h-5 w-5 rounded-full bg-destructive flex items-center justify-center">
                <AlertTriangle className="h-3 w-3 text-destructive-foreground" />
              </div>
            )}
            {hasVipAlert && (
              <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                <CircleDot className="h-3 w-3 text-accent-foreground" />
              </div>
            )}
          </div>
        </div>
        
        {/* SSN Row */}
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span className="font-medium">N° SS :</span>
          <span className="font-mono">{showSSN ? ssn : maskedSSN}</span>
          <button 
            onClick={() => setShowSSN(!showSSN)}
            className="text-primary hover:text-primary/80 transition-colors"
          >
            {showSSN ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Alert Banner */}
      {!hasImportedRecord && (
        <div className="mx-3 mt-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <div className="flex gap-2">
            <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <p className="text-xs text-warning leading-relaxed">
              Aucun dossier importé retrouvé. Si un dossier importé existe, vous pouvez le rechercher afin de fusionner les dossiers depuis{' '}
              <NavLink to="/patients" className="underline font-medium hover:text-warning/80">
                la liste de patients
              </NavLink>.
            </p>
          </div>
        </div>
      )}
      
      {/* Navigation Tabs */}
      <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar">
        <div className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.includes(`/${item.path}`);
            
            // Special handling for INFOS ADMINISTRATIVES accordion
            if (item.id === 'infos') {
              return (
                <Collapsible key={item.id} defaultOpen={isActive}>
                  <div className="relative">
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={() => { navigate('infos-administratives'); onNavigate?.(); }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold tracking-wide rounded-lg transition-all',
                          'hover:bg-muted/50 group',
                          isActive
                            ? 'text-primary bg-primary/5'
                            : 'text-foreground'
                        )}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                        <span className="flex-1 text-left">{item.label}</span>
                      </button>
                    </CollapsibleTrigger>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                    )}
                  </div>
                  <CollapsibleContent>
                    {renderAdminInfoContent()}
                  </CollapsibleContent>
                </Collapsible>
            );
            }

            // Special handling for ANTÉCÉDENTS ET MODE DE VIE accordion
            if (item.id === 'antecedents') {
              return (
                <Collapsible key={item.id} defaultOpen={isActive}>
                  <div className="relative">
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={() => { navigate('antecedents'); onNavigate?.(); }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold tracking-wide rounded-lg transition-all',
                          'hover:bg-muted/50 group',
                          isActive 
                            ? 'text-primary bg-primary/5' 
                            : 'text-foreground'
                        )}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                        <span className="flex-1 text-left">{item.label}</span>
                      </button>
                    </CollapsibleTrigger>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                    )}
                  </div>
                  <CollapsibleContent>
                    {renderAntecedentsContent()}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // Special handling for TRAITEMENT EN COURS accordion
            if (item.id === 'traitement') {
              return (
                <Collapsible key={item.id} defaultOpen={isActive}>
                  <div className="relative">
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={() => { navigate('traitement'); onNavigate?.(); }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold tracking-wide rounded-lg transition-all',
                          'hover:bg-muted/50 group',
                          isActive 
                            ? 'text-primary bg-primary/5' 
                            : 'text-foreground'
                        )}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {activePrescriptionsCount > 0 && (
                          <span className="text-primary text-xs font-medium">{activePrescriptionsCount}</span>
                        )}
                      </button>
                    </CollapsibleTrigger>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                    )}
                  </div>
                  <CollapsibleContent>
                    {renderTraitementContent()}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            // Special handling for BIOLOGIE ET BIOMÉTRIE accordion
            if (item.id === 'biologie') {
              return (
                <Collapsible key={item.id} defaultOpen={isActive}>
                  <div className="relative">
                    <CollapsibleTrigger asChild>
                      <button
                        onClick={() => { navigate('biologie'); onNavigate?.(); }}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold tracking-wide rounded-lg transition-all',
                          'hover:bg-muted/50 group',
                          isActive 
                            ? 'text-primary bg-primary/5' 
                            : 'text-foreground'
                        )}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                        <span className="flex-1 text-left">{item.label}</span>
                      </button>
                    </CollapsibleTrigger>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                    )}
                  </div>
                  <CollapsibleContent>
                    {renderBiologieContent()}
                  </CollapsibleContent>
                </Collapsible>
              );
            }
            
            if (item.hasChildren) {
              return (
                <Collapsible key={item.id} defaultOpen={isActive}>
                  <div className="relative">
                    <CollapsibleTrigger asChild>
                      <button
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold tracking-wide rounded-lg transition-all',
                          'hover:bg-muted/50 group',
                          isActive 
                            ? 'text-primary bg-primary/5' 
                            : 'text-foreground'
                        )}
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="text-primary text-xs font-medium">{item.badge}</span>
                        )}
                      </button>
                    </CollapsibleTrigger>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                    )}
                  </div>
                  <CollapsibleContent>
                    <div className="ml-6 py-1 space-y-0.5">
                      {/* Placeholder for sub-items */}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            }
            
            return (
              <div key={item.id} className="relative">
                <NavLink
                  to={item.path}
                  onClick={() => onNavigate?.()}
                  className={({ isActive: linkActive }) => cn(
                    'flex items-center gap-2 px-3 py-2.5 text-xs font-semibold tracking-wide rounded-lg transition-all',
                    'hover:bg-muted/50',
                    linkActive
                      ? 'text-primary bg-primary/5'
                      : 'text-foreground'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="w-3.5" /> {/* Spacer for alignment */}
                  <span>{item.label}</span>
                </NavLink>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      </nav>
      
      {/* Memo Section - Bottom */}
      <div className="flex-shrink-0 border-t border-border p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Mémo</span>
            {hasMemoContent && (
              <div className="h-2 w-2 rounded-full bg-primary" />
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs gap-1 h-7"
            onClick={() => setMemoModalOpen(true)}
          >
            Ouvrir
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <MemoModal
        isOpen={memoModalOpen}
        onClose={() => setMemoModalOpen(false)}
        onSave={handleSaveMemo}
        initialContent={memo?.content || ''}
        isLoading={isSaving}
      />
    </div>
  );
};

export default PatientDossierSidebar;
