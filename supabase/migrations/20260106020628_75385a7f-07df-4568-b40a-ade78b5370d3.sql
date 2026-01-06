-- Drop existing permissive policies
DROP POLICY IF EXISTS "Allow all access to patient_antecedents" ON public.patient_antecedents;
DROP POLICY IF EXISTS "Allow all access to patient_memos" ON public.patient_memos;

-- Create proper RLS policies for patient_antecedents
-- Only authenticated users can read antecedents
CREATE POLICY "Authenticated users can view patient_antecedents"
ON public.patient_antecedents
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can insert antecedents
CREATE POLICY "Authenticated users can insert patient_antecedents"
ON public.patient_antecedents
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update antecedents
CREATE POLICY "Authenticated users can update patient_antecedents"
ON public.patient_antecedents
FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can delete antecedents
CREATE POLICY "Authenticated users can delete patient_antecedents"
ON public.patient_antecedents
FOR DELETE
TO authenticated
USING (true);

-- Create proper RLS policies for patient_memos
-- Only authenticated users can read memos
CREATE POLICY "Authenticated users can view patient_memos"
ON public.patient_memos
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can insert memos
CREATE POLICY "Authenticated users can insert patient_memos"
ON public.patient_memos
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated users can update memos
CREATE POLICY "Authenticated users can update patient_memos"
ON public.patient_memos
FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can delete memos
CREATE POLICY "Authenticated users can delete patient_memos"
ON public.patient_memos
FOR DELETE
TO authenticated
USING (true);