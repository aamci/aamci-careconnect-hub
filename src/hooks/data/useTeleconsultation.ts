/**
 * Hooks React Query pour les téléconsultations
 * Gestion complète: CRUD, sessions, événements, documents, notes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as teleconsultationService from '@/services/supabase/teleconsultationService';
import type {
  Teleconsultation,
  TeleconsultationWithRelations,
  TeleconsultationSession,
  TeleconsultationEvent,
  TeleconsultationDocument,
  TeleconsultationNote,
  CreateTeleconsultationRequest,
  UpdateTeleconsultationRequest,
  JoinTeleconsultationRequest,
  ConnectionQualityUpdate,
  ShareDocumentRequest,
  CreateNoteRequest,
  StartRecordingRequest,
  ParticipantType,
  EventType,
} from '@/types/teleconsultation';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const teleconsultationKeys = {
  all: ['teleconsultations'] as const,
  lists: () => [...teleconsultationKeys.all, 'list'] as const,
  list: (filters: string) => [...teleconsultationKeys.lists(), { filters }] as const,
  details: () => [...teleconsultationKeys.all, 'detail'] as const,
  detail: (id: string) => [...teleconsultationKeys.details(), id] as const,
  byAppointment: (appointmentId: string) => [...teleconsultationKeys.all, 'appointment', appointmentId] as const,
  sessions: (id: string) => [...teleconsultationKeys.detail(id), 'sessions'] as const,
  events: (id: string) => [...teleconsultationKeys.detail(id), 'events'] as const,
  documents: (id: string) => [...teleconsultationKeys.detail(id), 'documents'] as const,
  notes: (id: string) => [...teleconsultationKeys.detail(id), 'notes'] as const,
};

// ============================================================================
// TELECONSULTATION CRUD HOOKS
// ============================================================================

/**
 * Créer une nouvelle téléconsultation
 */
export function useCreateTeleconsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTeleconsultationRequest) =>
      teleconsultationService.createTeleconsultation(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.all });
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.byAppointment(data.appointment_id) });
      toast.success('Téléconsultation créée');
    },
    onError: (error) => {
      console.error('Error creating teleconsultation:', error);
      toast.error('Erreur lors de la création de la téléconsultation');
    },
  });
}

/**
 * Récupérer une téléconsultation par ID
 */
export function useTeleconsultation(id: string | null) {
  return useQuery({
    queryKey: teleconsultationKeys.detail(id || ''),
    queryFn: () => teleconsultationService.getTeleconsultation(id!),
    enabled: !!id,
  });
}

/**
 * Récupérer une téléconsultation avec toutes ses relations
 */
export function useTeleconsultationWithRelations(id: string | null) {
  return useQuery({
    queryKey: [...teleconsultationKeys.detail(id || ''), 'relations'],
    queryFn: () => teleconsultationService.getTeleconsultationWithRelations(id!),
    enabled: !!id,
  });
}

/**
 * Récupérer une téléconsultation par appointment_id
 */
export function useTeleconsultationByAppointment(appointmentId: string | null) {
  return useQuery({
    queryKey: teleconsultationKeys.byAppointment(appointmentId || ''),
    queryFn: () => teleconsultationService.getTeleconsultationByAppointment(appointmentId!),
    enabled: !!appointmentId,
  });
}

/**
 * Récupérer toutes les téléconsultations du praticien connecté
 */
export function useTeleconsultations() {
  return useQuery({
    queryKey: teleconsultationKeys.lists(),
    queryFn: () => teleconsultationService.getTeleconsultations(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refresh every minute
    retry: 1, // Only retry once
    retryDelay: 1000, // Wait 1 second before retry
  });
}

/**
 * Mettre à jour une téléconsultation
 */
export function useUpdateTeleconsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTeleconsultationRequest }) =>
      teleconsultationService.updateTeleconsultation(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.byAppointment(data.appointment_id) });

      if (data.status === 'completed') {
        toast.success('Téléconsultation terminée');
      } else {
        toast.success('Téléconsultation mise à jour');
      }
    },
    onError: (error) => {
      console.error('Error updating teleconsultation:', error);
      toast.error('Erreur lors de la mise à jour');
    },
  });
}

