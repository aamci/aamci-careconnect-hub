import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Patient, Appointment } from '@/types';
import { format, differenceInYears, isWithinInterval, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  AlertTriangle,
  Star,
  Edit,
  Plus,
  Clock,
  ChevronRight,
  ChevronDown,
  X,
  Search,
  FileDown,
  Printer,
  Stethoscope,
  Pill,
  TestTube,
  FileImage,
  Mail as MailIcon,
  MoreHorizontal,
  Heart,
  Shield,
  Settings,
  Filter,
  Activity,
  Upload,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { mockAppointments, mockNotes } from '@/data/mockData';
import { mockAntecedents, mockMedicalHistory, observationTemplates, defaultBiometrics, currentCarePlan } from '@/data/consultationMockData';

interface FullPatientDossierProps {
  patient: Patient;
  onClose: () => void;
  onEdit: () => void;
}

const FullPatientDossier: React.FC<FullPatientDossierProps> = ({
  patient,
  onClose,
  onEdit
}) => {
  // Check if there's an active consultation based on agenda
  const activeConsultation = useMemo(() => {
    const now = new Date();
    return mockAppointments.find(apt => 
      apt.patientId === patient.id &&
      apt.status === 'in-progress' &&
      isWithinInterval(now, { start: apt.startTime, end: apt.endTime })
    );
  }, [patient.id]);

  const hasActiveConsultation = !!activeConsultation;

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [dossierSearch, setDossierSearch] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Collapsible states
  const [isInfosOpen, setIsInfosOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAntecedentsOpen, setIsAntecedentsOpen] = useState(true);
  const [isMemoOpen, setIsMemoOpen] = useState(false);
  const [isInterrogatoireOpen, setIsInterrogatoireOpen] = useState(true);
  const [isExamenOpen, setIsExamenOpen] = useState(true);
  const [isBiometricsOpen, setIsBiometricsOpen] = useState(true);

  // Medical observation states
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [motif, setMotif] = useState('');
  const [interrogatoire, setInterrogatoire] = useState('');
  const [examen, setExamen] = useState('');
  const [biometrics, setBiometrics] = useState(defaultBiometrics);
  const [tasks, setTasks] = useState<{ id: string; title: string; completed: boolean }[]>(
    currentCarePlan.nextTimeTasks.map(t => ({ id: t.id, title: t.label, completed: t.isCompleted }))
  );
  const [newTask, setNewTask] = useState('');

  const age = differenceInYears(new Date(), patient.dateOfBirth);
  const displayName = patient.usedFirstName || patient.firstName;
  const displayLastName = patient.usedLastName || patient.lastName;

  // Antecedent categories
  const medicalAntecedents = mockAntecedents.filter(a => a.category === 'medical');
  const cardiovascularAntecedents = mockAntecedents.filter(a => a.category === 'cardiovascular');
  const surgicalAntecedents = mockAntecedents.filter(a => a.category === 'surgical');
  const allergies = mockAntecedents.filter(a => a.category === 'allergy');

  // Calculate IMC
  const calculatedIMC = useMemo(() => {
    const heightData = biometrics.find(b => b.type === 'height');
    const weightData = biometrics.find(b => b.type === 'weight');
    const height = typeof heightData?.value === 'number' ? heightData.value : null;
    const weight = typeof weightData?.value === 'number' ? weightData.value : null;
    if (height && weight) {
      const heightM = height / 100;
      return (weight / (heightM * heightM)).toFixed(1);
    }
    return null;
  }, [biometrics]);

  // Group history by period
  const groupedHistory = useMemo(() => {
    const groups: Record<string, typeof mockMedicalHistory> = {};
    mockMedicalHistory.forEach(item => {
      const date = item.date;
      const now = new Date();
      let period: string;
      
      if (date.toDateString() === now.toDateString()) {
        period = "Aujourd'hui";
      } else {
        period = format(date, 'MMMM yyyy', { locale: fr });
        period = period.charAt(0).toUpperCase() + period.slice(1);
      }
      
      if (!groups[period]) groups[period] = [];
      groups[period].push(item);
    });
    return groups;
  }, []);

  const handleBiometricChange = (id: string, value: string) => {
    setBiometrics(prev => prev.map(b => 
      b.id === id ? { ...b, value: value ? parseFloat(value) : null } : b
    ));
    setIsDraft(true);
  };

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    setTasks(prev => [...prev, {
      id: `task-${Date.now()}`,
      title: newTask,
      completed: false
    }]);
    setNewTask('');
  };

  const handleCancel = () => {
    if (isDraft) {
      const confirmed = window.confirm('Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir annuler ?');
      if (!confirmed) return;
    }
    toast.info('Consultation annulée');
    onClose();
  };

  const handleSaveWithoutBilling = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDraft(false);
      toast.success('Consultation enregistrée sans facturation');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleActionCreate = (type: string) => {
    const labels: Record<string, string> = {
      pharmacy: 'Ordonnance pharmacie',
      biology: 'Ordonnance biologie',
      letter: 'Courrier',
      imaging: 'Ordonnance imagerie',
      other: 'Action'
    };
    toast.success(`${labels[type] || 'Action'} créée`);
  };

  const handleExport = (format: 'pdf' | 'json') => {
    toast.success(`Export ${format.toUpperCase()} en cours...`);
  };

  const handleImport = () => {
    toast.info('Import de dossier - Sélectionnez un fichier');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col bg-background overflow-hidden"
    >
      {/* Top Bar */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Dossier Patient</span>
            {hasActiveConsultation && (
              <Badge className="bg-primary text-primary-foreground">
                Consultation en cours
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher dans le dossier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-1.5" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="w-4 h-4 mr-1.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Patient Dossier Panel */}
        <div className="w-[300px] border-r border-border bg-card flex flex-col">
          {/* Patient Identity */}
          <div className="p-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {patient.gender === 'male' ? 'Monsieur' : patient.gender === 'female' ? 'Madame' : ''}
                </p>
                <h2 className="text-lg font-bold text-foreground">{displayLastName.toUpperCase()}</h2>
                <p className="text-base font-medium text-foreground">{displayName}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(patient.dateOfBirth, 'dd/MM/yyyy', { locale: fr })} ({age} ans)
                </p>
                <p className="text-sm text-muted-foreground">
                  MT: <span className="text-primary">{patient.referringDoctor || 'Inconnu'}</span>
                </p>
              </div>
              <div className="flex items-center gap-1">
                {patient.alerts?.some(a => a.type === 'vip') && (
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                )}
                {patient.alerts?.some(a => a.severity === 'critical') && (
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                )}
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Alert Banner */}
            {!patient.insuranceNumber && (
              <div className="mt-3 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Aucun dossier importé retrouvé. Recherchez depuis la liste de patients pour fusionner.
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
                placeholder="Rechercher..."
                value={dossierSearch}
                onChange={(e) => setDossierSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {/* Scrollable Sections */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {hasActiveConsultation && (
                <div className="mb-3">
                  <h3 className="text-xs font-semibold text-primary tracking-wider uppercase">
                    CONSULTATION EN COURS
                  </h3>
                </div>
              )}

              {/* INFOS ADMINISTRATIVES */}
              <Collapsible open={isInfosOpen} onOpenChange={setIsInfosOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded transition-colors">
                  {isInfosOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="text-sm font-medium">INFOS ADMINISTRATIVES</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pb-2 space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Téléphone:</span>{' '}
                    <span className="text-foreground">{patient.phone || 'Non renseigné'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="text-foreground">{patient.email || 'Non renseigné'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Adresse:</span>{' '}
                    <span className="text-foreground">{patient.address || ''} {patient.postalCode} {patient.city}</span>
                  </div>
                  {patient.insuranceNumber && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">N° SS:</span>{' '}
                      <span className="text-foreground">{patient.insuranceNumber}</span>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* HISTORIQUE (short link) */}
              <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded transition-colors">
                  {isHistoryOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="text-sm font-medium">HISTORIQUE</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-6 pb-2">
                  <p className="text-sm text-muted-foreground">Voir historique complet →</p>
                </CollapsibleContent>
              </Collapsible>

              {/* ANTÉCÉDENTS ET MODE DE VIE */}
              <Collapsible open={isAntecedentsOpen} onOpenChange={setIsAntecedentsOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 w-full py-2 hover:bg-muted/50 rounded transition-colors">
                  {isAntecedentsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span className="text-sm font-medium">ANTÉCÉDENTS ET MODE DE VIE</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-2 pb-2">
                  <AntecedentCategory title="Antécédents médicaux" items={medicalAntecedents} />
                  <AntecedentCategory title="Appareil cardiovasculaire" items={cardiovascularAntecedents} />
                  <AntecedentCategory title="Antécédents chirurgicaux" items={surgicalAntecedents} />
                  <AntecedentCategory title="Allergies" items={allergies} />
                  <AddLink text="Ajouter un antécédent familial" />
                  <AddLink text="Ajouter mode de vie" />
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>

          {/* Memo */}
          <div className="border-t border-border p-3">
            <Collapsible open={isMemoOpen} onOpenChange={setIsMemoOpen}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Mémo</span>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary">
                    Ouvrir <ChevronDown className={cn("w-4 h-4 ml-1 transition-transform", isMemoOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="mt-2">
                <textarea 
                  className="w-full h-20 p-2 text-sm border border-border rounded-md resize-none bg-background"
                  placeholder="Notes personnelles..."
                />
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* MediSync Team */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[10px] text-primary-foreground font-medium">MS</span>
              </div>
              <span className="text-sm font-medium">MediSync Team</span>
            </div>
          </div>
        </div>

        {/* Column 2: History Timeline */}
        <div className="w-[340px] border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Historique du patient</h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="px-4 py-2 border-b border-border">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {Object.entries(groupedHistory).map(([period, items]) => (
                <div key={period}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{period}</h4>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">Rendez-vous</p>
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <p>{format(item.date, 'dd/MM/yyyy', { locale: fr })}</p>
                          <p className="font-medium text-foreground">{item.practitionerName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Column 3 & 4: Observation + Care Plan (only if consultation active) */}
        {hasActiveConsultation ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Medical Observation */}
            <div className="flex-1 border-r border-border bg-card flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Observation médicale</h3>
                <Button variant="ghost" size="icon">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  {/* Template */}
                  <div>
                    <label className="text-sm font-medium text-foreground">Nom du modèle</label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Sélectionner un modèle" />
                      </SelectTrigger>
                      <SelectContent>
                        {observationTemplates.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Motif */}
                  <div>
                    <label className="text-sm font-medium text-foreground">Motif</label>
                    <Input
                      className="mt-1"
                      placeholder="Entrer le motif"
                      value={motif}
                      onChange={(e) => { setMotif(e.target.value); setIsDraft(true); }}
                    />
                  </div>

                  {/* Interrogatoire */}
                  <Collapsible open={isInterrogatoireOpen} onOpenChange={setIsInterrogatoireOpen}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full py-2">
                      {isInterrogatoireOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="text-sm font-medium">Interrogatoire</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <RichTextToolbar />
                      <textarea
                        className="w-full h-24 p-2 text-sm border border-border rounded-b-md resize-none bg-background"
                        placeholder="Entrer les réponses de votre interrogatoire..."
                        value={interrogatoire}
                        onChange={(e) => { setInterrogatoire(e.target.value); setIsDraft(true); }}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Examen */}
                  <Collapsible open={isExamenOpen} onOpenChange={setIsExamenOpen}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full py-2">
                      {isExamenOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="text-sm font-medium">Examen</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <RichTextToolbar />
                      <textarea
                        className="w-full h-24 p-2 text-sm border border-border rounded-b-md resize-none bg-background"
                        placeholder="Entrer les résultats de l'examen..."
                        value={examen}
                        onChange={(e) => { setExamen(e.target.value); setIsDraft(true); }}
                      />
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Biometrics */}
                  <Collapsible open={isBiometricsOpen} onOpenChange={setIsBiometricsOpen}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full py-2">
                      {isBiometricsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <span className="text-sm font-medium">Données biométriques</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-3 pt-2">
                      {biometrics.map(b => (
                        <div key={b.id} className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground flex-1">{b.label}</span>
                          <Input
                            type="number"
                            className="w-20 h-8 text-sm"
                            placeholder="Valeur"
                            value={b.value ?? ''}
                            onChange={(e) => handleBiometricChange(b.id, e.target.value)}
                            disabled={b.id === 'imc'}
                          />
                          <span className="text-sm text-muted-foreground w-12">{b.unit}</span>
                        </div>
                      ))}
                      {calculatedIMC && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground flex-1">IMC calculé</span>
                          <span className="text-sm font-medium text-foreground">{calculatedIMC}</span>
                          <span className="text-sm text-muted-foreground w-12">kg/m²</span>
                        </div>
                      )}
                      <button className="text-sm text-primary flex items-center gap-1 mt-2">
                        <Plus className="w-3.5 h-3.5" />
                        Ajouter une donnée
                      </button>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </ScrollArea>

              {isDraft && (
                <div className="px-4 py-2 border-t border-border bg-muted/30">
                  <span className="text-xs text-muted-foreground">Brouillon auto-sauvegardé</span>
                </div>
              )}
            </div>

            {/* Care Plan */}
            <div className="w-[260px] bg-card flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Plan de soins</h3>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-1.5" />
                  Imprimer
                </Button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'pharmacy', icon: Pill, label: 'Pharmacie' },
                    { id: 'biology', icon: TestTube, label: 'Biologie' },
                    { id: 'letter', icon: MailIcon, label: 'Courrier' },
                    { id: 'imaging', icon: FileImage, label: 'Imagerie' },
                    { id: 'other', icon: MoreHorizontal, label: 'Autres' },
                  ].map(action => (
                    <button
                      key={action.id}
                      onClick={() => handleActionCreate(action.id)}
                      className="flex flex-col items-center p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <action.icon className="w-5 h-5 text-primary mb-1" />
                      <span className="text-[10px] text-muted-foreground">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-3">Prochaine fois</h4>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => setTasks(prev => prev.map(t => 
                          t.id === task.id ? { ...t, completed: !t.completed } : t
                        ))}
                        className="rounded border-border"
                      />
                      <span className={cn(task.completed && "line-through text-muted-foreground")}>{task.title}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 mt-2">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                    <Input
                      className="h-8 text-sm flex-1"
                      placeholder="Ajouter une tâche..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* No active consultation - show simple patient info */
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/20 p-8">
            <div className="text-center max-w-md">
              <Stethoscope className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Pas de consultation en cours</h3>
              <p className="text-muted-foreground mb-6">
                L'écran de consultation s'affichera automatiquement lorsqu'un rendez-vous sera en cours selon l'agenda.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Voir l'agenda
                </Button>
                <Button onClick={() => toast.info('Démarrer une consultation manuelle')}>
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Démarrer consultation
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar (only if consultation active) */}
      {hasActiveConsultation && (
        <div className="h-16 border-t border-border bg-card flex items-center justify-between px-6">
          <Button variant="outline" onClick={handleCancel}>
            ANNULER
          </Button>
          <Button onClick={handleSaveWithoutBilling} disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : 'ENREGISTRER SANS FACTURER'}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

// Sub-components
const AntecedentCategory: React.FC<{ title: string; items: { id: string; label: string; icdCode?: string }[] }> = ({ title, items }) => (
  <div className="py-2">
    <div className="flex items-center justify-between group">
      <span className="text-sm text-primary font-medium">{title}</span>
      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
        <Plus className="w-3.5 h-3.5" />
      </Button>
    </div>
    {items.length > 0 && (
      <ul className="mt-1 space-y-0.5">
        {items.map(item => (
          <li key={item.id} className="text-sm text-foreground pl-2 py-0.5 hover:bg-muted/50 rounded cursor-pointer">
            {item.label}
            {item.icdCode && <span className="text-xs text-muted-foreground ml-1">({item.icdCode})</span>}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const AddLink: React.FC<{ text: string }> = ({ text }) => (
  <button className="flex items-center gap-1 text-sm text-primary hover:underline py-1">
    <Plus className="w-3.5 h-3.5" />
    <span>{text}</span>
  </button>
);

const RichTextToolbar: React.FC = () => (
  <div className="flex items-center gap-1 p-2 border border-b-0 border-border rounded-t-md bg-muted/30">
    {['B', 'I', 'U', '⋮⋮', '1.', '•'].map((item, i) => (
      <button key={i} className="w-7 h-7 flex items-center justify-center text-sm font-medium hover:bg-muted rounded">
        {item}
      </button>
    ))}
  </div>
);

export default FullPatientDossier;
