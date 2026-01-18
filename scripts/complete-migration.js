#!/usr/bin/env node
/**
 * Complete Migration - Only adds missing tables and policies
 * Safe to run multiple times (idempotent)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Read secrets
const secretsPath = path.join(projectRoot, 'secret', 'token-acces-lmops-plateform.json');
const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

const PROJECT_REF = secrets.supabase.project_id;
const ACCESS_TOKEN = secrets.supabase.access_token;

async function executeSQL(sql, description) {
  console.log(`\n[EXEC] ${description}`);

  const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error = JSON.parse(errorText);
    // Check if it's a "already exists" error - that's OK
    if (error.message && error.message.includes('already exists')) {
      console.log(`  [SKIP] Already exists`);
      return { skipped: true };
    }
    throw new Error(error.message || errorText);
  }

  console.log(`  [OK] Success`);
  return await response.json();
}

async function runMigration() {
  console.log('');
  console.log('='.repeat(60));
  console.log('COMPLETING MEDICAL HISTORY MIGRATION');
  console.log('='.repeat(60));

  // 1. Create patient_conditions table if not exists
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.patient_conditions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
      cim10_code VARCHAR(20),
      cim10_label TEXT,
      cisp2_code VARCHAR(20),
      cisp2_label TEXT,
      title TEXT NOT NULL,
      description TEXT,
      onset_date DATE,
      resolution_date DATE,
      clinical_status VARCHAR(50) NOT NULL DEFAULT 'active',
      verification_status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
      severity VARCHAR(20) DEFAULT 'medium',
      is_ald BOOLEAN DEFAULT FALSE,
      ald_number INTEGER,
      ald_start_date DATE,
      ald_end_date DATE,
      is_pinned BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_by UUID,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `, 'Create patient_conditions table');

  // Create indexes for patient_conditions
  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_patient_conditions_patient ON public.patient_conditions(patient_id);
  `, 'Create index on patient_conditions(patient_id)');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_patient_conditions_cim10 ON public.patient_conditions(cim10_code) WHERE cim10_code IS NOT NULL;
  `, 'Create index on patient_conditions(cim10_code)');

  // Enable RLS
  await executeSQL(`
    ALTER TABLE public.patient_conditions ENABLE ROW LEVEL SECURITY;
  `, 'Enable RLS on patient_conditions');

  // Drop and recreate policies
  await executeSQL(`
    DROP POLICY IF EXISTS "Users can view patient conditions" ON public.patient_conditions;
    DROP POLICY IF EXISTS "Users can manage patient conditions" ON public.patient_conditions;
  `, 'Drop existing policies on patient_conditions');

  await executeSQL(`
    CREATE POLICY "Users can view patient conditions"
      ON public.patient_conditions FOR SELECT
      TO authenticated
      USING (true);
  `, 'Create SELECT policy on patient_conditions');

  await executeSQL(`
    CREATE POLICY "Users can manage patient conditions"
      ON public.patient_conditions FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  `, 'Create ALL policy on patient_conditions');

  // 2. Create patient_procedures table if not exists
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.patient_procedures (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
      ccam_code VARCHAR(20),
      ccam_label TEXT,
      title TEXT NOT NULL,
      description TEXT,
      procedure_date DATE,
      hospital_name TEXT,
      surgeon_name TEXT,
      anesthesia_type VARCHAR(50),
      had_complications BOOLEAN DEFAULT FALSE,
      complications_description TEXT,
      is_pinned BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_by UUID,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `, 'Create patient_procedures table');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_patient_procedures_patient ON public.patient_procedures(patient_id);
  `, 'Create index on patient_procedures(patient_id)');

  await executeSQL(`
    ALTER TABLE public.patient_procedures ENABLE ROW LEVEL SECURITY;
  `, 'Enable RLS on patient_procedures');

  await executeSQL(`
    DROP POLICY IF EXISTS "Users can view patient procedures" ON public.patient_procedures;
    DROP POLICY IF EXISTS "Users can manage patient procedures" ON public.patient_procedures;
  `, 'Drop existing policies on patient_procedures');

  await executeSQL(`
    CREATE POLICY "Users can view patient procedures"
      ON public.patient_procedures FOR SELECT
      TO authenticated
      USING (true);
  `, 'Create SELECT policy on patient_procedures');

  await executeSQL(`
    CREATE POLICY "Users can manage patient procedures"
      ON public.patient_procedures FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  `, 'Create ALL policy on patient_procedures');

  // 3. Create patient_cvd_risk table if not exists
  await executeSQL(`
    CREATE TABLE IF NOT EXISTS public.patient_cvd_risk (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
      has_hypertension BOOLEAN DEFAULT FALSE,
      has_diabetes BOOLEAN DEFAULT FALSE,
      diabetes_type VARCHAR(20),
      has_dyslipidemia BOOLEAN DEFAULT FALSE,
      has_obesity BOOLEAN DEFAULT FALSE,
      has_family_history_cvd BOOLEAN DEFAULT FALSE,
      family_history_details TEXT,
      last_ldl_value NUMERIC(5,2),
      last_ldl_date DATE,
      last_hdl_value NUMERIC(5,2),
      last_hdl_date DATE,
      last_triglycerides_value NUMERIC(6,2),
      last_triglycerides_date DATE,
      last_hba1c_value NUMERIC(4,2),
      last_hba1c_date DATE,
      last_creatinine_value NUMERIC(6,2),
      last_creatinine_date DATE,
      score_type VARCHAR(50),
      score_value NUMERIC(5,2),
      score_date DATE,
      risk_category VARCHAR(50),
      target_ldl NUMERIC(5,2),
      target_bp_systolic INTEGER,
      target_bp_diastolic INTEGER,
      target_hba1c NUMERIC(4,2),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_by UUID,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      CONSTRAINT patient_cvd_risk_unique UNIQUE(patient_id)
    );
  `, 'Create patient_cvd_risk table');

  await executeSQL(`
    CREATE INDEX IF NOT EXISTS idx_patient_cvd_risk_patient ON public.patient_cvd_risk(patient_id);
  `, 'Create index on patient_cvd_risk(patient_id)');

  await executeSQL(`
    ALTER TABLE public.patient_cvd_risk ENABLE ROW LEVEL SECURITY;
  `, 'Enable RLS on patient_cvd_risk');

  await executeSQL(`
    DROP POLICY IF EXISTS "Users can view cvd risk" ON public.patient_cvd_risk;
    DROP POLICY IF EXISTS "Users can manage cvd risk" ON public.patient_cvd_risk;
  `, 'Drop existing policies on patient_cvd_risk');

  await executeSQL(`
    CREATE POLICY "Users can view cvd risk"
      ON public.patient_cvd_risk FOR SELECT
      TO authenticated
      USING (true);
  `, 'Create SELECT policy on patient_cvd_risk');

  await executeSQL(`
    CREATE POLICY "Users can manage cvd risk"
      ON public.patient_cvd_risk FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  `, 'Create ALL policy on patient_cvd_risk');

  console.log('');
  console.log('='.repeat(60));
  console.log('PHASE 1 COMPLETE: Missing tables created');
  console.log('='.repeat(60));
}

async function runRLSHardening() {
  console.log('');
  console.log('='.repeat(60));
  console.log('APPLYING RLS SECURITY HARDENING');
  console.log('='.repeat(60));

  // Check if is_admin function exists, create if not
  await executeSQL(`
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS BOOLEAN AS $$
    BEGIN
      -- Check if user has admin role in user metadata or profiles
      RETURN (
        SELECT COALESCE(
          (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'admin',
          false
        )
      );
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `, 'Create/Update is_admin() function');

  // Harden RLS on patients table
  await executeSQL(`
    ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "patients_select_policy" ON public.patients;
    DROP POLICY IF EXISTS "patients_insert_policy" ON public.patients;
    DROP POLICY IF EXISTS "patients_update_policy" ON public.patients;
    DROP POLICY IF EXISTS "patients_delete_policy" ON public.patients;
  `, 'Prepare patients table for RLS');

  await executeSQL(`
    CREATE POLICY "patients_select_policy"
      ON public.patients FOR SELECT
      TO authenticated
      USING (is_active = true OR public.is_admin());
  `, 'Create SELECT policy on patients');

  await executeSQL(`
    CREATE POLICY "patients_insert_policy"
      ON public.patients FOR INSERT
      TO authenticated
      WITH CHECK (true);
  `, 'Create INSERT policy on patients');

  await executeSQL(`
    CREATE POLICY "patients_update_policy"
      ON public.patients FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  `, 'Create UPDATE policy on patients');

  await executeSQL(`
    CREATE POLICY "patients_delete_policy"
      ON public.patients FOR DELETE
      TO authenticated
      USING (public.is_admin());
  `, 'Create DELETE policy on patients');

  // Harden RLS on appointments
  await executeSQL(`
    ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "appointments_select_policy" ON public.appointments;
    DROP POLICY IF EXISTS "appointments_insert_policy" ON public.appointments;
    DROP POLICY IF EXISTS "appointments_update_policy" ON public.appointments;
    DROP POLICY IF EXISTS "appointments_delete_policy" ON public.appointments;
  `, 'Prepare appointments table for RLS');

  await executeSQL(`
    CREATE POLICY "appointments_select_policy"
      ON public.appointments FOR SELECT
      TO authenticated
      USING (true);
  `, 'Create SELECT policy on appointments');

  await executeSQL(`
    CREATE POLICY "appointments_insert_policy"
      ON public.appointments FOR INSERT
      TO authenticated
      WITH CHECK (true);
  `, 'Create INSERT policy on appointments');

  await executeSQL(`
    CREATE POLICY "appointments_update_policy"
      ON public.appointments FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  `, 'Create UPDATE policy on appointments');

  await executeSQL(`
    CREATE POLICY "appointments_delete_policy"
      ON public.appointments FOR DELETE
      TO authenticated
      USING (public.is_admin());
  `, 'Create DELETE policy on appointments');

  // Harden RLS on consultations
  await executeSQL(`
    ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "consultations_select_policy" ON public.consultations;
    DROP POLICY IF EXISTS "consultations_insert_policy" ON public.consultations;
    DROP POLICY IF EXISTS "consultations_update_policy" ON public.consultations;
    DROP POLICY IF EXISTS "consultations_delete_policy" ON public.consultations;
  `, 'Prepare consultations table for RLS');

  await executeSQL(`
    CREATE POLICY "consultations_select_policy"
      ON public.consultations FOR SELECT
      TO authenticated
      USING (true);
  `, 'Create SELECT policy on consultations');

  await executeSQL(`
    CREATE POLICY "consultations_insert_policy"
      ON public.consultations FOR INSERT
      TO authenticated
      WITH CHECK (true);
  `, 'Create INSERT policy on consultations');

  await executeSQL(`
    CREATE POLICY "consultations_update_policy"
      ON public.consultations FOR UPDATE
      TO authenticated
      USING (created_by = auth.uid() OR public.is_admin())
      WITH CHECK (true);
  `, 'Create UPDATE policy on consultations');

  await executeSQL(`
    CREATE POLICY "consultations_delete_policy"
      ON public.consultations FOR DELETE
      TO authenticated
      USING (public.is_admin());
  `, 'Create DELETE policy on consultations');

  console.log('');
  console.log('='.repeat(60));
  console.log('PHASE 2 COMPLETE: RLS Security Hardening applied');
  console.log('='.repeat(60));
}

async function verifyMigration() {
  console.log('');
  console.log('='.repeat(60));
  console.log('VERIFICATION');
  console.log('='.repeat(60));

  // Check all patient tables
  const result = await executeSQL(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE 'patient_%'
    ORDER BY table_name;
  `, 'List all patient tables');

  console.log('\nPatient-related tables:');
  if (Array.isArray(result)) {
    result.forEach(row => console.log(`  - ${row.table_name}`));
  }

  // Check RLS status
  const rlsResult = await executeSQL(`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('patients', 'appointments', 'consultations', 'patient_conditions', 'patient_procedures', 'patient_cvd_risk')
    ORDER BY tablename;
  `, 'Check RLS status');

  console.log('\nRLS Status:');
  if (Array.isArray(rlsResult)) {
    rlsResult.forEach(row => {
      const status = row.rowsecurity ? '[ENABLED]' : '[DISABLED]';
      console.log(`  ${status} ${row.tablename}`);
    });
  }
}

// Main execution
async function main() {
  try {
    await runMigration();
    await runRLSHardening();
    await verifyMigration();

    console.log('');
    console.log('='.repeat(60));
    console.log('ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('');
  } catch (err) {
    console.error('\nMIGRATION FAILED:', err.message);
    process.exit(1);
  }
}

main();
