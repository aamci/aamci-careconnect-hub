-- ============================================
-- TÉLÉCONSULTATION - SCHEMA ESSENTIEL SIMPLIFIÉ
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- ===== TABLE 1: TELECONSULTATIONS (PRINCIPALE) =====
CREATE TABLE IF NOT EXISTS public.teleconsultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

    -- Sécurité
    room_token VARCHAR(255) NOT NULL UNIQUE,
    patient_link TEXT NOT NULL,
    practitioner_link TEXT NOT NULL,
    room_expires_at TIMESTAMPTZ NOT NULL,

    -- État
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'waiting', 'ready', 'in_progress', 'paused', 'completed', 'cancelled', 'failed'
    )),

    -- Timing
    scheduled_start TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    duration_minutes INTEGER,

    -- Contexte médical
    consultation_reason TEXT,
    chief_complaint TEXT,
    technical_check_done BOOLEAN DEFAULT false,

    -- Configuration
    settings JSONB DEFAULT '{"video_enabled": true, "audio_enabled": true, "screen_share_enabled": false, "recording_enabled": false, "quality": "auto"}'::jsonb,

    -- Métadonnées
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id)
);

-- Index essentiels
CREATE INDEX IF NOT EXISTS idx_teleconsultations_appointment ON public.teleconsultations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_patient ON public.teleconsultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_practitioner ON public.teleconsultations(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_status ON public.teleconsultations(status);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_room_token ON public.teleconsultations(room_token);

-- ===== TABLE 2: TELECONSULTATION_SESSIONS =====
CREATE TABLE IF NOT EXISTS public.teleconsultation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,
    participant_type VARCHAR(50) NOT NULL CHECK (participant_type IN ('patient', 'practitioner')),
    user_id UUID NOT NULL,
    peer_id VARCHAR(255) NOT NULL,
    connection_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'connecting' CHECK (status IN ('connecting', 'connected', 'reconnecting', 'disconnected', 'failed')),
    connected_at TIMESTAMPTZ,
    disconnected_at TIMESTAMPTZ,
    last_heartbeat TIMESTAMPTZ DEFAULT now(),
    connection_quality VARCHAR(20) CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor', 'critical')),
    network_stats JSONB DEFAULT '{"latency_ms": null, "packet_loss_percent": null, "bandwidth_kbps": null, "jitter_ms": null}'::jsonb,
    devices JSONB DEFAULT '{"video": {"enabled": true, "deviceId": null}, "audio": {"enabled": true, "deviceId": null}}'::jsonb,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teleconsultation_sessions_teleconsultation ON public.teleconsultation_sessions(teleconsultation_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_sessions_user ON public.teleconsultation_sessions(user_id);

-- ===== TABLE 3: TELECONSULTATION_EVENTS =====
CREATE TABLE IF NOT EXISTS public.teleconsultation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.teleconsultation_sessions(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    actor_type VARCHAR(50) CHECK (actor_type IN ('patient', 'practitioner', 'system')),
    actor_id UUID,
    event_data JSONB DEFAULT '{}'::jsonb,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teleconsultation_events_teleconsultation ON public.teleconsultation_events(teleconsultation_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_events_type ON public.teleconsultation_events(event_type);

-- ===== TABLE 4: TELECONSULTATION_DOCUMENTS =====
CREATE TABLE IF NOT EXISTS public.teleconsultation_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    shared_by VARCHAR(50) NOT NULL CHECK (shared_by IN ('patient', 'practitioner')),
    shared_by_id UUID NOT NULL,
    shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    visible_to_patient BOOLEAN DEFAULT true,
    visible_to_practitioner BOOLEAN DEFAULT true,
    share_type VARCHAR(50) NOT NULL CHECK (share_type IN ('pre_consultation', 'during_consultation', 'post_consultation')),
    viewed_by_patient BOOLEAN DEFAULT false,
    viewed_by_practitioner BOOLEAN DEFAULT false,
    viewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teleconsultation_documents_teleconsultation ON public.teleconsultation_documents(teleconsultation_id);

-- ===== TABLE 5: TELECONSULTATION_NOTES =====
CREATE TABLE IF NOT EXISTS public.teleconsultation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'clinical' CHECK (note_type IN ('clinical', 'diagnosis', 'treatment_plan', 'prescription_note', 'follow_up', 'administrative')),
    is_private BOOLEAN DEFAULT false,
    position_in_timeline INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_teleconsultation_notes_teleconsultation ON public.teleconsultation_notes(teleconsultation_id);

-- ===== TABLE 6: TELECONSULTATION_RECORDINGS =====
CREATE TABLE IF NOT EXISTS public.teleconsultation_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,
    patient_consent_given BOOLEAN NOT NULL DEFAULT false,
    patient_consent_date TIMESTAMPTZ,
    practitioner_consent_given BOOLEAN NOT NULL DEFAULT false,
    practitioner_consent_date TIMESTAMPTZ,
    file_path TEXT,
    file_size_bytes BIGINT,
    duration_seconds INTEGER,
    format VARCHAR(20) DEFAULT 'webm',
    codec VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'recording' CHECK (status IN ('recording', 'processing', 'available', 'archived', 'deleted')),
    retention_expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_teleconsultation_recordings_teleconsultation ON public.teleconsultation_recordings(teleconsultation_id);

-- ===== FONCTIONS & TRIGGERS =====

-- Fonction: Timestamp auto-update
CREATE OR REPLACE FUNCTION update_teleconsultation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER trigger_update_teleconsultation_timestamp
    BEFORE UPDATE ON public.teleconsultations
    FOR EACH ROW
    EXECUTE FUNCTION update_teleconsultation_timestamp();

CREATE TRIGGER trigger_update_teleconsultation_sessions_timestamp
    BEFORE UPDATE ON public.teleconsultation_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_teleconsultation_timestamp();

CREATE TRIGGER trigger_update_teleconsultation_notes_timestamp
    BEFORE UPDATE ON public.teleconsultation_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_teleconsultation_timestamp();

-- Fonction: Calculer durée effective
CREATE OR REPLACE FUNCTION calculate_teleconsultation_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.actual_start IS NOT NULL AND NEW.actual_end IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.actual_end - NEW.actual_start)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_duration
    BEFORE UPDATE ON public.teleconsultations
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
    EXECUTE FUNCTION calculate_teleconsultation_duration();

-- ===== ROW LEVEL SECURITY (RLS) =====

ALTER TABLE public.teleconsultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_recordings ENABLE ROW LEVEL SECURITY;

-- Politique: Les praticiens voient leurs téléconsultations
CREATE POLICY teleconsultations_practitioner_select
    ON public.teleconsultations FOR SELECT
    USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));

CREATE POLICY teleconsultations_practitioner_update
    ON public.teleconsultations FOR UPDATE
    USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));