/**
 * Supprimer une téléconsultation (soft delete)
 */
export function useDeleteTeleconsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => teleconsultationService.deleteTeleconsultation(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.all });
      toast.success('Téléconsultation supprimée');
    },
    onError: (error) => {
      console.error('Error deleting teleconsultation:', error);
      toast.error('Erreur lors de la suppression');
    },
  });
}

// ============================================================================
// ACCESS & VALIDATION HOOKS
// ============================================================================

/**
 * Valider l'accès à une téléconsultation
 */
export function useValidateTeleconsultationAccess(
  teleconsultationId: string | null,
  token: string | null,
  participantType: ParticipantType | null
) {
  return useQuery({
    queryKey: ['teleconsultation-access', teleconsultationId, token, participantType],
    queryFn: () =>
      teleconsultationService.validateTeleconsultationAccess(
        teleconsultationId!,
        token!,
        participantType!
      ),
    enabled: !!teleconsultationId && !!token && !!participantType,
    retry: false, // Don't retry failed access attempts
  });
}

// ============================================================================
// SESSION MANAGEMENT HOOKS
// ============================================================================

/**
 * Créer une session (rejoindre la téléconsultation)
 */
export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: JoinTeleconsultationRequest) =>
      teleconsultationService.createSession(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.sessions(data.teleconsultation_id) });
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.detail(data.teleconsultation_id) });
      toast.success('Connexion établie');
    },
    onError: (error) => {
      console.error('Error creating session:', error);
      toast.error('Erreur de connexion');
    },
  });
}

/**
 * Mettre à jour une session
 */
export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      updates,
    }: {
      sessionId: string;
      updates: Parameters<typeof teleconsultationService.updateSession>[1];
    }) => teleconsultationService.updateSession(sessionId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.sessions(data.teleconsultation_id) });

      if (data.status === 'disconnected') {
        toast.info('Déconnexion');
      }
    },
    onError: (error) => {
      console.error('Error updating session:', error);
    },
  });
}

/**
 * Mettre à jour la qualité de connexion
 */
export function useUpdateConnectionQuality() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (update: ConnectionQualityUpdate) =>
      teleconsultationService.updateConnectionQuality(update),
    onSuccess: () => {
      // Refresh sessions silently
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.all });
    },
    onError: (error) => {
      console.error('Error updating connection quality:', error);
    },
  });
}

/**
 * Heartbeat pour maintenir la session active
 */
export function useSessionHeartbeat() {
  return useMutation({
    mutationFn: (sessionId: string) => teleconsultationService.sessionHeartbeat(sessionId),
    onError: (error) => {
      console.error('Heartbeat failed:', error);
    },
  });
}

// ============================================================================
// EVENTS HOOKS
// ============================================================================

/**
 * Logger un événement
 */
export function useLogEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: Parameters<typeof teleconsultationService.logEvent>[0]) =>
      teleconsultationService.logEvent(event),
    onSuccess: (_, variables) => {
      // Invalidate events for this teleconsultation
      queryClient.invalidateQueries({
        queryKey: teleconsultationKeys.events(variables.teleconsultation_id),
      });
    },
  });
}

/**
 * Récupérer les événements d'une téléconsultation
 */
export function useTeleconsultationEvents(
  teleconsultationId: string | null,
  options?: {
    limit?: number;
    offset?: number;
    eventTypes?: EventType[];
  }
) {
  return useQuery({
    queryKey: [...teleconsultationKeys.events(teleconsultationId || ''), options],
    queryFn: () => teleconsultationService.getEvents(teleconsultationId!, options),
    enabled: !!teleconsultationId,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });
}

// ============================================================================
// DOCUMENT SHARING HOOKS
// ============================================================================

/**
 * Récupérer les documents partagés d'une téléconsultation
 */
