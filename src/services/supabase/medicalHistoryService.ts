/**
 * Medical History Service
 * Handles CRUD operations for patient medical history (Doctolib-level)
 *
 * Tables:
 * - patient_conditions (antecedents medicaux)
 * - patient_procedures (antecedents chirurgicaux)
 * - patient_family_history (histoire familiale)
 * - patient_devices (dispositifs medicaux)
 * - patient_lifestyle (mode de vie)
 * - patient_cvd_risk (risque cardiovasculaire)
 * - patient_perinatal (info perinatales)
 * - patient_gynecological (antecedents gyneco)
 */

import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserId } from './baseService';
import { logMedicalHistoryAudit } from './auditService';

// ============================================================================
// TYPES
// ============================================================================

export interface PatientCondition {
  id: string;
  patientId: string;
  cim10Code?: string;
  cim10Label?: string;
  cisp2Code?: string;
  cisp2Label?: string;
  title: string;
  description?: string;
  onsetDate?: Date;
  resolutionDate?: Date;
  clinicalStatus: 'active' | 'remission' | 'resolved' | 'inactive';
  verificationStatus: 'provisional' | 'differential' | 'confirmed' | 'refuted';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isAld: boolean;
  aldNumber?: number;
  aldStartDate?: Date;
  aldEndDate?: Date;
  isPinned: boolean;
  sortOrder: number;
  createdAt: Date;
  createdBy?: string;
}

export interface PatientProcedure {
  id: string;
  patientId: string;
  ccamCode?: string;
  ccamLabel?: string;
  title: string;
  description?: string;
  procedureDate?: Date;
  hospitalName?: string;
  surgeonName?: string;
  anesthesiaType?: 'general' | 'local' | 'regional' | 'sedation';
  hadComplications: boolean;
  complicationsDescription?: string;
  isPinned: boolean;
  sortOrder: number;
  createdAt: Date;
  createdBy?: string;
}

export interface PatientFamilyHistory {
  id: string;
  patientId: string;
  cim10Code?: string;
  cim10Label?: string;
  conditionName: string;
  relativeType: 'father' | 'mother' | 'sibling' | 'grandparent_paternal' | 'grandparent_maternal' | 'uncle_aunt' | 'child' | 'other';
  relativeName?: string;
  ageAtOnset?: number;
  isDeceased: boolean;
  ageAtDeath?: number;
  deathCause?: string;
  notes?: string;
  isPinned: boolean;
  sortOrder: number;
  createdAt: Date;
  createdBy?: string;
}

export interface PatientDevice {
  id: string;
  patientId: string;
  deviceType: string;
  deviceName: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  implantDate?: Date;
  bodyLocation?: string;
  mriCompatible?: boolean;
  mriConditions?: string;
  nextCheckupDate?: Date;
  batteryEndDate?: Date;
  isActive: boolean;
  removalDate?: Date;
  removalReason?: string;
  notes?: string;
  createdAt: Date;
  createdBy?: string;
}

export interface PatientLifestyle {
  id: string;
  patientId: string;
  tobaccoStatus?: 'never' | 'former' | 'current' | 'unknown';
  tobaccoStartAge?: number;
  tobaccoPackYears?: number;
  tobaccoQuitDate?: Date;
  tobaccoNotes?: string;
  alcoholStatus?: 'none' | 'occasional' | 'regular' | 'excessive' | 'former' | 'unknown';
  alcoholUnitsPerWeek?: number;
  alcoholNotes?: string;
  physicalActivityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  physicalActivityType?: string;
  physicalActivityFrequency?: string;
  dietType?: string;
  dietRestrictions?: string;
  sleepHoursAvg?: number;
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  stressLevel?: 'low' | 'moderate' | 'high' | 'very_high';
  occupation?: string;
  notes?: string;
  recordedAt: Date;
  createdBy?: string;
}

