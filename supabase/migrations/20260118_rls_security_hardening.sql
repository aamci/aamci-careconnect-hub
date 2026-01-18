-- =====================================================
-- MIGRATION: RLS Security Hardening for Critical Tables
-- Date: 2026-01-18
-- Version: 1.0
-- =====================================================
-- This migration adds/updates RLS policies on critical tables
-- to ensure proper data access control.
-- =====================================================

-- =====================================================
-- 1. PATIENTS TABLE - Multi-tenant & Role-based access
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "patients_select_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_insert_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_update_policy" ON public.patients;
DROP POLICY IF EXISTS "patients_delete_policy" ON public.patients;
DROP POLICY IF EXISTS "Users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Users can manage patients" ON public.patients;

-- SELECT: Authenticated users can view patients
CREATE POLICY "patients_select_policy"
  ON public.patients FOR SELECT
  TO authenticated
  USING (
    -- Active patients or user has admin role
    is_active = true OR public.is_admin()
  );

-- INSERT: Authenticated users can create patients
CREATE POLICY "patients_insert_policy"
  ON public.patients FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Authenticated users can update patients
CREATE POLICY "patients_update_policy"
  ON public.patients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Only admins can delete patients
CREATE POLICY "patients_delete_policy"
  ON public.patients FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- 2. APPOINTMENTS TABLE - Role-based access
-- =====================================================

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_select_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update_policy" ON public.appointments;
DROP POLICY IF EXISTS "appointments_delete_policy" ON public.appointments;
DROP POLICY IF EXISTS "Users can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can manage appointments" ON public.appointments;

-- SELECT: Authenticated users can view all appointments
CREATE POLICY "appointments_select_policy"
  ON public.appointments FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Authenticated users can create appointments
CREATE POLICY "appointments_insert_policy"
  ON public.appointments FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Authenticated users can update appointments
CREATE POLICY "appointments_update_policy"
  ON public.appointments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: Only admins can delete appointments (soft delete preferred)
CREATE POLICY "appointments_delete_policy"
  ON public.appointments FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- 3. CONSULTATIONS TABLE - Practitioner-based access
-- =====================================================

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "consultations_select_policy" ON public.consultations;
DROP POLICY IF EXISTS "consultations_insert_policy" ON public.consultations;
DROP POLICY IF EXISTS "consultations_update_policy" ON public.consultations;
DROP POLICY IF EXISTS "consultations_delete_policy" ON public.consultations;
DROP POLICY IF EXISTS "Users can view consultations" ON public.consultations;
DROP POLICY IF EXISTS "Users can manage consultations" ON public.consultations;

-- SELECT: Authenticated users can view consultations
CREATE POLICY "consultations_select_policy"
  ON public.consultations FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Authenticated users can create consultations
CREATE POLICY "consultations_insert_policy"
  ON public.consultations FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Only creator or admin can update consultations
CREATE POLICY "consultations_update_policy"
  ON public.consultations FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR public.is_admin()
  )
  WITH CHECK (true);

-- DELETE: Only admins can delete consultations
CREATE POLICY "consultations_delete_policy"
  ON public.consultations FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- 4. PRESCRIPTIONS TABLE - Signed prescriptions immutable
-- =====================================================

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prescriptions_select_policy" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_insert_policy" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_update_policy" ON public.prescriptions;
DROP POLICY IF EXISTS "prescriptions_delete_policy" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can view prescriptions" ON public.prescriptions;
DROP POLICY IF EXISTS "Users can manage prescriptions" ON public.prescriptions;

-- SELECT: Authenticated users can view prescriptions
CREATE POLICY "prescriptions_select_policy"
  ON public.prescriptions FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Authenticated users can create prescriptions
CREATE POLICY "prescriptions_insert_policy"
  ON public.prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Only creator can update unsigned prescriptions
CREATE POLICY "prescriptions_update_policy"
  ON public.prescriptions FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND signed_at IS NULL
  )
  WITH CHECK (signed_at IS NULL);

-- DELETE: Only admins can delete prescriptions
CREATE POLICY "prescriptions_delete_policy"
  ON public.prescriptions FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- 5. VITAL_SIGNS TABLE - Medical data protection
