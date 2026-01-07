import { supabase } from '@/integrations/supabase/client';

export interface WaitingListEntry {
  id: string;
  patient_id: string;
  practitioner_id?: string;
  motif_id?: string;
  site_id?: string;
  priority: number;
  requested_date_from?: string;
  requested_date_to?: string;
  requested_time_from?: string;
  requested_time_to?: string;
  preferred_days?: number[];
  notes?: string;
  status: 'active' | 'contacted' | 'scheduled' | 'expired' | 'cancelled';
  contacted_at?: string;
  scheduled_appointment_id?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

// Fetch waiting list
export async function fetchWaitingList(options?: { 
  practitionerId?: string; 
  status?: string;
}) {
  let query = supabase
    .from('waiting_list')
    .select(`
      *,
      patient:patients(id, first_name, last_name, phone),
      practitioner:practitioners(id, first_name, last_name),
      motif:appointment_motifs(id, name, color)
    `)
    .order('priority', { ascending: true })
    .order('created_at', { ascending: true });
    
  if (options?.practitionerId) {
    query = query.eq('practitioner_id', options.practitionerId);
  }
  if (options?.status) {
    query = query.eq('status', options.status);
  } else {
    query = query.eq('status', 'active');
  }
    
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Add to waiting list
export async function addToWaitingList(entry: Omit<WaitingListEntry, 'id' | 'created_at' | 'updated_at' | 'status'>) {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('waiting_list')
    .insert({
      ...entry,
      status: 'active',
      created_by: user.user?.id,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Update waiting list entry
export async function updateWaitingListEntry(id: string, updates: Partial<WaitingListEntry>) {
  const { data, error } = await supabase
    .from('waiting_list')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Mark as contacted
export async function markAsContacted(id: string) {
  const { data, error } = await supabase
    .from('waiting_list')
    .update({
      status: 'contacted',
      contacted_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Schedule from waiting list
export async function scheduleFromWaitingList(id: string, appointmentId: string) {
  const { data, error } = await supabase
    .from('waiting_list')
    .update({
      status: 'scheduled',
      scheduled_appointment_id: appointmentId,
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Cancel waiting list entry
export async function cancelWaitingListEntry(id: string) {
  const { error } = await supabase
    .from('waiting_list')
    .update({ status: 'cancelled' })
    .eq('id', id);
    
  if (error) throw error;
}

// Appointment Recurrences
export interface AppointmentRecurrence {
  id: string;
  patient_id: string;
  practitioner_id: string;
  motif_id: string;
  site_id?: string;
  room_id?: string;
  recurrence_pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  day_of_week?: number;
  day_of_month?: number;
  time_slot: string;
  duration: number;
  start_date: string;
  end_date?: string;
  max_occurrences?: number;
  occurrences_created: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Fetch recurrences
export async function fetchRecurrences(options?: { patientId?: string; practitionerId?: string }) {
  let query = supabase
    .from('appointment_recurrences')
    .select(`
      *,
      patient:patients(id, first_name, last_name),
      practitioner:practitioners(id, first_name, last_name),
      motif:appointment_motifs(id, name, color)
    `)
    .eq('is_active', true)
    .order('start_date', { ascending: true });
    
  if (options?.patientId) {
    query = query.eq('patient_id', options.patientId);
  }
  if (options?.practitionerId) {
    query = query.eq('practitioner_id', options.practitionerId);
  }
    
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Create recurrence
export async function createRecurrence(recurrence: Omit<AppointmentRecurrence, 'id' | 'created_at' | 'updated_at' | 'occurrences_created' | 'is_active'>) {
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('appointment_recurrences')
    .insert({
      ...recurrence,
      is_active: true,
      occurrences_created: 0,
      created_by: user.user?.id,
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

// Cancel recurrence
export async function cancelRecurrence(id: string) {
  const { error } = await supabase
    .from('appointment_recurrences')
    .update({ is_active: false })
    .eq('id', id);
    
  if (error) throw error;
}
