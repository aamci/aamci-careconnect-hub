/**
 * React Query hooks for Messaging
 * Conversations, messages, attachments, voice, delivery status
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as messagingService from '@/services/supabase/messagesService';
import {
  SendMessageParams,
  UpdateMessageParams,
  CreateConversationParams,
} from '@/types/messaging';

// ── Query Keys ──────────────────────────────────

export const messagingKeys = {
  all: ['messaging'] as const,
  conversations: () => [...messagingKeys.all, 'conversations'] as const,
  conversationsList: (opts?: { patientId?: string }) =>
    [...messagingKeys.conversations(), opts ?? {}] as const,
  conversation: (id: string) => [...messagingKeys.conversations(), id] as const,
  messages: (conversationId: string) =>
    [...messagingKeys.all, 'messages', conversationId] as const,
  participants: (conversationId: string) =>
    [...messagingKeys.all, 'participants', conversationId] as const,
  unreadCount: () => [...messagingKeys.all, 'unread'] as const,
  search: (query: string, conversationId?: string) =>
    [...messagingKeys.all, 'search', query, conversationId] as const,
};

// ── Conversation Queries ────────────────────────

export function useConversations(options?: { patientId?: string }) {
  return useQuery({
    queryKey: messagingKeys.conversationsList(options),
    queryFn: () => messagingService.fetchConversations(options),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useConversation(conversationId: string | null) {
  return useQuery({
    queryKey: messagingKeys.conversation(conversationId ?? ''),
    queryFn: () => messagingService.fetchConversationById(conversationId!),
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });
}

// ── Message Queries ─────────────────────────────

export function useMessages(
  conversationId: string | null,
  options?: { limit?: number }
) {
  return useQuery({
    queryKey: messagingKeys.messages(conversationId ?? ''),
    queryFn: () =>
      messagingService.fetchMessages(conversationId!, {
        limit: options?.limit,
      }),
    enabled: !!conversationId,
    staleTime: 10 * 1000,
    refetchInterval: 15 * 1000,
  });
}

// ── Participant Queries ─────────────────────────

export function useConversationParticipants(conversationId: string | null) {
  return useQuery({
    queryKey: messagingKeys.participants(conversationId ?? ''),
    queryFn: () => messagingService.fetchConversationParticipants(conversationId!),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
  });
}

// ── Unread Count ────────────────────────────────

export function useUnreadCount() {
  return useQuery({
    queryKey: messagingKeys.unreadCount(),
    queryFn: messagingService.fetchUnreadCount,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// ── Search ──────────────────────────────────────

export function useSearchMessages(query: string, conversationId?: string) {
  return useQuery({
    queryKey: messagingKeys.search(query, conversationId),
    queryFn: () => messagingService.searchMessages(query, conversationId),
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
}

// ── Conversation Mutations ──────────────────────

export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateConversationParams) =>
      messagingService.createConversation(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      toast.success('Conversation créée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      messagingService.archiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      toast.success('Conversation archivée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useTogglePin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, isPinned }: { conversationId: string; isPinned: boolean }) =>
      messagingService.toggleConversationPin(conversationId, isPinned),
    onSuccess: (_, { isPinned }) => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      toast.success(isPinned ? 'Conversation épinglée' : 'Conversation désépinglée');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useToggleMute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, isMuted }: { conversationId: string; isMuted: boolean }) =>
      messagingService.toggleConversationMute(conversationId, isMuted),
    onSuccess: (_, { isMuted }) => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      toast.success(isMuted ? 'Notifications désactivées' : 'Notifications activées');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ── Message Mutations ───────────────────────────

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: SendMessageParams) => messagingService.sendMessage(params),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(params.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCount() });
    },
    onError: (error: Error) => {
      toast.error(`Erreur d'envoi: ${error.message}`);
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateMessageParams) => messagingService.updateMessage(params),
    onSuccess: (_, params) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(params.conversationId),
      });
      toast.success('Message modifié');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      conversationId,
    }: {
      messageId: string;
      conversationId: string;
    }) => messagingService.deleteMessage(messageId, conversationId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.messages(conversationId),
      });
      toast.success('Message supprimé');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      messagingService.markConversationAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messagingKeys.conversations() });
      queryClient.invalidateQueries({ queryKey: messagingKeys.unreadCount() });
    },
  });
}

// ── Attachment Mutations ────────────────────────

export function useUploadAttachment() {
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (progress: number) => void;
    }) => messagingService.uploadChatAttachment(file, onProgress),
    onError: (error: Error) => {
      toast.error(`Erreur upload: ${error.message}`);
    },
  });
}

// ── Voice Message Mutations ─────────────────────

export function useUploadVoiceMessage() {
  return useMutation({
    mutationFn: ({
      audioBlob,
      durationMs,
      waveform,
    }: {
      audioBlob: Blob;
      durationMs: number;
      waveform?: number[];
    }) => messagingService.uploadVoiceMessage(audioBlob, durationMs, waveform),
    onError: (error: Error) => {
      toast.error(`Erreur enregistrement vocal: ${error.message}`);
    },
  });
}

// ── Participant Mutations ───────────────────────

export function useAddParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
      role,
    }: {
      conversationId: string;
      userId: string;
      role?: 'admin' | 'member';
    }) => messagingService.addParticipant(conversationId, userId, role),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.participants(conversationId),
      });
      toast.success('Participant ajouté');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

export function useRemoveParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conversationId,
      userId,
    }: {
      conversationId: string;
      userId: string;
    }) => messagingService.removeParticipant(conversationId, userId),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({
        queryKey: messagingKeys.participants(conversationId),
      });
      toast.success('Participant retiré');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
