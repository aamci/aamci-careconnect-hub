// Secure Enterprise Messaging Types - CareConnect Hub

// ── Common ──────────────────────────────────────
export type MessageMode = 'email' | 'chat';

export type ParticipantRole = 'practitioner' | 'patient' | 'secretary' | 'lab' | 'pharmacy' | 'specialist';

export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

export interface MessageParticipant {
  id: string;
  name: string;
  initials: string;
  role: ParticipantRole;
  email: string;
  isOnline: boolean;
  presenceStatus?: PresenceStatus;
  lastSeenAt?: string;
  avatarColor?: string;
  avatarUrl?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  storageUrl?: string;
  thumbnailUrl?: string;
  checksum?: string;
  uploadProgress?: number;
}

// ── Voice Message ───────────────────────────────
export interface VoiceMessageData {
  durationMs: number;
  waveform?: number[];
  mimeType: string;
  storageUrl: string;
  transcription?: string;
}

// ── Email Mode ──────────────────────────────────

export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'archive' | 'trash';

export type EmailPriority = 'low' | 'normal' | 'high';

export interface EmailMessage {
  id: string;
  threadId: string;
  from: MessageParticipant;
  to: MessageParticipant[];
  cc?: MessageParticipant[];
  subject: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  priority: EmailPriority;
  folder: EmailFolder;
  attachments: MessageAttachment[];
  hasReadReceipt: boolean;
  readAt?: string;
}

export interface EmailThread {
  id: string;
  subject: string;
  participants: MessageParticipant[];
  messages: EmailMessage[];
  lastMessageDate: string;
  unreadCount: number;
  isStarred: boolean;
  folder: EmailFolder;
  hasAttachments: boolean;
}

export interface EmailFolderInfo {
  id: EmailFolder;
  label: string;
  count: number;
  unreadCount: number;
}

export interface ComposeEmailData {
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  priority: EmailPriority;
  attachments: MessageAttachment[];
  requestReadReceipt: boolean;
  replyToId?: string;
  forwardFromId?: string;
}

// ── Chat Mode ───────────────────────────────────

export type ChatMessageType = 'text' | 'system' | 'attachment' | 'appointment' | 'voice' | 'file';

export type DeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  type: ChatMessageType;
  timestamp: string;
  deliveryStatus: DeliveryStatus;
  attachments?: MessageAttachment[];
  voiceData?: VoiceMessageData;
  replyTo?: string;
  replyToMessage?: ChatMessage;
  isEdited: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatConversation {
  id: string;
  participants: MessageParticipant[];
  lastMessage: string;
  lastMessageTime: string;
  lastMessageSenderId: string;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isTyping: boolean;
  typingUsers?: string[];
  isArchived?: boolean;
  createdAt: string;
  patientId?: string;
  subject?: string;
  conversationType?: 'direct' | 'group' | 'patient_care';
}

export interface QuickReply {
  id: string;
  label: string;
  text: string;
  category: string;
}

// ── Realtime Events ─────────────────────────────
export interface TypingEvent {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresenceEvent {
  userId: string;
  status: PresenceStatus;
  lastSeenAt: string;
}

// ── Service Params ──────────────────────────────
export interface SendMessageParams {
  conversationId: string;
  content: string;
  type?: ChatMessageType;
  attachments?: MessageAttachment[];
  voiceData?: VoiceMessageData;
  replyTo?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMessageParams {
  messageId: string;
  conversationId: string;
  content: string;
}

export interface CreateConversationParams {
  participantIds: string[];
  subject?: string;
  conversationType?: 'direct' | 'group' | 'patient_care';
  patientId?: string;
  initialMessage?: string;
}
