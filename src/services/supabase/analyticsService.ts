/**
 * Analytics Service
 * Handles metrics aggregation, KPIs, and dashboard data
 */

import { supabase } from '@/integrations/supabase/client';
import { executeQuery, ServiceResult } from './baseService';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns';

// ==================== TYPES ====================

export interface PeriodFilter {
  start: Date;
  end: Date;
}

export interface AnalyticsFilters {
  period: PeriodFilter;
  practitionerId?: string;
  siteId?: string;
  appointmentType?: string;
  canal?: 'presentiel' | 'visio' | 'all';
}

export interface KPIMetrics {
  appointments: {
    total: number;
    change: number; // % vs période précédente
    byStatus: Record<string, number>;
  };
  documents: {
    total: number;
    change: number;
    byType: Record<string, number>;
  };
  patients: {
    total: number;
    change: number;
    newPatients: number;
    activePatients: number;
  };
  revenue: {
    total: number;
    change: number;
    avgPerDay: number;
    unpaid: number;
  };
  quality: {
    attendanceRate: number;
    change: number;
    avgDuration: number;
    satisfactionScore?: number;
  };
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface DistributionData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

// ==================== HELPER FUNCTIONS ====================

function getPreviousPeriod(current: PeriodFilter): PeriodFilter {
  const duration = current.end.getTime() - current.start.getTime();
  return {
    start: new Date(current.start.getTime() - duration),
    end: new Date(current.start.getTime() - 1)
  };
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// ==================== APPOINTMENTS ANALYTICS ====================

export async function getAppointmentsMetrics(
  filters: AnalyticsFilters
): Promise<ServiceResult<KPIMetrics['appointments']>> {
  return executeQuery(
    async () => {
      // Current period
      let query = supabase
        .from('appointments')
        .select('id, status, type, start_time', { count: 'exact' })
        .gte('start_time', filters.period.start.toISOString())
        .lte('start_time', filters.period.end.toISOString());

      if (filters.practitionerId && filters.practitionerId !== 'all') {
        query = query.eq('practitioner_id', filters.practitionerId);
      }

      const { data: currentData, error: currentError, count: currentCount } = await query;
      if (currentError) throw currentError;

      // Previous period for comparison
      const prevPeriod = getPreviousPeriod(filters.period);
      const { count: prevCount, error: prevError } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .gte('start_time', prevPeriod.start.toISOString())
        .lte('start_time', prevPeriod.end.toISOString());

      if (prevError) throw prevError;

      // Calculate by status
      const byStatus: Record<string, number> = {};
      currentData?.forEach(apt => {
        byStatus[apt.status] = (byStatus[apt.status] || 0) + 1;
      });

      return {
        data: {
          total: currentCount || 0,
          change: calculateChange(currentCount || 0, prevCount || 0),
          byStatus
        },
        error: null
      };
    },
    () => ({
      total: 142,
      change: 12.5,
      byStatus: {
        completed: 120,
        scheduled: 18,
        cancelled: 4
      }
    })
  );
}

// ==================== DOCUMENTS ANALYTICS ====================

export async function getDocumentsMetrics(
  filters: AnalyticsFilters
): Promise<ServiceResult<KPIMetrics['documents']>> {
  return executeQuery(
    async () => {
      // Current period
      const { data: currentData, error: currentError, count: currentCount } = await supabase
        .from('documents')
        .select('id, type, created_at', { count: 'exact' })
        .gte('created_at', filters.period.start.toISOString())
        .lte('created_at', filters.period.end.toISOString());

      if (currentError) throw currentError;

      // Previous period
      const prevPeriod = getPreviousPeriod(filters.period);
      const { count: prevCount, error: prevError } = await supabase
        .from('documents')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', prevPeriod.start.toISOString())
        .lte('created_at', prevPeriod.end.toISOString());

      if (prevError) throw prevError;

      // Calculate by type
      const byType: Record<string, number> = {};
      currentData?.forEach(doc => {
        byType[doc.type] = (byType[doc.type] || 0) + 1;
      });

      return {
        data: {
          total: currentCount || 0,
          change: calculateChange(currentCount || 0, prevCount || 0),
          byType
        },
        error: null
      };
    },
    () => ({
      total: 89,
      change: 8.3,
      byType: {
        prescription: 45,
        report: 28,
        certificate: 16
      }
    })
  );
}

// ==================== PATIENTS ANALYTICS ====================

export async function getPatientsMetrics(
  filters: AnalyticsFilters
): Promise<ServiceResult<KPIMetrics['patients']>> {
  return executeQuery(
    async () => {
      // Patients seen in current period (via appointments)
      const { data: currentAppointments, error: currentError } = await supabase
        .from('appointments')
        .select('patient_id, status')
        .gte('start_time', filters.period.start.toISOString())
        .lte('start_time', filters.period.end.toISOString())
        .eq('status', 'completed');

      if (currentError) throw currentError;

      const uniquePatients = new Set(currentAppointments?.map(a => a.patient_id) || []);
      const totalCurrent = uniquePatients.size;

      // Previous period
      const prevPeriod = getPreviousPeriod(filters.period);
      const { data: prevAppointments, error: prevError } = await supabase
        .from('appointments')
        .select('patient_id')
        .gte('start_time', prevPeriod.start.toISOString())
        .lte('start_time', prevPeriod.end.toISOString())
        .eq('status', 'completed');

      if (prevError) throw prevError;

      const prevUniquePatients = new Set(prevAppointments?.map(a => a.patient_id) || []);
      const totalPrev = prevUniquePatients.size;

      // New patients created in period
      const { count: newPatientsCount, error: newError } = await supabase
        .from('patients')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', filters.period.start.toISOString())
        .lte('created_at', filters.period.end.toISOString());

      if (newError) throw newError;

      return {
        data: {
          total: totalCurrent,
          change: calculateChange(totalCurrent, totalPrev),
          newPatients: newPatientsCount || 0,
          activePatients: totalCurrent
        },
        error: null
      };
    },
    () => ({
      total: 67,
      change: 15.2,
      newPatients: 23,
      activePatients: 67
    })
  );
}

// ==================== REVENUE ANALYTICS ====================

export async function getRevenueMetrics(
  filters: AnalyticsFilters
): Promise<ServiceResult<KPIMetrics['revenue']>> {
  return executeQuery(
    async () => {
      // Current period revenue
      const { data: currentInvoices, error: currentError } = await supabase
        .from('invoices')
        .select('total_amount, payment_status, created_at')
        .gte('created_at', filters.period.start.toISOString())
        .lte('created_at', filters.period.end.toISOString());

      if (currentError) throw currentError;

      const totalCurrent = currentInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
      const unpaid = currentInvoices?.filter(inv => inv.payment_status !== 'paid')
        .reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      // Previous period
      const prevPeriod = getPreviousPeriod(filters.period);
      const { data: prevInvoices, error: prevError } = await supabase
        .from('invoices')
        .select('total_amount')
        .gte('created_at', prevPeriod.start.toISOString())
        .lte('created_at', prevPeriod.end.toISOString());

      if (prevError) throw prevError;

      const totalPrev = prevInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;

      // Calculate avg per day
      const days = Math.ceil((filters.period.end.getTime() - filters.period.start.getTime()) / (1000 * 60 * 60 * 24));
      const avgPerDay = days > 0 ? totalCurrent / days : 0;

      return {
        data: {
          total: totalCurrent,
          change: calculateChange(totalCurrent, totalPrev),
          avgPerDay,
          unpaid
        },
        error: null
      };
    },
    () => ({
      total: 12450,
      change: 18.7,
      avgPerDay: 498,
      unpaid: 850
    })
  );
}

// ==================== QUALITY ANALYTICS ====================

export async function getQualityMetrics(
  filters: AnalyticsFilters
): Promise<ServiceResult<KPIMetrics['quality']>> {
  return executeQuery(
    async () => {
      // Current period appointments
      const { data: currentData, error: currentError } = await supabase
        .from('appointments')
        .select('status, duration')
        .gte('start_time', filters.period.start.toISOString())
        .lte('start_time', filters.period.end.toISOString());

      if (currentError) throw currentError;

      const total = currentData?.length || 0;
      const completed = currentData?.filter(a => a.status === 'completed').length || 0;
      const attendanceRateCurrent = total > 0 ? (completed / total) * 100 : 0;

      const avgDuration = completed > 0
        ? currentData!.filter(a => a.status === 'completed')
            .reduce((sum, a) => sum + (a.duration || 0), 0) / completed
        : 0;

      // Previous period
      const prevPeriod = getPreviousPeriod(filters.period);
      const { data: prevData, error: prevError } = await supabase
        .from('appointments')
        .select('status')
        .gte('start_time', prevPeriod.start.toISOString())
        .lte('start_time', prevPeriod.end.toISOString());

      if (prevError) throw prevError;

      const totalPrev = prevData?.length || 0;
      const completedPrev = prevData?.filter(a => a.status === 'completed').length || 0;
      const attendanceRatePrev = totalPrev > 0 ? (completedPrev / totalPrev) * 100 : 0;

      return {
        data: {
          attendanceRate: attendanceRateCurrent,
          change: attendanceRateCurrent - attendanceRatePrev,
          avgDuration
        },
        error: null
      };
    },
    () => ({
      attendanceRate: 94.2,
      change: 2.1,
      avgDuration: 28
    })
  );
}

// ==================== ALL KPIs ====================

export async function getAllKPIs(filters: AnalyticsFilters): Promise<ServiceResult<KPIMetrics>> {
  return executeQuery(
    async () => {
      const [appointments, documents, patients, revenue, quality] = await Promise.all([
        getAppointmentsMetrics(filters),
        getDocumentsMetrics(filters),
        getPatientsMetrics(filters),
        getRevenueMetrics(filters),
        getQualityMetrics(filters)
      ]);

      if (appointments.error || documents.error || patients.error || revenue.error || quality.error) {
        throw new Error('Failed to fetch one or more metrics');
      }

      return {
        data: {
          appointments: appointments.data!,
          documents: documents.data!,
          patients: patients.data!,
          revenue: revenue.data!,
          quality: quality.data!
        },
        error: null
      };
    },
    () => ({
      appointments: {
        total: 142,
        change: 12.5,
        byStatus: { completed: 120, scheduled: 18, cancelled: 4 }
      },
      documents: {
        total: 89,
        change: 8.3,
        byType: { prescription: 45, report: 28, certificate: 16 }
      },
      patients: {
        total: 67,
        change: 15.2,
        newPatients: 23,
        activePatients: 67
      },
      revenue: {
        total: 12450,
        change: 18.7,
        avgPerDay: 498,
        unpaid: 850
      },
      quality: {
        attendanceRate: 94.2,
        change: 2.1,
        avgDuration: 28
      }
    })
  );
}

// ==================== TIME SERIES DATA ====================

export async function getAppointmentsTimeSeries(
  filters: AnalyticsFilters,
  granularity: 'day' | 'week' | 'month' = 'day'
): Promise<ServiceResult<TimeSeriesData[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('start_time, status')
        .gte('start_time', filters.period.start.toISOString())
        .lte('start_time', filters.period.end.toISOString());

      if (error) throw error;

      // Group by date
      const grouped = new Map<string, number>();
      data?.forEach(apt => {
        const date = format(new Date(apt.start_time), 'yyyy-MM-dd');
        grouped.set(date, (grouped.get(date) || 0) + 1);
      });

      const result: TimeSeriesData[] = Array.from(grouped.entries())
        .map(([date, value]) => ({ date, value, label: format(new Date(date), 'dd MMM') }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return { data: result, error: null };
    },
    () => {
      // Mock data for 30 days
      const result: TimeSeriesData[] = [];
      for (let i = 0; i < 30; i++) {
        const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
        result.push({
          date,
          value: Math.floor(Math.random() * 10) + 2,
          label: format(new Date(date), 'dd MMM')
        });
      }
      return result;
    }
  );
}

// ==================== DISTRIBUTION DATA ====================

export async function getAppointmentsDistribution(
  filters: AnalyticsFilters,
  groupBy: 'type' | 'status' | 'practitioner' = 'type'
): Promise<ServiceResult<DistributionData[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('type, status, practitioner_id')
        .gte('start_time', filters.period.start.toISOString())
        .lte('start_time', filters.period.end.toISOString());

      if (error) throw error;

      const total = data?.length || 0;
      const grouped = new Map<string, number>();

      data?.forEach(apt => {
        const key = apt[groupBy === 'practitioner' ? 'practitioner_id' : groupBy] || 'unknown';
        grouped.set(key, (grouped.get(key) || 0) + 1);
      });

      const result: DistributionData[] = Array.from(grouped.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: total > 0 ? (value / total) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value);

      return { data: result, error: null };
    },
    () => [
      { name: 'Consultation', value: 85, percentage: 59.9 },
      { name: 'Suivi', value: 42, percentage: 29.6 },
      { name: 'Urgence', value: 15, percentage: 10.5 }
    ]
  );
}

// ==================== EXPORT FUNCTIONS ====================

export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => row[h]).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
}

export function exportToPDF(data: any[], filename: string): void {
  // Build a printable HTML table and trigger browser print dialog
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const rows = data.map(row => headers.map(h => String(row[h] ?? '')));

  const html = `
    <!DOCTYPE html>
    <html><head><title>${filename}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1 { font-size: 18px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f4f4f4; font-weight: bold; }
      @media print { body { padding: 0; } }
    </style></head>
    <body>
      <h1>${filename} — ${format(new Date(), 'dd/MM/yyyy')}</h1>
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </body></html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}
