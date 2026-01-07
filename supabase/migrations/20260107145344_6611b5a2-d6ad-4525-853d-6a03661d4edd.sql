-- =====================================================
-- PHASE 1: Tables principales pour les plages d'ouverture
-- =====================================================

-- Table des séries de récurrence (master pour les ouvertures récurrentes)
CREATE TABLE public.opening_series (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    
    -- Informations de base
    title TEXT NOT NULL DEFAULT 'Ouverture',
    color TEXT DEFAULT '#FFFFFF',
    
    -- Configuration de récurrence
    recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('none', 'weekly', 'biweekly', 'weekdays', 'custom')),
    recurrence_days INTEGER[] DEFAULT '{}', -- 0=Dimanche, 1=Lundi, etc.
    recurrence_interval INTEGER DEFAULT 1, -- Toutes les X semaines
    recurrence_end_date DATE, -- NULL = jamais
    
    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des plages d'ouverture (occurrences individuelles)
CREATE TABLE public.practitioner_openings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE CASCADE,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    series_id UUID REFERENCES public.opening_series(id) ON DELETE CASCADE,
    
    -- Informations temporelles
    opening_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    
    -- Informations d'affichage
    title TEXT NOT NULL DEFAULT 'Ouverture',
    color TEXT DEFAULT '#FFFFFF',
    
    -- Remplacement éventuel
    substitute_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL,
    
    -- États
    is_exception BOOLEAN DEFAULT FALSE, -- Exception dans une série (modifiée individuellement)
    is_cancelled BOOLEAN DEFAULT FALSE, -- Annulée (mais garde la trace)
    
    -- Métadonnées
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Contrainte: end_time > start_time
    CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Table de liaison ouvertures <-> motifs de consultation
CREATE TABLE public.opening_motifs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    opening_id UUID REFERENCES public.practitioner_openings(id) ON DELETE CASCADE,
    series_id UUID REFERENCES public.opening_series(id) ON DELETE CASCADE,
    motif_id UUID NOT NULL REFERENCES public.appointment_motifs(id) ON DELETE CASCADE,
    max_appointments INTEGER, -- Limite optionnelle par motif
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Au moins un lien requis
    CONSTRAINT opening_or_series CHECK (opening_id IS NOT NULL OR series_id IS NOT NULL)
);

-- =====================================================
-- PHASE 2: Index pour performances
-- =====================================================

