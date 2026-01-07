/**
 * Notes Service
 * Handles CRUD operations for notes
 */

import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types';
import { mockNotes } from '@/data/mockData';
import { executeQuery, ServiceResult, getCurrentUserId } from './baseService';

// ==================== TYPE MAPPERS ====================

interface DbNote {
  id: string;
  content: string;
  patient_id: string | null;
  appointment_id: string | null;
  author_id: string | null;
  author_name: string | null;
  is_urgent: boolean | null;
  send_to_secretariat: boolean | null;
  created_at: string;
  updated_at: string;
}

function mapDbToNote(db: DbNote): Note {
  return {
    id: db.id,
    content: db.content,
    patientId: db.patient_id || undefined,
    appointmentId: db.appointment_id || undefined,
    authorId: db.author_id || '',
    authorName: db.author_name || 'Inconnu',
    isUrgent: db.is_urgent ?? false,
    sendToSecretariat: db.send_to_secretariat ?? false,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
  };
}

// ==================== QUERIES ====================

export async function fetchNotes(): Promise<ServiceResult<Note[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) return { data: null, error };

      return {
        data: (data || []).map((n) => mapDbToNote(n as DbNote)),
        error: null,
      };
    },
    () => mockNotes
  );
}

export async function fetchNotesByPatient(patientId: string): Promise<ServiceResult<Note[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error };

      return {
        data: (data || []).map((n) => mapDbToNote(n as DbNote)),
        error: null,
      };
    },
    () => mockNotes.filter((n) => n.patientId === patientId)
  );
}

export async function fetchUrgentNotes(): Promise<ServiceResult<Note[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('is_urgent', true)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error };

      return {
        data: (data || []).map((n) => mapDbToNote(n as DbNote)),
        error: null,
      };
    },
    () => mockNotes.filter((n) => n.isUrgent)
  );
}

export async function fetchSecretariatNotes(): Promise<ServiceResult<Note[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('send_to_secretariat', true)
        .order('created_at', { ascending: false });

      if (error) return { data: null, error };

      return {
        data: (data || []).map((n) => mapDbToNote(n as DbNote)),
        error: null,
      };
    },
    () => mockNotes.filter((n) => n.sendToSecretariat)
  );
}

// ==================== MUTATIONS ====================

export async function createNote(
  note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServiceResult<Note>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('notes')
      .insert({
        content: note.content,
        patient_id: note.patientId,
        appointment_id: note.appointmentId,
        author_id: userId,
        author_name: note.authorName,
        is_urgent: note.isUrgent,
        send_to_secretariat: note.sendToSecretariat,
      })
      .select()
      .single();

    if (error) return { data: null, error };

    return { data: mapDbToNote(data as DbNote), error: null };
  });
}

export async function updateNote(
  id: string,
  updates: Partial<Note>
): Promise<ServiceResult<Note>> {
  return executeQuery(async () => {
    const updateData: any = {};
    
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.isUrgent !== undefined) updateData.is_urgent = updates.isUrgent;
    if (updates.sendToSecretariat !== undefined) updateData.send_to_secretariat = updates.sendToSecretariat;

    const { data, error } = await supabase
      .from('notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error };

    return { data: mapDbToNote(data as DbNote), error: null };
  });
}

export async function deleteNote(id: string): Promise<ServiceResult<boolean>> {
  return executeQuery(async () => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) return { data: null, error };

    return { data: true, error: null };
  });
}
