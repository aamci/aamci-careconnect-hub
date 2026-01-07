/**
 * React Query hooks for Notes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '@/types';
import * as notesService from '@/services/supabase/notesService';
import { toast } from 'sonner';

// Query keys
export const notesKeys = {
  all: ['notes'] as const,
  lists: () => [...notesKeys.all, 'list'] as const,
  byPatient: (patientId: string) => [...notesKeys.lists(), { patientId }] as const,
  urgent: () => [...notesKeys.lists(), 'urgent'] as const,
  secretariat: () => [...notesKeys.lists(), 'secretariat'] as const,
};

// ==================== QUERIES ====================

export function useNotes() {
  return useQuery({
    queryKey: notesKeys.lists(),
    queryFn: async () => {
      const result = await notesService.fetchNotes();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useNotesByPatient(patientId: string) {
  return useQuery({
    queryKey: notesKeys.byPatient(patientId),
    queryFn: async () => {
      const result = await notesService.fetchNotesByPatient(patientId);
      if (result.error) throw result.error;
      return result.data || [];
    },
    enabled: !!patientId,
    staleTime: 60 * 1000,
  });
}

export function useUrgentNotes() {
  return useQuery({
    queryKey: notesKeys.urgent(),
    queryFn: async () => {
      const result = await notesService.fetchUrgentNotes();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useSecretariatNotes() {
  return useQuery({
    queryKey: notesKeys.secretariat(),
    queryFn: async () => {
      const result = await notesService.fetchSecretariatNotes();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 30 * 1000,
  });
}

// ==================== MUTATIONS ====================

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
      const result = await notesService.createNote(note);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: (_, note) => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
      if (note.patientId) {
        queryClient.invalidateQueries({ queryKey: notesKeys.byPatient(note.patientId) });
      }
      toast.success('Note créée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Note> }) => {
      const result = await notesService.updateNote(id, updates);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
      toast.success('Note mise à jour');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await notesService.deleteNote(id);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKeys.all });
      toast.success('Note supprimée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
