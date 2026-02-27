/**
 * Messaging Service - Supabase CRUD operations
 * Handles conversations, messages, attachments, and delivery status
 */

import { supabase } from '@/integrations/supabase/client';
import {
  SendMessageParams,
  UpdateMessageParams,
  CreateConversationParams,
  MessageAttachment,
} from '@/types/messaging';
import { uploadFileToStorage } from '@/lib/fileUtils';

// ── Auth Helper ─────────────────────────────────

async function requireAuth() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return user;
}

// ── Conversations ───────────────────────────────

export async function fetchConversations(options?: {
  patientId?: string;
  includeArchived?: boolean;
}) {
  const user = await requireAuth();

  let query = supabase
    .from('conversations')
    .select('*')
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (!options?.includeArchived) {
    query = query.eq('is_archived', false);
  }

  if (options?.patientId) {
    query = query.eq('patient_id', options.patientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function fetchConversationById(conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single();
  if (error) throw error;
  return data;
}

export async function createConversation(params: CreateConversationParams) {
  const user = await requireAuth();

  const { data: conv, error } = await supabase
    .from('conversations')
    .insert({
      created_by: user.id,
      subject: params.subject || null,
      conversation_type: params.conversationType || 'direct',
      patient_id: params.patientId || null,
      is_archived: false,
    } as any)
    .select()
    .single();
  if (error) throw error;

  // Add creator as admin participant
  await supabase.from('conversation_participants').insert({
    conversation_id: conv.id,
    user_id: user.id,
    role: 'admin',
  } as any);

  // Add other participants
  for (const userId of params.participantIds) {
    if (userId !== user.id) {
      await supabase.from('conversation_participants').insert({
        conversation_id: conv.id,
        user_id: userId,
        role: 'member',
      } as any);
    }
  }

  // Send initial message if provided
  if (params.initialMessage) {
    await sendMessage({
      conversationId: conv.id,
      content: params.initialMessage,
      type: 'text',
    });
  }

  return conv;
}

export async function archiveConversation(conversationId: string) {
  const { error } = await supabase
    .from('conversations')
    .update({ is_archived: true } as any)
    .eq('id', conversationId);
  if (error) throw error;
}

export async function unarchiveConversation(conversationId: string) {
  const { error } = await supabase
    .from('conversations')
    .update({ is_archived: false } as any)
    .eq('id', conversationId);
  if (error) throw error;
}

export async function toggleConversationPin(conversationId: string, isPinned: boolean) {
  const { error } = await supabase
    .from('conversations')
    .update({ is_pinned: isPinned } as any)
    .eq('id', conversationId);
  if (error) throw error;
}

export async function toggleConversationMute(conversationId: string, isMuted: boolean) {
  const { error } = await supabase
    .from('conversations')
    .update({ is_muted: isMuted } as any)
    .eq('id', conversationId);
  if (error) throw error;
}

// ── Messages ────────────────────────────────────

export async function fetchMessages(
  conversationId: string,
  options?: { limit?: number; before?: string }
) {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  if (options?.before) {
    query = query.lt('created_at', options.before);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage(params: SendMessageParams) {
  const user = await requireAuth();

  const messagePayload: Record<string, unknown> = {
    conversation_id: params.conversationId,
    sender_id: user.id,
    content: params.content,
    type: params.type || 'text',
    is_deleted: false,
    is_edited: false,
  };

  if (params.replyTo) {
    messagePayload.reply_to = params.replyTo;
  }

  if (params.metadata) {
    messagePayload.metadata = params.metadata;
  }

  if (params.voiceData) {
    messagePayload.metadata = {
      ...(params.metadata || {}),
      voice: params.voiceData,
    };
    messagePayload.type = 'voice';
  }

  const { data, error } = await supabase
    .from('messages')
    .insert(messagePayload as any)
    .select()
    .single();
  if (error) throw error;

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() } as any)
    .eq('id', params.conversationId);

  // Save attachments if any
  if (params.attachments && params.attachments.length > 0) {
    for (const attachment of params.attachments) {
      await supabase.from('message_attachments').insert({
        message_id: data.id,
        name: attachment.name,
        size: attachment.size,
        type: attachment.type,
        storage_url: attachment.storageUrl || attachment.url,
        thumbnail_url: attachment.thumbnailUrl,
        checksum: attachment.checksum,
      } as any);
    }
  }

  return data;
}

export async function updateMessage(params: UpdateMessageParams) {
  await requireAuth();

  const { error } = await supabase
    .from('messages')
    .update({
      content: params.content,
      is_edited: true,
      edited_at: new Date().toISOString(),
    } as any)
    .eq('id', params.messageId)
    .eq('conversation_id', params.conversationId);
  if (error) throw error;
}

export async function deleteMessage(messageId: string, conversationId: string) {
  await requireAuth();

  const { error } = await supabase
    .from('messages')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    } as any)
    .eq('id', messageId)
    .eq('conversation_id', conversationId);
  if (error) throw error;
}

// ── Read Receipts ───────────────────────────────

export async function markConversationAsRead(conversationId: string) {
  const user = await requireAuth();

  // Update all unread messages in the conversation to 'read'
  const { error } = await supabase
    .from('messages')
    .update({ delivery_status: 'read' } as any)
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .neq('delivery_status', 'read');
  if (error) throw error;

  // Update participant's last_read_at
  await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() } as any)
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id);
}