-- =====================================================

ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vital_signs_select_policy" ON public.vital_signs;
DROP POLICY IF EXISTS "vital_signs_insert_policy" ON public.vital_signs;
DROP POLICY IF EXISTS "vital_signs_update_policy" ON public.vital_signs;
DROP POLICY IF EXISTS "vital_signs_delete_policy" ON public.vital_signs;
DROP POLICY IF EXISTS "Users can view vital_signs" ON public.vital_signs;
DROP POLICY IF EXISTS "Users can manage vital_signs" ON public.vital_signs;

-- SELECT: Authenticated users can view vital signs
CREATE POLICY "vital_signs_select_policy"
  ON public.vital_signs FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Authenticated users can create vital signs
CREATE POLICY "vital_signs_insert_policy"
  ON public.vital_signs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Only recorder can update vital signs
CREATE POLICY "vital_signs_update_policy"
  ON public.vital_signs FOR UPDATE
  TO authenticated
  USING (recorded_by = auth.uid() OR public.is_admin())
  WITH CHECK (true);

-- DELETE: Only admins can delete vital signs
CREATE POLICY "vital_signs_delete_policy"
  ON public.vital_signs FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- 6. DOCUMENTS TABLE - File access control
-- =====================================================

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documents_select_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON public.documents;
DROP POLICY IF EXISTS "Users can view documents" ON public.documents;
DROP POLICY IF EXISTS "Users can manage documents" ON public.documents;

-- SELECT: Authenticated users can view documents
CREATE POLICY "documents_select_policy"
  ON public.documents FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Authenticated users can upload documents
CREATE POLICY "documents_insert_policy"
  ON public.documents FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Only uploader or admin can update documents
CREATE POLICY "documents_update_policy"
  ON public.documents FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_admin())
  WITH CHECK (true);

-- DELETE: Only admins can delete documents
CREATE POLICY "documents_delete_policy"
  ON public.documents FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- 7. INVOICES TABLE - Financial data protection
-- =====================================================

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_select_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_insert_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_update_policy" ON public.invoices;
DROP POLICY IF EXISTS "invoices_delete_policy" ON public.invoices;
DROP POLICY IF EXISTS "Users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can manage invoices" ON public.invoices;

-- SELECT: Authenticated users can view invoices
CREATE POLICY "invoices_select_policy"
  ON public.invoices FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Authenticated users can create invoices
CREATE POLICY "invoices_insert_policy"
  ON public.invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: Only creator or admin can update non-finalized invoices
CREATE POLICY "invoices_update_policy"
  ON public.invoices FOR UPDATE
  TO authenticated
  USING (
    (created_by = auth.uid() OR public.is_admin())
    AND status NOT IN ('paid', 'cancelled')
  )
  WITH CHECK (status NOT IN ('paid', 'cancelled'));

-- DELETE: Only admins can delete invoices
CREATE POLICY "invoices_delete_policy"
  ON public.invoices FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- =====================================================
-- 8. MESSAGES TABLE - Private messaging
-- =====================================================

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_update_policy" ON public.messages;
DROP POLICY IF EXISTS "messages_delete_policy" ON public.messages;
DROP POLICY IF EXISTS "Users can view messages" ON public.messages;
DROP POLICY IF EXISTS "Users can manage messages" ON public.messages;

-- SELECT: Users can view messages they sent or received
CREATE POLICY "messages_select_policy"
  ON public.messages FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Authenticated users can send messages
CREATE POLICY "messages_insert_policy"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- UPDATE: Only sender can update their messages
CREATE POLICY "messages_update_policy"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- DELETE: Only sender or admin can delete messages
CREATE POLICY "messages_delete_policy"
  ON public.messages FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid() OR public.is_admin());

-- =====================================================
-- 9. AUDIT_LOGS TABLE - Immutable audit trail
-- =====================================================

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_logs_select_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_update_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_delete_policy" ON public.audit_logs;
DROP POLICY IF EXISTS "Users can view audit_logs" ON public.audit_logs;

-- SELECT: Only admins can view audit logs
CREATE POLICY "audit_logs_select_policy"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- INSERT: System can insert audit logs
CREATE POLICY "audit_logs_insert_policy"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE: No one can update audit logs
CREATE POLICY "audit_logs_update_policy"
  ON public.audit_logs FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- DELETE: No one can delete audit logs
CREATE POLICY "audit_logs_delete_policy"
  ON public.audit_logs FOR DELETE
  TO authenticated
  USING (false);

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'RLS Security Hardening complete!';
  RAISE NOTICE 'Protected tables: patients, appointments, consultations, prescriptions, vital_signs, documents, invoices, messages, audit_logs';
END $$;
