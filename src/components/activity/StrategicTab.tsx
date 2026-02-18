/**
 * Onglet Indicateurs Stratégiques
 * KPIs : Pyramide âges, Ratio docs, Cascades, Consultations complexes, Reprogrammations
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users2, FileText, AlertOctagon, Clock, RotateCcw, TrendingUp
} from 'lucide-react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell, PieChart, Pie,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type {
  AgeDistributionMetrics,
  DocumentRatioMetrics,
  CascadeCancellationMetrics,
  ComplexConsultationMetrics,
  ReschedulingMetrics
} from '@/types/advancedAnalytics';

interface StrategicTabProps {
  ageDistribution?: AgeDistributionMetrics;
  documentRatio?: DocumentRatioMetrics;
  cascadeCancellation?: CascadeCancellationMetrics;
  complexConsultation?: ComplexConsultationMetrics;
  rescheduling?: ReschedulingMetrics;
  isLoading: boolean;
}

const AGE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

const StrategicTab: React.FC<StrategicTabProps> = ({
  ageDistribution,
  documentRatio,
  cascadeCancellation,
  complexConsultation,
  rescheduling,
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

  // Alerte si cascade détectée
  const hasCascade = cascadeCancellation && cascadeCancellation.cascadeCount > 0;

  return (
    <div className="space-y-4">
      {/* Alerte cascade si présente */}
      {hasCascade && (
        <Alert variant="destructive" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <AlertOctagon className="h-5 w-5" />
          <AlertTitle>Annulations en cascade détectées</AlertTitle>
          <AlertDescription>
            {cascadeCancellation?.cascadeCount} événement(s) de cascade impactant {cascadeCancellation?.impactedAppointments} RDV.
            Vérifiez les absences praticiens ou problèmes techniques.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Âge moyen */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Âge moyen</CardTitle>
                <Users2 className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ageDistribution?.averageAge} ans</div>
              <div className="text-xs text-muted-foreground mt-1">
                Médiane : {ageDistribution?.medianAge} ans
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ratio docs/consult */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Docs/Consult</CardTitle>
                <FileText className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentRatio?.globalRatio}</div>
              <div className="text-xs text-muted-foreground mt-1">
                documents par consultation
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cascades */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Cascades</CardTitle>
                <AlertOctagon className={`h-5 w-5 ${hasCascade ? 'text-amber-600' : 'text-green-600'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{cascadeCancellation?.cascadeCount || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {cascadeCancellation?.impactedAppointments || 0} RDV impactés
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Consultations complexes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Consult. complexes</CardTitle>
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complexConsultation?.rate}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {complexConsultation?.complexCount}/{complexConsultation?.totalCount} consultations
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reprogrammation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Reprogrammation</CardTitle>
                <RotateCcw className="h-5 w-5 text-teal-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rescheduling?.reschedulingRate}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                délai moy : {rescheduling?.avgDelayDays}j
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pyramide des âges */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pyramide des âges</CardTitle>
            <CardDescription>Répartition de la patientèle active par tranche d'âge</CardDescription>
          </CardHeader>
          <CardContent>
            {ageDistribution?.distribution && ageDistribution.distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={ageDistribution.distribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis dataKey="range" type="category" width={80} stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number, name: string) => [
                      `${value} patients`,
                      name === 'male' ? 'Hommes' : name === 'female' ? 'Femmes' : 'Autres'
                    ]}
                  />
                  <Legend formatter={(value) => value === 'male' ? 'Hommes' : value === 'female' ? 'Femmes' : 'Autres'} />
                  <Bar dataKey="male" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="female" stackId="a" fill="#EC4899" />
                  <Bar dataKey="other" stackId="a" fill="#94A3B8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ratio documents par catégorie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ratio documents par catégorie</CardTitle>
            <CardDescription>Nombre de documents créés par consultation</CardDescription>
          </CardHeader>
          <CardContent>
            {documentRatio?.byCategory && documentRatio.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={documentRatio.byCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number) => [`${value} doc/consult`, 'Ratio']}
                  />
                  <Bar dataKey="ratio" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                    {documentRatio.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                    ))}
                  </Bar>
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

      {/* Funnel reprogrammation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Funnel de reprogrammation</CardTitle>
          <CardDescription>Du rendez-vous annulé à la consultation réalisée</CardDescription>
        </CardHeader>
        <CardContent>
          {rescheduling?.funnel && rescheduling.funnel.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rescheduling.funnel.map((stage, index) => (
                <div
                  key={stage.stage}
                  className={`relative p-4 rounded-lg text-center ${
                    index === 0 ? 'bg-red-50 border-red-200 dark:bg-red-950/20' :
                    index === 1 ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20' :
                    'bg-green-50 border-green-200 dark:bg-green-950/20'
                  } border`}
                >
                  {index < rescheduling.funnel.length - 1 && (
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hidden md:block">
                      →
                    </div>
                  )}
                  <div className="text-sm font-medium text-muted-foreground">{stage.stage}</div>
                  <div className="text-3xl font-bold mt-2">{stage.count}</div>
                  <div className="text-sm mt-1">{stage.percentage.toFixed(1)}%</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[150px] flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Consultations complexes par type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consultations complexes par type</CardTitle>
          <CardDescription>Consultations dépassant le seuil de durée (moy + 1.5σ)</CardDescription>
        </CardHeader>
        <CardContent>
          {complexConsultation?.byType && complexConsultation.byType.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Type</th>
                    <th className="text-center py-2 font-medium">Durée moy.</th>
                    <th className="text-center py-2 font-medium">Seuil complexe</th>
                    <th className="text-center py-2 font-medium">Nb complexes</th>
                    <th className="text-right py-2 font-medium">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {complexConsultation.byType.map((type) => (
                    <tr key={type.type} className="border-b hover:bg-muted/50">
                      <td className="py-2 font-medium capitalize">{type.type}</td>
                      <td className="text-center py-2">{type.avgDuration} min</td>
                      <td className="text-center py-2 text-muted-foreground">&gt; {type.threshold} min</td>
                      <td className="text-center py-2">
                        <Badge variant={type.complexCount > 0 ? 'destructive' : 'secondary'}>
                          {type.complexCount}/{type.totalCount}
                        </Badge>
                      </td>
                      <td className="text-right py-2 font-mono">{type.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ratio documents par praticien */}
      {documentRatio?.byPractitioner && documentRatio.byPractitioner.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Productivité documentaire par praticien</CardTitle>
            <CardDescription>Ratio documents créés par consultation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documentRatio.byPractitioner.map((p, index) => (
                <div key={p.id} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-40 truncate">{p.name}</span>
                  <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min((p.ratio / 2) * 100, 100)}%`,
                        backgroundColor: AGE_COLORS[index % AGE_COLORS.length]
                      }}
                    />
                  </div>
                  <span className="text-sm font-mono w-16 text-right">{p.ratio} doc/c</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StrategicTab;