export interface PatientCvdRisk {
  id: string;
  patientId: string;
  hasHypertension: boolean;
  hasDiabetes: boolean;
  diabetesType?: 'type1' | 'type2' | 'gestational';
  hasDyslipidemia: boolean;
  hasObesity: boolean;
  hasFamilyHistoryCvd: boolean;
  familyHistoryDetails?: string;
  lastLdlValue?: number;
  lastLdlDate?: Date;
  lastHdlValue?: number;
  lastHdlDate?: Date;
  lastTriglyceridesValue?: number;
  lastTriglyceridesDate?: Date;
  lastHba1cValue?: number;
  lastHba1cDate?: Date;
  lastCreatinineValue?: number;
  lastCreatinineDate?: Date;
  scoreType?: string;
  scoreValue?: number;
  scoreDate?: Date;
  riskCategory?: 'low' | 'moderate' | 'high' | 'very_high';
  targetLdl?: number;
  targetBpSystolic?: number;
  targetBpDiastolic?: number;
  targetHba1c?: number;
  notes?: string;
  createdAt: Date;
  createdBy?: string;
}

// ============================================================================
// PATIENT CONDITIONS (Antecedents Medicaux)
// ============================================================================

export async function fetchPatientConditions(patientId: string): Promise<PatientCondition[]> {
  const { data, error } = await supabase
    .from('patient_conditions')
    .select('*')
    .eq('patient_id', patientId)
    .order('is_pinned', { ascending: false })
    .order('sort_order')
    .order('onset_date', { ascending: false });

  if (error) {
    console.error('[MedicalHistory] Error fetching conditions:', error);
    throw error;
  }

  return (data || []).map(mapDbToCondition);
}

export async function createPatientCondition(
  patientId: string,
  input: Omit<PatientCondition, 'id' | 'patientId' | 'createdAt' | 'createdBy'>
): Promise<PatientCondition> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('patient_conditions')
    .insert({
      patient_id: patientId,
      cim10_code: input.cim10Code,
      cim10_label: input.cim10Label,
      cisp2_code: input.cisp2Code,
      cisp2_label: input.cisp2Label,
      title: input.title,
      description: input.description,
      onset_date: input.onsetDate?.toISOString().split('T')[0],
      resolution_date: input.resolutionDate?.toISOString().split('T')[0],
      clinical_status: input.clinicalStatus,
      verification_status: input.verificationStatus,
      severity: input.severity,
      is_ald: input.isAld,
      ald_number: input.aldNumber,
      ald_start_date: input.aldStartDate?.toISOString().split('T')[0],
      ald_end_date: input.aldEndDate?.toISOString().split('T')[0],
      is_pinned: input.isPinned,
      sort_order: input.sortOrder,
      created_by: userId,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('[MedicalHistory] Error creating condition:', error);
    throw error;
  }

  // Audit log
  await logMedicalHistoryAudit({
    patientId,
    actionType: 'create',
    entityType: 'condition',
    entityId: data.id,
    newData: data,
  });

  return mapDbToCondition(data);
}

export async function updatePatientCondition(
  conditionId: string,
  updates: Partial<PatientCondition>
): Promise<void> {
  const { data: existing } = await supabase
    .from('patient_conditions')
    .select('*')
    .eq('id', conditionId)
    .single();

  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.clinicalStatus !== undefined) updateData.clinical_status = updates.clinicalStatus;
  if (updates.verificationStatus !== undefined) updateData.verification_status = updates.verificationStatus;
  if (updates.severity !== undefined) updateData.severity = updates.severity;
  if (updates.isAld !== undefined) updateData.is_ald = updates.isAld;
  if (updates.isPinned !== undefined) updateData.is_pinned = updates.isPinned;
  if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;

  const { data, error } = await supabase
    .from('patient_conditions')
    .update(updateData)
    .eq('id', conditionId)
    .select()
    .single();

  if (error) {
    console.error('[MedicalHistory] Error updating condition:', error);
    throw error;
  }

  // Audit log
  if (existing) {
    await logMedicalHistoryAudit({
      patientId: existing.patient_id,
      actionType: 'update',
      entityType: 'condition',
      entityId: conditionId,
      oldData: existing,
      newData: data,
    });
  }
}

export async function deletePatientCondition(conditionId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('patient_conditions')
    .select('*')
    .eq('id', conditionId)
    .single();

  const { error } = await supabase
    .from('patient_conditions')
    .delete()
    .eq('id', conditionId);

  if (error) {
    console.error('[MedicalHistory] Error deleting condition:', error);
    throw error;
  }

  // Audit log
  if (existing) {
    await logMedicalHistoryAudit({
      patientId: existing.patient_id,
      actionType: 'delete',
      entityType: 'condition',
      entityId: conditionId,
      oldData: existing,
    });
  }
}

