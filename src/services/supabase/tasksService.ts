/**
 * Tasks Service
 * Handles CRUD operations for tasks
 */

import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types';
import { mockTasks } from '@/data/mockData';
import { executeQuery, ServiceResult, getCurrentUserId, isoToDate } from './baseService';

// ==================== TYPE MAPPERS ====================

interface DbTask {
  id: string;
  title: string;
  description: string | null;
  type: string;
  priority: string;
  status: string;
  assignee_id: string | null;
  assignee_name: string | null;
  patient_id: string | null;
  patient_name?: string | null;
  is_personal?: boolean | null;
  appointment_id: string | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Map old DB type values to display categories
const dbTypeToCategory: Record<string, Task['type']> = {
  'call': 'patient-contact',
  'preparation': 'autre',
  'followup': 'rendez-vous',
  'administrative': 'facturation',
  'other': 'autre',
  // New values map to themselves
  'rendez-vous': 'rendez-vous',
  'patient-contact': 'patient-contact',
  'document': 'document',
  'facturation': 'facturation',
  'resultats': 'resultats',
  'autre': 'autre',
};

// Map new category values to old DB-compatible type values (before migration)
const categoryToOldType: Record<string, string> = {
  'rendez-vous': 'followup',
  'patient-contact': 'call',
  'facturation': 'administrative',
  'resultats': 'document',
  'autre': 'other',
};

function mapDbToTask(db: DbTask): Task {
  return {
    id: db.id,
    title: db.title,
    description: db.description || undefined,
    type: dbTypeToCategory[db.type] || (db.type as Task['type']) || 'autre',
    priority: (db.priority || 'medium') as Task['priority'],
    status: (db.status || 'todo') as Task['status'],
    assigneeId: db.assignee_id || undefined,
    assigneeName: db.assignee_name || undefined,
    patientId: db.patient_id || undefined,
    patientName: db.patient_name || undefined,
    isPersonal: db.is_personal || false,
    appointmentId: db.appointment_id || undefined,
    dueDate: isoToDate(db.due_date),
    completedAt: isoToDate(db.completed_at),
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

// ==================== QUERIES ====================

export async function fetchTasks(): Promise<ServiceResult<Task[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) return { data: null, error };

      return {
        data: (data || []).map((t) => mapDbToTask(t as DbTask)),
        error: null,
      };
    },
    () => mockTasks
  );
}

export async function fetchTasksByStatus(status: Task['status']): Promise<ServiceResult<Task[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('status', status)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) return { data: null, error };

      return {
        data: (data || []).map((t) => mapDbToTask(t as DbTask)),
        error: null,
      };
    },
    () => mockTasks.filter((t) => t.status === status)
  );
}

export async function fetchTasksByPatient(patientId: string): Promise<ServiceResult<Task[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error };

      return {
        data: (data || []).map((t) => mapDbToTask(t as DbTask)),
        error: null,
      };
    },
    () => mockTasks.filter((t) => t.patientId === patientId)
  );
}

export async function fetchMyTasks(): Promise<ServiceResult<Task[]>> {
  return executeQuery(
    async () => {
      const userId = await getCurrentUserId();
      if (!userId) return { data: [], error: null };

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assignee_id', userId)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) return { data: null, error };

      return {
        data: (data || []).map((t) => mapDbToTask(t as DbTask)),
        error: null,
      };
    },
    () => mockTasks
  );
}

// ==================== MUTATIONS ====================

export async function createTask(
  task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServiceResult<Task>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();

    // Full insert with new columns (after migration)
    const fullInsert: Record<string, any> = {
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      status: task.status,
      assignee_id: task.assigneeId,
      assignee_name: task.assigneeName,
      patient_id: task.patientId || null,
      patient_name: task.patientName || null,
      is_personal: task.isPersonal || false,
      appointment_id: task.appointmentId,
      due_date: task.dueDate?.toISOString(),
      created_by: userId,
    };

    let { data, error } = await supabase
      .from('tasks')
      .insert(fullInsert)
      .select()
      .single();

    // If schema error (missing columns or CHECK violation), retry with old-compatible schema
    if (error && (
      error.message.includes('is_personal') ||
      error.message.includes('patient_name') ||
      error.message.includes('check') ||
      error.message.includes('violates')
    )) {
      console.warn('[Tasks] New columns not available, retrying with compatible schema');
      const compatInsert: Record<string, any> = {
        title: task.title,
        description: task.description,
        type: categoryToOldType[task.type] || task.type,
        priority: task.priority,
        status: task.status,
        assignee_id: task.assigneeId,
        assignee_name: task.assigneeName,
        patient_id: task.patientId || null,
        appointment_id: task.appointmentId,
        due_date: task.dueDate?.toISOString(),
        created_by: userId,
      };

      const result = await supabase
        .from('tasks')
        .insert(compatInsert)
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) return { data: null, error };

    return { data: mapDbToTask(data as DbTask), error: null };
  });
}

export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<ServiceResult<Task>> {
  return executeQuery(async () => {
    const updateData: any = {};

    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.assigneeId !== undefined) updateData.assignee_id = updates.assigneeId;
    if (updates.assigneeName !== undefined) updateData.assignee_name = updates.assigneeName;
    if (updates.patientId !== undefined) updateData.patient_id = updates.patientId || null;
    if (updates.patientName !== undefined) updateData.patient_name = updates.patientName || null;
    if (updates.isPersonal !== undefined) updateData.is_personal = updates.isPersonal;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate?.toISOString();
    if (updates.completedAt !== undefined) updateData.completed_at = updates.completedAt?.toISOString();

    let { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // If schema error, retry without new columns
    if (error && (
      error.message.includes('is_personal') ||
      error.message.includes('patient_name') ||
      error.message.includes('check') ||
      error.message.includes('violates')
    )) {
      console.warn('[Tasks] New columns not available for update, retrying with compatible schema');
      const { patient_name, is_personal, ...compatData } = updateData;
      if (compatData.type) {
        compatData.type = categoryToOldType[compatData.type] || compatData.type;
      }

      const result = await supabase
        .from('tasks')
        .update(compatData)
        .eq('id', id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) return { data: null, error };

    return { data: mapDbToTask(data as DbTask), error: null };
  });
}

export async function completeTask(id: string): Promise<ServiceResult<Task>> {
  return updateTask(id, {
    status: 'done',
    completedAt: new Date(),
  });
}

export async function deleteTask(id: string): Promise<ServiceResult<boolean>> {
  return executeQuery(async () => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) return { data: null, error };

    return { data: true, error: null };
  });
}
