-- =====================================================
-- PHASE 1: MODÈLE ALLERGIES NORMALISÉ
-- =====================================================

-- 1.1 Référentiel des allergènes (liste contrôlée)
CREATE TABLE IF NOT EXISTS public.allergen_reference (
    code VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'medication',
    is_common BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2 Allergies patients (table pivot normalisée)
CREATE TABLE IF NOT EXISTS public.patient_allergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    allergen_code VARCHAR(50) NOT NULL REFERENCES public.allergen_reference(code),
    severity public.antecedent_severity NOT NULL DEFAULT 'medium',
    reaction_description TEXT,
    confirmed_date DATE,
    confirmed_by UUID,
    source VARCHAR(50) NOT NULL DEFAULT 'manual',
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(patient_id, allergen_code)
);

-- 1.3 Index pour performance
CREATE INDEX IF NOT EXISTS idx_patient_allergies_patient ON public.patient_allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_allergies_allergen ON public.patient_allergies(allergen_code);
CREATE INDEX IF NOT EXISTS idx_patient_allergies_active ON public.patient_allergies(patient_id) WHERE is_active = true;

-- 1.4 RLS sur patient_allergies
ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patient allergies"
    ON public.patient_allergies FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can manage patient allergies"
    ON public.patient_allergies FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 1.5 RLS sur allergen_reference
ALTER TABLE public.allergen_reference ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view allergen reference"
    ON public.allergen_reference FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage allergen reference"
    ON public.allergen_reference FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 1.6 Trigger updated_at pour patient_allergies
CREATE TRIGGER update_patient_allergies_updated_at
    BEFORE UPDATE ON public.patient_allergies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 2: DONNÉES DE RÉFÉRENCE ALLERGÈNES
-- =====================================================

INSERT INTO public.allergen_reference (code, name, category, is_common) VALUES
    ('PENICILLIN', 'Pénicilline', 'medication', true),
    ('AMOXICILLIN', 'Amoxicilline', 'medication', true),
    ('ASPIRIN', 'Aspirine', 'medication', true),
    ('IBUPROFEN', 'Ibuprofène', 'medication', true),
    ('SULFONAMIDES', 'Sulfamides', 'medication', true),
    ('CEPHALOSPORINS', 'Céphalosporines', 'medication', true),
    ('CODEINE', 'Codéine', 'medication', false),
    ('MORPHINE', 'Morphine', 'medication', false),
    ('NSAIDS', 'Anti-inflammatoires non stéroïdiens', 'medication', true),
    ('LATEX', 'Latex', 'material', true),
    ('IODINE', 'Iode / Produits de contraste', 'medication', true),
    ('PEANUTS', 'Arachides', 'food', true),
    ('TREE_NUTS', 'Fruits à coque', 'food', true),
    ('SHELLFISH', 'Crustacés', 'food', true),
    ('EGGS', 'Œufs', 'food', true),
    ('MILK', 'Lait', 'food', true),
    ('GLUTEN', 'Gluten', 'food', true),
    ('SOY', 'Soja', 'food', false),
    ('FISH', 'Poissons', 'food', false),
    ('POLLEN', 'Pollens', 'environmental', true),
    ('DUST_MITES', 'Acariens', 'environmental', true),
    ('ANIMAL_DANDER', 'Poils d''animaux', 'environmental', true),
    ('MOLD', 'Moisissures', 'environmental', false),
    ('OTHER', 'Autre (préciser)', 'other', false)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- PHASE 3: VUES DÉTERMINISTES (SOURCE DE VÉRITÉ)
-- =====================================================

-- 3.1 Vue alertes actives
CREATE OR REPLACE VIEW public.v_active_patient_alerts AS
SELECT 
    pa.id,
    pa.patient_id,
    pa.type,
    pa.message,
    pa.severity,
    pa.created_at,
    pa.created_by
FROM public.patient_alerts pa
WHERE pa.is_active = true
  AND pa.resolved_at IS NULL;

-- 3.2 Vue allergies actives avec infos allergène
CREATE OR REPLACE VIEW public.v_active_patient_allergies AS
SELECT 
    pal.id,
    pal.patient_id,
    pal.allergen_code,
    ar.name AS allergen_name,
    ar.category AS allergen_category,
    pal.severity,
    pal.reaction_description,
    pal.confirmed_date,
    pal.source,
    pal.created_at
FROM public.patient_allergies pal
JOIN public.allergen_reference ar ON ar.code = pal.allergen_code
WHERE pal.is_active = true;

-- 3.3 Vue consolidée patient avec compteurs
CREATE OR REPLACE VIEW public.v_patient_summary AS
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.gender,
    p.phone,
    p.email,
    p.is_active,
    COALESCE(alert_counts.active_alerts_count, 0) AS active_alerts_count,
    COALESCE(allergy_counts.active_allergies_count, 0) AS active_allergies_count,
    p.created_at,
    p.updated_at
FROM public.patients p
LEFT JOIN (
    SELECT patient_id, COUNT(*) AS active_alerts_count
    FROM public.v_active_patient_alerts
    GROUP BY patient_id
) alert_counts ON alert_counts.patient_id = p.id
LEFT JOIN (
    SELECT patient_id, COUNT(*) AS active_allergies_count
    FROM public.v_active_patient_allergies
    GROUP BY patient_id
) allergy_counts ON allergy_counts.patient_id = p.id
WHERE p.is_active = true;

-- =====================================================
-- PHASE 4: MIGRATION DONNÉES EXISTANTES
-- =====================================================

-- 4.1 Migrer alertes pénicilline vers patient_allergies
INSERT INTO public.patient_allergies (patient_id, allergen_code, severity, reaction_description, source, created_by, created_at)
SELECT DISTINCT
    pa.patient_id,
    'PENICILLIN',
    CASE 
        WHEN pa.severity = 'critical' THEN 'critical'::public.antecedent_severity
        WHEN pa.severity = 'warning' THEN 'high'::public.antecedent_severity
        ELSE 'medium'::public.antecedent_severity
    END,
    pa.message,
    'migrated',
    pa.created_by,
    pa.created_at
FROM public.patient_alerts pa
WHERE pa.type = 'medical' 
  AND pa.is_active = true
  AND (LOWER(pa.message) LIKE '%pénicilline%' OR LOWER(pa.message) LIKE '%penicillin%')
ON CONFLICT (patient_id, allergen_code) DO NOTHING;

-- 4.2 Marquer alertes migrées comme résolues
UPDATE public.patient_alerts
SET 
    is_active = false,
    resolved_at = now(),
    updated_at = now()
WHERE type = 'medical'
  AND is_active = true
  AND (LOWER(message) LIKE '%pénicilline%' OR LOWER(message) LIKE '%penicillin%');

-- =====================================================
-- PHASE 5: FONCTION HELPER COMPTAGE RAPIDE
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_patient_alert_counts(p_patient_id UUID)
RETURNS TABLE(active_alerts INT, active_allergies INT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        COALESCE((SELECT COUNT(*)::INT FROM v_active_patient_alerts WHERE patient_id = p_patient_id), 0),
        COALESCE((SELECT COUNT(*)::INT FROM v_active_patient_allergies WHERE patient_id = p_patient_id), 0);
$$;