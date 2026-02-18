import React, { useState } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { usePatient } from '@/hooks/data/usePatients';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import PatientDossierSidebar from '@/components/patients/dossier/PatientDossierSidebar';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { cn } from '@/lib/utils';

const PatientDossierPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const breakpoint = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isDesktop = ['laptop', 'desktop', 'wide'].includes(breakpoint);

  const { data: patient, isLoading, error } = usePatient(patientId || '');

  if (isLoading) {
    return (
      <MainLayout activeNav="patients" onNavChange={() => {}}>
        <div className="h-full flex bg-background">
          <div className="hidden lg:block w-72 p-4 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex-1 p-4">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!patient || error) {
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

  return (
    <MainLayout activeNav="patients" onNavChange={() => {}}>
      <div className="h-full flex bg-background">
        {/* Mobile header bar with menu toggle */}
        {!isDesktop && (
          <div className="fixed top-14 left-[72px] right-0 z-30 flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {(patient.usedLastName || patient.lastName).toUpperCase()} {patient.usedFirstName || patient.firstName}
              </p>
            </div>
          </div>
        )}

        {/* Desktop Sidebar - visible on laptop+ */}
        {isDesktop && (
          <PatientDossierSidebar patient={patient} />
        )}

        {/* Mobile/Tablet Sidebar - Sheet drawer */}
        {!isDesktop && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-80 p-0">
              <PatientDossierSidebar
                patient={patient}
                onNavigate={() => setSidebarOpen(false)}
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content Area */}
        <div className={cn('flex-1 overflow-y-auto bg-muted/30', isDesktop ? '' : 'pt-12')}>
          <Outlet context={{ patient }} />
        </div>
      </div>
    </MainLayout>
  );
};

export default PatientDossierPage;
