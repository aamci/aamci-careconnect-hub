-- =============================================
-- PHASE 1: RBAC & AUDIT SYSTEM (CRITICAL)
-- =============================================

-- 1. User Roles Table (RBAC)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- 2. Audit Logs Table (Traceability)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    performed_by UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX idx_audit_logs_performed_by ON public.audit_logs(performed_by);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_record_id ON public.audit_logs(record_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs viewable by admins"
ON public.audit_logs FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Audit logs can be created by system"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================
-- PHASE 2: ORGANIZATIONS (Multi-Cabinet)
-- =============================================

-- 3. Organizations Table (without member policy first)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    type VARCHAR(50) DEFAULT 'cabinet',
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_organizations_slug ON public.organizations(slug);
CREATE INDEX idx_organizations_is_active ON public.organizations(is_active);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 4. Organization Members Table
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    permissions JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (organization_id, user_id)
);

CREATE INDEX idx_org_members_org_id ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user_id ON public.organization_members(user_id);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Now add policies for organizations (after organization_members exists)
CREATE POLICY "Organizations viewable by members"
ON public.organizations FOR SELECT
TO authenticated
USING (
    is_active = true 
    OR public.is_admin(auth.uid())
    OR id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Organizations manageable by admins"
ON public.organizations FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policies for organization_members
CREATE POLICY "Organization members viewable by org members"
ON public.organization_members FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR organization_id IN (
        SELECT organization_id FROM public.organization_members 
        WHERE user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
);

CREATE POLICY "Organization members manageable by org admins"
ON public.organization_members FOR ALL
TO authenticated
USING (
    public.is_admin(auth.uid())
    OR (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    )
);

-- =============================================
-- PHASE 3: MESSAGING SYSTEM
-- =============================================

-- 5. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL DEFAULT 'direct',
    title VARCHAR(255),
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    last_message_at TIMESTAMP WITH TIME ZONE,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_conversations_patient_id ON public.conversations(patient_id);
CREATE INDEX idx_conversations_org_id ON public.conversations(organization_id);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 6. Conversation Participants Table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_muted BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (conversation_id, user_id)
);

CREATE INDEX idx_conv_participants_conv_id ON public.conversation_participants(conversation_id);
CREATE INDEX idx_conv_participants_user_id ON public.conversation_participants(user_id);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Now add conversation policies
CREATE POLICY "Conversations viewable by participants"
ON public.conversations FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT conversation_id FROM public.conversation_participants 
        WHERE user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
);

CREATE POLICY "Conversations manageable by participants"
ON public.conversations FOR ALL
TO authenticated
USING (
    id IN (
        SELECT conversation_id FROM public.conversation_participants 
        WHERE user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
);

CREATE POLICY "Conversation participants viewable by participants"
ON public.conversation_participants FOR SELECT
TO authenticated
USING (
    conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants 
        WHERE user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
);

CREATE POLICY "Conversation participants manageable by conv admins"
ON public.conversation_participants FOR ALL
TO authenticated
USING (
    user_id = auth.uid()
    OR public.is_admin(auth.uid())
);

-- 7. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    metadata JSONB DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Messages viewable by conversation participants"
ON public.messages FOR SELECT
TO authenticated
USING (
    conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants 
        WHERE user_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
);

CREATE POLICY "Messages can be created by participants"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Messages can be updated by sender"
ON public.messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid());

-- =============================================
-- PHASE 4: BILLING SYSTEM
-- =============================================

-- 8. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL NOT NULL,
    practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'EUR',
    notes TEXT,
    payment_terms TEXT,
    billing_address JSONB,
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_invoices_patient_id ON public.invoices(patient_id);
CREATE INDEX idx_invoices_practitioner_id ON public.invoices(practitioner_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_issue_date ON public.invoices(issue_date DESC);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoices viewable by authenticated users"
ON public.invoices FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Invoices can be created by authenticated users"
ON public.invoices FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Invoices can be updated by creator or admin"
ON public.invoices FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.is_admin(auth.uid()));

-- 9. Invoice Items Table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    code VARCHAR(50),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invoice items follow invoice policy"
ON public.invoice_items FOR ALL
TO authenticated
USING (
    invoice_id IN (SELECT id FROM public.invoices)
);

-- 10. Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reference VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'completed',
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_patient_id ON public.payments(patient_id);
CREATE INDEX idx_payments_date ON public.payments(payment_date DESC);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payments viewable by authenticated users"
ON public.payments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Payments can be created by authenticated users"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Payments can be updated by creator or admin"
ON public.payments FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR public.is_admin(auth.uid()));

-- =============================================
-- PHASE 5: WAITING LIST & RECURRENCES
-- =============================================

-- 11. Waiting List Table
CREATE TABLE IF NOT EXISTS public.waiting_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE CASCADE,
    motif_id UUID REFERENCES public.appointment_motifs(id) ON DELETE SET NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    priority INTEGER DEFAULT 5,
    requested_date_from DATE,
    requested_date_to DATE,
    requested_time_from TIME,
    requested_time_to TIME,
    preferred_days INTEGER[],
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    contacted_at TIMESTAMP WITH TIME ZONE,
    scheduled_appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_waiting_list_patient_id ON public.waiting_list(patient_id);
CREATE INDEX idx_waiting_list_practitioner_id ON public.waiting_list(practitioner_id);
CREATE INDEX idx_waiting_list_status ON public.waiting_list(status);
CREATE INDEX idx_waiting_list_priority ON public.waiting_list(priority);

ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Waiting list viewable by authenticated users"
ON public.waiting_list FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Waiting list manageable by authenticated users"
ON public.waiting_list FOR ALL
TO authenticated
USING (true);

