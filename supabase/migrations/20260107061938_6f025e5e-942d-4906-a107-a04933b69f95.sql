-- =====================================================
-- PHASE 1: Ajout des RLS policies manquantes
-- =====================================================

-- Sites policies
CREATE POLICY "Sites are viewable by all authenticated users" 
ON public.sites FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Sites are manageable by admins" 
ON public.sites FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()));

-- Rooms policies
CREATE POLICY "Rooms are viewable by all authenticated users" 
ON public.rooms FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Rooms are manageable by admins" 
ON public.rooms FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()));

-- Practitioners policies
CREATE POLICY "Practitioners are viewable by all authenticated users" 
ON public.practitioners FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Practitioners can update their own profile" 
ON public.practitioners FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Practitioners are manageable by admins" 
ON public.practitioners FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()));

-- Patients policies
CREATE POLICY "Patients are viewable by all authenticated users" 
ON public.patients FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Patients can be created by authenticated users" 
ON public.patients FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Patients can be updated by authenticated users" 
ON public.patients FOR UPDATE 
TO authenticated 
USING (true);

-- Patient alerts policies
CREATE POLICY "Patient alerts are viewable by authenticated users" 
ON public.patient_alerts FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Patient alerts can be managed by authenticated users" 
ON public.patient_alerts FOR ALL 
TO authenticated 
USING (true);

-- Appointment motifs policies
CREATE POLICY "Appointment motifs are viewable by all authenticated users" 
ON public.appointment_motifs FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Appointment motifs are manageable by admins" 
ON public.appointment_motifs FOR ALL 
TO authenticated 
USING (public.is_admin(auth.uid()));

-- Appointments policies
CREATE POLICY "Appointments are viewable by authenticated users" 
ON public.appointments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Appointments can be created by authenticated users" 
ON public.appointments FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Appointments can be updated by authenticated users" 
ON public.appointments FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Appointments can be deleted by authenticated users" 
ON public.appointments FOR DELETE 
TO authenticated 
USING (true);

-- Appointment history policies
CREATE POLICY "Appointment history is viewable by authenticated users" 
ON public.appointment_history FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Appointment history can be created by authenticated users" 
ON public.appointment_history FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Notes policies
CREATE POLICY "Notes are viewable by authenticated users" 
ON public.notes FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Notes can be created by authenticated users" 
ON public.notes FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Notes can be updated by author or admin" 
ON public.notes FOR UPDATE 
TO authenticated 
USING (author_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Notes can be deleted by author or admin" 
ON public.notes FOR DELETE 
TO authenticated 
USING (author_id = auth.uid() OR public.is_admin(auth.uid()));

-- Tasks policies
CREATE POLICY "Tasks are viewable by authenticated users" 
ON public.tasks FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Tasks can be created by authenticated users" 
ON public.tasks FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Tasks can be updated by assignee or admin" 
ON public.tasks FOR UPDATE 
TO authenticated 
USING (assignee_id = auth.uid() OR created_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Tasks can be deleted by admin" 
ON public.tasks FOR DELETE 
TO authenticated 
USING (public.is_admin(auth.uid()));

-- Documents policies
CREATE POLICY "Documents are viewable by authenticated users" 
ON public.documents FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Documents can be created by authenticated users" 
ON public.documents FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Documents can be updated by uploader or admin" 
ON public.documents FOR UPDATE 
TO authenticated 
USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "Documents can be deleted by uploader or admin" 
ON public.documents FOR DELETE 
TO authenticated 
USING (uploaded_by = auth.uid() OR public.is_admin(auth.uid()));

-- Consultations policies
CREATE POLICY "Consultations are viewable by authenticated users" 
ON public.consultations FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Consultations can be created by authenticated users" 
ON public.consultations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Consultations can be updated by practitioner or admin" 
ON public.consultations FOR UPDATE 
TO authenticated 
USING (
  practitioner_id IN (SELECT id FROM practitioners WHERE user_id = auth.uid()) 
  OR public.is_admin(auth.uid())
);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own preferences" 
ON public.user_preferences FOR ALL 
TO authenticated 
USING (user_id = auth.uid());

-- Notification preferences policies
CREATE POLICY "Users can view their own notification preferences" 
ON public.notification_preferences FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own notification preferences" 
ON public.notification_preferences FOR ALL 
TO authenticated 
USING (user_id = auth.uid());

-- Practitioner availability policies
CREATE POLICY "Practitioner availability is viewable by authenticated users" 
ON public.practitioner_availability FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Practitioner availability can be managed by practitioner or admin" 
ON public.practitioner_availability FOR ALL 
TO authenticated 
USING (
  practitioner_id IN (SELECT id FROM practitioners WHERE user_id = auth.uid()) 
  OR public.is_admin(auth.uid())
);

-- Practitioner exceptions policies
CREATE POLICY "Practitioner exceptions are viewable by authenticated users" 
ON public.practitioner_exceptions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Practitioner exceptions can be managed by practitioner or admin" 
ON public.practitioner_exceptions FOR ALL 
TO authenticated 
USING (
  practitioner_id IN (SELECT id FROM practitioners WHERE user_id = auth.uid()) 
  OR public.is_admin(auth.uid())
);

-- Patient antecedents policies
CREATE POLICY "Patient antecedents are viewable by authenticated users" 
ON public.patient_antecedents FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Patient antecedents can be managed by authenticated users" 
ON public.patient_antecedents FOR ALL 
TO authenticated 
USING (true);

-- Patient memos policies
CREATE POLICY "Patient memos are viewable by authenticated users" 
ON public.patient_memos FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Patient memos can be managed by authenticated users" 
ON public.patient_memos FOR ALL 
TO authenticated 
USING (true);