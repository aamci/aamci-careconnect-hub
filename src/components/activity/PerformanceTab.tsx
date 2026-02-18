/**
 * Onglet Performance Opérationnelle
 * KPIs : Créneaux perdus, RPH, Durée par type, Occupation créneaux
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock, DollarSign, AlertTriangle, Timer, TrendingUp, TrendingDown,
  Loader2, UserX, XCircle
} from 'lucide-react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine, Cell,
  LineChart, Line, ComposedChart, Area
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { NoShowMetrics, RevenuePerHourMetrics, ConsultationDurationMetrics, SlotOccupancyMetrics } from '@/types/advancedAnalytics';

interface PerformanceTabProps {
  noShow?: NoShowMetrics;
  revenuePerHour?: RevenuePerHourMetrics;
  consultationDuration?: ConsultationDurationMetrics;
  slotOccupancy?: SlotOccupancyMetrics;
  isLoading: boolean;
}

const PerformanceTab: React.FC<PerformanceTabProps> = ({
  noShow,
  revenuePerHour,
  consultationDuration,
  slotOccupancy,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card><CardContent className="pt-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
          <Card><CardContent className="pt-6"><Skeleton className="h-[300px] w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const noShowColor = noShow && noShow.rate > 15 ? 'text-red-600' : noShow && noShow.rate > 10 ? 'text-amber-600' : 'text-green-600';
  const occupancyColor = slotOccupancy && slotOccupancy.occupancyRate > 85 ? 'text-red-600' : slotOccupancy && slotOccupancy.occupancyRate < 60 ? 'text-amber-600' : 'text-green-600';

  return (
    <div className="space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Créneaux perdus */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Créneaux perdus</CardTitle>
                <UserX className={`h-5 w-5 ${noShowColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{noShow?.rate.toFixed(1)}%</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant={noShow && noShow.change <= 0 ? 'default' : 'destructive'} className="font-medium">
                  {noShow && noShow.change >= 0 ? '+' : ''}{noShow?.change.toFixed(1)}%
                </Badge>
                <span className="text-muted-foreground">
                  {noShow?.noShowCount} no-show, {noShow?.lateCancellationCount} annul.
                </span>
              </div>
              {noShow && noShow.economicLoss > 0 && (
                <div className="text-xs text-red-500 mt-1">
                  Perte estimée : {noShow.economicLoss.toLocaleString('fr-FR')} €
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenu par heure */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenu / heure</CardTitle>
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{revenuePerHour?.value.toFixed(0)} €/h</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant={revenuePerHour && revenuePerHour.change >= 0 ? 'default' : 'destructive'} className="font-medium">
                  {revenuePerHour && revenuePerHour.change >= 0 ? '+' : ''}{revenuePerHour?.change.toFixed(1)}%
                </Badge>
                <span className="text-muted-foreground">vs période précédente</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Durée moyenne */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Durée moy. globale</CardTitle>
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{consultationDuration?.globalAvg} min</div>
              <div className="text-xs text-muted-foreground mt-1">
                {consultationDuration?.byType.length} types de consultations
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Taux d'occupation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Taux occupation</CardTitle>
                <Clock className={`h-5 w-5 ${occupancyColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slotOccupancy?.occupancyRate}%</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant={slotOccupancy && slotOccupancy.change >= 0 ? 'default' : 'destructive'} className="font-medium">
                  {slotOccupancy && slotOccupancy.change >= 0 ? '+' : ''}{slotOccupancy?.change.toFixed(1)}%
                </Badge>
                <span className="text-muted-foreground">
                  {slotOccupancy?.usedHours}h / {slotOccupancy?.availableHours}h
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Durée par type - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Durée moyenne par type</CardTitle>
            <CardDescription>Réel vs planifié (en minutes)</CardDescription>
          </CardHeader>
          <CardContent>
            {consultationDuration?.byType && consultationDuration.byType.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={consultationDuration.byType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="label" type="category" width={100} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} min`,
                      name === 'avgDuration' ? 'Durée réelle' : 'Durée planifiée'
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="avgDuration" name="Durée réelle" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="plannedDuration" name="Durée planifiée" fill="#94A3B8" radius={[0, 4, 4, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* RPH par praticien - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenu par heure par praticien</CardTitle>
            <CardDescription>Performance économique</CardDescription>
          </CardHeader>
          <CardContent>
            {revenuePerHour?.byPractitioner && revenuePerHour.byPractitioner.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={revenuePerHour.byPractitioner}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number) => [`${value.toFixed(0)} €/h`, 'RPH']}
                  />
                  <Bar dataKey="rph" fill="#10B981" radius={[4, 4, 0, 0]}>
                    {revenuePerHour.byPractitioner.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : index === 1 ? '#3B82F6' : '#8B5CF6'} />
                    ))}
                  </Bar>
                  <ReferenceLine y={revenuePerHour.value} stroke="#EF4444" strokeDasharray="5 5" label={{ value: 'Moy.', fill: '#EF4444', fontSize: 11 }} />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* No-Show Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tendance des créneaux perdus</CardTitle>
          <CardDescription>No-shows et annulations tardives par jour</CardDescription>
        </CardHeader>
        <CardContent>
          {noShow?.trend && noShow.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <ComposedChart data={noShow.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(d) => d.slice(5)} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Bar dataKey="noShow" name="No-show" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Annulation tardive" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Occupation details */}
      {slotOccupancy?.byPractitioner && slotOccupancy.byPractitioner.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Occupation par praticien</CardTitle>
            <CardDescription>Taux d'utilisation des créneaux</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slotOccupancy.byPractitioner.map((p) => (
                <div key={p.id} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-40 truncate">{p.name}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        p.rate > 85 ? 'bg-red-500' : p.rate < 60 ? 'bg-amber-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(p.rate, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-mono w-16 text-right">{p.rate}%</span>
                  <span className="text-xs text-muted-foreground w-12">{p.usedHours}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceTab;
