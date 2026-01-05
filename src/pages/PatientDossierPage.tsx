import React from 'react';
import { useParams, useNavigate, NavLink, Outlet, Navigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { mockPatients } from '@/data/mockData';
import { format, differenceInYears } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ChevronLeft, 
  Star, 
  AlertTriangle,
  Home,
  Stethoscope,
  FileUser,
  History,
  HeartPulse,
  Edit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const PatientDossierPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  
  const patient = mockPatients.find(p => p.id === patientId);
  
  if (!patient) {
    return (
      <MainLayout activeNav="patients" onNavChange={() => {}}>
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Patient non trouvé</h2>
            <Button onClick={() => navigate('/patients')}>
              Retour à la liste
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const age = differenceInYears(new Date(), patient.dateOfBirth);
  const displayName = patient.usedFirstName || patient.firstName;
  const displayLastName = patient.usedLastName || patient.lastName;
  const hasVipAlert = patient.alerts?.some(a => a.type === 'vip');
  const hasCriticalAlert = patient.alerts?.some(a => a.severity === 'critical');

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: 'home' },
    { id: 'consultation', label: 'Consultation en cours', icon: Stethoscope, path: 'consultation' },
    { id: 'infos', label: 'Infos administratives', icon: FileUser, path: 'infos' },
    { id: 'historique', label: 'Historique', icon: History, path: 'historique' },
    { id: 'antecedents', label: 'Antécédents et mode de vie', icon: HeartPulse, path: 'antecedents' },
  ];

  return (
    <MainLayout activeNav="patients" onNavChange={() => {}}>
      <div className="h-full flex flex-col bg-background">
        {/* Patient Header Bar */}
        <div className="flex-shrink-0 border-b border-border bg-card">
          <div className="px-4 py-3 sm:px-6">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-full hover:bg-muted"
                onClick={() => navigate('/patients')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Patient Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="h-11 w-11 border-2 border-primary/20 flex-shrink-0">
                  <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
                    {displayName[0]}{displayLastName[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg font-bold text-foreground truncate">
                      {displayLastName.toUpperCase()} {displayName}
                    </h1>
                    {hasVipAlert && (
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500 flex-shrink-0" />
                    )}
                    {hasCriticalAlert && (
                      <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{patient.gender === 'male' ? 'H' : 'F'}</span>
                    <span className="mx-1.5">•</span>
                    <span>{format(patient.dateOfBirth, 'dd/MM/yyyy')}</span>
                    <span className="mx-1.5">•</span>
                    <span className="font-medium">{age} ans</span>
                    {patient.phone && (
                      <>
                        <span className="mx-1.5 hidden sm:inline">•</span>
                        <span className="hidden sm:inline">{patient.phone}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Edit Button */}
              <Button variant="outline" size="sm" className="gap-1.5 hidden sm:flex">
                <Edit className="h-4 w-4" />
                Modifier
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-4 sm:px-6 overflow-x-auto">
            <nav className="flex gap-1 min-w-max pb-px">
              {navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap',
                    isActive 
                      ? 'text-primary border-primary bg-primary/5' 
                      : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  <span className="md:hidden">{item.label.split(' ')[0]}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Alerts Banner */}
        {patient.alerts && patient.alerts.length > 0 && (
          <div className="flex-shrink-0 px-4 py-2 sm:px-6 bg-warning/10 border-b border-warning/20">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0" />
              <span className="text-warning font-medium">Alertes:</span>
              <span className="text-warning/80 truncate">
                {patient.alerts.map(a => a.message).join(' • ')}
              </span>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Outlet context={{ patient }} />
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientDossierPage;
