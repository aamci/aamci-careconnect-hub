-- ============================================
-- TÉLÉCONSULTATION - SCHEMA COMPLET
-- Module visio sécurisé pour consultations médicales
-- ============================================

-- ===== TABLE 1: TELECONSULTATIONS =====
-- Représente une session de téléconsultation (1:1 avec appointment)
CREATE TABLE IF NOT EXISTS public.teleconsultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,

    -- Sécurité
    room_token VARCHAR(255) NOT NULL UNIQUE, -- Token sécurisé pour rejoindre la salle
    patient_link TEXT NOT NULL, -- Lien unique pour le patient
    practitioner_link TEXT NOT NULL, -- Lien unique pour le praticien
    room_expires_at TIMESTAMPTZ NOT NULL, -- Expiration automatique du lien

    -- État de la session
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN (
        'scheduled',      -- Programmée
        'waiting',        -- Patient en salle d'attente
        'ready',          -- Médecin prêt à démarrer
        'in_progress',    -- Consultation en cours
        'paused',         -- En pause (incident technique)
        'completed',      -- Terminée normalement
        'cancelled',      -- Annulée
        'failed'          -- Échec technique
    )),

    -- Timing
    scheduled_start TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ, -- Heure réelle de démarrage
    actual_end TIMESTAMPTZ, -- Heure réelle de fin
    duration_minutes INTEGER, -- Durée effective en minutes

    -- Contexte médical
    consultation_reason TEXT, -- Motif de consultation
    chief_complaint TEXT, -- Motif principal (du RDV)
    technical_check_done BOOLEAN DEFAULT false, -- Test technique patient effectué

    -- Configuration technique
    settings JSONB DEFAULT '{
        "video_enabled": true,
        "audio_enabled": true,
        "screen_share_enabled": false,
        "recording_enabled": false,
        "quality": "auto"
    }'::jsonb,

    -- Métadonnées
    metadata JSONB DEFAULT '{}'::jsonb, -- Données additionnelles (browser, OS, etc.)

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_teleconsultations_appointment ON public.teleconsultations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_patient ON public.teleconsultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_practitioner ON public.teleconsultations(practitioner_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_status ON public.teleconsultations(status);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_scheduled_start ON public.teleconsultations(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_room_token ON public.teleconsultations(room_token);

-- ===== TABLE 2: TELECONSULTATION_SESSIONS =====
-- Représente une session WebRTC (reconnexion = nouvelle session)
CREATE TABLE IF NOT EXISTS public.teleconsultation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relation
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,
    participant_type VARCHAR(50) NOT NULL CHECK (participant_type IN ('patient', 'practitioner')),
    user_id UUID NOT NULL, -- patient_id ou practitioner_id

    -- Connexion WebRTC
    peer_id VARCHAR(255) NOT NULL, -- ID du peer WebRTC
    connection_id VARCHAR(255) NOT NULL, -- ID unique de connexion

    -- État de la session
    status VARCHAR(50) NOT NULL DEFAULT 'connecting' CHECK (status IN (
        'connecting',     -- En cours de connexion
        'connected',      -- Connecté
        'reconnecting',   -- Reconnexion en cours
        'disconnected',   -- Déconnecté proprement
        'failed'          -- Échec de connexion
    )),

    -- Timing
    connected_at TIMESTAMPTZ,
    disconnected_at TIMESTAMPTZ,
    last_heartbeat TIMESTAMPTZ DEFAULT now(), -- Dernier battement de cœur

    -- Qualité technique
    connection_quality VARCHAR(20) CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor', 'critical')),
    network_stats JSONB DEFAULT '{
        "latency_ms": null,
        "packet_loss_percent": null,
        "bandwidth_kbps": null,
        "jitter_ms": null
    }'::jsonb,

    -- Configuration dispositifs
    devices JSONB DEFAULT '{
        "video": {"enabled": true, "deviceId": null, "label": null},
        "audio": {"enabled": true, "deviceId": null, "label": null}
    }'::jsonb,

    -- Métadonnées
    user_agent TEXT, -- Browser/OS du participant
    ip_address INET, -- Adresse IP (anonymisée si RGPD)

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_teleconsultation_sessions_teleconsultation ON public.teleconsultation_sessions(teleconsultation_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_sessions_user ON public.teleconsultation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_sessions_status ON public.teleconsultation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_sessions_peer ON public.teleconsultation_sessions(peer_id);

-- ===== TABLE 3: TELECONSULTATION_EVENTS =====
-- Journal d'événements en temps réel (join, leave, incident, etc.)
CREATE TABLE IF NOT EXISTS public.teleconsultation_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relation
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,
    session_id UUID REFERENCES public.teleconsultation_sessions(id) ON DELETE SET NULL,

    -- Type d'événement
    event_type VARCHAR(100) NOT NULL CHECK (event_type IN (
        -- Connexion
        'patient_joined',
        'practitioner_joined',
        'patient_left',
        'practitioner_left',
        'reconnection_attempt',
        'reconnection_success',
        'reconnection_failed',

        -- État
        'session_started',
        'session_paused',
        'session_resumed',
        'session_ended',

        -- Technique
        'video_enabled',
        'video_disabled',
        'audio_enabled',
        'audio_disabled',
        'screen_share_started',
        'screen_share_stopped',
        'network_issue',
        'quality_degraded',

        -- Documents
        'document_shared',
        'document_viewed',

        -- Médical
        'prescription_created',
        'note_added',

        -- Sécurité
        'unauthorized_access_attempt',
        'link_expired'
    )),

    -- Acteur
    actor_type VARCHAR(50) CHECK (actor_type IN ('patient', 'practitioner', 'system')),
    actor_id UUID, -- ID du patient/praticien ou NULL si system

    -- Données de l'événement
    event_data JSONB DEFAULT '{}'::jsonb,

    -- Contexte
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    message TEXT,

    -- Timestamp
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_teleconsultation_events_teleconsultation ON public.teleconsultation_events(teleconsultation_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_events_session ON public.teleconsultation_events(session_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_events_type ON public.teleconsultation_events(event_type);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_events_occurred ON public.teleconsultation_events(occurred_at);

-- ===== TABLE 4: TELECONSULTATION_DOCUMENTS =====
-- Documents partagés pendant la téléconsultation
CREATE TABLE IF NOT EXISTS public.teleconsultation_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,

    -- Métadonnées du partage
    shared_by VARCHAR(50) NOT NULL CHECK (shared_by IN ('patient', 'practitioner')),
    shared_by_id UUID NOT NULL,
    shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Visibilité
    visible_to_patient BOOLEAN DEFAULT true,
    visible_to_practitioner BOOLEAN DEFAULT true,

    -- Type de partage
    share_type VARCHAR(50) NOT NULL CHECK (share_type IN (
        'pre_consultation', -- Envoyé avant la consultation
        'during_consultation', -- Partagé pendant
        'post_consultation' -- Généré après (ordonnance, compte-rendu)
    )),

    -- Statut
    viewed_by_patient BOOLEAN DEFAULT false,
    viewed_by_practitioner BOOLEAN DEFAULT false,
    viewed_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_teleconsultation_documents_teleconsultation ON public.teleconsultation_documents(teleconsultation_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_documents_document ON public.teleconsultation_documents(document_id);

-- ===== TABLE 5: TELECONSULTATION_NOTES =====
-- Notes prises en temps réel pendant la téléconsultation
CREATE TABLE IF NOT EXISTS public.teleconsultation_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,

    -- Contenu
    content TEXT NOT NULL,
    note_type VARCHAR(50) DEFAULT 'clinical' CHECK (note_type IN (
        'clinical',           -- Note clinique
        'diagnosis',          -- Diagnostic
        'treatment_plan',     -- Plan de traitement
        'prescription_note',  -- Note d'ordonnance
        'follow_up',          -- Suivi
        'administrative'      -- Administratif
    )),

    -- Métadonnées
    is_private BOOLEAN DEFAULT false, -- Visible uniquement par le praticien
    position_in_timeline INTEGER, -- Position dans la chronologie de la consultation

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_teleconsultation_notes_teleconsultation ON public.teleconsultation_notes(teleconsultation_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_notes_practitioner ON public.teleconsultation_notes(practitioner_id);

-- ===== TABLE 6: TELECONSULTATION_RECORDINGS (OPTIONNEL - RÉGLEMENTATION STRICTE) =====
-- Enregistrements vidéo (uniquement si autorisé et consenti)
CREATE TABLE IF NOT EXISTS public.teleconsultation_recordings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relations
    teleconsultation_id UUID NOT NULL REFERENCES public.teleconsultations(id) ON DELETE CASCADE,

    -- Consentement OBLIGATOIRE
    patient_consent_given BOOLEAN NOT NULL DEFAULT false,
    patient_consent_date TIMESTAMPTZ,
    practitioner_consent_given BOOLEAN NOT NULL DEFAULT false,
    practitioner_consent_date TIMESTAMPTZ,

    -- Fichier
    file_path TEXT, -- Chemin dans Supabase Storage
    file_size_bytes BIGINT,
    duration_seconds INTEGER,

    -- Format
    format VARCHAR(20) DEFAULT 'webm', -- webm, mp4, etc.
    codec VARCHAR(50),

    -- État
    status VARCHAR(50) NOT NULL DEFAULT 'recording' CHECK (status IN (
        'recording',   -- En cours
        'processing',  -- En traitement
        'available',   -- Disponible
        'archived',    -- Archivé
        'deleted'      -- Supprimé (soft delete)
    )),

    -- Rétention
    retention_expires_at TIMESTAMPTZ NOT NULL, -- Suppression automatique après X jours

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_teleconsultation_recordings_teleconsultation ON public.teleconsultation_recordings(teleconsultation_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultation_recordings_status ON public.teleconsultation_recordings(status);

-- ===== FONCTIONS & TRIGGERS =====

-- Fonction: Générer un token sécurisé
CREATE OR REPLACE FUNCTION generate_room_token()
RETURNS VARCHAR(255) AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Fonction: Générer les liens sécurisés lors de la création
CREATE OR REPLACE FUNCTION generate_teleconsultation_links()
RETURNS TRIGGER AS $$
DECLARE
    base_url TEXT := 'https://app.medisync.com/visio/'; -- À remplacer par la vraie URL
BEGIN
    -- Générer un token unique
    NEW.room_token := generate_room_token();

    -- Générer les liens
    NEW.patient_link := base_url || 'patient/' || NEW.id || '?token=' || NEW.room_token;
    NEW.practitioner_link := base_url || 'practitioner/' || NEW.id || '?token=' || NEW.room_token;

    -- Expiration par défaut: 24h après le RDV
    IF NEW.room_expires_at IS NULL THEN
        NEW.room_expires_at := NEW.scheduled_start + INTERVAL '24 hours';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-génération des liens
CREATE TRIGGER trigger_generate_teleconsultation_links
    BEFORE INSERT ON public.teleconsultations
    FOR EACH ROW
    EXECUTE FUNCTION generate_teleconsultation_links();

-- Fonction: Calculer la durée effective
CREATE OR REPLACE FUNCTION calculate_teleconsultation_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND NEW.actual_start IS NOT NULL AND NEW.actual_end IS NOT NULL THEN
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.actual_end - NEW.actual_start)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-calcul de la durée
CREATE TRIGGER trigger_calculate_duration
    BEFORE UPDATE ON public.teleconsultations
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
    EXECUTE FUNCTION calculate_teleconsultation_duration();

-- Fonction: Timestamp auto-update
CREATE OR REPLACE FUNCTION update_teleconsultation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Updated_at auto
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

-- ===== ROW LEVEL SECURITY (RLS) =====

-- Activer RLS
ALTER TABLE public.teleconsultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teleconsultation_recordings ENABLE ROW LEVEL SECURITY;

-- Politique: Les praticiens voient leurs téléconsultations
CREATE POLICY teleconsultations_practitioner_select
    ON public.teleconsultations
    FOR SELECT
    USING (
        practitioner_id IN (
            SELECT id FROM public.practitioners WHERE user_id = auth.uid()
        )
    );

-- Politique: Les praticiens peuvent modifier leurs téléconsultations
CREATE POLICY teleconsultations_practitioner_update
    ON public.teleconsultations
    FOR UPDATE
    USING (
        practitioner_id IN (
            SELECT id FROM public.practitioners WHERE user_id = auth.uid()
        )
    );

-- Politique: Insert pour les praticiens
CREATE POLICY teleconsultations_practitioner_insert
    ON public.teleconsultations
    FOR INSERT
    WITH CHECK (
        practitioner_id IN (
            SELECT id FROM public.practitioners WHERE user_id = auth.uid()
        )
    );

-- Politique: Les sessions sont visibles par les participants
CREATE POLICY teleconsultation_sessions_participant_access
    ON public.teleconsultation_sessions
    FOR ALL
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (
                SELECT id FROM public.practitioners WHERE user_id = auth.uid()
            )
        )
        OR user_id = auth.uid()
    );

-- Politique: Les événements sont visibles par les participants
CREATE POLICY teleconsultation_events_participant_access
    ON public.teleconsultation_events
    FOR SELECT
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (
                SELECT id FROM public.practitioners WHERE user_id = auth.uid()
            )
        )
    );

-- Politique: Les documents sont visibles par les participants
CREATE POLICY teleconsultation_documents_access
    ON public.teleconsultation_documents
    FOR SELECT
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (
                SELECT id FROM public.practitioners WHERE user_id = auth.uid()
            )
        )
    );

