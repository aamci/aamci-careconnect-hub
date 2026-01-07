import { supabase } from '@/integrations/supabase/client';

export async function fetchPrescriptions(options?: { patientId?: string }) {
  let query = supabase.from('prescriptions').select('*').order('created_at', { ascending: false });
  if (options?.patientId) query = query.eq('patient_id', options.patientId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createPrescription(prescription: any) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({ ...prescription, created_by: user.user?.id } as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchVitalSigns(patientId: string) {
  const { data, error } = await supabase.from('vital_signs').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function recordVitalSigns(vitalSigns: any) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('vital_signs')
    .insert({ ...vitalSigns, recorded_by: user.user?.id } as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchVaccinations(patientId: string) {
  const { data, error } = await supabase.from('vaccinations').select('*').eq('patient_id', patientId).order('administration_date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addVaccination(vaccination: any) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('vaccinations')
    .insert({ ...vaccination, created_by: user.user?.id } as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchLabResults(options?: { patientId?: string }) {
  let query = supabase.from('lab_results').select('*').order('test_date', { ascending: false });
  if (options?.patientId) query = query.eq('patient_id', options.patientId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function addLabResult(labResult: any) {
  const { data, error } = await supabase.from('lab_results').insert(labResult as any).select().single();
  if (error) throw error;
  return data;
}