-- 12. Appointment Recurrences Table
CREATE TABLE IF NOT EXISTS public.appointment_recurrences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE CASCADE NOT NULL,
    motif_id UUID REFERENCES public.appointment_motifs(id) ON DELETE SET NULL NOT NULL,
    site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    recurrence_pattern VARCHAR(50) NOT NULL,
    day_of_week INTEGER,
    day_of_month INTEGER,
    time_slot TIME NOT NULL,
    duration INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    max_occurrences INTEGER,
    occurrences_created INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_recurrences_patient_id ON public.appointment_recurrences(patient_id);
CREATE INDEX idx_recurrences_practitioner_id ON public.appointment_recurrences(practitioner_id);
CREATE INDEX idx_recurrences_is_active ON public.appointment_recurrences(is_active);

ALTER TABLE public.appointment_recurrences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recurrences viewable by authenticated users"
ON public.appointment_recurrences FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Recurrences manageable by authenticated users"
ON public.appointment_recurrences FOR ALL
TO authenticated
USING (true);

-- =============================================
-- PHASE 6: MEDICAL TABLES
-- =============================================

-- 13. Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL NOT NULL,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'medication',
    content JSONB NOT NULL DEFAULT '[]',
    start_date DATE,
    end_date DATE,
    duration_days INTEGER,
    renewable BOOLEAN DEFAULT false,
    renewal_count INTEGER DEFAULT 0,
    max_renewals INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    notes TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_practitioner_id ON public.prescriptions(practitioner_id);
CREATE INDEX idx_prescriptions_status ON public.prescriptions(status);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prescriptions viewable by authenticated users"
ON public.prescriptions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Prescriptions can be created by authenticated users"
ON public.prescriptions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Prescriptions can be updated by practitioner or admin"
ON public.prescriptions FOR UPDATE
TO authenticated
USING (
    practitioner_id IN (
        SELECT id FROM public.practitioners WHERE user_id = auth.uid()
    ) 
    OR public.is_admin(auth.uid())
);

-- 14. Vaccinations Table
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL,
    vaccine_name VARCHAR(255) NOT NULL,
    vaccine_code VARCHAR(50),
    batch_number VARCHAR(100),
    manufacturer VARCHAR(255),
    administration_date DATE NOT NULL,
    administration_site VARCHAR(100),
    dose_number INTEGER DEFAULT 1,
    next_dose_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_vaccinations_patient_id ON public.vaccinations(patient_id);
CREATE INDEX idx_vaccinations_date ON public.vaccinations(administration_date DESC);

ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vaccinations viewable by authenticated users"
ON public.vaccinations FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Vaccinations manageable by authenticated users"
ON public.vaccinations FOR ALL
TO authenticated
USING (true);

-- 15. Vital Signs Table
CREATE TABLE IF NOT EXISTS public.vital_signs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    recorded_by UUID REFERENCES auth.users(id),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    weight_kg DECIMAL(5, 2),
    height_cm DECIMAL(5, 1),
    bmi DECIMAL(4, 1),
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    heart_rate INTEGER,
    temperature_c DECIMAL(4, 1),
    respiratory_rate INTEGER,
    oxygen_saturation INTEGER,
    blood_glucose DECIMAL(5, 1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_vital_signs_patient_id ON public.vital_signs(patient_id);
CREATE INDEX idx_vital_signs_recorded_at ON public.vital_signs(recorded_at DESC);

ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vital signs viewable by authenticated users"
ON public.vital_signs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Vital signs can be created by authenticated users"
ON public.vital_signs FOR INSERT
TO authenticated
WITH CHECK (true);

-- 16. Lab Results Table
CREATE TABLE IF NOT EXISTS public.lab_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
    practitioner_id UUID REFERENCES public.practitioners(id) ON DELETE SET NULL,
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    lab_name VARCHAR(255),
    test_date DATE NOT NULL,
    received_date DATE,
    category VARCHAR(100),
    results JSONB NOT NULL DEFAULT '[]',
    interpretation TEXT,
    is_abnormal BOOLEAN DEFAULT false,
    reviewed_by UUID REFERENCES auth.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_lab_results_patient_id ON public.lab_results(patient_id);
CREATE INDEX idx_lab_results_test_date ON public.lab_results(test_date DESC);
CREATE INDEX idx_lab_results_status ON public.lab_results(status);

ALTER TABLE public.lab_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lab results viewable by authenticated users"
ON public.lab_results FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Lab results manageable by authenticated users"
ON public.lab_results FOR ALL
TO authenticated
USING (true);

-- =============================================
-- PHASE 7: STORAGE BUCKET
-- =============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- PHASE 8: TRIGGERS
-- =============================================

CREATE TRIGGER set_updated_at_user_roles
BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_organizations
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_organization_members
BEFORE UPDATE ON public.organization_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_conversations
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_messages
BEFORE UPDATE ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_invoices
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_payments
BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_waiting_list
BEFORE UPDATE ON public.waiting_list
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_appointment_recurrences
BEFORE UPDATE ON public.appointment_recurrences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_prescriptions
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_vaccinations
BEFORE UPDATE ON public.vaccinations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at_lab_results
BEFORE UPDATE ON public.lab_results
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- PHASE 9: INVOICE NUMBER GENERATOR
-- =============================================

CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1000;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.invoice_number_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER generate_invoice_number_trigger
BEFORE INSERT ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.generate_invoice_number();