-- Migration: Timeline & Historique Patient
-- Creates tables for patient history timeline feature

-- ==================== TABLE: timeline_events ====================
CREATE TABLE IF NOT EXISTS timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Type and category
  event_type VARCHAR(50) NOT NULL,
  event_subtype VARCHAR(50),

  -- Content
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,

  -- References
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  document_ids UUID[] DEFAULT '{}',

  -- Metadata (flexible JSON for type-specific data)
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- ==================== TABLE: patient_reminders ====================
CREATE TABLE IF NOT EXISTS patient_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,

  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),

  -- Notification settings
  notify_days_before INTEGER DEFAULT 7,
  notification_sent BOOLEAN DEFAULT FALSE,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== TABLE: patient_tasks ====================
CREATE TABLE IF NOT EXISTS patient_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(30) DEFAULT 'other' CHECK (type IN ('call', 'document', 'preparation', 'followup', 'administrative', 'other')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(20) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),

  assignee_id UUID REFERENCES auth.users(id),
  assignee_name VARCHAR(255),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,

  due_date DATE,
  completed_at TIMESTAMPTZ,

  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== INDEXES ====================
-- Timeline events indexes
CREATE INDEX IF NOT EXISTS idx_timeline_patient_date ON timeline_events(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON timeline_events(event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_patient_type ON timeline_events(patient_id, event_type);
CREATE INDEX IF NOT EXISTS idx_timeline_not_deleted ON timeline_events(patient_id) WHERE deleted_at IS NULL;

-- Reminders indexes
CREATE INDEX IF NOT EXISTS idx_reminders_patient ON patient_reminders(patient_id);
CREATE INDEX IF NOT EXISTS idx_reminders_due_date ON patient_reminders(due_date) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_reminders_patient_status ON patient_reminders(patient_id, status);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_patient ON patient_tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON patient_tasks(status) WHERE status != 'done';
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON patient_tasks(assignee_id) WHERE status != 'done';

-- ==================== VIEW: patient_attendance_stats ====================
CREATE OR REPLACE VIEW patient_attendance_stats AS
SELECT
  patient_id,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'absent-excused') as absent_excused_count,
  COUNT(*) FILTER (WHERE status = 'absent-unexcused') as no_show_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  COUNT(*) as total_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE status NOT IN ('cancelled', 'scheduled')), 0) * 100,
    1
  ) as attendance_rate
FROM appointments
WHERE start_time < NOW()
GROUP BY patient_id;

-- ==================== TRIGGERS ====================
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to timeline_events
DROP TRIGGER IF EXISTS update_timeline_events_updated_at ON timeline_events;
CREATE TRIGGER update_timeline_events_updated_at
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to patient_tasks
DROP TRIGGER IF EXISTS update_patient_tasks_updated_at ON patient_tasks;
CREATE TRIGGER update_patient_tasks_updated_at
  BEFORE UPDATE ON patient_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==================== RLS POLICIES ====================
-- Enable RLS
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_tasks ENABLE ROW LEVEL SECURITY;

-- Timeline events policies
CREATE POLICY "Users can view timeline events" ON timeline_events
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert timeline events" ON timeline_events
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own timeline events" ON timeline_events
  FOR UPDATE USING (created_by = auth.uid() OR auth.uid() IS NOT NULL);

-- Reminders policies
CREATE POLICY "Users can view reminders" ON patient_reminders
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert reminders" ON patient_reminders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update reminders" ON patient_reminders
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Tasks policies
CREATE POLICY "Users can view tasks" ON patient_tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert tasks" ON patient_tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update tasks" ON patient_tasks
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ==================== FUNCTION: Sync appointments to timeline ====================
CREATE OR REPLACE FUNCTION sync_appointment_to_timeline()
RETURNS TRIGGER AS $$
BEGIN
  -- On new appointment, create timeline event
  IF TG_OP = 'INSERT' THEN
    INSERT INTO timeline_events (
      patient_id,
      event_type,
      title,
      subtitle,
      appointment_id,
      metadata,
      created_by,
      created_at
    )
    SELECT
      NEW.patient_id,
      'appointment',
      COALESCE(m.name, 'Rendez-vous'),
      CONCAT(p.title, ' ', p.first_name, ' ', p.last_name),
      NEW.id,
      jsonb_build_object(
        'status', NEW.status,
        'practitioner_id', NEW.practitioner_id,
        'practitioner_name', CONCAT(p.title, ' ', p.first_name, ' ', p.last_name),
        'motif_id', NEW.motif_id,
        'motif_name', m.name,
        'duration', NEW.duration,
        'start_time', NEW.start_time
      ),
      NEW.created_by,
      NEW.start_time
    FROM practitioners p
    LEFT JOIN appointment_motifs m ON m.id = NEW.motif_id
    WHERE p.id = NEW.practitioner_id;
  END IF;

  -- On update, update the timeline event metadata
  IF TG_OP = 'UPDATE' THEN
    UPDATE timeline_events
    SET
      metadata = metadata || jsonb_build_object('status', NEW.status, 'duration', NEW.duration),
      updated_at = NOW()
    WHERE appointment_id = NEW.id AND event_type = 'appointment';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS sync_appointment_timeline ON appointments;
CREATE TRIGGER sync_appointment_timeline
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION sync_appointment_to_timeline();

-- ==================== FUNCTION: Sync documents to timeline ====================
CREATE OR REPLACE FUNCTION sync_document_to_timeline()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO timeline_events (
      patient_id,
      event_type,
      event_subtype,
      title,
      subtitle,
      document_ids,
      metadata,
      created_by,
      created_at
    )
    VALUES (
      NEW.patient_id,
      CASE
        WHEN NEW.uploaded_by IS NOT NULL THEN 'document_created'
        ELSE 'document_received'
      END,
      NEW.category,
      NEW.name,
      NEW.category,
      ARRAY[NEW.id],
      jsonb_build_object(
        'category', NEW.category,
        'source', CASE WHEN NEW.uploaded_by IS NOT NULL THEN 'internal' ELSE 'external' END,
        'file_type', NEW.mime_type,
        'file_size', NEW.file_size,
        'file_path', NEW.file_path
      ),
      NEW.uploaded_by,
      NEW.created_at
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
DROP TRIGGER IF EXISTS sync_document_timeline ON documents;
CREATE TRIGGER sync_document_timeline
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION sync_document_to_timeline();

-- ==================== GRANT PERMISSIONS ====================
GRANT SELECT, INSERT, UPDATE ON timeline_events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON patient_reminders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON patient_tasks TO authenticated;
GRANT SELECT ON patient_attendance_stats TO authenticated;
