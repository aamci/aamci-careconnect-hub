import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Clock,
  ChevronRight,
  Plus,
  User,
  Activity,
  AlertTriangle,
  MessageSquare,
  Pill,
  AlertCircle,
  FileUp,
  Maximize2,
  Minimize2,
  GripHorizontal,
  Heart,
  Stethoscope,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockAppointments, mockNotes } from '@/data/mockData';
import { cn } from '@/lib/utils';
import PatientAllergiesBadge from '@/components/patients/PatientAllergiesBadge';

interface OutletContext {
  patient: Patient;
}

type ModuleSize = 'S' | 'M' | 'L';

interface ModuleState {
  size: ModuleSize;
  expanded: boolean;
}

const PatientHomeTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  
  const [moduleStates, setModuleStates] = useState<Record<string, ModuleState>>({
    appointments: { size: 'M', expanded: false },
    contacts: { size: 'S', expanded: false },
    quickActions: { size: 'S', expanded: false },
    notes: { size: 'M', expanded: false },
    clinical: { size: 'M', expanded: false },
    documents: { size: 'S', expanded: false },
    prevention: { size: 'S', expanded: false },
  });
  
  const patientAppointments = mockAppointments
    .filter(apt => apt.patientId === patient.id)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    
  const upcomingAppointments = patientAppointments
    .filter(apt => apt.startTime > new Date())
    .slice(0, 5);
  const recentNotes = mockNotes.filter(note => note.patientId === patient.id).slice(0, 3);

  const toggleModuleExpanded = (moduleId: string) => {
    setModuleStates(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], expanded: !prev[moduleId]?.expanded }
    }));
  };

  const getModuleClasses = (moduleId: string) => {
    const state = moduleStates[moduleId];
    if (state?.expanded) return 'col-span-full';
    switch (state?.size) {
      case 'S': return 'col-span-1';
      case 'L': return 'col-span-2';
      default: return 'col-span-1';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Clinical Alerts Banner */}
      {patient.alerts && patient.alerts.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-destructive mb-2">Alertes actives</h3>
              <div className="space-y-2">
                {patient.alerts.map((alert, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-foreground">{alert.message}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        Voir détail
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-7 gap-1">
                        <Check className="h-3 w-3" />
                        Traité
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card 
          className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('../historique')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{patientAppointments.length}</p>
                <p className="text-xs text-muted-foreground">RDV Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('../historique')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{upcomingAppointments.length}</p>
                <p className="text-xs text-muted-foreground">À venir</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-success/5 to-success/10 border-success/20 cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{recentNotes.length}</p>
                <p className="text-xs text-muted-foreground">Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20 cursor-pointer hover:shadow-md transition-shadow"
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center">
                <Activity className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{patient.alerts?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Alertes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modular Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Upcoming Appointments Module */}
        <ModuleCard
          id="appointments"
          title="Prochains rendez-vous"
          icon={Calendar}
          state={moduleStates.appointments}
          onToggleExpand={() => toggleModuleExpanded('appointments')}
          className={getModuleClasses('appointments')}
          headerActions={
            <>
              <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
                Voir tout
                <ChevronRight className="h-3 w-3" />
              </Button>
            </>
          }
          footerAction={
            <Button className="w-full gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Nouveau rendez-vous
            </Button>
          }
        >
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-2">
              {upcomingAppointments.map((apt) => (
                <div 
                  key={apt.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div 
                    className="w-1 h-10 rounded-full flex-shrink-0"
                    style={{ backgroundColor: apt.motif.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {format(apt.startTime, 'EEE d MMM', { locale: fr })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(apt.startTime, 'HH:mm')} • {apt.motif.name}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {apt.practitioner.title} {apt.practitioner.lastName}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Calendar}
              message="Aucun rendez-vous à venir"
              action={
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Planifier un RDV
                </Button>
              }
            />
          )}
        </ModuleCard>

        {/* Contacts Module */}
        <ModuleCard
          id="contacts"
          title="Coordonnées"
          icon={User}
          state={moduleStates.contacts}
          onToggleExpand={() => toggleModuleExpanded('contacts')}
          className={getModuleClasses('contacts')}
          headerActions={
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => navigate('../infos')}
            >
              Modifier
            </Button>
          }
        >
          <div className="space-y-2">
            {patient.phone && (
              <a 
                href={`tel:${patient.phone}`}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-primary">{patient.phone}</span>
              </a>
            )}
            {patient.email && (
              <a 
                href={`mailto:${patient.email}`}
                className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-primary truncate">{patient.email}</span>
              </a>
            )}
            {(patient.address || patient.city) && (
              <div className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm text-foreground">
                  {patient.address && `${patient.address}, `}
                  {patient.postalCode} {patient.city}
                </span>
              </div>
            )}
          </div>
        </ModuleCard>

        {/* Quick Actions Module */}
        <ModuleCard
          id="quickActions"
          title="Actions rapides"
          icon={Activity}
          state={moduleStates.quickActions}
          onToggleExpand={() => toggleModuleExpanded('quickActions')}
          className={getModuleClasses('quickActions')}
        >
          <div className="grid grid-cols-2 gap-2">
            <Button className="w-full justify-start gap-2 h-9" size="sm">
              <Plus className="h-4 w-4" />
              Nouveau RDV
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-9" size="sm">
              <FileText className="h-4 w-4" />
              Ajouter note
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-9" size="sm">
              <MessageSquare className="h-4 w-4" />
              Message
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 h-9" size="sm">
              <Calendar className="h-4 w-4" />
              Multi-RDV
            </Button>
          </div>
        </ModuleCard>

        {/* Recent Notes Module */}
        <ModuleCard
          id="notes"
          title="Notes récentes"
          icon={FileText}
          state={moduleStates.notes}
          onToggleExpand={() => toggleModuleExpanded('notes')}
          className={getModuleClasses('notes')}
          headerActions={
            <Button variant="ghost" size="sm" className="text-xs gap-1 h-7">
              Voir tout
              <ChevronRight className="h-3 w-3" />
            </Button>
          }
        >
          {recentNotes.length > 0 ? (
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <div 
                  key={note.id}
                  className="p-2.5 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">
                      {format(note.createdAt, 'dd/MM/yyyy', { locale: fr })}
                    </span>
                    <span className="text-xs text-muted-foreground">{note.authorName}</span>
                  </div>
                  <p className="text-sm text-foreground line-clamp-2">{note.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={FileText}
              message="Aucune note"
            />
          )}
        </ModuleCard>

        {/* Clinical Summary Module */}
        <ModuleCard
          id="clinical"
          title="Résumé clinique"
          icon={Stethoscope}
          state={moduleStates.clinical}
          onToggleExpand={() => toggleModuleExpanded('clinical')}
          className={getModuleClasses('clinical')}
          headerActions={
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => navigate('../antecedents')}
            >
              Ouvrir
            </Button>
          }
        >
          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Diagnostics actifs</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-xs">Hypertension</Badge>
                <Badge variant="secondary" className="text-xs">Diabète T2</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Allergies</p>
              <PatientAllergiesBadge patientId={patient.id} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Traitements principaux</p>
              <div className="flex items-center gap-1.5 text-sm text-foreground">
                <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Metformine 500mg, Lisinopril 10mg</span>
              </div>
            </div>
          </div>
        </ModuleCard>

        {/* Documents Module */}
        <ModuleCard
          id="documents"
          title="Documents récents"
          icon={FileText}
          state={moduleStates.documents}
          onToggleExpand={() => toggleModuleExpanded('documents')}
          className={getModuleClasses('documents')}
          footerAction={
            <Button variant="outline" className="w-full gap-2" size="sm">
              <FileUp className="h-4 w-4" />
              Importer un document
            </Button>
          }
        >
          <EmptyState 
            icon={FileText}
            message="Aucun document récent"
          />
        </ModuleCard>

        {/* Prevention Module */}
        <ModuleCard
          id="prevention"
          title="Prévention"
          icon={Heart}
          state={moduleStates.prevention}
          onToggleExpand={() => toggleModuleExpanded('prevention')}
          className={getModuleClasses('prevention')}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-warning" />
                <span className="text-sm text-foreground">Rappel vaccin grippe</span>
              </div>
              <Badge variant="outline" className="text-xs">Échu</Badge>
            </div>
          </div>
        </ModuleCard>
      </div>
    </div>
  );
};

// Reusable Module Card Component
interface ModuleCardProps {
  id: string;
  title: string;
  icon: React.ElementType;
  state: ModuleState;
  onToggleExpand: () => void;
  className?: string;
  headerActions?: React.ReactNode;
  footerAction?: React.ReactNode;
  children: React.ReactNode;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  id,
  title,
  icon: Icon,
  state,
  onToggleExpand,
  className,
  headerActions,
  footerAction,
  children,
}) => {
  return (
    <Card className={cn('flex flex-col', state?.expanded && 'fixed inset-4 z-50', className)}>
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-1">
            {headerActions}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onToggleExpand}
            >
              {state?.expanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto">
        {children}
      </CardContent>
      {footerAction && (
        <div className="p-3 pt-0 flex-shrink-0">
          {footerAction}
        </div>
      )}
    </Card>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon: React.ElementType;
  message: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, message, action }) => (
  <div className="text-center py-6 text-muted-foreground">
    <Icon className="h-8 w-8 mx-auto mb-2 opacity-30" />
    <p className="text-sm">{message}</p>
    {action && <div className="mt-3">{action}</div>}
  </div>
);

export default PatientHomeTab;
