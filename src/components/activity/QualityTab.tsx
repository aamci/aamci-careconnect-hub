/**
 * Onglet Qualité & Suivi
 * KPIs : Délai 1ère consultation, Suivi longitudinal, Complétion documents, Recouvrement
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClock, Users, FileCheck, CreditCard, TrendingUp, TrendingDown,
  CheckCircle2, AlertCircle
} from 'lucide-react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import type {
  FirstVisitDelayMetrics,
  FollowupMetrics,
  DocumentCompletionMetrics,
  CollectionMetrics
} from '@/types/advancedAnalytics';

interface QualityTabProps {
  firstVisitDelay?: FirstVisitDelayMetrics;
  followup?: FollowupMetrics;
  documentCompletion?: DocumentCompletionMetrics;
  collection?: CollectionMetrics;
  isLoading: boolean;
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

const QualityTab: React.FC<QualityTabProps> = ({
  firstVisitDelay,
  followup,
  documentCompletion,
  collection,
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

  const delayColor = firstVisitDelay && firstVisitDelay.avgDays <= 7 ? 'text-green-600' :
    firstVisitDelay && firstVisitDelay.avgDays <= 15 ? 'text-amber-600' : 'text-red-600';
  const followupColor = followup && followup.longitudinalRate >= 50 ? 'text-green-600' :
    followup && followup.longitudinalRate >= 30 ? 'text-amber-600' : 'text-red-600';
  const completionColor = documentCompletion && documentCompletion.rate24h >= 85 ? 'text-green-600' :
    documentCompletion && documentCompletion.rate24h >= 70 ? 'text-amber-600' : 'text-red-600';
  const collectionColor = collection && collection.rate >= 90 ? 'text-green-600' :
    collection && collection.rate >= 80 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-4">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Délai 1ère consultation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Délai 1ère consult.</CardTitle>
                <CalendarClock className={`h-5 w-5 ${delayColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{firstVisitDelay?.avgDays} jours</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant={firstVisitDelay && firstVisitDelay.change <= 0 ? 'default' : 'destructive'} className="font-medium">
                  {firstVisitDelay && firstVisitDelay.change >= 0 ? '+' : ''}{firstVisitDelay?.change} j
                </Badge>
                <span className="text-muted-foreground">médiane : {firstVisitDelay?.medianDays}j</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Taux de suivi */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Suivi longitudinal</CardTitle>
                <Users className={`h-5 w-5 ${followupColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{followup?.longitudinalRate}%</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant={followup && followup.change >= 0 ? 'default' : 'destructive'} className="font-medium">
                  {followup && followup.change >= 0 ? '+' : ''}{followup?.change}%
                </Badge>
                <span className="text-muted-foreground">
                  {followup?.followedPatientsCount}/{followup?.totalPatientsCount} patients
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Complétion documents */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Docs créés &lt;24h</CardTitle>
                <FileCheck className={`h-5 w-5 ${completionColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documentCompletion?.rate24h}%</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant={documentCompletion && documentCompletion.change >= 0 ? 'default' : 'destructive'} className="font-medium">
                  {documentCompletion && documentCompletion.change >= 0 ? '+' : ''}{documentCompletion?.change}%
                </Badge>
                <span className="text-muted-foreground">délai moy : {documentCompletion?.avgDelayHours}h</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Taux de recouvrement */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Recouvrement</CardTitle>
                <CreditCard className={`h-5 w-5 ${collectionColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{collection?.rate}%</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant={collection && collection.change >= 0 ? 'default' : 'destructive'} className="font-medium">
                  {collection && collection.change >= 0 ? '+' : ''}{collection?.change}%
                </Badge>
                <span className="text-muted-foreground text-red-500">
                  impayés : {collection?.unpaidAmount.toLocaleString('fr-FR')}€
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribution délais 1ère consultation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribution des délais</CardTitle>
            <CardDescription>Délai entre inscription patient et 1ère consultation</CardDescription>
          </CardHeader>
          <CardContent>
            {firstVisitDelay?.distribution && firstVisitDelay.distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <RechartsBarChart data={firstVisitDelay.distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'count' ? `${value} patients` : `${value.toFixed(1)}%`,
                      name === 'count' ? 'Nombre' : 'Pourcentage'
                    ]}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {firstVisitDelay.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fréquence de visite */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fréquence de visite</CardTitle>
            <CardDescription>Répartition patients par nombre de visites</CardDescription>
          </CardHeader>
          <CardContent>
            {followup?.visitFrequency && followup.visitFrequency.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={followup.visitFrequency}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    label={({ visits, percentage }) => `${visits} (${percentage.toFixed(0)}%)`}
                  >
                    {followup.visitFrequency.map((entry, index) => (
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
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Document completion by category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Complétion documents par catégorie</CardTitle>
          <CardDescription>Taux de création dans les 24h post-consultation</CardDescription>
        </CardHeader>
        <CardContent>
          {documentCompletion?.byCategory && documentCompletion.byCategory.length > 0 ? (
            <div className="space-y-4">
              {documentCompletion.byCategory.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{cat.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{cat.count} docs</span>
                      <span className="font-mono">{cat.rate}%</span>
                      {cat.rate >= 90 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : cat.rate >= 75 ? (
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <Progress value={cat.rate} className="h-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Statut des paiements</CardTitle>
          <CardDescription>Répartition des factures par statut</CardDescription>
        </CardHeader>
        <CardContent>
          {collection?.byStatus && collection.byStatus.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {collection.byStatus.map((status) => (
                <div
                  key={status.status}
                  className={`p-4 rounded-lg border ${
                    status.status === 'paid' ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' :
                    status.status === 'pending' ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800' :
                    'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
                  }`}
                >
                  <div className="text-sm text-muted-foreground">{status.label}</div>
                  <div className="text-2xl font-bold mt-1">{status.amount.toLocaleString('fr-FR')} €</div>
                  <div className="text-xs mt-1">
                    {status.count} factures ({status.percentage.toFixed(1)}%)
                  </div>
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
    </div>
  );
};

export default QualityTab;
