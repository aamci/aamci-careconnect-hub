/**
 * Allergies Service
 * Handles CRUD operations for patient allergies with normalized data model
 * Source of truth: patient_allergies table + allergen_reference
 */

import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from './baseService';

// ==================== TYPES ====================

export interface Allergen {
  code: string;
  name: string;
  category: 'medication' | 'food' | 'environmental' | 'material' | 'other';
  isCommon: boolean;
}

export interface PatientAllergy {
  id: string;
  patientId: string;
  allergenCode: string;
  allergenName: string;
  allergenCategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reactionDescription?: string;
  confirmedDate?: Date;
  source: 'manual' | 'import' | 'lab' | 'migrated';
  isActive: boolean;
  createdAt: Date;
}

interface DbAllergen {
  code: string;
  name: string;
  category: string;
  is_common: boolean;
}

interface DbPatientAllergy {
  id: string;
  patient_id: string;
  allergen_code: string;
  allergen_name?: string;
  allergen_category?: string;
  severity: string;
  reaction_description: string | null;
  confirmed_date: string | null;
  source: string;
  is_active: boolean;
  created_at: string;
}

// ==================== MAPPERS ====================

function mapDbToAllergen(db: DbAllergen): Allergen {
  return {
    code: db.code,
    name: db.name,
    category: db.category as Allergen['category'],
    isCommon: db.is_common,
  };
}

function mapDbToPatientAllergy(db: DbPatientAllergy): PatientAllergy {
  return {
    id: db.id,
    patientId: db.patient_id,
    allergenCode: db.allergen_code,
    allergenName: db.allergen_name || db.allergen_code,
    allergenCategory: db.allergen_category || 'other',
    severity: db.severity as PatientAllergy['severity'],
    reactionDescription: db.reaction_description || undefined,
    confirmedDate: db.confirmed_date ? new Date(db.confirmed_date) : undefined,
    source: db.source as PatientAllergy['source'],
    isActive: db.is_active,
    createdAt: new Date(db.created_at),
  };
}

// ==================== QUERIES ====================

/**
 * Fetch all available allergens from the reference table
 */
export async function fetchAllergenReference(): Promise<Allergen[]> {
  const { data, error } = await supabase
    .from('allergen_reference')
    .select('*')
    .order('is_common', { ascending: false })
    .order('name');

  if (error) {
    console.error('[Allergies] Error fetching allergen reference:', error);
    throw error;
  }

  return (data || []).map(mapDbToAllergen);
}

/**
 * Fetch common allergens only (for quick selection UI)
 */
export async function fetchCommonAllergens(): Promise<Allergen[]> {
  const { data, error } = await supabase
    .from('allergen_reference')
    .select('*')
    .eq('is_common', true)
    .order('name');

  if (error) {
    console.error('[Allergies] Error fetching common allergens:', error);
    throw error;
  }

  return (data || []).map(mapDbToAllergen);
}

/**
 * Fetch active allergies for a patient using the view (source of truth)
 */
export async function fetchPatientAllergies(patientId: string): Promise<PatientAllergy[]> {
  const { data, error } = await supabase
    .from('v_active_patient_allergies')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Allergies] Error fetching patient allergies:', error);
    throw error;
  }

  return (data || []).map((item) => ({
    id: item.id,
    patientId: item.patient_id,
    allergenCode: item.allergen_code,
    allergenName: item.allergen_name || item.allergen_code,
    allergenCategory: item.allergen_category || 'other',
    severity: item.severity as PatientAllergy['severity'],
    reactionDescription: item.reaction_description || undefined,
    confirmedDate: item.confirmed_date ? new Date(item.confirmed_date) : undefined,
    source: item.source as PatientAllergy['source'],
    isActive: true,
    createdAt: new Date(item.created_at),
  }));
}

/**
 * Fetch all allergies for a patient (including inactive)
 */
export async function fetchPatientAllergiesHistory(patientId: string): Promise<PatientAllergy[]> {
  const { data, error } = await supabase
    .from('patient_allergies')
    .select(`
      *,
      allergen_reference!inner(name, category)
    `)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Allergies] Error fetching patient allergies history:', error);
    throw error;
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    patientId: item.patient_id,
    allergenCode: item.allergen_code,
    allergenName: item.allergen_reference?.name || item.allergen_code,
    allergenCategory: item.allergen_reference?.category || 'other',
    severity: item.severity as PatientAllergy['severity'],
    reactionDescription: item.reaction_description || undefined,
    confirmedDate: item.confirmed_date ? new Date(item.confirmed_date) : undefined,
    source: item.source as PatientAllergy['source'],
    isActive: item.is_active,
    createdAt: new Date(item.created_at),
  }));
}

