/**
 * Onglet Indicateurs Prédictifs & Stratégiques
 * KPIs : Télémédecine, Segments patients, Urgences récurrentes, Variabilité charge
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Video, UserPlus, AlertTriangle, Activity, TrendingUp, TrendingDown,
  Users, BarChart3, Phone
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line, BarChart, Bar, Cell,
  ComposedChart, ReferenceLine
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type {
  TelemedicineMetrics,
  PatientSegmentMetrics,
  EmergencyRecurrenceMetrics,
  WorkloadVariabilityMetrics
} from '@/types/advancedAnalytics';

interface PredictiveTabProps {
  telemedicine?: TelemedicineMetrics;
  patientSegment?: PatientSegmentMetrics;
  emergencyRecurrence?: EmergencyRecurrenceMetrics;
  workloadVariability?: WorkloadVariabilityMetrics;
  isLoading: boolean;
}

const PredictiveTab: React.FC<PredictiveTabProps> = ({
  telemedicine,
  patientSegment,
  emergencyRecurrence,
  workloadVariability,
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

  const cvColor = workloadVariability && workloadVariability.coefficientOfVariation < 15 ? 'text-green-600' :
    workloadVariability && workloadVariability.coefficientOfVariation < 25 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-4">
      {/* Alerte patients à risque si présents */}
      {emergencyRecurrence && emergencyRecurrence.atRiskCount > 0 && (
        <Alert variant="destructive" className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Patients à risque détectés</AlertTitle>
          <AlertDescription>
            {emergencyRecurrence.atRiskCount} patient(s) avec urgences récurrentes nécessitent une attention particulière.
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Adoption téléconsultation */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Téléconsultation</CardTitle>
                <Video className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{telemedicine?.adoptionRate}%</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant={telemedicine && telemedicine.adoptionChange >= 0 ? 'default' : 'destructive'} className="font-medium">
                  {telemedicine && telemedicine.adoptionChange >= 0 ? '+' : ''}{telemedicine?.adoptionChange}%
                </Badge>
                <span className="text-muted-foreground">
                  {telemedicine?.totalVisio} visio / {telemedicine?.totalInPerson} présent.
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ratio nouveaux/fidèles */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Nouveaux / Fidèles</CardTitle>
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patientSegment?.ratio.toFixed(2)}</div>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant={patientSegment && patientSegment.change >= 0 ? 'default' : 'destructive'} className="font-medium">
                  {patientSegment && patientSegment.change >= 0 ? '+' : ''}{patientSegment?.change.toFixed(2)}
                </Badge>
                <span className="text-muted-foreground">
                  {patientSegment?.newPatientsCount} new / {patientSegment?.loyalPatientsCount} fidèles
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Récurrence urgences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Urgences récurr.</CardTitle>
                <AlertTriangle className={`h-5 w-5 ${emergencyRecurrence && emergencyRecurrence.atRiskCount > 0 ? 'text-red-600' : 'text-green-600'}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{emergencyRecurrence?.rate}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {emergencyRecurrence?.atRiskCount} patient(s) à risque (≥2 urgences)
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Variabilité charge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Variabilité charge</CardTitle>
                <Activity className={`h-5 w-5 ${cvColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">CV {workloadVariability?.coefficientOfVariation}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                Moy. {workloadVariability?.weeklyAvg} RDV/sem (σ={workloadVariability?.standardDeviation})
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tendance télémédecine */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Évolution télémédecine</CardTitle>
            <CardDescription>Visio vs présentiel sur la période</CardDescription>
          </CardHeader>
          <CardContent>
            {telemedicine?.trend && telemedicine.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={telemedicine.trend}>
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
                  <Area type="monotone" dataKey="inPerson" name="Présentiel" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="visio" name="Visio" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variabilité hebdomadaire */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Charge hebdomadaire</CardTitle>
            <CardDescription>Avec bandes de confiance (±1σ)</CardDescription>
          </CardHeader>
          <CardContent>
            {workloadVariability?.weeklyData && workloadVariability.weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={workloadVariability.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="upperBound" name="Borne sup." stroke="transparent" fill="#10B981" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="lowerBound" name="Borne inf." stroke="transparent" fill="#10B981" fillOpacity={0.1} />
                  <Line type="monotone" dataKey="count" name="RDV réels" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
                  <ReferenceLine y={workloadVariability.weeklyAvg} stroke="#F59E0B" strokeDasharray="5 5" label={{ value: 'Moy.', fill: '#F59E0B', fontSize: 11 }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tendance segments patients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Évolution des segments patients</CardTitle>
          <CardDescription>Nouveaux patients vs patients fidèles par semaine</CardDescription>
        </CardHeader>
        <CardContent>
          {patientSegment?.trend && patientSegment.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={patientSegment.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
                <Bar dataKey="newPatients" name="Nouveaux patients" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="loyalPatients" name="Patients fidèles" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patients à risque */}
      {emergencyRecurrence?.atRiskPatients && emergencyRecurrence.atRiskPatients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Patients à risque - Urgences récurrentes
            </CardTitle>
            <CardDescription>Patients avec ≥2 consultations urgentes sur la période</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Patient</th>
                    <th className="text-center py-2 font-medium">Nb urgences</th>
                    <th className="text-right py-2 font-medium">Dernière urgence</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencyRecurrence.atRiskPatients.map((patient) => (
                    <tr key={patient.patientId} className="border-b hover:bg-muted/50">
                      <td className="py-2">{patient.patientName}</td>
                      <td className="text-center py-2">
                        <Badge variant="destructive">{patient.emergencyCount}</Badge>
                      </td>
                      <td className="text-right py-2 text-muted-foreground">{patient.lastEmergency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictiveTab;
