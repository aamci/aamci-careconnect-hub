-- =====================================================
-- MIGRATION: Tables Antecedents Medicaux Doctolib-Level
-- Date: 2026-01-18
-- Version: 1.0
-- =====================================================

-- =====================================================
-- PHASE 1: PATIENT_CONDITIONS (Antecedents Medicaux)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Codage medical (CIM-10, CISP-2)
  cim10_code VARCHAR(20),
  cim10_label TEXT,
  cisp2_code VARCHAR(20),
  cisp2_label TEXT,

  -- Donnees cliniques
  title TEXT NOT NULL,
  description TEXT,
  onset_date DATE,
  resolution_date DATE,

  -- Statut clinique
  clinical_status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (clinical_status IN ('active', 'remission', 'resolved', 'inactive')),
  verification_status VARCHAR(50) NOT NULL DEFAULT 'confirmed'
    CHECK (verification_status IN ('provisional', 'differential', 'confirmed', 'refuted')),
  severity public.antecedent_severity DEFAULT 'medium',

  -- ALD (Affection Longue Duree)
  is_ald BOOLEAN DEFAULT FALSE,
  ald_number INTEGER,
  ald_start_date DATE,
  ald_end_date DATE,

  -- Affichage
  is_pinned BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_patient_conditions_patient ON public.patient_conditions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_conditions_cim10 ON public.patient_conditions(cim10_code) WHERE cim10_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_patient_conditions_status ON public.patient_conditions(patient_id, clinical_status);

-- RLS
ALTER TABLE public.patient_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patient conditions"
  ON public.patient_conditions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage patient conditions"
  ON public.patient_conditions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger updated_at
