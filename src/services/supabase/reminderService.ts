/**
 * Reminder Service - Patient Reminders
 * Supabase service for managing patient reminders and tasks
 */

import { supabase } from '@/integrations/supabase/client';
import {
  PatientReminder,
  PatientTask,
  CreateReminderInput,
  UpdateReminderInput,
  ReminderStatus,
  PatientTaskStatus,
} from '@/types/timeline';

// ==================== REMINDERS ====================

export async function fetchPatientReminders(
  patientId: string,
  status: ReminderStatus | 'all' = 'pending'
): Promise<{ data: PatientReminder[]; error: Error | null }> {
  let query = supabase
    .from('patient_reminders')
    .select('*')
    .eq('patient_id', patientId)
    .order('due_date', { ascending: true });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching reminders:', error);
    return { data: [], error: new Error(error.message) };
  }

  return { data: (data || []) as PatientReminder[], error: null };
}

export async function createReminder(
  input: CreateReminderInput
): Promise<{ data: PatientReminder | null; error: Error | null }> {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('patient_reminders')
    .insert({
      patient_id: input.patient_id,
      title: input.title,
      description: input.description,
      due_date: input.due_date,
      notify_days_before: input.notify_days_before || 7,
      created_by: user.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating reminder:', error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as PatientReminder, error: null };
}

export async function updateReminder(
  reminderId: string,
  updates: UpdateReminderInput
): Promise<{ data: PatientReminder | null; error: Error | null }> {
  const { data: user } = await supabase.auth.getUser();

  const updateData: Record<string, unknown> = { ...updates };

  // If marking as completed, set completed_at and completed_by
  if (updates.status === 'completed') {
    updateData.completed_at = new Date().toISOString();
    updateData.completed_by = user.user?.id;
  }

  const { data, error } = await supabase
    .from('patient_reminders')
    .update(updateData)
    .eq('id', reminderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating reminder:', error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as PatientReminder, error: null };
}

export async function deleteReminder(reminderId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('patient_reminders')
    .delete()
    .eq('id', reminderId);

  if (error) {
    console.error('Error deleting reminder:', error);
    return { error: new Error(error.message) };
  }

  return { error: null };
}

// ==================== TASKS ====================

export async function fetchPatientTasks(
  patientId: string,
  status: PatientTaskStatus | 'all' = 'all'
): Promise<{ data: PatientTask[]; error: Error | null }> {
  let query = supabase
    .from('patient_tasks')
    .select('*')
    .eq('patient_id', patientId)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('priority', { ascending: false });

  if (status !== 'all') {
    query = query.eq('status', status);
  } else {
    // Exclude done tasks by default unless specifically requested
    query = query.neq('status', 'done');
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching tasks:', error);
    return { data: [], error: new Error(error.message) };
  }

  return { data: (data || []) as PatientTask[], error: null };
}

export async function createTask(
  task: Omit<PatientTask, 'id' | 'created_at' | 'updated_at' | 'created_by'>
): Promise<{ data: PatientTask | null; error: Error | null }> {
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('patient_tasks')
    .insert({
      ...task,
      created_by: user.user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating task:', error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as PatientTask, error: null };
}

export async function updateTask(
  taskId: string,
  updates: Partial<PatientTask>
): Promise<{ data: PatientTask | null; error: Error | null }> {
  const updateData: Record<string, unknown> = { ...updates };

  // If marking as done, set completed_at
  if (updates.status === 'done') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('patient_tasks')
    .update(updateData)
    .eq('id', taskId)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return { data: null, error: new Error(error.message) };
  }

  return { data: data as PatientTask, error: null };
}

export async function deleteTask(taskId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('patient_tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    return { error: new Error(error.message) };
  }

  return { error: null };
}

// ==================== UPCOMING REMINDERS ====================

export async function fetchUpcomingReminders(
  patientId: string,
  daysAhead: number = 30
): Promise<{ data: PatientReminder[]; error: Error | null }> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  const { data, error } = await supabase
    .from('patient_reminders')
    .select('*')
    .eq('patient_id', patientId)
    .eq('status', 'pending')
    .lte('due_date', futureDate.toISOString().split('T')[0])
    .order('due_date', { ascending: true })
    .limit(10);

  if (error) {
    console.error('Error fetching upcoming reminders:', error);
    return { data: [], error: new Error(error.message) };
  }

  return { data: (data || []) as PatientReminder[], error: null };
}
