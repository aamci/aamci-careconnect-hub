import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, X, Filter } from 'lucide-react';
import { Patient } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import ActionsPanel from '../actions-panel/ActionsPanel';

interface DossierPageLayoutProps {
  patient: Patient;
  title: string;
  breadcrumbLabel: string;
  children: React.ReactNode;
  isLoading?: boolean;
  showFilter?: boolean;
  onFilter?: () => void;
  headerActions?: React.ReactNode;
}

/**
 * Shared layout for all dossier sections with:
 * - Breadcrumb navigation
 * - Sticky ACTIONS panel on the right
 * - Loading skeleton support
 * - Consistent styling
 */
const DossierPageLayout: React.FC<DossierPageLayoutProps> = ({
  patient,
  title,
  breadcrumbLabel,
  children,
  isLoading = false,
  showFilter = false,
  onFilter,
  headerActions,
}) => {
  const navigate = useNavigate();

  const handleClosePatientDossier = () => {
    navigate('/patients');
  };

  return (
    <div className="h-full flex">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Header with Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={`/patients/${patient.id}/home`}>Dossier patient</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-2">
            {showFilter && (
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onFilter}>
                <Filter className="h-4 w-4" />
                Filtrer
              </Button>
            )}
            {headerActions}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary gap-1.5"
              onClick={handleClosePatientDossier}
            >
              Fermer le dossier patient
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Page Title */}
        <h1 className="text-xl font-bold text-foreground mb-6">{title}</h1>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {/* Content */}
        {!isLoading && children}
      </div>

      {/* Right Actions Panel - Sticky */}
      <div className="hidden lg:block w-64 flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <ActionsPanel patient={patient} />
      </div>
    </div>
  );
};

export default DossierPageLayout;