export function useTeleconsultationDocuments(teleconsultationId: string | null) {
  return useQuery({
    queryKey: teleconsultationKeys.documents(teleconsultationId || ''),
    queryFn: () => teleconsultationService.getDocuments(teleconsultationId!),
    enabled: !!teleconsultationId,
    refetchInterval: 5000, // Refresh every 5 seconds for real-time feel
  });
}

/**
 * Partager un document pendant la téléconsultation
 */
export function useShareDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ShareDocumentRequest) =>
      teleconsultationService.shareDocument(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: teleconsultationKeys.documents(data.teleconsultation_id),
      });
      toast.success('Document partagé');
    },
    onError: (error) => {
      console.error('Error sharing document:', error);
      toast.error('Erreur lors du partage du document');
    },
  });
}

/**
 * Marquer un document comme vu
 */
export function useMarkDocumentAsViewed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentShareId,
      viewedBy,
    }: {
      documentShareId: string;
      viewedBy: ParticipantType;
    }) => teleconsultationService.markDocumentAsViewed(documentShareId, viewedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.all });
    },
  });
}

// ============================================================================
// BILLING HOOKS
// ============================================================================

/**
 * Créer une facture pour une téléconsultation
 */
export function useCreateInvoiceForTeleconsultation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teleconsultationId: string) =>
      teleconsultationService.createInvoiceForTeleconsultation(teleconsultationId),
    onSuccess: (data, teleconsultationId) => {
      queryClient.invalidateQueries({
        queryKey: teleconsultationKeys.detail(teleconsultationId),
      });
      toast.success('Facture créée automatiquement');
    },
    onError: (error) => {
      console.error('Error creating invoice for teleconsultation:', error);
      // Ne pas afficher d'erreur toast car c'est automatique
    },
  });
}

// ============================================================================
// NOTES HOOKS
// ============================================================================

/**
 * Créer une note pendant la téléconsultation
 */
export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateNoteRequest) =>
      teleconsultationService.createNote(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: teleconsultationKeys.notes(data.teleconsultation_id),
      });
      toast.success('Note ajoutée');
    },
    onError: (error) => {
      console.error('Error creating note:', error);
      toast.error('Erreur lors de la création de la note');
    },
  });
}

/**
 * Récupérer les notes d'une téléconsultation
 */
export function useTeleconsultationNotes(teleconsultationId: string | null) {
  return useQuery({
    queryKey: teleconsultationKeys.notes(teleconsultationId || ''),
    queryFn: () => teleconsultationService.getNotes(teleconsultationId!),
    enabled: !!teleconsultationId,
  });
}

/**
 * Supprimer une note (soft delete)
 */
export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => teleconsultationService.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.all });
      toast.success('Note supprimée');
    },
    onError: (error) => {
      console.error('Error deleting note:', error);
      toast.error('Erreur lors de la suppression');
    },
  });
}

// ============================================================================
// RECORDING HOOKS
// ============================================================================

/**
 * Démarrer un enregistrement
 */
export function useStartRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: StartRecordingRequest) =>
      teleconsultationService.startRecording(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.detail(data.teleconsultation_id) });
      toast.success('Enregistrement démarré');
    },
    onError: (error) => {
      console.error('Error starting recording:', error);
      toast.error('Erreur lors du démarrage de l\'enregistrement');
    },
  });
}

/**
 * Mettre à jour un enregistrement
 */
export function useUpdateRecording() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recordingId,
      updates,
    }: {
      recordingId: string;
      updates: Parameters<typeof teleconsultationService.updateRecording>[1];
    }) => teleconsultationService.updateRecording(recordingId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teleconsultationKeys.detail(data.teleconsultation_id) });

      if (data.status === 'completed') {
        toast.success('Enregistrement terminé');
      }
    },
    onError: (error) => {
      console.error('Error updating recording:', error);
      toast.error('Erreur lors de la mise à jour de l\'enregistrement');
    },
  });
}