// ============================================================================
// PATIENT PROCEDURES (Antecedents Chirurgicaux)
// ============================================================================

export async function fetchPatientProcedures(patientId: string): Promise<PatientProcedure[]> {
  const { data, error } = await supabase
    .from('patient_procedures')
    .select('*')
    .eq('patient_id', patientId)
    .order('is_pinned', { ascending: false })
    .order('procedure_date', { ascending: false });

  if (error) {
    console.error('[MedicalHistory] Error fetching procedures:', error);
    throw error;
  }

  return (data || []).map(mapDbToProcedure);
}

export async function createPatientProcedure(
  patientId: string,
  input: Omit<PatientProcedure, 'id' | 'patientId' | 'createdAt' | 'createdBy'>
): Promise<PatientProcedure> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('patient_procedures')
    .insert({
      patient_id: patientId,
      ccam_code: input.ccamCode,
      ccam_label: input.ccamLabel,
      title: input.title,
      description: input.description,
      procedure_date: input.procedureDate?.toISOString().split('T')[0],
      hospital_name: input.hospitalName,
      surgeon_name: input.surgeonName,
      anesthesia_type: input.anesthesiaType,
      had_complications: input.hadComplications,
      complications_description: input.complicationsDescription,
      is_pinned: input.isPinned,
      sort_order: input.sortOrder,
      created_by: userId,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('[MedicalHistory] Error creating procedure:', error);
    throw error;
  }

  await logMedicalHistoryAudit({
    patientId,
    actionType: 'create',
    entityType: 'procedure',
    entityId: data.id,
    newData: data,
  });

  return mapDbToProcedure(data);
}

// ============================================================================
// PATIENT FAMILY HISTORY
// ============================================================================

export async function fetchPatientFamilyHistory(patientId: string): Promise<PatientFamilyHistory[]> {
  const { data, error } = await supabase
    .from('patient_family_history')
    .select('*')
    .eq('patient_id', patientId)
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[MedicalHistory] Error fetching family history:', error);
    throw error;
  }

  return (data || []).map(mapDbToFamilyHistory);
}

export async function createPatientFamilyHistory(
  patientId: string,
  input: Omit<PatientFamilyHistory, 'id' | 'patientId' | 'createdAt' | 'createdBy'>
): Promise<PatientFamilyHistory> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('patient_family_history')
    .insert({
      patient_id: patientId,
      cim10_code: input.cim10Code,
      cim10_label: input.cim10Label,
      condition_name: input.conditionName,
      relative_type: input.relativeType,
      relative_name: input.relativeName,
      age_at_onset: input.ageAtOnset,
      is_deceased: input.isDeceased,
      age_at_death: input.ageAtDeath,
      death_cause: input.deathCause,
      notes: input.notes,
      is_pinned: input.isPinned,
      sort_order: input.sortOrder,
      created_by: userId,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('[MedicalHistory] Error creating family history:', error);
    throw error;
  }

  await logMedicalHistoryAudit({
    patientId,
    actionType: 'create',
    entityType: 'family_history',
    entityId: data.id,
    newData: data,
  });

  return mapDbToFamilyHistory(data);
}

// ============================================================================
// PATIENT DEVICES
// ============================================================================

export async function fetchPatientDevices(patientId: string): Promise<PatientDevice[]> {
  const { data, error } = await supabase
    .from('patient_devices')
    .select('*')
    .eq('patient_id', patientId)
    .eq('is_active', true)
    .order('implant_date', { ascending: false });

  if (error) {
    console.error('[MedicalHistory] Error fetching devices:', error);
    throw error;
  }

  return (data || []).map(mapDbToDevice);
}