// ==================== MUTATIONS ====================

export interface CreateAllergyInput {
  allergenCode: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reactionDescription?: string;
  confirmedDate?: Date;
  notes?: string;
}

/**
 * Add an allergy to a patient
 */
export async function createPatientAllergy(
  patientId: string,
  input: CreateAllergyInput
): Promise<PatientAllergy> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('patient_allergies')
    .insert({
      patient_id: patientId,
      allergen_code: input.allergenCode,
      severity: input.severity,
      reaction_description: input.reactionDescription,
      confirmed_date: input.confirmedDate?.toISOString().split('T')[0],
      notes: input.notes,
      source: 'manual',
      created_by: userId,
    })
    .select(`
      *,
      allergen_reference!inner(name, category)
    `)
    .single();

  if (error) {
    console.error('[Allergies] Error creating patient allergy:', error);
    throw error;
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    allergenCode: data.allergen_code,
    allergenName: (data as any).allergen_reference?.name || data.allergen_code,
    allergenCategory: (data as any).allergen_reference?.category || 'other',
    severity: data.severity as PatientAllergy['severity'],
    reactionDescription: data.reaction_description || undefined,
    confirmedDate: data.confirmed_date ? new Date(data.confirmed_date) : undefined,
    source: data.source as PatientAllergy['source'],
    isActive: data.is_active ?? true,
    createdAt: new Date(data.created_at),
  };
}

/**
 * Update an existing allergy
 */
export async function updatePatientAllergy(
  allergyId: string,
  updates: Partial<CreateAllergyInput>
): Promise<void> {
  const { error } = await supabase
    .from('patient_allergies')
    .update({
      severity: updates.severity,
      reaction_description: updates.reactionDescription,
      confirmed_date: updates.confirmedDate?.toISOString().split('T')[0],
      notes: updates.notes,
    })
    .eq('id', allergyId);

  if (error) {
    console.error('[Allergies] Error updating patient allergy:', error);
    throw error;
  }
}

/**
 * Deactivate an allergy (soft delete)
 */
export async function deactivatePatientAllergy(allergyId: string): Promise<void> {
  const { error } = await supabase
    .from('patient_allergies')
    .update({ is_active: false })
    .eq('id', allergyId);

  if (error) {
    console.error('[Allergies] Error deactivating patient allergy:', error);
    throw error;
  }
}

/**
 * Reactivate a previously deactivated allergy
 */
export async function reactivatePatientAllergy(allergyId: string): Promise<void> {
  const { error } = await supabase
    .from('patient_allergies')
    .update({ is_active: true })
    .eq('id', allergyId);

  if (error) {
    console.error('[Allergies] Error reactivating patient allergy:', error);
    throw error;
  }
}

// ==================== ANALYTICS / DATA QUALITY ====================

/**
 * Get allergy distribution statistics (for data quality monitoring)
 */
export async function getAllergyDistribution(): Promise<{ code: string; name: string; count: number }[]> {
  const { data, error } = await supabase
    .from('v_active_patient_allergies')
    .select('allergen_code, allergen_name');

  if (error) {
    console.error('[Allergies] Error fetching allergy distribution:', error);
    throw error;
  }

  const counts = (data || []).reduce((acc, item) => {
    const key = item.allergen_code;
    if (!acc[key]) {
      acc[key] = { code: key, name: item.allergen_name || key, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {} as Record<string, { code: string; name: string; count: number }>);

  return Object.values(counts).sort((a, b) => b.count - a.count);
}

/**
 * Check if a patient has a specific allergy
 */
export async function patientHasAllergy(patientId: string, allergenCode: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('v_active_patient_allergies')
    .select('id')
    .eq('patient_id', patientId)
    .eq('allergen_code', allergenCode)
    .maybeSingle();

  if (error) {
    console.error('[Allergies] Error checking patient allergy:', error);
    return false;
  }

  return !!data;
}
