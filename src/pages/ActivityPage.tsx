/**
 * Page ACTIVITÉ - Dashboard statistique premium
 * KPIs, graphiques, exports, drill-down
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  Users,
  Euro,
  TrendingUp,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Loader2
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAllKPIs, useAppointmentsTimeSeries, useAppointmentsDistribution } from '@/hooks/data/useAnalytics';
import { exportToCSV, exportToPDF } from '@/services/supabase/analyticsService';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types for metrics
interface MetricCard {
  id: string;
  label: string;
  value: number;
  unit?: string;
  change: number;
  changeLabel: string;
  icon: any;
  color: string;
}

interface FilterState {
  period: 'today' | 'week' | 'month' | 'custom';
  practitioner: string;
  site: string;
  type: string;
  canal: string;
}

const ActivityPage: React.FC = () => {
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState('stats');
  const [filters, setFilters] = useState<FilterState>({
    period: 'month',
    practitioner: 'all',
    site: 'all',
    type: 'all',
    canal: 'all'
  });

  // Calculate date range based on period filter
  const analyticsFilters = useMemo(() => {
    let start: Date, end: Date;
    const now = new Date();

    switch (filters.period) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        end = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }

    return {
      period: { start, end },
      practitionerId: filters.practitioner !== 'all' ? filters.practitioner : undefined,
      siteId: filters.site !== 'all' ? filters.site : undefined,
      appointmentType: filters.type !== 'all' ? filters.type : undefined,
      canal: filters.canal !== 'all' ? (filters.canal as 'presentiel' | 'visio') : undefined
    };
  }, [filters]);

  // Fetch analytics data
  const { data: kpisData, isLoading: kpisLoading } = useAllKPIs(analyticsFilters);
  const { data: timeSeriesData, isLoading: timeSeriesLoading } = useAppointmentsTimeSeries(analyticsFilters);
  const { data: distributionData, isLoading: distributionLoading } = useAppointmentsDistribution(analyticsFilters, 'type');

  // Prepare KPI cards from data
  const kpiCards: MetricCard[] = useMemo(() => {
    if (!kpisData) return [];

    return [
      {
        id: 'appointments',
        label: 'Rendez-vous',
        value: kpisData.appointments.total,
        change: kpisData.appointments.change,
        changeLabel: 'vs période précédente',
        icon: Calendar,
        color: 'text-blue-600'
      },
      {
        id: 'documents',
        label: 'Documents créés',
        value: kpisData.documents.total,
        change: kpisData.documents.change,
        changeLabel: 'vs période précédente',
        icon: FileText,
        color: 'text-purple-600'
      },
      {
        id: 'patients',
        label: 'Patients vus',
        value: kpisData.patients.total,
        change: kpisData.patients.change,
        changeLabel: 'vs période précédente',
        icon: Users,
        color: 'text-green-600'
      },
      {
        id: 'revenue',
        label: 'Facturation',
        value: kpisData.revenue.total,
        unit: '€',
        change: kpisData.revenue.change,
        changeLabel: 'vs période précédente',
        icon: Euro,
        color: 'text-orange-600'
      },
      {
        id: 'quality',
        label: 'Taux de présence',
        value: kpisData.quality.attendanceRate,
        unit: '%',
        change: kpisData.quality.change,
        changeLabel: 'vs période précédente',
        icon: TrendingUp,
        color: 'text-teal-600'
      }
    ];
  }, [kpisData]);

  const handleExport = (format: 'csv' | 'pdf') => {
    if (!kpisData || !timeSeriesData) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'exporter : données non disponibles'
      });
      return;
    }

    try {
      if (format === 'csv') {
        exportToCSV(timeSeriesData, `statistiques_${filters.period}`);
        toast({
          title: 'Export CSV',
          description: 'Les statistiques ont été exportées avec succès'
        });
      } else {
        exportToPDF(timeSeriesData, `statistiques_${filters.period}`);
        toast({
          title: 'Export PDF',
          description: 'La fonctionnalité PDF sera bientôt disponible'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'export'
      });
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Chart colors
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <MainLayout activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="h-full flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-card">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                  <Activity className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                  Activité
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Tableau de bord statistique et indicateurs de performance
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                  <span className="sm:hidden">CSV</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
            </div>

            {/* Filtres globaux */}
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtres</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <Select
                  value={filters.period}
                  onValueChange={(value) => handleFilterChange('period', value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Période" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.practitioner}
                  onValueChange={(value) => handleFilterChange('practitioner', value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Praticien" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les praticiens</SelectItem>
                    <SelectItem value="p1">Dr. Martin</SelectItem>
                    <SelectItem value="p2">Dr. Dubois</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.site}
                  onValueChange={(value) => handleFilterChange('site', value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Site" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les sites</SelectItem>
                    <SelectItem value="s1">Cabinet Paris</SelectItem>
                    <SelectItem value="s2">Cabinet Lyon</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type}
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Type RDV" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="suivi">Suivi</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.canal}
                  onValueChange={(value) => handleFilterChange('canal', value)}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les canaux</SelectItem>
                    <SelectItem value="presentiel">Présentiel</SelectItem>
                    <SelectItem value="visio">Visio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {kpisLoading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="pb-3">
                      <Skeleton className="h-4 w-24" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-20 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                kpiCards.map((kpi) => (
                  <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            {kpi.label}
                          </CardTitle>
                          <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-2xl font-bold">
                            {kpi.value.toLocaleString('fr-FR', {
                              maximumFractionDigits: kpi.unit === '%' ? 1 : 0
                            })}
                            {kpi.unit && <span className="text-lg ml-1">{kpi.unit}</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <Badge
                              variant={kpi.change >= 0 ? 'default' : 'destructive'}
                              className="font-medium"
                            >
                              {kpi.change >= 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                            </Badge>
                            <span className="text-muted-foreground">{kpi.changeLabel}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>

            {/* Tabs pour différentes vues */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-4">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Vue d'ensemble</span>
                  <span className="sm:hidden">Aperçu</span>
                </TabsTrigger>
                <TabsTrigger value="appointments" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Rendez-vous</span>
                  <span className="sm:hidden">RDV</span>
                </TabsTrigger>
                <TabsTrigger value="patients" className="gap-2">
                  <Users className="h-4 w-4" />
                  Patients
                </TabsTrigger>
                <TabsTrigger value="billing" className="gap-2">
                  <Euro className="h-4 w-4" />
                  <span className="hidden sm:inline">Facturation</span>
                  <span className="sm:hidden">Factures</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Évolution des consultations</CardTitle>
                      <CardDescription>Nombre de consultations par jour</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {timeSeriesLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : timeSeriesData && timeSeriesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                            <XAxis
                              dataKey="label"
                              stroke="hsl(var(--muted-foreground))"
                              fontSize={12}
                            />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px'
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#3B82F6"
                              strokeWidth={2}
                              dot={{ fill: '#3B82F6', r: 4 }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          Aucune donnée disponible
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Répartition par type</CardTitle>
                      <CardDescription>Distribution des consultations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {distributionLoading ? (
                        <div className="h-[300px] flex items-center justify-center">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : distributionData && distributionData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={distributionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {distributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--background))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '6px'
                              }}
                            />
                            <Legend />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          Aucune donnée disponible
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Activité récente</CardTitle>
                    <CardDescription>Consultations par jour</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {timeSeriesLoading ? (
                      <div className="h-[250px] flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : timeSeriesData && timeSeriesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsBarChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                          <XAxis
                            dataKey="label"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={12}
                          />
                          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px'
                            }}
                          />
                          <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        Aucune donnée disponible
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques rendez-vous</CardTitle>
                    <CardDescription>Détails et analyse des rendez-vous</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {kpisLoading ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                          ))}
                        </div>
                      </div>
                    ) : kpisData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Total RDV</div>
                            <div className="text-2xl font-bold">
                              {kpisData.appointments.total}
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Taux présence</div>
                            <div className="text-2xl font-bold">
                              {kpisData.quality.attendanceRate.toFixed(1)}%
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Durée moyenne</div>
                            <div className="text-2xl font-bold">
                              {Math.round(kpisData.quality.avgDuration)} min
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                          <div className="p-4 border rounded-lg">
                            <div className="text-sm font-medium mb-3">Par statut</div>
                            <div className="space-y-2">
                              {Object.entries(kpisData.appointments.byStatus).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                  <span className="text-sm capitalize">{status}</span>
                                  <Badge variant="secondary">{count}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          {distributionData && distributionData.length > 0 && (
                            <div className="p-4 border rounded-lg">
                              <div className="text-sm font-medium mb-3">Par type</div>
                              <div className="space-y-2">
                                {distributionData.map((item) => (
                                  <div key={item.name} className="flex items-center justify-between">
                                    <span className="text-sm">{item.name}</span>
                                    <Badge variant="secondary">{item.value}</Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques patients</CardTitle>
                    <CardDescription>Analyse de la patientèle</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {kpisLoading ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                          ))}
                        </div>
                      </div>
                    ) : kpisData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Nouveaux patients</div>
                            <div className="text-2xl font-bold">
                              {kpisData.patients.newPatients}
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Patients actifs</div>
                            <div className="text-2xl font-bold">
                              {kpisData.patients.activePatients}
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Total vus</div>
                            <div className="text-2xl font-bold">
                              {kpisData.patients.total}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques facturation</CardTitle>
                    <CardDescription>Analyse financière</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {kpisLoading ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                          ))}
                        </div>
                      </div>
                    ) : kpisData ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">CA total</div>
                            <div className="text-2xl font-bold">
                              {kpisData.revenue.total.toLocaleString('fr-FR')} €
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">CA moyen/jour</div>
                            <div className="text-2xl font-bold">
                              {Math.round(kpisData.revenue.avgPerDay).toLocaleString('fr-FR')} €
                            </div>
                          </div>
                          <div className="p-4 bg-muted/30 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Impayés</div>
                            <div className="text-2xl font-bold text-destructive">
                              {kpisData.revenue.unpaid.toLocaleString('fr-FR')} €
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ActivityPage;
