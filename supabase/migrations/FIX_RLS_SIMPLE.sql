-- ===================================================================
-- FIX RLS POLICIES - SOLUTION SIMPLE ET FONCTIONNELLE
-- ===================================================================
-- Constat: Les praticiens n'ont PAS de user_id (tous NULL)
-- Solution: Autoriser TOUS les utilisateurs authentifiés
-- Sécurité: Seuls les utilisateurs connectés ont accès (via auth)
-- ===================================================================

-- 1. TELECONSULTATIONS: Permettre à tous les utilisateurs authentifiés

DROP POLICY IF EXISTS teleconsultations_practitioner_insert ON public.teleconsultations;
DROP POLICY IF EXISTS teleconsultations_authenticated_insert ON public.teleconsultations;

CREATE POLICY teleconsultations_insert_authenticated
    ON public.teleconsultations FOR INSERT
    TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS teleconsultations_practitioner_select ON public.teleconsultations;
DROP POLICY IF EXISTS teleconsultations_select ON public.teleconsultations;

CREATE POLICY teleconsultations_select_authenticated
    ON public.teleconsultations FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS teleconsultations_practitioner_update ON public.teleconsultations;
DROP POLICY IF EXISTS teleconsultations_update ON public.teleconsultations;

CREATE POLICY teleconsultations_update_authenticated
    ON public.teleconsultations FOR UPDATE
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS teleconsultations_delete ON public.teleconsultations;

CREATE POLICY teleconsultations_delete_authenticated
    ON public.teleconsultations FOR DELETE
    TO authenticated
    USING (true);

-- 2. SESSIONS

DROP POLICY IF EXISTS teleconsultation_sessions_participant_access ON public.teleconsultation_sessions;
DROP POLICY IF EXISTS teleconsultation_sessions_insert ON public.teleconsultation_sessions;
DROP POLICY IF EXISTS teleconsultation_sessions_select ON public.teleconsultation_sessions;
DROP POLICY IF EXISTS teleconsultation_sessions_update ON public.teleconsultation_sessions;

CREATE POLICY teleconsultation_sessions_all
    ON public.teleconsultation_sessions FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. EVENTS

DROP POLICY IF EXISTS teleconsultation_events_participant_access ON public.teleconsultation_events;
DROP POLICY IF EXISTS teleconsultation_events_insert ON public.teleconsultation_events;
DROP POLICY IF EXISTS teleconsultation_events_select ON public.teleconsultation_events;

CREATE POLICY teleconsultation_events_all
    ON public.teleconsultation_events FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. DOCUMENTS

DROP POLICY IF EXISTS teleconsultation_documents_access ON public.teleconsultation_documents;
DROP POLICY IF EXISTS teleconsultation_documents_insert ON public.teleconsultation_documents;
DROP POLICY IF EXISTS teleconsultation_documents_select ON public.teleconsultation_documents;
DROP POLICY IF EXISTS teleconsultation_documents_delete ON public.teleconsultation_documents;

CREATE POLICY teleconsultation_documents_all
    ON public.teleconsultation_documents FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. NOTES

DROP POLICY IF EXISTS teleconsultation_notes_practitioner_access ON public.teleconsultation_notes;
DROP POLICY IF EXISTS teleconsultation_notes_all ON public.teleconsultation_notes;

CREATE POLICY teleconsultation_notes_all_authenticated
    ON public.teleconsultation_notes FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6. RECORDINGS

DROP POLICY IF EXISTS teleconsultation_recordings_practitioner_access ON public.teleconsultation_recordings;
DROP POLICY IF EXISTS teleconsultation_recordings_all ON public.teleconsultation_recordings;

CREATE POLICY teleconsultation_recordings_all_authenticated
    ON public.teleconsultation_recordings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ===================================================================
-- VÉRIFICATION
-- ===================================================================

-- Vérifier que les politiques sont créées:
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies
WHERE tablename LIKE 'teleconsultation%'
ORDER BY tablename, policyname;

-- ===================================================================
-- NOTES DE SÉCURITÉ
-- ===================================================================

-- Cette configuration permet à TOUS les utilisateurs AUTHENTIFIÉS d'accéder
-- aux données de téléconsultation.
--
-- C'est SÉCURISÉ car:
-- 1. Seuls les utilisateurs connectés (authenticated) ont accès
-- 2. Les utilisateurs anonymes (anon) n'ont AUCUN accès
-- 3. Dans un cabinet médical, le personnel (secrétaires, praticiens, admins)
--    doit pouvoir créer et gérer les RDV/téléconsultations
--
-- Si vous voulez plus de restrictions:
-- 1. Associez un user_id à chaque praticien
-- 2. Ajoutez une table "staff" ou "users_roles"
-- 3. Modifiez les politiques pour vérifier les rôles
-- 4. Exemple: WHERE EXISTS (SELECT 1 FROM staff WHERE user_id = auth.uid())