CREATE TRIGGER update_patient_conditions_updated_at
  BEFORE UPDATE ON public.patient_conditions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 2: PATIENT_PROCEDURES (Antecedents Chirurgicaux)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Codage CCAM
  ccam_code VARCHAR(20),
  ccam_label TEXT,

  -- Donnees
  title TEXT NOT NULL,
  description TEXT,
  procedure_date DATE,
  hospital_name TEXT,
  surgeon_name TEXT,
  anesthesia_type VARCHAR(50), -- general, local, regional, sedation

  -- Complications
  had_complications BOOLEAN DEFAULT FALSE,
  complications_description TEXT,

  -- Affichage
  is_pinned BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_patient_procedures_patient ON public.patient_procedures(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_procedures_ccam ON public.patient_procedures(ccam_code) WHERE ccam_code IS NOT NULL;

-- RLS
ALTER TABLE public.patient_procedures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patient procedures"
  ON public.patient_procedures FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage patient procedures"
  ON public.patient_procedures FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_patient_procedures_updated_at
  BEFORE UPDATE ON public.patient_procedures
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 3: PATIENT_FAMILY_HISTORY (Histoire Familiale)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_family_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Codage
  cim10_code VARCHAR(20),
  cim10_label TEXT,

  -- Donnees
  condition_name TEXT NOT NULL,
  relative_type VARCHAR(50) NOT NULL
    CHECK (relative_type IN ('father', 'mother', 'sibling', 'grandparent_paternal', 'grandparent_maternal', 'uncle_aunt', 'child', 'other')),
  relative_name TEXT,
  age_at_onset INTEGER,
  is_deceased BOOLEAN DEFAULT FALSE,
  age_at_death INTEGER,
  death_cause TEXT,
  notes TEXT,

  -- Affichage
  is_pinned BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_patient_family_history_patient ON public.patient_family_history(patient_id);

-- RLS
ALTER TABLE public.patient_family_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view family history"
  ON public.patient_family_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage family history"
  ON public.patient_family_history FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_patient_family_history_updated_at
  BEFORE UPDATE ON public.patient_family_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 4: PATIENT_DEVICES (Dispositifs Medicaux)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Type de dispositif
  device_type VARCHAR(100) NOT NULL
    CHECK (device_type IN ('pacemaker', 'defibrillator', 'hip_prosthesis', 'knee_prosthesis',
      'cochlear_implant', 'dental_implant', 'intraocular_lens', 'vascular_stent',
      'insulin_pump', 'port_a_cath', 'other')),
  device_name TEXT NOT NULL,

  -- Details
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  implant_date DATE,
  body_location TEXT,

  -- Compatibilite
  mri_compatible BOOLEAN,
  mri_conditions TEXT,

  -- Suivi
  next_checkup_date DATE,
  battery_end_date DATE,

  -- Etat
  is_active BOOLEAN DEFAULT TRUE,
  removal_date DATE,
  removal_reason TEXT,
  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_patient_devices_patient ON public.patient_devices(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_devices_active ON public.patient_devices(patient_id) WHERE is_active = true;

-- RLS
ALTER TABLE public.patient_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view patient devices"
  ON public.patient_devices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage patient devices"
  ON public.patient_devices FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_patient_devices_updated_at
  BEFORE UPDATE ON public.patient_devices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 5: PATIENT_LIFESTYLE (Mode de Vie)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_lifestyle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Tabac
  tobacco_status VARCHAR(50) CHECK (tobacco_status IN ('never', 'former', 'current', 'unknown')),
  tobacco_start_age INTEGER,
  tobacco_pack_years NUMERIC(5,2),
  tobacco_quit_date DATE,
  tobacco_notes TEXT,

  -- Alcool
  alcohol_status VARCHAR(50) CHECK (alcohol_status IN ('none', 'occasional', 'regular', 'excessive', 'former', 'unknown')),
  alcohol_units_per_week NUMERIC(5,2),
  alcohol_notes TEXT,

  -- Activite physique
  physical_activity_level VARCHAR(50) CHECK (physical_activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
  physical_activity_type TEXT,
  physical_activity_frequency TEXT,

  -- Alimentation
  diet_type VARCHAR(100),
  diet_restrictions TEXT,

  -- Sommeil
  sleep_hours_avg NUMERIC(3,1),
  sleep_quality VARCHAR(50) CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),

  -- Stress
  stress_level VARCHAR(50) CHECK (stress_level IN ('low', 'moderate', 'high', 'very_high')),
  occupation TEXT,

  -- General
  notes TEXT,

  -- Audit
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT patient_lifestyle_unique UNIQUE(patient_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_patient_lifestyle_patient ON public.patient_lifestyle(patient_id);

-- RLS
ALTER TABLE public.patient_lifestyle ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view lifestyle"
  ON public.patient_lifestyle FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage lifestyle"
  ON public.patient_lifestyle FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_patient_lifestyle_updated_at
  BEFORE UPDATE ON public.patient_lifestyle
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 6: PATIENT_CVD_RISK (Risque Cardiovasculaire)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_cvd_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Facteurs de risque
  has_hypertension BOOLEAN DEFAULT FALSE,
  has_diabetes BOOLEAN DEFAULT FALSE,
  diabetes_type VARCHAR(20), -- type1, type2, gestational
  has_dyslipidemia BOOLEAN DEFAULT FALSE,
  has_obesity BOOLEAN DEFAULT FALSE,
  has_family_history_cvd BOOLEAN DEFAULT FALSE,
  family_history_details TEXT,

  -- Mesures biologiques
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

  -- Score de risque
  score_type VARCHAR(50), -- SCORE2, SCORE2-OP, Framingham, QRISK3
  score_value NUMERIC(5,2),
  score_date DATE,
  risk_category VARCHAR(50) CHECK (risk_category IN ('low', 'moderate', 'high', 'very_high')),

  -- Objectifs therapeutiques
  target_ldl NUMERIC(5,2),
  target_bp_systolic INTEGER,
  target_bp_diastolic INTEGER,
  target_hba1c NUMERIC(4,2),

  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT patient_cvd_risk_unique UNIQUE(patient_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_patient_cvd_risk_patient ON public.patient_cvd_risk(patient_id);

-- RLS
ALTER TABLE public.patient_cvd_risk ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cvd risk"
  ON public.patient_cvd_risk FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage cvd risk"
  ON public.patient_cvd_risk FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_patient_cvd_risk_updated_at
  BEFORE UPDATE ON public.patient_cvd_risk
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 7: PATIENT_PERINATAL (Info Perinatales)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_perinatal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Naissance
  birth_weight_grams INTEGER,
  birth_height_cm INTEGER,
  birth_term_weeks INTEGER,
  birth_term_days INTEGER,
  birth_type VARCHAR(50) CHECK (birth_type IN ('vaginal', 'cesarean_planned', 'cesarean_emergency', 'instrumental')),

  -- Scores
  apgar_1min INTEGER CHECK (apgar_1min >= 0 AND apgar_1min <= 10),
  apgar_5min INTEGER CHECK (apgar_5min >= 0 AND apgar_5min <= 10),
  apgar_10min INTEGER CHECK (apgar_10min >= 0 AND apgar_10min <= 10),

  -- Complications
  neonatal_complications TEXT,
  neonatal_hospitalization BOOLEAN DEFAULT FALSE,
  neonatal_hospitalization_days INTEGER,
  maternal_complications TEXT,

  -- Allaitement
  breastfeeding_duration_months INTEGER,

  -- Grossesse
  pregnancy_complications TEXT,
  gestational_diabetes BOOLEAN DEFAULT FALSE,
  preeclampsia BOOLEAN DEFAULT FALSE,

  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  CONSTRAINT patient_perinatal_unique UNIQUE(patient_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_patient_perinatal_patient ON public.patient_perinatal(patient_id);

-- RLS
ALTER TABLE public.patient_perinatal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view perinatal"
  ON public.patient_perinatal FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage perinatal"
  ON public.patient_perinatal FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PHASE 8: PATIENT_GYNECOLOGICAL (Antecedents Gyneco)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.patient_gynecological (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,

  -- Cycle menstruel
  menarche_age INTEGER,
  menopause_age INTEGER,
  is_menopausal BOOLEAN DEFAULT FALSE,
  cycle_regularity VARCHAR(50) CHECK (cycle_regularity IN ('regular', 'irregular', 'amenorrhea')),

  -- Obstetrique (GPAP)
  gravidity INTEGER DEFAULT 0, -- Nombre de grossesses
  parity INTEGER DEFAULT 0,    -- Nombre d'accouchements
  abortions INTEGER DEFAULT 0, -- Fausses couches + IVG
  living_children INTEGER DEFAULT 0,

  -- Depistage col
  last_pap_smear_date DATE,
  last_pap_smear_result VARCHAR(100),
  last_hpv_test_date DATE,
  last_hpv_test_result VARCHAR(100),
  hpv_vaccination BOOLEAN,
  hpv_vaccination_date DATE,

  -- Depistage sein
  last_mammogram_date DATE,
  last_mammogram_result VARCHAR(100),
  has_breast_implants BOOLEAN DEFAULT FALSE,

  -- Contraception
  contraception_method VARCHAR(100),
  contraception_start_date DATE,

  -- Antecedents gyneco
  gyneco_surgeries TEXT,
  sti_history TEXT,

  notes TEXT,

  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT patient_gynecological_unique UNIQUE(patient_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_patient_gynecological_patient ON public.patient_gynecological(patient_id);

-- RLS
ALTER TABLE public.patient_gynecological ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gynecological"
  ON public.patient_gynecological FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage gynecological"
  ON public.patient_gynecological FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger
CREATE TRIGGER update_patient_gynecological_updated_at
  BEFORE UPDATE ON public.patient_gynecological
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PHASE 9: VUE CONSOLIDEE ANTECEDENTS
-- =====================================================

CREATE OR REPLACE VIEW public.v_patient_medical_history_summary AS
SELECT
  p.id AS patient_id,
  p.first_name,
  p.last_name,
  p.gender,
  p.date_of_birth,
  -- Compteurs
  (SELECT COUNT(*) FROM public.patient_conditions WHERE patient_id = p.id AND clinical_status = 'active') AS active_conditions_count,
  (SELECT COUNT(*) FROM public.patient_procedures WHERE patient_id = p.id) AS procedures_count,
  (SELECT COUNT(*) FROM public.patient_family_history WHERE patient_id = p.id) AS family_history_count,
  (SELECT COUNT(*) FROM public.patient_devices WHERE patient_id = p.id AND is_active = true) AS active_devices_count,
  (SELECT COUNT(*) FROM public.v_active_patient_allergies WHERE patient_id = p.id) AS allergies_count,
  -- Flags importants
  (SELECT COUNT(*) > 0 FROM public.patient_conditions WHERE patient_id = p.id AND is_ald = true) AS has_ald,
  (SELECT COUNT(*) > 0 FROM public.patient_devices WHERE patient_id = p.id AND is_active = true AND mri_compatible = false) AS has_mri_incompatible_device,
  -- Lifestyle summary
  (SELECT tobacco_status FROM public.patient_lifestyle WHERE patient_id = p.id) AS tobacco_status,
  (SELECT alcohol_status FROM public.patient_lifestyle WHERE patient_id = p.id) AS alcohol_status,
  -- CVD Risk
  (SELECT risk_category FROM public.patient_cvd_risk WHERE patient_id = p.id) AS cvd_risk_category
FROM public.patients p
WHERE p.is_active = true;

-- =====================================================
-- FIN DE MIGRATION
-- =====================================================

-- Verification
DO $$
BEGIN
  RAISE NOTICE 'Migration terminee avec succes!';
  RAISE NOTICE 'Tables creees: patient_conditions, patient_procedures, patient_family_history, patient_devices, patient_lifestyle, patient_cvd_risk, patient_perinatal, patient_gynecological';
  RAISE NOTICE 'Vue creee: v_patient_medical_history_summary';
END $$;