export async function createPatientDevice(
  patientId: string,
  input: Omit<PatientDevice, 'id' | 'patientId' | 'createdAt' | 'createdBy'>
): Promise<PatientDevice> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('patient_devices')
    .insert({
      patient_id: patientId,
      device_type: input.deviceType,
      device_name: input.deviceName,
      manufacturer: input.manufacturer,
      model: input.model,
      serial_number: input.serialNumber,
      implant_date: input.implantDate?.toISOString().split('T')[0],
      body_location: input.bodyLocation,
      mri_compatible: input.mriCompatible,
      mri_conditions: input.mriConditions,
      next_checkup_date: input.nextCheckupDate?.toISOString().split('T')[0],
      battery_end_date: input.batteryEndDate?.toISOString().split('T')[0],
      is_active: input.isActive,
      notes: input.notes,
      created_by: userId,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('[MedicalHistory] Error creating device:', error);
    throw error;
  }

  await logMedicalHistoryAudit({
    patientId,
    actionType: 'create',
    entityType: 'device',
    entityId: data.id,
    newData: data,
  });

  return mapDbToDevice(data);
}

// ============================================================================
// PATIENT LIFESTYLE
// ============================================================================

export async function fetchPatientLifestyle(patientId: string): Promise<PatientLifestyle | null> {
  const { data, error } = await supabase
    .from('patient_lifestyle')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle();

  if (error) {
    console.error('[MedicalHistory] Error fetching lifestyle:', error);
    throw error;
  }

  return data ? mapDbToLifestyle(data) : null;
}

export async function upsertPatientLifestyle(
  patientId: string,
  input: Partial<Omit<PatientLifestyle, 'id' | 'patientId' | 'recordedAt' | 'createdBy'>>
): Promise<PatientLifestyle> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('patient_lifestyle')
    .upsert({
      patient_id: patientId,
      tobacco_status: input.tobaccoStatus,
      tobacco_start_age: input.tobaccoStartAge,
      tobacco_pack_years: input.tobaccoPackYears,
      tobacco_quit_date: input.tobaccoQuitDate?.toISOString().split('T')[0],
      tobacco_notes: input.tobaccoNotes,
      alcohol_status: input.alcoholStatus,
      alcohol_units_per_week: input.alcoholUnitsPerWeek,
      alcohol_notes: input.alcoholNotes,
      physical_activity_level: input.physicalActivityLevel,
      physical_activity_type: input.physicalActivityType,
      physical_activity_frequency: input.physicalActivityFrequency,
      diet_type: input.dietType,
      diet_restrictions: input.dietRestrictions,
      sleep_hours_avg: input.sleepHoursAvg,
      sleep_quality: input.sleepQuality,
      stress_level: input.stressLevel,
      occupation: input.occupation,
      notes: input.notes,
      created_by: userId,
    } as any, { onConflict: 'patient_id' })
    .select()
    .single();

  if (error) {
    console.error('[MedicalHistory] Error upserting lifestyle:', error);
    throw error;
  }

  await logMedicalHistoryAudit({
    patientId,
    actionType: 'update',
    entityType: 'lifestyle',
    entityId: data.id,
    newData: data,
  });

  return mapDbToLifestyle(data);
}

// ============================================================================
// PATIENT CVD RISK
// ============================================================================

export async function fetchPatientCvdRisk(patientId: string): Promise<PatientCvdRisk | null> {
  const { data, error } = await supabase
    .from('patient_cvd_risk')
    .select('*')
    .eq('patient_id', patientId)
    .maybeSingle();

  if (error) {
    console.error('[MedicalHistory] Error fetching CVD risk:', error);
    throw error;
  }

  return data ? mapDbToCvdRisk(data) : null;
}

