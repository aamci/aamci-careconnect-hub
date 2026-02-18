import React from 'react';
import { BarChart3, TrendingUp, Users, CalendarDays, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Statistiques: React.FC = () => {
  const stats = [
    { label: 'Rendez-vous ce mois', value: '142', icon: CalendarDays, trend: '+12%' },
    { label: 'Patients uniques', value: '98', icon: Users, trend: '+8%' },
    { label: 'Taux d\'occupation', value: '87%', icon: TrendingUp, trend: '+3%' },
    { label: 'Duree moyenne RDV', value: '22 min', icon: Clock, trend: '-2%' },
  ];

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
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Evolution mensuelle</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            <p>Graphique d'evolution disponible sur la page Activite</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistiques;
