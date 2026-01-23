-- =====================================================
-- MIGRATION: Analytics & Metrics Schema
-- Date: 2026-01-23
-- Version: 1.0
-- =====================================================
-- Creates tables and views for analytics dashboard
-- Pre-aggregated daily metrics for performance
-- =====================================================

-- Daily metrics aggregation table
-- Stores pre-computed metrics per day/practitioner/site
CREATE TABLE IF NOT EXISTS public.daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date and scope
  metric_date DATE NOT NULL,
  practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE CASCADE,
  site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,

  -- Appointment metrics
  total_appointments INTEGER NOT NULL DEFAULT 0,
  completed_appointments INTEGER NOT NULL DEFAULT 0,
  cancelled_appointments INTEGER NOT NULL DEFAULT 0,
  no_show_appointments INTEGER NOT NULL DEFAULT 0,
  scheduled_appointments INTEGER NOT NULL DEFAULT 0,

  -- Patient metrics
  unique_patients_seen INTEGER NOT NULL DEFAULT 0,
  new_patients INTEGER NOT NULL DEFAULT 0,

  -- Document metrics
  documents_created INTEGER NOT NULL DEFAULT 0,
  prescriptions_created INTEGER NOT NULL DEFAULT 0,
  certificates_created INTEGER NOT NULL DEFAULT 0,
  reports_created INTEGER NOT NULL DEFAULT 0,

  -- Financial metrics (in cents to avoid floating point issues)
  total_revenue_cents INTEGER NOT NULL DEFAULT 0,
  paid_revenue_cents INTEGER NOT NULL DEFAULT 0,
  unpaid_revenue_cents INTEGER NOT NULL DEFAULT 0,

  -- Quality metrics
  avg_consultation_duration_minutes INTEGER,
  total_consultation_minutes INTEGER NOT NULL DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Unique constraint: one record per date/practitioner/site combination
  UNIQUE(metric_date, practitioner_id, site_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_metrics_date ON public.daily_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_practitioner ON public.daily_metrics(practitioner_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_metrics_site ON public.daily_metrics(site_id, metric_date DESC);

-- RLS Policies
ALTER TABLE public.daily_metrics ENABLE ROW LEVEL SECURITY;

-- Practitioners can view their own metrics
CREATE POLICY "Practitioners can view own metrics"
  ON public.daily_metrics
  FOR SELECT
  USING (
    practitioner_id IN (
      SELECT id FROM public.practitioners
      WHERE user_id = auth.uid()
    )
    OR
    -- Or if user has admin role
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Only system can insert/update metrics (via functions)
CREATE POLICY "System can manage metrics"
  ON public.daily_metrics
  FOR ALL
  USING (auth.uid() = '00000000-0000-0000-0000-000000000000'::uuid);

-- =====================================================
-- Materialized view for quick dashboard loading
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.monthly_metrics_summary AS
SELECT
  DATE_TRUNC('month', metric_date) AS month,
  practitioner_id,
  site_id,
  SUM(total_appointments) AS total_appointments,
  SUM(completed_appointments) AS completed_appointments,
  SUM(cancelled_appointments) AS cancelled_appointments,
  SUM(unique_patients_seen) AS unique_patients_seen,
  SUM(new_patients) AS new_patients,
  SUM(documents_created) AS documents_created,
  SUM(total_revenue_cents) AS total_revenue_cents,
  SUM(unpaid_revenue_cents) AS unpaid_revenue_cents,
  AVG(avg_consultation_duration_minutes) AS avg_consultation_duration_minutes,
  COUNT(DISTINCT metric_date) AS days_with_data
FROM public.daily_metrics
GROUP BY DATE_TRUNC('month', metric_date), practitioner_id, site_id;

-- Index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_monthly_metrics_summary_unique
  ON public.monthly_metrics_summary(month, practitioner_id, site_id);

-- =====================================================
-- Function to refresh metrics (called by cron or manually)
-- =====================================================

CREATE OR REPLACE FUNCTION public.refresh_daily_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update daily metrics for target date
  INSERT INTO public.daily_metrics (
    metric_date,
    practitioner_id,
    site_id,
    total_appointments,
    completed_appointments,
    cancelled_appointments,
    no_show_appointments,
    scheduled_appointments,
    unique_patients_seen,
    new_patients,
    documents_created,
    prescriptions_created,
    total_revenue_cents,
    paid_revenue_cents,
    unpaid_revenue_cents,
    avg_consultation_duration_minutes,
    total_consultation_minutes,
    updated_at
  )
  SELECT
    target_date AS metric_date,
    a.practitioner_id,
    p.site_ids[1] AS site_id, -- Use first site for now

    -- Appointment counts
    COUNT(*) AS total_appointments,
    COUNT(*) FILTER (WHERE a.status = 'completed') AS completed_appointments,
    COUNT(*) FILTER (WHERE a.status = 'cancelled') AS cancelled_appointments,
    COUNT(*) FILTER (WHERE a.status = 'no-show') AS no_show_appointments,
    COUNT(*) FILTER (WHERE a.status = 'scheduled') AS scheduled_appointments,

    -- Patient metrics
    COUNT(DISTINCT a.patient_id) FILTER (WHERE a.status = 'completed') AS unique_patients_seen,
    COUNT(DISTINCT a.patient_id) FILTER (WHERE a.is_first_visit = TRUE) AS new_patients,

    -- Document counts (approximate - would need JOIN to documents table)
    0 AS documents_created,
    0 AS prescriptions_created,

    -- Financial metrics (approximate - would need JOIN to invoices table)
    0 AS total_revenue_cents,
    0 AS paid_revenue_cents,
    0 AS unpaid_revenue_cents,

    -- Duration metrics
    AVG(a.duration) FILTER (WHERE a.status = 'completed' AND a.duration IS NOT NULL) AS avg_consultation_duration_minutes,
    SUM(a.duration) FILTER (WHERE a.status = 'completed') AS total_consultation_minutes,

    NOW() AS updated_at

  FROM public.appointments a
  LEFT JOIN public.practitioners p ON a.practitioner_id = p.id
  WHERE DATE(a.start_time) = target_date
  GROUP BY a.practitioner_id, p.site_ids[1]

  ON CONFLICT (metric_date, practitioner_id, site_id)
  DO UPDATE SET
    total_appointments = EXCLUDED.total_appointments,
    completed_appointments = EXCLUDED.completed_appointments,
    cancelled_appointments = EXCLUDED.cancelled_appointments,
    no_show_appointments = EXCLUDED.no_show_appointments,
    scheduled_appointments = EXCLUDED.scheduled_appointments,
    unique_patients_seen = EXCLUDED.unique_patients_seen,
    new_patients = EXCLUDED.new_patients,
    avg_consultation_duration_minutes = EXCLUDED.avg_consultation_duration_minutes,
    total_consultation_minutes = EXCLUDED.total_consultation_minutes,
    updated_at = NOW();

  -- Refresh materialized view
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.monthly_metrics_summary;
END;
$$;

-- =====================================================
-- Function to aggregate documents and invoices metrics
-- (To be called after appointments are aggregated)
-- =====================================================

CREATE OR REPLACE FUNCTION public.refresh_documents_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update document counts
  UPDATE public.daily_metrics dm
  SET
    documents_created = COALESCE(doc_counts.total, 0),
    prescriptions_created = COALESCE(doc_counts.prescriptions, 0),
    certificates_created = COALESCE(doc_counts.certificates, 0),
    reports_created = COALESCE(doc_counts.reports, 0),
    updated_at = NOW()
  FROM (
    SELECT
      d.created_by AS practitioner_id,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE d.type = 'prescription') AS prescriptions,
      COUNT(*) FILTER (WHERE d.type = 'certificate') AS certificates,
      COUNT(*) FILTER (WHERE d.type = 'report') AS reports
    FROM public.documents d
    WHERE DATE(d.created_at) = target_date
    GROUP BY d.created_by
  ) AS doc_counts
  WHERE dm.metric_date = target_date
    AND dm.practitioner_id = doc_counts.practitioner_id;

  -- Update financial metrics
  UPDATE public.daily_metrics dm
  SET
    total_revenue_cents = COALESCE(inv_totals.total_cents, 0),
    paid_revenue_cents = COALESCE(inv_totals.paid_cents, 0),
    unpaid_revenue_cents = COALESCE(inv_totals.unpaid_cents, 0),
    updated_at = NOW()
  FROM (
    SELECT
      i.practitioner_id,
      SUM((i.total_amount * 100)::INTEGER) AS total_cents,
      SUM((i.total_amount * 100)::INTEGER) FILTER (WHERE i.payment_status = 'paid') AS paid_cents,
      SUM((i.total_amount * 100)::INTEGER) FILTER (WHERE i.payment_status != 'paid') AS unpaid_cents
    FROM public.invoices i
    WHERE DATE(i.created_at) = target_date
    GROUP BY i.practitioner_id
  ) AS inv_totals
  WHERE dm.metric_date = target_date
    AND dm.practitioner_id = inv_totals.practitioner_id;
END;
$$;

-- =====================================================
-- Trigger to auto-update metrics on appointment changes
-- =====================================================

CREATE OR REPLACE FUNCTION public.trigger_refresh_metrics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh metrics for the date of the appointment
  PERFORM public.refresh_daily_metrics(DATE(COALESCE(NEW.start_time, OLD.start_time)));
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger on appointments table
DROP TRIGGER IF EXISTS auto_refresh_metrics_on_appointment ON public.appointments;
CREATE TRIGGER auto_refresh_metrics_on_appointment
  AFTER INSERT OR UPDATE OR DELETE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_refresh_metrics();

-- =====================================================
-- Initial data population (last 90 days)
-- =====================================================

DO $$
DECLARE
  day_offset INTEGER;
BEGIN
  -- Populate last 90 days of metrics
  FOR day_offset IN 0..89 LOOP
    PERFORM public.refresh_daily_metrics(CURRENT_DATE - day_offset);
  END LOOP;

  -- Refresh documents and financial metrics
  FOR day_offset IN 0..89 LOOP
    PERFORM public.refresh_documents_metrics(CURRENT_DATE - day_offset);
  END LOOP;

  -- Refresh materialized view
  REFRESH MATERIALIZED VIEW public.monthly_metrics_summary;
END $$;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE public.daily_metrics IS 'Pre-aggregated daily metrics for analytics dashboard. Updated automatically via triggers.';
COMMENT ON MATERIALIZED VIEW public.monthly_metrics_summary IS 'Monthly rollup of daily metrics for fast dashboard loading.';
COMMENT ON FUNCTION public.refresh_daily_metrics IS 'Manually refresh metrics for a specific date. Called automatically via trigger.';
COMMENT ON FUNCTION public.refresh_documents_metrics IS 'Update document and invoice metrics for a specific date.';