export async function upsertPatientCvdRisk(
  patientId: string,
  input: Partial<Omit<PatientCvdRisk, 'id' | 'patientId' | 'createdAt' | 'createdBy'>>
): Promise<PatientCvdRisk> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('patient_cvd_risk')
    .upsert({
      patient_id: patientId,
      has_hypertension: input.hasHypertension,
      has_diabetes: input.hasDiabetes,
      diabetes_type: input.diabetesType,
      has_dyslipidemia: input.hasDyslipidemia,
      has_obesity: input.hasObesity,
      has_family_history_cvd: input.hasFamilyHistoryCvd,
      family_history_details: input.familyHistoryDetails,
      last_ldl_value: input.lastLdlValue,
      last_ldl_date: input.lastLdlDate?.toISOString().split('T')[0],
      last_hba1c_value: input.lastHba1cValue,
      last_hba1c_date: input.lastHba1cDate?.toISOString().split('T')[0],
      score_type: input.scoreType,
      score_value: input.scoreValue,
      score_date: input.scoreDate?.toISOString().split('T')[0],
      risk_category: input.riskCategory,
      target_ldl: input.targetLdl,
      target_bp_systolic: input.targetBpSystolic,
      target_bp_diastolic: input.targetBpDiastolic,
      target_hba1c: input.targetHba1c,
      notes: input.notes,
      created_by: userId,
    } as any, { onConflict: 'patient_id' })
    .select()
    .single();

  if (error) {
    console.error('[MedicalHistory] Error upserting CVD risk:', error);
    throw error;
  }

  await logMedicalHistoryAudit({
    patientId,
    actionType: 'update',
    entityType: 'cvd_risk',
    entityId: data.id,
    newData: data,
  });

  return mapDbToCvdRisk(data);
}

// ============================================================================
// CONSOLIDATED VIEW
// ============================================================================

export interface PatientMedicalHistorySummary {
  patientId: string;
  conditions: PatientCondition[];
  procedures: PatientProcedure[];
  familyHistory: PatientFamilyHistory[];
  devices: PatientDevice[];
  lifestyle: PatientLifestyle | null;
  cvdRisk: PatientCvdRisk | null;
}

export async function fetchPatientMedicalHistory(patientId: string): Promise<PatientMedicalHistorySummary> {
  const [conditions, procedures, familyHistory, devices, lifestyle, cvdRisk] = await Promise.all([
    fetchPatientConditions(patientId),
    fetchPatientProcedures(patientId),
    fetchPatientFamilyHistory(patientId),
    fetchPatientDevices(patientId),
    fetchPatientLifestyle(patientId),
    fetchPatientCvdRisk(patientId),
  ]);

  return {
    patientId,
    conditions,
    procedures,
    familyHistory,
    devices,
    lifestyle,
    cvdRisk,
  };
}

// ============================================================================
// MAPPERS
// ============================================================================

function mapDbToCondition(db: any): PatientCondition {
  return {
    id: db.id,
    patientId: db.patient_id,
    cim10Code: db.cim10_code,
    cim10Label: db.cim10_label,
    cisp2Code: db.cisp2_code,
    cisp2Label: db.cisp2_label,
    title: db.title,
    description: db.description,
    onsetDate: db.onset_date ? new Date(db.onset_date) : undefined,
    resolutionDate: db.resolution_date ? new Date(db.resolution_date) : undefined,
    clinicalStatus: db.clinical_status,
    verificationStatus: db.verification_status,
    severity: db.severity,
    isAld: db.is_ald,
    aldNumber: db.ald_number,
    aldStartDate: db.ald_start_date ? new Date(db.ald_start_date) : undefined,
    aldEndDate: db.ald_end_date ? new Date(db.ald_end_date) : undefined,
    isPinned: db.is_pinned,
    sortOrder: db.sort_order,
    createdAt: new Date(db.created_at),
    createdBy: db.created_by,
  };
}

function mapDbToProcedure(db: any): PatientProcedure {
  return {
    id: db.id,
    patientId: db.patient_id,
    ccamCode: db.ccam_code,
    ccamLabel: db.ccam_label,
    title: db.title,
    description: db.description,
    procedureDate: db.procedure_date ? new Date(db.procedure_date) : undefined,
    hospitalName: db.hospital_name,
    surgeonName: db.surgeon_name,
    anesthesiaType: db.anesthesia_type,
    hadComplications: db.had_complications,
    complicationsDescription: db.complications_description,
    isPinned: db.is_pinned,
    sortOrder: db.sort_order,
    createdAt: new Date(db.created_at),
    createdBy: db.created_by,
  };
}

function mapDbToFamilyHistory(db: any): PatientFamilyHistory {
  return {
    id: db.id,
    patientId: db.patient_id,
    cim10Code: db.cim10_code,
    cim10Label: db.cim10_label,
    conditionName: db.condition_name,
    relativeType: db.relative_type,
    relativeName: db.relative_name,
    ageAtOnset: db.age_at_onset,
    isDeceased: db.is_deceased,
    ageAtDeath: db.age_at_death,
    deathCause: db.death_cause,
    notes: db.notes,
    isPinned: db.is_pinned,
    sortOrder: db.sort_order,
    createdAt: new Date(db.created_at),
    createdBy: db.created_by,
  };
}