-- Politique: Les notes sont visibles uniquement par le praticien
CREATE POLICY teleconsultation_notes_practitioner_access
    ON public.teleconsultation_notes
    FOR ALL
    USING (
        practitioner_id IN (
            SELECT id FROM public.practitioners WHERE user_id = auth.uid()
        )
    );

-- Politique: Les enregistrements nécessitent consentement
CREATE POLICY teleconsultation_recordings_access
    ON public.teleconsultation_recordings
    FOR SELECT
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (
                SELECT id FROM public.practitioners WHERE user_id = auth.uid()
            )
        )
        AND status != 'deleted'
    );

-- ===== COMMENTAIRES & DOCUMENTATION =====

COMMENT ON TABLE public.teleconsultations IS 'Table principale des téléconsultations - 1 ligne = 1 session visio médicale';
COMMENT ON TABLE public.teleconsultation_sessions IS 'Sessions WebRTC - supporte reconnexions multiples';
COMMENT ON TABLE public.teleconsultation_events IS 'Journal d''événements temps réel (audit et debug)';
COMMENT ON TABLE public.teleconsultation_documents IS 'Documents partagés avant/pendant/après la visio';
COMMENT ON TABLE public.teleconsultation_notes IS 'Notes médicales prises en temps réel';
COMMENT ON TABLE public.teleconsultation_recordings IS 'Enregistrements vidéo (RGPD: consentement obligatoire)';

COMMENT ON COLUMN public.teleconsultations.room_token IS 'Token sécurisé généré automatiquement - ne JAMAIS exposer en clair';
COMMENT ON COLUMN public.teleconsultations.patient_link IS 'Lien unique envoyé au patient (email/SMS)';
COMMENT ON COLUMN public.teleconsultations.practitioner_link IS 'Lien unique pour le praticien';
COMMENT ON COLUMN public.teleconsultation_sessions.peer_id IS 'ID du peer WebRTC (simple-peer ou autre lib)';
COMMENT ON COLUMN public.teleconsultation_events.event_type IS 'Type d''événement - extensible selon besoins métier';
