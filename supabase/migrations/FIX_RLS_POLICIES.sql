-- ===================================================================
-- FIX RLS POLICIES - TÉLÉCONSULTATION
-- ===================================================================
-- Problème: La politique actuelle ne permet qu'à un praticien de créer
-- des téléconsultations pour lui-même. Mais dans une vraie application,
-- une secrétaire ou un admin doit pouvoir créer des RDV pour n'importe
-- quel praticien.
-- ===================================================================

-- 1. Supprimer l'ancienne politique INSERT trop restrictive
DROP POLICY IF EXISTS teleconsultations_practitioner_insert ON public.teleconsultations;

-- 2. Créer une nouvelle politique INSERT plus permissive
-- Permet à tout utilisateur authentifié de créer des téléconsultations
-- (la validation métier se fait côté application)
CREATE POLICY teleconsultations_authenticated_insert
    ON public.teleconsultations FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Alternative: Si vous voulez restreindre aux praticiens uniquement
-- Décommentez ci-dessous et commentez la politique ci-dessus
/*
CREATE POLICY teleconsultations_practitioner_insert
    ON public.teleconsultations FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Permet si l'utilisateur est le praticien du RDV
        practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        OR
        -- Ou si l'utilisateur est un praticien (peut créer pour d'autres)
        auth.uid() IN (SELECT user_id FROM public.practitioners)
    );
*/

-- 3. Améliorer la politique SELECT pour permettre de voir toutes les téléconsultations
-- si l'utilisateur est un praticien (pour l'agenda)
DROP POLICY IF EXISTS teleconsultations_practitioner_select ON public.teleconsultations;

CREATE POLICY teleconsultations_select
    ON public.teleconsultations FOR SELECT
    TO authenticated
    USING (
        -- Praticien voit ses propres téléconsultations
        practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        OR
        -- Patient voit ses téléconsultations
        patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
        OR
        -- Tout praticien authentifié peut voir (pour l'agenda global)
        auth.uid() IN (SELECT user_id FROM public.practitioners)
    );

-- 4. Améliorer la politique UPDATE
DROP POLICY IF EXISTS teleconsultations_practitioner_update ON public.teleconsultations;

CREATE POLICY teleconsultations_update
    ON public.teleconsultations FOR UPDATE
    TO authenticated
    USING (
        -- Praticien peut modifier ses propres téléconsultations
        practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        OR
        -- Ou tout praticien (pour permettre les modifications par admin/secrétaire)
        auth.uid() IN (SELECT user_id FROM public.practitioners)
    );

-- 5. Ajouter une politique DELETE
CREATE POLICY teleconsultations_delete
    ON public.teleconsultations FOR DELETE
    TO authenticated
    USING (
        -- Seul le praticien concerné peut supprimer
        practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
    );

-- ===================================================================
-- POLITIQUES POUR LES AUTRES TABLES
-- ===================================================================

-- Sessions: Permettre INSERT à tous les utilisateurs authentifiés
DROP POLICY IF EXISTS teleconsultation_sessions_participant_access ON public.teleconsultation_sessions;

CREATE POLICY teleconsultation_sessions_insert
    ON public.teleconsultation_sessions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY teleconsultation_sessions_select
    ON public.teleconsultation_sessions FOR SELECT
    TO authenticated
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
               OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
        )
        OR user_id = auth.uid()
    );

CREATE POLICY teleconsultation_sessions_update
    ON public.teleconsultation_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Events: Permettre INSERT à tous
DROP POLICY IF EXISTS teleconsultation_events_participant_access ON public.teleconsultation_events;

CREATE POLICY teleconsultation_events_insert
    ON public.teleconsultation_events FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY teleconsultation_events_select
    ON public.teleconsultation_events FOR SELECT
    TO authenticated
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
               OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
        )
    );

-- Documents: Permettre INSERT à tous
DROP POLICY IF EXISTS teleconsultation_documents_access ON public.teleconsultation_documents;

CREATE POLICY teleconsultation_documents_insert
    ON public.teleconsultation_documents FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY teleconsultation_documents_select
    ON public.teleconsultation_documents FOR SELECT
    TO authenticated
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
               OR patient_id IN (SELECT id FROM public.patients WHERE user_id = auth.uid())
        )
    );

CREATE POLICY teleconsultation_documents_delete
    ON public.teleconsultation_documents FOR DELETE
    TO authenticated
    USING (
        uploaded_by = auth.uid()
        OR
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        )
    );

-- Notes: Seuls les praticiens
DROP POLICY IF EXISTS teleconsultation_notes_practitioner_access ON public.teleconsultation_notes;

CREATE POLICY teleconsultation_notes_all
    ON public.teleconsultation_notes FOR ALL
    TO authenticated
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        )
    );

-- Recordings: Seuls les praticiens
DROP POLICY IF EXISTS teleconsultation_recordings_practitioner_access ON public.teleconsultation_recordings;

CREATE POLICY teleconsultation_recordings_all
    ON public.teleconsultation_recordings FOR ALL
    TO authenticated
    USING (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        )
    )
    WITH CHECK (
        teleconsultation_id IN (
            SELECT id FROM public.teleconsultations
            WHERE practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid())
        )
    );

-- ===================================================================
-- VÉRIFICATION
-- ===================================================================
-- Vous pouvez vérifier que les politiques sont correctes avec:
-- SELECT * FROM pg_policies WHERE tablename LIKE 'teleconsultation%';