function mapDbToDevice(db: any): PatientDevice {
  return {
    id: db.id,
    patientId: db.patient_id,
    deviceType: db.device_type,
    deviceName: db.device_name,
    manufacturer: db.manufacturer,
    model: db.model,
    serialNumber: db.serial_number,
    implantDate: db.implant_date ? new Date(db.implant_date) : undefined,
    bodyLocation: db.body_location,
    mriCompatible: db.mri_compatible,
    mriConditions: db.mri_conditions,
    nextCheckupDate: db.next_checkup_date ? new Date(db.next_checkup_date) : undefined,
    batteryEndDate: db.battery_end_date ? new Date(db.battery_end_date) : undefined,
    isActive: db.is_active,
    removalDate: db.removal_date ? new Date(db.removal_date) : undefined,
    removalReason: db.removal_reason,
    notes: db.notes,
    createdAt: new Date(db.created_at),
    createdBy: db.created_by,
  };
}

function mapDbToLifestyle(db: any): PatientLifestyle {
  return {
    id: db.id,
    patientId: db.patient_id,
    tobaccoStatus: db.tobacco_status,
    tobaccoStartAge: db.tobacco_start_age,
    tobaccoPackYears: db.tobacco_pack_years,
    tobaccoQuitDate: db.tobacco_quit_date ? new Date(db.tobacco_quit_date) : undefined,
    tobaccoNotes: db.tobacco_notes,
    alcoholStatus: db.alcohol_status,
    alcoholUnitsPerWeek: db.alcohol_units_per_week,
    alcoholNotes: db.alcohol_notes,
    physicalActivityLevel: db.physical_activity_level,
    physicalActivityType: db.physical_activity_type,
    physicalActivityFrequency: db.physical_activity_frequency,
    dietType: db.diet_type,
    dietRestrictions: db.diet_restrictions,
    sleepHoursAvg: db.sleep_hours_avg,
    sleepQuality: db.sleep_quality,
    stressLevel: db.stress_level,
    occupation: db.occupation,
    notes: db.notes,
    recordedAt: new Date(db.recorded_at),
    createdBy: db.created_by,
  };
}

function mapDbToCvdRisk(db: any): PatientCvdRisk {
  return {
    id: db.id,
    patientId: db.patient_id,
    hasHypertension: db.has_hypertension,
    hasDiabetes: db.has_diabetes,
    diabetesType: db.diabetes_type,
    hasDyslipidemia: db.has_dyslipidemia,
    hasObesity: db.has_obesity,
    hasFamilyHistoryCvd: db.has_family_history_cvd,
    familyHistoryDetails: db.family_history_details,
    lastLdlValue: db.last_ldl_value,
    lastLdlDate: db.last_ldl_date ? new Date(db.last_ldl_date) : undefined,
    lastHdlValue: db.last_hdl_value,
    lastHdlDate: db.last_hdl_date ? new Date(db.last_hdl_date) : undefined,
    lastTriglyceridesValue: db.last_triglycerides_value,
    lastTriglyceridesDate: db.last_triglycerides_date ? new Date(db.last_triglycerides_date) : undefined,
    lastHba1cValue: db.last_hba1c_value,
    lastHba1cDate: db.last_hba1c_date ? new Date(db.last_hba1c_date) : undefined,
    lastCreatinineValue: db.last_creatinine_value,
    lastCreatinineDate: db.last_creatinine_date ? new Date(db.last_creatinine_date) : undefined,
    scoreType: db.score_type,
    scoreValue: db.score_value,
    scoreDate: db.score_date ? new Date(db.score_date) : undefined,
    riskCategory: db.risk_category,
    targetLdl: db.target_ldl,
    targetBpSystolic: db.target_bp_systolic,
    targetBpDiastolic: db.target_bp_diastolic,
    targetHba1c: db.target_hba1c,
    notes: db.notes,
    createdAt: new Date(db.created_at),
    createdBy: db.created_by,
  };
}
