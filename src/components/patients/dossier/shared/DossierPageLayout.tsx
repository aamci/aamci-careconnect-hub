import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, X, Filter, MoreVertical } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import ActionsPanel from '../actions-panel/ActionsPanel';
import { cn } from '@/lib/utils';

/**
 * L2 - Layout Canonique du Dossier Patient
 *
 * Structure CSS Grid anti-overlap:
 * - Column B: Main content (flex-1, minmax protected)
 * - Column C: Actions panel (fixed width on desktop, Sheet on mobile/tablet)
 *
 * Breakpoints (matrice responsive):
 * - ≥1440px (2xl): Full desktop - actions panel visible (240px)
 * - ≥1280px (xl): Large desktop - actions panel visible (220px)
 * - ≥1024px (lg): Medium desktop - actions panel visible (200px)
 * - ≥768px (md): Tablet - actions in Sheet (right)
 * - <768px: Mobile - actions in Sheet (bottom)
 *
 * Anti-overlap rules:
 * - minmax() on all columns
 * - No fixed widths without flex-shrink-0
 * - clamp() for dynamic spacing
 * - truncate on all text fields
 */

interface DossierPageLayoutProps {
  patient: Patient;
  title: string;
  breadcrumbLabel: string;
  children: React.ReactNode;
  isLoading?: boolean;
  showFilter?: boolean;
  onFilter?: () => void;
  headerActions?: React.ReactNode;
  /** Force single-screen mode (no scroll on content) */
  fitScreen?: boolean;
  /** Hide breadcrumb for nested pages */
  hideBreadcrumb?: boolean;
  /** Compact header (smaller title, less spacing) */
  compactHeader?: boolean;
}

const DossierPageLayout: React.FC<DossierPageLayoutProps> = ({
  patient,
  title,
  breadcrumbLabel,
  children,
  isLoading = false,
  showFilter = false,
  onFilter,
  headerActions,
  fitScreen = false,
  hideBreadcrumb = false,
  compactHeader = false,
}) => {
  const navigate = useNavigate();
  const [actionsSheetOpen, setActionsSheetOpen] = useState(false);

  const handleClosePatientDossier = () => {
    navigate('/patients');
  };

  return (
    <div
      className={cn(
        // Base: CSS Grid layout with anti-overlap protection
        "grid w-full",
        // Height constraint: fit screen or allow scroll
        fitScreen ? "h-full max-h-full overflow-hidden" : "min-h-full",
        // Grid columns: responsive with minmax protection
        // Mobile/Tablet: single column
        "grid-cols-[1fr]",
        // Large screens: main content + actions panel (more flexible sizing)
        "lg:grid-cols-[minmax(0,1fr)_minmax(180px,200px)]",
        "xl:grid-cols-[minmax(0,1fr)_minmax(200px,220px)]",
        "2xl:grid-cols-[minmax(0,1fr)_minmax(220px,240px)]"
      )}
    >
      {/* Column B: Main Content Area */}
      <div
        className={cn(
          "min-w-0 flex flex-col", // min-w-0 critical for anti-overlap
          fitScreen ? "h-full overflow-hidden" : "overflow-y-auto",
          // Responsive padding with clamp
          "p-3 sm:p-4 md:p-5 lg:p-6"
        )}
      >
        {/* Header with Breadcrumb */}
        <div className={cn(
          "flex items-center justify-between flex-shrink-0",
          compactHeader ? "mb-3" : "mb-4 lg:mb-6"
        )}>
          {!hideBreadcrumb && (
            <Breadcrumb>
              <BreadcrumbList className="flex-wrap">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      to={`/patients/${patient.id}/home`}
                      className="text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none"
                    >
                      Dossier patient
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">
                    {breadcrumbLabel}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {showFilter && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 h-8 px-2 sm:px-3"
                onClick={onFilter}
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filtrer</span>
              </Button>
            )}
            {headerActions}

            {/* Mobile/Tablet: Actions Sheet Trigger */}
            <Sheet open={actionsSheetOpen} onOpenChange={setActionsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden h-8 w-8 p-0"
                  aria-label="Actions"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] sm:w-[320px] p-0"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Actions patient</SheetTitle>
                </SheetHeader>
                <ActionsPanel patient={patient} />
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="sm"
              className="text-primary gap-1 h-8 px-2 sm:px-3"
              onClick={handleClosePatientDossier}
            >
              <span className="hidden md:inline">Fermer le dossier</span>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Page Title - Responsive sizing */}
        <h1 className={cn(
          "font-bold text-foreground flex-shrink-0 truncate",
          compactHeader
            ? "text-base sm:text-lg mb-3"
            : "text-lg sm:text-xl mb-4 lg:mb-6"
        )}>
          {title}
        </h1>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3 flex-shrink-0">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        )}

        {/* Content Area - Anti-overlap with min-w-0 */}
        {!isLoading && (
          <div className={cn(
            "min-w-0", // Critical for nested flex/grid anti-overlap
            fitScreen ? "flex-1 overflow-y-auto" : "flex-1"
          )}>
            {children}
          </div>
        )}
      </div>

      {/* Column C: Right Actions Panel - Desktop only, sticky */}
      <aside
        className={cn(
          "hidden lg:flex flex-col",
          "border-l border-border/50",
          "sticky top-0 max-h-screen",
          "overflow-y-auto custom-scrollbar"
        )}
      >
        <ActionsPanel patient={patient} />
      </aside>
    </div>
  );
};

export default DossierPageLayout;
