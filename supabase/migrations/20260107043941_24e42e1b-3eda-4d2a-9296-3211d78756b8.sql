-- ============================================
-- MEDISYNC PRO - SCHEMA COMPLET
-- Migration sécurisée, idempotente, zéro perte
-- ============================================

-- ===== PHASE 1: TABLES RÉFÉRENTIELLES =====

-- Table Sites (cabinets médicaux)
CREATE TABLE IF NOT EXISTS public.sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Table Rooms (salles de consultation)
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    capacity INTEGER,
    equipment JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table Practitioners (praticiens)
CREATE TABLE IF NOT EXISTS public.practitioners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(20) DEFAULT 'Dr',
    specialty VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    avatar_url TEXT,
    color VARCHAR(20) DEFAULT '#3B82F6',
    site_ids UUID[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table Patients
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    used_first_name VARCHAR(100),
    used_last_name VARCHAR(100),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    date_of_birth DATE NOT NULL,
    phone VARCHAR(50),
    phone_secondary VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    birth_place VARCHAR(100),
    insurance_number VARCHAR(100),
    insurance_provider VARCHAR(100),
    referring_doctor VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Table Patient Alerts
CREATE TABLE IF NOT EXISTS public.patient_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('medical', 'administrative', 'vip', 'payment')),
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    is_active BOOLEAN DEFAULT true,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table Appointment Motifs (types de RDV)
CREATE TABLE IF NOT EXISTS public.appointment_motifs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    duration INTEGER NOT NULL DEFAULT 20,
    color VARCHAR(20) DEFAULT '#3B82F6',
    type VARCHAR(50) NOT NULL CHECK (type IN ('consultation', 'followup', 'emergency', 'procedure', 'checkup')),
    requires_room BOOLEAN DEFAULT false,
    is_online_bookable BOOLEAN DEFAULT true,
    instructions TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== PHASE 2: TABLES TRANSACTIONNELLES =====

-- Table Appointments (rendez-vous)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
    room_id UUID REFERENCES public.rooms(id),
    motif_id UUID NOT NULL REFERENCES public.appointment_motifs(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting', 'in-progress', 'completed', 'absent-excused', 'absent-unexcused', 'cancelled')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('consultation', 'followup', 'emergency', 'procedure', 'checkup')),
    is_first_visit BOOLEAN DEFAULT false,
    is_on_waiting_list BOOLEAN DEFAULT false,
    referred_by VARCHAR(255),
    notes TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Table Appointment History (historique des modifications)
CREATE TABLE IF NOT EXISTS public.appointment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL CHECK (action IN ('created', 'modified', 'status_changed', 'cancelled', 'rescheduled')),
    user_id UUID REFERENCES auth.users(id),
    user_name VARCHAR(255),
    details TEXT,
    previous_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table Notes
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    author_id UUID REFERENCES auth.users(id),
    author_name VARCHAR(255),
    is_urgent BOOLEAN DEFAULT false,
    send_to_secretariat BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table Tasks (tâches)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('call', 'document', 'preparation', 'followup', 'administrative', 'other')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in-progress', 'done')),
    assignee_id UUID REFERENCES auth.users(id),
    assignee_name VARCHAR(255),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- ===== PHASE 3: TABLES SECONDAIRES =====

-- Table Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    category VARCHAR(100),
    file_path TEXT,
    file_size INTEGER,
    mime_type VARCHAR(100),
    storage_bucket VARCHAR(100) DEFAULT 'documents',
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table Consultations
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'cancelled')),
    chief_complaint TEXT,
    history_of_present_illness TEXT,
    physical_examination JSONB,
    diagnosis JSONB DEFAULT '[]'::jsonb,
    treatment_plan TEXT,
    prescriptions JSONB DEFAULT '[]'::jsonb,
    follow_up_instructions TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- Table User Preferences (préférences UI)
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, preference_key)
);

-- Table Practitioner Availability (disponibilités)
CREATE TABLE IF NOT EXISTS public.practitioner_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id),
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table Practitioner Exceptions (absences, congés)
CREATE TABLE IF NOT EXISTS public.practitioner_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_all_day BOOLEAN DEFAULT true,
    reason VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- ===== INDEXES PERFORMANCE =====

