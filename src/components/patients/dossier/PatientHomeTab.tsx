/**
 * PatientHomeTab - Density-optimized patient summary view
 *
 * Key features:
 * - Uses density tokens for responsive sizing
 * - Zero scroll target at 1366x768 resolution
 * - Compact KPI cards with gradient backgrounds
 * - Collapsible modules for space efficiency
 * - Density-aware typography and spacing
 */

import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Patient } from '@/types';
import { format } from 'date-fns';
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
  Heart,
  Stethoscope,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockAppointments, mockNotes } from '@/data/mockData';
import { cn } from '@/lib/utils';
import PatientAllergiesBadge from '@/components/patients/PatientAllergiesBadge';
import {
  CardCompact,
  InfoRowCompact,
  ListItemCompact,
  BadgeCompact,
} from '@/components/ui/card-compact';
import { useDensity } from '@/hooks/useDensity';

interface OutletContext {
  patient: Patient;
}

const PatientHomeTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const navigate = useNavigate();
  const { config, isCompact } = useDensity();

  // Module collapse states
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({
    appointments: false,
    contacts: false,
    quickActions: false,
    notes: false,
    clinical: false,
    documents: true, // collapsed by default
    prevention: true, // collapsed by default
  });

  const toggleCollapse = (id: string) => {
    setCollapsedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Data preparation
  const patientAppointments = mockAppointments
    .filter((apt) => apt.patientId === patient.id)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  const upcomingAppointments = patientAppointments
    .filter((apt) => apt.startTime > new Date())
    .slice(0, isCompact ? 3 : 4);

  const recentNotes = mockNotes
    .filter((note) => note.patientId === patient.id)
    .slice(0, isCompact ? 2 : 3);

  return (
    <div
      className="h-full overflow-y-auto custom-scrollbar"
      style={{
        padding: `var(--density-space-md)`,
      }}
    >
      <div
        className="max-w-7xl mx-auto flex flex-col"
        style={{ gap: `var(--density-section-gap)` }}
      >
        {/* Clinical Alerts Banner - Compact */}
        {patient.alerts && patient.alerts.length > 0 && (
          <div
            className="bg-destructive/10 border border-destructive/20 rounded-lg flex items-start"
            style={{
              padding: `var(--density-space-sm) var(--density-space-md)`,
              gap: `var(--density-space-sm)`,
            }}
          >
            <AlertTriangle
              className="text-destructive flex-shrink-0"
              style={{
                width: `var(--density-icon-md)`,
                height: `var(--density-icon-md)`,
                marginTop: '2px',
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {patient.alerts.slice(0, 2).map((alert, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <BadgeCompact
                      variant={alert.severity === 'critical' ? 'destructive' : 'warning'}
                    >
                      {alert.type}
                    </BadgeCompact>
                    <span
                      className="text-foreground truncate"
                      style={{ fontSize: `var(--density-text-sm)` }}
                    >
                      {alert.message}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-0.5 px-1.5"
                      style={{ fontSize: `var(--density-text-xs)` }}
                    >
                      <Check style={{ width: 12, height: 12 }} />
                    </Button>
                  </div>
                ))}
                {patient.alerts.length > 2 && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0"
                    style={{ fontSize: `var(--density-text-xs)` }}
                  >
                    +{patient.alerts.length - 2} autres
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* KPI Cards Row - Responsive grid */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4"
          style={{ gap: `var(--density-space-sm)` }}
        >
          <KPICard
            icon={Calendar}
            value={patientAppointments.length}
            label="RDV Total"
            gradient="from-primary/5 to-primary/10"
            borderColor="border-primary/20"
            iconColor="text-primary"
            iconBg="bg-primary/20"
            onClick={() => navigate('../historique')}
          />
          <KPICard
            icon={Clock}
            value={upcomingAppointments.length}
            label="À venir"
            gradient="from-accent/5 to-accent/10"
            borderColor="border-accent/20"
            iconColor="text-accent"
            iconBg="bg-accent/20"
            onClick={() => navigate('../historique')}
          />
          <KPICard
            icon={FileText}
            value={recentNotes.length}
            label="Notes"
            gradient="from-success/5 to-success/10"
            borderColor="border-success/20"
            iconColor="text-success"
            iconBg="bg-success/20"
          />
          <KPICard
            icon={Activity}
            value={patient.alerts?.length || 0}
            label="Alertes"
            gradient="from-warning/5 to-warning/10"
            borderColor="border-warning/20"
            iconColor="text-warning"
            iconBg="bg-warning/20"
          />
        </div>

        {/* Main Content Grid - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: `var(--density-section-gap)` }}
        >
          {/* Upcoming Appointments */}
          <CardCompact
            title="Prochains RDV"
            icon={Calendar}
            collapsible
            collapsed={collapsedModules.appointments}
            onCollapsedChange={() => toggleCollapse('appointments')}
            headerActions={
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0.5 px-1.5"
                style={{ fontSize: `var(--density-text-xs)` }}
              >
                Voir tout
                <ChevronRight style={{ width: 12, height: 12 }} />
              </Button>
            }
            noPadding
          >
            {upcomingAppointments.length > 0 ? (
              <>
                {upcomingAppointments.map((apt) => (
                  <ListItemCompact
                    key={apt.id}
                    primary={format(apt.startTime, 'EEE d MMM', { locale: fr })}
                    secondary={`${format(apt.startTime, 'HH:mm')} - ${apt.motif.name}`}
                    left={
                      <div
                        className="w-1 rounded-full"
                        style={{
                          height: `var(--density-list-item-height)`,
                          backgroundColor: apt.motif.color,
                        }}
                      />
                    }
                    right={
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: `var(--density-text-xs)` }}
                      >
                        {apt.practitioner.title} {apt.practitioner.lastName}
                      </span>
                    }
                    onClick={() => {}}
                  />
                ))}
                <div style={{ padding: `var(--density-space-sm)` }}>
                  <Button
                    size="sm"
                    className="w-full"
                    style={{ height: `var(--density-btn-height)` }}
                  >
                    <Plus style={{ width: 14, height: 14, marginRight: 4 }} />
                    Nouveau RDV
                  </Button>
                </div>
              </>
            ) : (
              <EmptyStateCompact icon={Calendar} message="Aucun RDV à venir" />
            )}
          </CardCompact>

          {/* Coordonnées */}
          <CardCompact
            title="Coordonnées"
            icon={User}
            collapsible
            collapsed={collapsedModules.contacts}
            onCollapsedChange={() => toggleCollapse('contacts')}
            headerActions={
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0.5 px-1.5"
                style={{ fontSize: `var(--density-text-xs)` }}
                onClick={() => navigate('../infos')}
              >
                Modifier
              </Button>
            }
            noPadding
          >
            {patient.phone && (
              <InfoRowCompact
                icon={Phone}
                label="Téléphone"
                value={
                  <a href={`tel:${patient.phone}`} className="text-primary hover:underline">
                    {patient.phone}
                  </a>
                }
              />
            )}
            {patient.email && (
              <InfoRowCompact
                icon={Mail}
                label="Email"
                value={
                  <a
                    href={`mailto:${patient.email}`}
                    className="text-primary hover:underline truncate max-w-[150px]"
                  >
                    {patient.email}
                  </a>
                }
              />
            )}
            {(patient.address || patient.city) && (
              <InfoRowCompact
                icon={MapPin}
                label="Adresse"
                value={`${patient.postalCode} ${patient.city}`}
              />
            )}
          </CardCompact>

          {/* Actions rapides */}
          <CardCompact
            title="Actions rapides"
            icon={Activity}
            collapsible
            collapsed={collapsedModules.quickActions}
            onCollapsedChange={() => toggleCollapse('quickActions')}
          >
            <div
              className="grid grid-cols-2"
              style={{ gap: `var(--density-space-sm)` }}
            >
              <Button
                size="sm"
                className="justify-start"
                style={{
                  height: `var(--density-btn-height)`,
                  fontSize: `var(--density-text-sm)`,
                }}
              >
                <Plus style={{ width: 14, height: 14, marginRight: 4 }} />
                RDV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                style={{
                  height: `var(--density-btn-height)`,
                  fontSize: `var(--density-text-sm)`,
                }}
              >
                <FileText style={{ width: 14, height: 14, marginRight: 4 }} />
                Note
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                style={{
                  height: `var(--density-btn-height)`,
                  fontSize: `var(--density-text-sm)`,
                }}
              >
                <MessageSquare style={{ width: 14, height: 14, marginRight: 4 }} />
                SMS
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                style={{
                  height: `var(--density-btn-height)`,
                  fontSize: `var(--density-text-sm)`,
                }}
              >
                <Calendar style={{ width: 14, height: 14, marginRight: 4 }} />
                Multi-RDV
              </Button>
            </div>
          </CardCompact>

          {/* Notes récentes */}
          <CardCompact
            title="Notes récentes"
            icon={FileText}
            collapsible
            collapsed={collapsedModules.notes}
            onCollapsedChange={() => toggleCollapse('notes')}
            headerActions={
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0.5 px-1.5"
                style={{ fontSize: `var(--density-text-xs)` }}
              >
                Voir tout
                <ChevronRight style={{ width: 12, height: 12 }} />
              </Button>
            }
            noPadding
          >
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <ListItemCompact
                  key={note.id}
                  primary={
                    <span className="line-clamp-1">{note.content}</span>
                  }
                  secondary={`${format(note.createdAt, 'dd/MM/yy', { locale: fr })} - ${note.authorName}`}
                  onClick={() => {}}
                />
              ))
            ) : (
              <EmptyStateCompact icon={FileText} message="Aucune note" />
            )}
          </CardCompact>

          {/* Résumé clinique */}
          <CardCompact
            title="Résumé clinique"
            icon={Stethoscope}
            collapsible
            collapsed={collapsedModules.clinical}
            onCollapsedChange={() => toggleCollapse('clinical')}
            headerActions={
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0.5 px-1.5"
                style={{ fontSize: `var(--density-text-xs)` }}
                onClick={() => navigate('../antecedents')}
              >
                Ouvrir
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: `var(--density-space-sm)` }}>
              <div>
                <p
                  className="font-medium text-muted-foreground"
                  style={{ fontSize: `var(--density-text-xs)`, marginBottom: 4 }}
                >
                  Diagnostics
                </p>
                <div className="flex flex-wrap gap-1">
                  <BadgeCompact>Hypertension</BadgeCompact>
                  <BadgeCompact>Diabète T2</BadgeCompact>
                </div>
              </div>
              <div>
                <p
                  className="font-medium text-muted-foreground"
                  style={{ fontSize: `var(--density-text-xs)`, marginBottom: 4 }}
                >
                  Allergies
                </p>
                <PatientAllergiesBadge patientId={patient.id} />
              </div>
              <div>
                <p
                  className="font-medium text-muted-foreground"
                  style={{ fontSize: `var(--density-text-xs)`, marginBottom: 4 }}
                >
                  Traitements
                </p>
                <div
                  className="flex items-center text-foreground"
                  style={{ gap: `var(--density-space-xs)`, fontSize: `var(--density-text-sm)` }}
                >
                  <Pill style={{ width: 12, height: 12 }} className="text-muted-foreground" />
                  <span className="truncate">Metformine 500mg, Lisinopril</span>
                </div>
              </div>
            </div>
          </CardCompact>

          {/* Documents */}
          <CardCompact
            title="Documents"
            icon={FileText}
            collapsible
            defaultCollapsed
            collapsed={collapsedModules.documents}
            onCollapsedChange={() => toggleCollapse('documents')}
          >
            <div className="text-center" style={{ padding: `var(--density-space-md)` }}>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                style={{ height: `var(--density-btn-height)` }}
              >
                <FileUp style={{ width: 14, height: 14, marginRight: 4 }} />
                Importer
              </Button>
            </div>
          </CardCompact>

          {/* Prévention */}
          <CardCompact
            title="Prévention"
            icon={Heart}
            collapsible
            defaultCollapsed
            collapsed={collapsedModules.prevention}
            onCollapsedChange={() => toggleCollapse('prevention')}
            noPadding
          >
            <div
              className="flex items-center justify-between bg-warning/10 border-l-2 border-warning"
              style={{ padding: `var(--density-space-sm) var(--density-space-md)` }}
            >
              <div className="flex items-center" style={{ gap: `var(--density-space-sm)` }}>
                <AlertCircle
                  className="text-warning"
                  style={{ width: `var(--density-icon-sm)`, height: `var(--density-icon-sm)` }}
                />
                <span style={{ fontSize: `var(--density-text-sm)` }}>Vaccin grippe</span>
              </div>
              <BadgeCompact variant="warning">Échu</BadgeCompact>
            </div>
          </CardCompact>
        </div>
      </div>
    </div>
  );
};

