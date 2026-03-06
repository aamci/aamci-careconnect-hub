-- Migration: Add missing columns and update CHECK constraints on tasks table
-- Date: 2026-02-28
-- Purpose: Add is_personal, patient_name columns and expand type values

-- 1. Add is_personal column
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT false;

-- 2. Add patient_name column (denormalized for display performance)
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS patient_name VARCHAR(255);

-- 3. Drop old type CHECK constraint and add expanded one
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_type_check;
ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_type_check
  CHECK (type IN (
    'call', 'document', 'preparation', 'followup', 'administrative', 'other',
    'rendez-vous', 'patient-contact', 'facturation', 'resultats', 'autre'
  ));

-- 4. Backfill patient_name from patients table for existing rows
UPDATE public.tasks t
SET patient_name = p.last_name || ' ' || p.first_name
FROM public.patients p
WHERE t.patient_id = p.id
  AND t.patient_name IS NULL;

-- 5. Create index on is_personal for filtering
CREATE INDEX IF NOT EXISTS idx_tasks_is_personal ON public.tasks(is_personal);
