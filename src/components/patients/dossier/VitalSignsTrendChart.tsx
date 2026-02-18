import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { VitalSign } from '@/hooks/data/useVitalSigns';

interface VitalSignsTrendChartProps {
  vitalSigns: VitalSign[];
}

interface ChartDataPoint {
  date: string;
  dateLabel: string;
  weight_kg: number | null;
  bmi: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  temperature_c: number | null;
  oxygen_saturation: number | null;
}

const CHART_CONFIGS = {
  weight: {
    title: 'Poids et IMC',
    lines: [
      { key: 'weight_kg', label: 'Poids (kg)', color: '#3B82F6', yAxisId: 'left' },
      { key: 'bmi', label: 'IMC', color: '#8B5CF6', yAxisId: 'right' },
    ],
    references: [
      { y: 25, label: 'IMC 25', yAxisId: 'right', color: '#F59E0B' },
      { y: 30, label: 'IMC 30', yAxisId: 'right', color: '#EF4444' },
    ],
  },
  bp: {
    title: 'Tension artérielle',
    lines: [
      { key: 'systolic_bp', label: 'Systolique', color: '#EF4444', yAxisId: 'left' },
      { key: 'diastolic_bp', label: 'Diastolique', color: '#3B82F6', yAxisId: 'left' },
    ],
    references: [
      { y: 140, label: 'Seuil HTA sys.', yAxisId: 'left', color: '#F59E0B' },
      { y: 90, label: 'Seuil HTA dia.', yAxisId: 'left', color: '#F59E0B' },
    ],
  },
  cardiac: {
    title: 'Fréquence cardiaque',
    lines: [
      { key: 'heart_rate', label: 'FC (bpm)', color: '#EC4899', yAxisId: 'left' },
    ],
    references: [
      { y: 60, label: 'Min normal', yAxisId: 'left', color: '#10B981' },
      { y: 100, label: 'Max normal', yAxisId: 'left', color: '#F59E0B' },
    ],
  },
  spo2: {
    title: 'Saturation en oxygène',
    lines: [
      { key: 'oxygen_saturation', label: 'SpO2 (%)', color: '#06B6D4', yAxisId: 'left' },
    ],
    references: [
      { y: 95, label: 'Seuil normal', yAxisId: 'left', color: '#F59E0B' },
    ],
  },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        entry.value !== null && (
          <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        )
      ))}
    </div>
  );
};

const VitalSignsTrendChart: React.FC<VitalSignsTrendChartProps> = ({ vitalSigns }) => {
  const [activeTab, setActiveTab] = useState('weight');

  const chartData = useMemo<ChartDataPoint[]>(() => {
    return [...vitalSigns]
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .map((vs) => ({
        date: vs.recorded_at,
        dateLabel: format(new Date(vs.recorded_at), 'dd MMM yy', { locale: fr }),
        weight_kg: vs.weight_kg,
        bmi: vs.bmi,
        systolic_bp: vs.systolic_bp,
        diastolic_bp: vs.diastolic_bp,
        heart_rate: vs.heart_rate,
        temperature_c: vs.temperature_c,
        oxygen_saturation: vs.oxygen_saturation,
      }));
  }, [vitalSigns]);

  if (chartData.length < 2) return null;

  const renderChart = (configKey: keyof typeof CHART_CONFIGS) => {
    const config = CHART_CONFIGS[configKey];
    const hasData = config.lines.some((line) =>
      chartData.some((d) => d[line.key as keyof ChartDataPoint] !== null)
    );

    if (!hasData) {
      return (
        <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
          Pas de données disponibles pour cette métrique
        </div>
      );
    }

    const hasRightAxis = config.lines.some((l) => l.yAxisId === 'right');

    return (
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} margin={{ top: 5, right: hasRightAxis ? 50 : 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          {hasRightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          {config.references.map((ref, idx) => (
            <ReferenceLine
              key={idx}
              y={ref.y}
              yAxisId={ref.yAxisId}
              stroke={ref.color}
              strokeDasharray="4 4"
              label={{
                value: ref.label,
                position: 'right',
                fill: ref.color,
                fontSize: 10,
              }}
            />
          ))}
          {config.lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              yAxisId={line.yAxisId}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Tendances biométriques</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="weight" className="text-xs">Poids/IMC</TabsTrigger>
            <TabsTrigger value="bp" className="text-xs">Tension</TabsTrigger>
            <TabsTrigger value="cardiac" className="text-xs">FC</TabsTrigger>
            <TabsTrigger value="spo2" className="text-xs">SpO2</TabsTrigger>
          </TabsList>

          {Object.keys(CHART_CONFIGS).map((key) => (
            <TabsContent key={key} value={key}>
              {renderChart(key as keyof typeof CHART_CONFIGS)}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VitalSignsTrendChart;
