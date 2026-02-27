import React, { useState } from 'react';
import { BarChart3, TrendingUp, Users, CalendarDays, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const monthlyData = [
  { month: 'Sep', rdv: 105, patients: 72 },
  { month: 'Oct', rdv: 118, patients: 80 },
  { month: 'Nov', rdv: 127, patients: 85 },
  { month: 'Dec', rdv: 98, patients: 68 },
  { month: 'Jan', rdv: 134, patients: 91 },
  { month: 'Fev', rdv: 142, patients: 98 },
];

const maxRdv = Math.max(...monthlyData.map((d) => d.rdv));

type ChartMetric = 'rdv' | 'patients';

const Statistiques: React.FC = () => {
  const [chartMetric, setChartMetric] = useState<ChartMetric>('rdv');

  const stats = [
    { label: 'Rendez-vous ce mois', value: '142', icon: CalendarDays, trend: '+12%' },
    { label: 'Patients uniques', value: '98', icon: Users, trend: '+8%' },
    { label: 'Taux d\'occupation', value: '87%', icon: TrendingUp, trend: '+3%' },
    { label: 'Duree moyenne RDV', value: '22 min', icon: Clock, trend: '-2%' },
  ];

  const maxValue = Math.max(...monthlyData.map((d) => d[chartMetric]));

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Statistiques</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Retrouvez ici un apercu des statistiques de votre activite.
          Pour des analyses detaillees, consultez la page Activite depuis le menu principal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <stat.icon className="h-5 w-5 text-primary" />
                  <span className={`text-xs font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Evolution mensuelle</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant={chartMetric === 'rdv' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setChartMetric('rdv')}
              >
                Rendez-vous
              </Button>
              <Button
                variant={chartMetric === 'patients' ? 'default' : 'outline'}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setChartMetric('patients')}
              >
                Patients
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-3 px-2">
            {monthlyData.map((d) => {
              const value = d[chartMetric];
              const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-foreground">{value}</span>
                  <div
                    className={cn(
                      'w-full rounded-t-md transition-all duration-500',
                      chartMetric === 'rdv' ? 'bg-primary/80' : 'bg-teal-500/80'
                    )}
                    style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                  />
                  <span className="text-xs text-muted-foreground mt-1">{d.month}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistiques;