// Compact KPI Card Component
interface KPICardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  gradient: string;
  borderColor: string;
  iconColor: string;
  iconBg: string;
  onClick?: () => void;
}

const KPICard: React.FC<KPICardProps> = ({
  icon: Icon,
  value,
  label,
  gradient,
  borderColor,
  iconColor,
  iconBg,
  onClick,
}) => (
  <div
    className={cn(
      'bg-gradient-to-br rounded-lg border shadow-sm transition-shadow',
      gradient,
      borderColor,
      onClick && 'cursor-pointer hover:shadow-md'
    )}
    style={{
      padding: `var(--density-space-sm) var(--density-space-md)`,
      borderRadius: `var(--density-card-radius)`,
    }}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
  >
    <div className="flex items-center" style={{ gap: `var(--density-space-sm)` }}>
      <div
        className={cn('rounded-lg flex items-center justify-center', iconBg)}
        style={{
          width: `var(--density-avatar-md)`,
          height: `var(--density-avatar-md)`,
        }}
      >
        <Icon
          className={iconColor}
          style={{
            width: `var(--density-icon-md)`,
            height: `var(--density-icon-md)`,
          }}
        />
      </div>
      <div className="min-w-0">
        <p
          className="font-bold text-foreground"
          style={{ fontSize: `var(--density-text-xl)`, lineHeight: 1.1 }}
        >
          {value}
        </p>
        <p
          className="text-muted-foreground truncate"
          style={{ fontSize: `var(--density-text-xs)` }}
        >
          {label}
        </p>
      </div>
    </div>
  </div>
);

// Compact Empty State
interface EmptyStateCompactProps {
  icon: React.ElementType;
  message: string;
}

const EmptyStateCompact: React.FC<EmptyStateCompactProps> = ({ icon: Icon, message }) => (
  <div
    className="text-center text-muted-foreground"
    style={{ padding: `var(--density-space-lg) var(--density-space-md)` }}
  >
    <Icon
      className="mx-auto opacity-30"
      style={{
        width: `var(--density-icon-lg)`,
        height: `var(--density-icon-lg)`,
        marginBottom: `var(--density-space-xs)`,
      }}
    />
    <p style={{ fontSize: `var(--density-text-sm)` }}>{message}</p>
  </div>
);

export default PatientHomeTab;
