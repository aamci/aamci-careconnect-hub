import { supabase } from '@/integrations/supabase/client';

export async function fetchConsultations(options?: { patientId?: string }) {
  let query = supabase.from('consultations').select('*').order('start_time', { ascending: false });
  if (options?.patientId) query = query.eq('patient_id', options.patientId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function startConsultation(appointmentId: string, patientId: string, practitionerId: string) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('consultations')
    .insert({ appointment_id: appointmentId, patient_id: patientId, practitioner_id: practitionerId, status: 'in-progress', created_by: user.user?.id } as any)
    .select()
    .single();
  if (error) throw error;
  await supabase.from('appointments').update({ status: 'in-progress' }).eq('id', appointmentId);
  return data;
}

export async function updateConsultation(id: string, updates: any) {
  const { data, error } = await supabase.from('consultations').update(updates as any).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function completeConsultation(id: string) {
  const { data, error } = await supabase
    .from('consultations')
    .update({ status: 'completed', end_time: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  if (data.appointment_id) {
    await supabase.from('appointments').update({ status: 'completed' }).eq('id', data.appointment_id);
  }
  return data;
}