CREATE INDEX idx_opening_series_practitioner ON public.opening_series(practitioner_id);
CREATE INDEX idx_opening_series_active ON public.opening_series(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_practitioner_openings_practitioner ON public.practitioner_openings(practitioner_id);
CREATE INDEX idx_practitioner_openings_date ON public.practitioner_openings(opening_date);
CREATE INDEX idx_practitioner_openings_series ON public.practitioner_openings(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX idx_practitioner_openings_date_range ON public.practitioner_openings(practitioner_id, opening_date);

CREATE INDEX idx_opening_motifs_opening ON public.opening_motifs(opening_id) WHERE opening_id IS NOT NULL;
CREATE INDEX idx_opening_motifs_series ON public.opening_motifs(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX idx_opening_motifs_motif ON public.opening_motifs(motif_id);

-- =====================================================
-- PHASE 3: Triggers pour updated_at
-- =====================================================

CREATE TRIGGER update_opening_series_updated_at
    BEFORE UPDATE ON public.opening_series
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_practitioner_openings_updated_at
    BEFORE UPDATE ON public.practitioner_openings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 4: Row Level Security
-- =====================================================

ALTER TABLE public.opening_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practitioner_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_motifs ENABLE ROW LEVEL SECURITY;

-- Policies pour opening_series
CREATE POLICY "Authenticated users can view opening series"
    ON public.opening_series FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated users can create opening series"
    ON public.opening_series FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update opening series"
    ON public.opening_series FOR UPDATE
    TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated users can delete opening series"
    ON public.opening_series FOR DELETE
    TO authenticated
    USING (TRUE);

-- Policies pour practitioner_openings
CREATE POLICY "Authenticated users can view openings"
    ON public.practitioner_openings FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated users can create openings"
    ON public.practitioner_openings FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update openings"
    ON public.practitioner_openings FOR UPDATE
    TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated users can delete openings"
    ON public.practitioner_openings FOR DELETE
    TO authenticated
    USING (TRUE);

-- Policies pour opening_motifs
CREATE POLICY "Authenticated users can view opening motifs"
    ON public.opening_motifs FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated users can create opening motifs"
    ON public.opening_motifs FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "Authenticated users can update opening motifs"
    ON public.opening_motifs FOR UPDATE
    TO authenticated
    USING (TRUE);

CREATE POLICY "Authenticated users can delete opening motifs"
    ON public.opening_motifs FOR DELETE
    TO authenticated
    USING (TRUE);

-- =====================================================
-- PHASE 5: Vue pour les ouvertures avec détails
-- =====================================================

CREATE OR REPLACE VIEW public.v_openings_with_details AS
SELECT 
    po.id,
    po.practitioner_id,
    po.site_id,
    po.series_id,
    po.opening_date,
    po.start_time,
    po.end_time,
    po.title,
    po.color,
    po.substitute_id,
    po.is_exception,
    po.is_cancelled,
    po.created_at,
    po.updated_at,
    p.first_name AS practitioner_first_name,
    p.last_name AS practitioner_last_name,
    p.color AS practitioner_color,
    s.name AS site_name,
    os.recurrence_type,
    os.recurrence_days,
    os.recurrence_interval,
    CASE 
        WHEN os.id IS NOT NULL THEN TRUE 
        ELSE FALSE 
    END AS is_recurring,
    (
        SELECT json_agg(json_build_object(
            'id', am.id,
            'name', am.name,
            'color', am.color,
            'short_name', am.short_name
        ))
        FROM public.opening_motifs om
        JOIN public.appointment_motifs am ON am.id = om.motif_id
        WHERE om.opening_id = po.id OR om.series_id = po.series_id
    ) AS motifs
FROM public.practitioner_openings po
LEFT JOIN public.practitioners p ON p.id = po.practitioner_id
LEFT JOIN public.sites s ON s.id = po.site_id
LEFT JOIN public.opening_series os ON os.id = po.series_id
WHERE po.is_cancelled = FALSE;

-- =====================================================
-- PHASE 6: Données de test (ouverture récurrente lundis 8h-18h30)
-- =====================================================

-- Insérer une série pour Jean Charles-Frédéric (si praticien existe)
DO $$
DECLARE
    v_practitioner_id UUID;
    v_series_id UUID;
    v_day DATE;
    v_motif_id UUID;
BEGIN
    -- Récupérer un praticien existant
    SELECT id INTO v_practitioner_id FROM public.practitioners WHERE is_active = TRUE LIMIT 1;
    
    IF v_practitioner_id IS NOT NULL THEN
        -- Créer une série récurrente pour tous les lundis
        INSERT INTO public.opening_series (
            practitioner_id,
            title,
            recurrence_type,
            recurrence_days,
            recurrence_interval
        ) VALUES (
            v_practitioner_id,
            'Ouverture récurrente',
            'weekly',
            ARRAY[1], -- Lundi
            1 -- Toutes les semaines
        ) RETURNING id INTO v_series_id;
        
        -- Créer des occurrences pour les 4 prochaines semaines (lundis)
        FOR v_day IN 
            SELECT generate_series(
                date_trunc('week', CURRENT_DATE)::date + 1, -- Prochain lundi
                date_trunc('week', CURRENT_DATE)::date + 29, -- 4 semaines
                '7 days'::interval
            )::date
        LOOP
            INSERT INTO public.practitioner_openings (
                practitioner_id,
                series_id,
                opening_date,
                start_time,
                end_time,
                title
            ) VALUES (
                v_practitioner_id,
                v_series_id,
                v_day,
                '08:15'::time,
                '18:30'::time,
                'Ouverture récurrente'
            );
        END LOOP;
        
        -- Associer tous les motifs actifs à cette série
        FOR v_motif_id IN SELECT id FROM public.appointment_motifs WHERE is_active = TRUE
        LOOP
            INSERT INTO public.opening_motifs (series_id, motif_id)
            VALUES (v_series_id, v_motif_id);
        END LOOP;
        
        -- Créer aussi des ouvertures pour mar, mer, jeu, ven
        INSERT INTO public.opening_series (
            practitioner_id,
            title,
            recurrence_type,
            recurrence_days,
            recurrence_interval
        ) VALUES (
            v_practitioner_id,
            'Ouverture récurrente',
            'weekly',
            ARRAY[2,3,4,5], -- Mar, Mer, Jeu, Ven
            1
        ) RETURNING id INTO v_series_id;
        
        -- Créer occurrences mar, mer, jeu, ven pour 2 semaines
        FOR v_day IN 
            SELECT d::date
            FROM generate_series(
                date_trunc('week', CURRENT_DATE)::date,
                date_trunc('week', CURRENT_DATE)::date + 13,
                '1 day'::interval
            ) d
            WHERE EXTRACT(dow FROM d) IN (2,3,4,5) -- Mar, Mer, Jeu, Ven
        LOOP
            INSERT INTO public.practitioner_openings (
                practitioner_id,
                series_id,
                opening_date,
                start_time,
                end_time,
                title
            ) VALUES (
                v_practitioner_id,
                v_series_id,
                v_day,
                '08:15'::time,
                '18:30'::time,
                'Ouverture récurrente'
            );
        END LOOP;
        
        -- Associer tous les motifs à cette série aussi
        FOR v_motif_id IN SELECT id FROM public.appointment_motifs WHERE is_active = TRUE
        LOOP
            INSERT INTO public.opening_motifs (series_id, motif_id)
            VALUES (v_series_id, v_motif_id);
        END LOOP;
    END IF;
END $$;