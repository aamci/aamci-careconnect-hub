-- =====================================================
-- MIGRATION: User Calendar Display Preferences
-- Date: 2026-01-18
-- Version: 1.0
-- =====================================================
-- Persists user agenda display preferences (Doctolib-level)
-- Single Source of Truth: this table, localStorage = cache only
-- =====================================================

-- ENUM for zoom levels
DO $$ BEGIN
  CREATE TYPE calendar_zoom_level AS ENUM ('MINIMUM', 'STANDARD', 'MAXIMUM');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM for sidebar grouping
DO $$ BEGIN
  CREATE TYPE sidebar_grouping_type AS ENUM ('alphabetical', 'center', 'location', 'specialty');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ENUM for stats mode
DO $$ BEGIN
  CREATE TYPE stats_mode_type AS ENUM ('hidden', 'perDay', 'perHalfDay');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Main preferences table
CREATE TABLE IF NOT EXISTS public.user_calendar_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Scope
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  calendar_scope VARCHAR(50) NOT NULL DEFAULT 'global', -- 'global' or 'calendar:{uuid}'

  -- Display Time Range (minutes from midnight)
  time_range_start_minute INTEGER NOT NULL DEFAULT 420,  -- 07:00
  time_range_end_minute INTEGER NOT NULL DEFAULT 1140,   -- 19:00

  -- Zoom / Density
  zoom_level calendar_zoom_level NOT NULL DEFAULT 'STANDARD',

  -- Hover precision (minutes)
  hover_granularity_minutes INTEGER NOT NULL DEFAULT 15,

  -- Week view settings
  week_visible_days INTEGER NOT NULL DEFAULT 127, -- 7-bit bitmask (Mon-Sun = 1111111)
  show_only_upcoming_days BOOLEAN NOT NULL DEFAULT false,
  show_side_by_side_agendas BOOLEAN NOT NULL DEFAULT false,

  -- School holidays
  school_holidays_region VARCHAR(10) DEFAULT 'A',
  show_holidays_mini_calendar BOOLEAN NOT NULL DEFAULT true,
  show_holidays_main_calendar BOOLEAN NOT NULL DEFAULT false,

  -- Display options
  show_consultation_reasons BOOLEAN NOT NULL DEFAULT true,
  sidebar_grouping_primary sidebar_grouping_type NOT NULL DEFAULT 'alphabetical',
  sidebar_grouping_secondary sidebar_grouping_type DEFAULT NULL,

  -- Statistics
  stats_mode stats_mode_type NOT NULL DEFAULT 'hidden',

  -- Times
  afternoon_start_minute INTEGER NOT NULL DEFAULT 840, -- 14:00

  -- Notifications
  notifications_online_bookings BOOLEAN NOT NULL DEFAULT true,
  waiting_room_sound BOOLEAN NOT NULL DEFAULT true,
  enable_patient_name_blur BOOLEAN NOT NULL DEFAULT false,

  -- Concurrency control
  version INTEGER NOT NULL DEFAULT 1,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT ucp_user_scope_unique UNIQUE(user_id, calendar_scope),
  CONSTRAINT ucp_time_range_valid CHECK (
    time_range_start_minute >= 0
    AND time_range_end_minute <= 1439
    AND time_range_start_minute < time_range_end_minute
    AND (time_range_end_minute - time_range_start_minute) >= 240 -- min 4h
  ),
  CONSTRAINT ucp_hover_granularity_valid CHECK (
    hover_granularity_minutes IN (5, 10, 15, 20, 30, 45)
  ),
  CONSTRAINT ucp_week_days_valid CHECK (
    week_visible_days >= 1 AND week_visible_days <= 127
  ),
  CONSTRAINT ucp_afternoon_valid CHECK (
    afternoon_start_minute >= 600 AND afternoon_start_minute <= 900 -- 10:00-15:00
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ucp_user_id ON public.user_calendar_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_ucp_user_scope ON public.user_calendar_preferences(user_id, calendar_scope);

-- RLS
ALTER TABLE public.user_calendar_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only access their own preferences
DROP POLICY IF EXISTS "ucp_select_own" ON public.user_calendar_preferences;
CREATE POLICY "ucp_select_own"
  ON public.user_calendar_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "ucp_insert_own" ON public.user_calendar_preferences;
CREATE POLICY "ucp_insert_own"
  ON public.user_calendar_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ucp_update_own" ON public.user_calendar_preferences;
CREATE POLICY "ucp_update_own"
  ON public.user_calendar_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "ucp_delete_own" ON public.user_calendar_preferences;
CREATE POLICY "ucp_delete_own"
  ON public.user_calendar_preferences FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_ucp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ucp_updated_at ON public.user_calendar_preferences;
CREATE TRIGGER trigger_ucp_updated_at
  BEFORE UPDATE ON public.user_calendar_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_ucp_updated_at();

-- Audit log for preference changes
CREATE TABLE IF NOT EXISTS public.user_calendar_preferences_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preference_id UUID NOT NULL REFERENCES public.user_calendar_preferences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
  field_changed VARCHAR(100),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ucp_audit_pref ON public.user_calendar_preferences_audit(preference_id);
CREATE INDEX IF NOT EXISTS idx_ucp_audit_user ON public.user_calendar_preferences_audit(user_id);

-- RLS for audit (read-only for users, write via trigger)
ALTER TABLE public.user_calendar_preferences_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ucp_audit_select_own" ON public.user_calendar_preferences_audit;
CREATE POLICY "ucp_audit_select_own"
  ON public.user_calendar_preferences_audit FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to log preference changes
CREATE OR REPLACE FUNCTION log_ucp_changes()
RETURNS TRIGGER AS $$
DECLARE
  field_name TEXT;
  old_val JSONB;
  new_val JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.user_calendar_preferences_audit
      (preference_id, user_id, action, new_value)
    VALUES
      (NEW.id, NEW.user_id, 'CREATE', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log each changed field
    FOREACH field_name IN ARRAY ARRAY[
      'time_range_start_minute', 'time_range_end_minute', 'zoom_level',
      'hover_granularity_minutes', 'week_visible_days', 'show_only_upcoming_days',
      'show_side_by_side_agendas', 'school_holidays_region', 'show_holidays_mini_calendar',
      'show_holidays_main_calendar', 'show_consultation_reasons', 'sidebar_grouping_primary',
      'sidebar_grouping_secondary', 'stats_mode', 'afternoon_start_minute',
      'notifications_online_bookings', 'waiting_room_sound', 'enable_patient_name_blur'
    ] LOOP
      EXECUTE format('SELECT to_jsonb($1.%I), to_jsonb($2.%I)', field_name, field_name)
        INTO old_val, new_val
        USING OLD, NEW;

      IF old_val IS DISTINCT FROM new_val THEN
        INSERT INTO public.user_calendar_preferences_audit
          (preference_id, user_id, action, field_changed, old_value, new_value)
        VALUES
          (NEW.id, NEW.user_id, 'UPDATE', field_name, old_val, new_val);
      END IF;
    END LOOP;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.user_calendar_preferences_audit
      (preference_id, user_id, action, old_value)
    VALUES
      (OLD.id, OLD.user_id, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_ucp_audit ON public.user_calendar_preferences;
CREATE TRIGGER trigger_ucp_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.user_calendar_preferences
  FOR EACH ROW
  EXECUTE FUNCTION log_ucp_changes();

-- Helper function to get or create default preferences
CREATE OR REPLACE FUNCTION get_or_create_calendar_preferences(
  p_user_id UUID,
  p_scope VARCHAR DEFAULT 'global'
)
RETURNS public.user_calendar_preferences AS $$
DECLARE
  result public.user_calendar_preferences;
BEGIN
  SELECT * INTO result
  FROM public.user_calendar_preferences
  WHERE user_id = p_user_id AND calendar_scope = p_scope;

  IF NOT FOUND THEN
    INSERT INTO public.user_calendar_preferences (user_id, calendar_scope)
    VALUES (p_user_id, p_scope)
    RETURNING * INTO result;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'User Calendar Preferences migration complete!';
  RAISE NOTICE 'Tables: user_calendar_preferences, user_calendar_preferences_audit';
  RAISE NOTICE 'Functions: get_or_create_calendar_preferences, log_ucp_changes';
END $$;