CREATE POLICY teleconsultations_practitioner_insert
    ON public.teleconsultations FOR INSERT
    WITH CHECK (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));

-- Politique: Sessions accessibles par les participants
CREATE POLICY teleconsultation_sessions_participant_access
    ON public.teleconsultation_sessions FOR ALL
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        )
        OR user_id = auth.uid()
    );

-- Politique: Événements visibles par les participants
CREATE POLICY teleconsultation_events_participant_access
    ON public.teleconsultation_events FOR SELECT
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        )
    );

-- Politique: Documents visibles par les participants
CREATE POLICY teleconsultation_documents_access
    ON public.teleconsultation_documents FOR SELECT
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        )
    );

-- Politique: Notes visibles uniquement par le praticien
CREATE POLICY teleconsultation_notes_practitioner_access
    ON public.teleconsultation_notes FOR ALL
    USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));

-- Politique: Enregistrements accessibles par le praticien
CREATE POLICY teleconsultation_recordings_access
    ON public.teleconsultation_recordings FOR SELECT
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        )
        AND status != 'deleted'
    );

-- ===== COMMENTAIRES =====
COMMENT ON TABLE public.teleconsultations IS 'Téléconsultations vidéo - Session visio médicale sécurisée';
COMMENT ON TABLE public.teleconsultation_sessions IS 'Sessions WebRTC avec support reconnexions';
COMMENT ON TABLE public.teleconsultation_events IS 'Journal événements temps réel';
COMMENT ON TABLE public.teleconsultation_documents IS 'Documents partagés pendant la visio';
COMMENT ON TABLE public.teleconsultation_notes IS 'Notes médicales temps réel';
COMMENT ON TABLE public.teleconsultation_recordings IS 'Enregistrements vidéo (consentement obligatoire)';

-- ===== VÉRIFICATION =====
-- Afficher toutes les tables créées
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'teleconsultation%' ORDER BY tablename;