export async function updateDeliveryStatus(
  messageId: string,
  status: 'sent' | 'delivered' | 'read'
) {
  const { error } = await supabase
    .from('messages')
    .update({ delivery_status: status } as any)
    .eq('id', messageId);
  if (error) throw error;
}

// ── Participants ────────────────────────────────

export async function fetchConversationParticipants(conversationId: string) {
  const { data, error } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId);
  if (error) throw error;
  return data ?? [];
}

export async function addParticipant(
  conversationId: string,
  userId: string,
  role: 'admin' | 'member' = 'member'
) {
  const { error } = await supabase
    .from('conversation_participants')
    .insert({
      conversation_id: conversationId,
      user_id: userId,
      role,
    } as any);
  if (error) throw error;
}

export async function removeParticipant(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('conversation_participants')
    .delete()
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
  if (error) throw error;
}

// ── File Attachments ────────────────────────────

export async function uploadChatAttachment(
  file: File,
  onProgress?: (progress: number) => void
): Promise<MessageAttachment> {
  const result = await uploadFileToStorage(file, {
    bucket: 'chat-attachments',
    folder: 'messages',
    onProgress,
  });

  return {
    id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: result.filename,
    size: file.size,
    type: file.type,
    storageUrl: result.storageUrl,
    thumbnailUrl: result.thumbnailUrl,
    checksum: result.checksum,
  };
}

// ── Voice Messages ──────────────────────────────

export async function uploadVoiceMessage(
  audioBlob: Blob,
  durationMs: number,
  waveform?: number[]
) {
  const file = new File([audioBlob], `voice-${Date.now()}.webm`, {
    type: audioBlob.type || 'audio/webm',
  });

  const result = await uploadFileToStorage(file, {
    bucket: 'chat-attachments',
    folder: 'voice-messages',
  });

  return {
    durationMs,
    waveform,
    mimeType: file.type,
    storageUrl: result.storageUrl,
  };
}

// ── Typing Indicators ───────────────────────────

export async function broadcastTyping(conversationId: string, isTyping: boolean) {
  const user = await requireAuth();

  const channel = supabase.channel(`typing:${conversationId}`);
  await channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: {
      userId: user.id,
      isTyping,
      conversationId,
    },
  });
}

// ── Search ──────────────────────────────────────

export async function searchMessages(query: string, conversationId?: string) {
  let dbQuery = supabase
    .from('messages')
    .select('*')
    .eq('is_deleted', false)
    .ilike('content', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (conversationId) {
    dbQuery = dbQuery.eq('conversation_id', conversationId);
  }

  const { data, error } = await dbQuery;
  if (error) throw error;
  return data ?? [];
}

// ── Unread Count ────────────────────────────────

export async function fetchUnreadCount() {
  const user = await requireAuth();

  const { data, error } = await supabase
    .from('messages')
    .select('conversation_id', { count: 'exact' })
    .neq('sender_id', user.id)
    .neq('delivery_status', 'read')
    .eq('is_deleted', false);

  if (error) throw error;
  return data?.length ?? 0;
}
