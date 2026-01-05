-- Create enum for antecedent categories
CREATE TYPE public.antecedent_category AS ENUM (
  'medical',
  'cardiovascular', 
  'surgical',
  'allergies',
  'family',
  'lifestyle'
);

-- Create enum for severity levels
CREATE TYPE public.antecedent_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Create antecedents table
CREATE TABLE public.patient_antecedents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL,
  category public.antecedent_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  occurrence_date DATE,
  severity public.antecedent_severity DEFAULT 'low',
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient memos table
CREATE TABLE public.patient_memos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.patient_antecedents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_memos ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (public access for now - will be restricted when auth is implemented)
CREATE POLICY "Allow all access to patient_antecedents" 
ON public.patient_antecedents 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all access to patient_memos" 
ON public.patient_memos 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_patient_antecedents_patient_id ON public.patient_antecedents(patient_id);
CREATE INDEX idx_patient_antecedents_category ON public.patient_antecedents(category);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_patient_antecedents_updated_at
BEFORE UPDATE ON public.patient_antecedents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_memos_updated_at
BEFORE UPDATE ON public.patient_memos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();