CREATE INDEX IF NOT EXISTS idx_rooms_site_id ON public.rooms(site_id);
CREATE INDEX IF NOT EXISTS idx_practitioners_user_id ON public.practitioners(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_last_name ON public.patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_patients_email ON public.patients(email);
CREATE INDEX IF NOT EXISTS idx_patient_alerts_patient_id ON public.patient_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_practitioner_id ON public.appointments(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments(start_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date_range ON public.appointments(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointment_history_appointment_id ON public.appointment_history(appointment_id);
CREATE INDEX IF NOT EXISTS idx_notes_patient_id ON public.notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_notes_appointment_id ON public.notes(appointment_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_patient_id ON public.tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_documents_patient_id ON public.documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_practitioner_id ON public.consultations(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_availability_practitioner_id ON public.practitioner_availability(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_exceptions_practitioner_id ON public.practitioner_exceptions(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_practitioner_exceptions_date ON public.practitioner_exceptions(exception_date);

-- ===== TRIGGERS UPDATED_AT =====

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY[
        'sites', 'rooms', 'practitioners', 'patients', 'patient_alerts',
        'appointment_motifs', 'appointments', 'notes', 'tasks', 'documents',
        'consultations', 'user_preferences', 'practitioner_availability'
    ])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_updated_at ON public.%I', tbl);
        EXECUTE format('CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at()', tbl);
    END LOOP;
END $$;

-- ===== ROW LEVEL SECURITY =====

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_motifs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_exceptions ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- Sites: tous les utilisateurs authentifiés peuvent lire, admins peuvent modifier
CREATE POLICY "Sites are viewable by authenticated users" ON public.sites FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sites are editable by admins" ON public.sites FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Rooms: lecture pour tous, modification par admins
CREATE POLICY "Rooms are viewable by authenticated users" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Rooms are editable by admins" ON public.rooms FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Practitioners: lecture pour tous, modification par admins ou le praticien lui-même
CREATE POLICY "Practitioners are viewable by authenticated users" ON public.practitioners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Practitioners can update own profile" ON public.practitioners FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage practitioners" ON public.practitioners FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Patients: tous les utilisateurs authentifiés (personnel médical)
CREATE POLICY "Patients are viewable by authenticated users" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Patients are manageable by authenticated users" ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Patients are updatable by authenticated users" ON public.patients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Patients are deletable by admins" ON public.patients FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Patient Alerts
CREATE POLICY "Patient alerts viewable by authenticated users" ON public.patient_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Patient alerts manageable by authenticated users" ON public.patient_alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Patient alerts updatable by authenticated users" ON public.patient_alerts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Patient alerts deletable by authenticated users" ON public.patient_alerts FOR DELETE TO authenticated USING (true);

-- Appointment Motifs
CREATE POLICY "Motifs are viewable by authenticated users" ON public.appointment_motifs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Motifs are editable by admins" ON public.appointment_motifs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Appointments
CREATE POLICY "Appointments viewable by authenticated users" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Appointments manageable by authenticated users" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Appointments updatable by authenticated users" ON public.appointments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Appointments deletable by admins" ON public.appointments FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Appointment History
CREATE POLICY "History viewable by authenticated users" ON public.appointment_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "History insertable by authenticated users" ON public.appointment_history FOR INSERT TO authenticated WITH CHECK (true);

-- Notes
CREATE POLICY "Notes viewable by authenticated users" ON public.notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Notes manageable by authenticated users" ON public.notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Notes updatable by author or admin" ON public.notes FOR UPDATE TO authenticated USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Notes deletable by author or admin" ON public.notes FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Tasks
CREATE POLICY "Tasks viewable by authenticated users" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Tasks manageable by authenticated users" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Tasks updatable by assignee or admin" ON public.tasks FOR UPDATE TO authenticated USING (assignee_id = auth.uid() OR created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Tasks deletable by creator or admin" ON public.tasks FOR DELETE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Documents
CREATE POLICY "Documents viewable by authenticated users" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Documents manageable by authenticated users" ON public.documents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Documents updatable by uploader or admin" ON public.documents FOR UPDATE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Documents deletable by uploader or admin" ON public.documents FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Consultations
CREATE POLICY "Consultations viewable by authenticated users" ON public.consultations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Consultations manageable by authenticated users" ON public.consultations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Consultations updatable by creator or admin" ON public.consultations FOR UPDATE TO authenticated USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Consultations deletable by admin" ON public.consultations FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- User Preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own preferences" ON public.user_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own preferences" ON public.user_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own preferences" ON public.user_preferences FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Practitioner Availability
CREATE POLICY "Availability viewable by authenticated users" ON public.practitioner_availability FOR SELECT TO authenticated USING (true);
CREATE POLICY "Availability manageable by practitioner or admin" ON public.practitioner_availability FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.practitioners p WHERE p.id = practitioner_id AND p.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.practitioners p WHERE p.id = practitioner_id AND p.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- Practitioner Exceptions
CREATE POLICY "Exceptions viewable by authenticated users" ON public.practitioner_exceptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Exceptions manageable by practitioner or admin" ON public.practitioner_exceptions FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM public.practitioners p WHERE p.id = practitioner_id AND p.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM public.practitioners p WHERE p.id = practitioner_id AND p.user_id = auth.uid()) OR public.has_role(auth.uid(), 'admin'));

-- ===== STORAGE BUCKET DOCUMENTS =====

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Authenticated users can view documents" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documents');
CREATE POLICY "Authenticated users can upload documents" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
CREATE POLICY "Users can update own documents" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own documents" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);