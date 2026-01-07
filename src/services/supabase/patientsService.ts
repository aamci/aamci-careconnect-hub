/**
 * Patients Service
 * Handles CRUD operations for patients and patient alerts
 */

import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientAlert } from '@/types';
import { mockPatients } from '@/data/mockData';
import { executeQuery, ServiceResult, dateToIso, isoToDate, getCurrentUserId } from './baseService';

// ==================== TYPE MAPPERS ====================

interface DbPatient {
  id: string;
  first_name: string;
  last_name: string;
  used_first_name: string | null;
  used_last_name: string | null;
  gender: string;
  date_of_birth: string;
  phone: string | null;
  phone_secondary: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  birth_place: string | null;
  insurance_number: string | null;
  insurance_provider: string | null;
  referring_doctor: string | null;
  notes: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface DbPatientAlert {
  id: string;
  patient_id: string;
  type: string;
  message: string;
  severity: string;
  is_active: boolean | null;
}

function mapDbToPatient(db: DbPatient, alerts: PatientAlert[] = []): Patient {
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    usedFirstName: db.used_first_name || undefined,
    usedLastName: db.used_last_name || undefined,
    gender: db.gender as Patient['gender'],
    dateOfBirth: new Date(db.date_of_birth),
    phone: db.phone || '',
    phoneSecondary: db.phone_secondary || undefined,
    email: db.email || undefined,
    address: db.address || undefined,
    city: db.city || undefined,
    postalCode: db.postal_code || undefined,
    birthPlace: db.birth_place || undefined,
    insuranceNumber: db.insurance_number || undefined,
    insuranceProvider: db.insurance_provider || undefined,
    referringDoctor: db.referring_doctor || undefined,
    notes: db.notes || undefined,
    alerts,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

function mapDbToPatientAlert(db: DbPatientAlert): PatientAlert {
  return {
    id: db.id,
    type: db.type as PatientAlert['type'],
    message: db.message,
    severity: db.severity as PatientAlert['severity'],
  };
}

function mapPatientToDb(patient: Partial<Patient>) {
  return {
    first_name: patient.firstName,
    last_name: patient.lastName,
    used_first_name: patient.usedFirstName,
    used_last_name: patient.usedLastName,
    gender: patient.gender,
    date_of_birth: patient.dateOfBirth ? dateToIso(patient.dateOfBirth)?.split('T')[0] : undefined,
    phone: patient.phone,
    phone_secondary: patient.phoneSecondary,
    email: patient.email,
    address: patient.address,
    city: patient.city,
    postal_code: patient.postalCode,
    birth_place: patient.birthPlace,
    insurance_number: patient.insuranceNumber,
    insurance_provider: patient.insuranceProvider,
    referring_doctor: patient.referringDoctor,
    notes: patient.notes,
  };
}

// ==================== QUERIES ====================

export async function fetchPatients(): Promise<ServiceResult<Patient[]>> {
  return executeQuery(
    async () => {
      // Fetch patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .eq('is_active', true)
        .order('last_name');

      if (patientsError) return { data: null, error: patientsError };

      // Fetch alerts for all patients
      const patientIds = (patientsData || []).map((p) => p.id);
      
      let alertsByPatient: Record<string, PatientAlert[]> = {};
      
      if (patientIds.length > 0) {
        const { data: alertsData, error: alertsError } = await supabase
          .from('patient_alerts')
          .select('*')
          .in('patient_id', patientIds)
          .eq('is_active', true);

        if (!alertsError && alertsData) {
          alertsByPatient = alertsData.reduce((acc, alert) => {
            const patientId = alert.patient_id;
            if (!acc[patientId]) acc[patientId] = [];
            acc[patientId].push(mapDbToPatientAlert(alert as DbPatientAlert));
            return acc;
          }, {} as Record<string, PatientAlert[]>);
        }
      }

      const patients = (patientsData || []).map((p) =>
        mapDbToPatient(p as DbPatient, alertsByPatient[p.id] || [])
      );

      return { data: patients, error: null };
    },
    () => mockPatients
  );
}

export async function fetchPatientById(id: string): Promise<ServiceResult<Patient | null>> {
  return executeQuery(
    async () => {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) return { data: null, error: patientError };

      const { data: alertsData } = await supabase
        .from('patient_alerts')
        .select('*')
        .eq('patient_id', id)
        .eq('is_active', true);

      const alerts = (alertsData || []).map((a) => mapDbToPatientAlert(a as DbPatientAlert));
      
      return { data: mapDbToPatient(patientData as DbPatient, alerts), error: null };
    },
    () => mockPatients.find((p) => p.id === id) || null
  );
}

export async function searchPatients(query: string): Promise<ServiceResult<Patient[]>> {
  return executeQuery(
    async () => {
      const searchQuery = `%${query}%`;
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('is_active', true)
        .or(`first_name.ilike.${searchQuery},last_name.ilike.${searchQuery},email.ilike.${searchQuery},phone.ilike.${searchQuery}`)
        .order('last_name')
        .limit(50);

      if (error) return { data: null, error };

      return {
        data: (data || []).map((p) => mapDbToPatient(p as DbPatient)),
        error: null,
      };
    },
    () => {
      const q = query.toLowerCase();
      return mockPatients.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phone?.includes(q)
      );
    }
  );
}

// ==================== MUTATIONS ====================

export async function createPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResult<Patient>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('patients')
      .insert({
        ...mapPatientToDb(patient),
        created_by: userId,
        updated_by: userId,
      })
      .select()
      .single();

    if (error) return { data: null, error };

    return { data: mapDbToPatient(data as DbPatient), error: null };
  });
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<ServiceResult<Patient>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('patients')
      .update({
        ...mapPatientToDb(updates),
        updated_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error };

    return { data: mapDbToPatient(data as DbPatient), error: null };
  });
}

export async function deletePatient(id: string): Promise<ServiceResult<boolean>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();
    
    // Soft delete
    const { error } = await supabase
      .from('patients')
      .update({ 
        is_active: false,
        updated_by: userId,
      })
      .eq('id', id);

    if (error) return { data: null, error };

    return { data: true, error: null };
  });
}

// ==================== ALERTS ====================

export async function createPatientAlert(
  patientId: string,
  alert: Omit<PatientAlert, 'id'>
): Promise<ServiceResult<PatientAlert>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('patient_alerts')
      .insert({
        patient_id: patientId,
        type: alert.type,
        message: alert.message,
        severity: alert.severity,
        created_by: userId,
      })
      .select()
      .single();

    if (error) return { data: null, error };

    return { data: mapDbToPatientAlert(data as DbPatientAlert), error: null };
  });
}

export async function resolvePatientAlert(alertId: string): Promise<ServiceResult<boolean>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();
    
    const { error } = await supabase
      .from('patient_alerts')
      .update({
        is_active: false,
        resolved_at: new Date().toISOString(),
        resolved_by: userId,
      })
      .eq('id', alertId);

    if (error) return { data: null, error };

    return { data: true, error: null };
  });
}
