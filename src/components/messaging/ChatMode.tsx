import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Send,
  Paperclip,
  ChevronLeft,
  Pin,
  BellOff,
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Zap,
  X,
  Phone,
  Video,
  Info,
  Mic,
  Trash2,
  Edit3,
  Reply,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ChatConversation, ChatMessage, DeliveryStatus, QuickReply } from '@/types/messaging';
import {
  mockChatConversations,
  mockChatMessages,
  mockQuickReplies,
  currentUser,
} from '@/data/messagingMockData';
import {
  useConversations,
  useSendMessage,
  useMessages,
  useMarkAsRead,
  useTogglePin,
  useToggleMute,
  useDeleteMessage,
  useUpdateMessage,
} from '@/hooks/data/useMessaging';
import {
  useRealtimeMessages,
  useRealtimeConversations,
  useTypingIndicator,
  usePresence,
} from '@/hooks/useRealtimeMessaging';
import { useToast } from '@/hooks/use-toast';
import VoiceRecorder from './VoiceRecorder';
import VoicePlayer from './VoicePlayer';
import AttachmentPreview from './AttachmentPreview';
import ChatFileUpload from './ChatFileUpload';

// ── Delivery Status Icon ────────────────────────

const DeliveryIcon: React.FC<{ status: DeliveryStatus }> = ({ status }) => {
  if (status === 'read') return <CheckCheck className="h-3 w-3 text-primary" />;
  if (status === 'delivered') return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
  if (status === 'failed') return <AlertCircle className="h-3 w-3 text-destructive" />;
  if (status === 'sending') return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
  return <Check className="h-3 w-3 text-muted-foreground" />;
};

// ── Helper: Map DB row to ChatMessage ───────────

function mapDbMessageToChat(row: Record<string, any>): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    text: row.content || '',
    type: row.type || 'text',
    timestamp: row.created_at,
    deliveryStatus: row.delivery_status || 'sent',
    isEdited: row.is_edited || false,
    editedAt: row.edited_at,
    isDeleted: row.is_deleted || false,
    attachments: row.attachments,
    voiceData: row.metadata?.voice,
    replyTo: row.reply_to,
    metadata: row.metadata,
  };
}

// ── Helper: Map DB row to ChatConversation ──────

function mapDbConversationToChat(
  row: Record<string, any>,
  _isOnline?: (userId: string) => boolean
): ChatConversation {
  return {
    id: row.id,
    participants: row.participants || [],
    lastMessage: row.last_message || '',
    lastMessageTime: row.last_message_at || row.updated_at || row.created_at,
    lastMessageSenderId: row.last_message_sender_id || '',
    unreadCount: row.unread_count || 0,
    isPinned: row.is_pinned || false,
    isMuted: row.is_muted || false,
    isTyping: false,
    isArchived: row.is_archived || false,
    createdAt: row.created_at,
    patientId: row.patient_id,
    subject: row.subject,
    conversationType: row.conversation_type,
  };
}

// ── Props ────────────────────────────────────────

interface ChatModeProps {
  patientId?: string;
}

// ── Main Component ──────────────────────────────

const ChatMode: React.FC<ChatModeProps> = ({ patientId }) => {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Try to load real data from Supabase (filtered by patient when provided)
  const {
    data: dbConversations,
    isLoading: loadingConversations,
    isError: conversationsError,
  } = useConversations(patientId ? { patientId } : undefined);

  // State
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplyFilter, setQuickReplyFilter] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<import('@/types/messaging').MessageAttachment[]>([]);

  // Real data hooks
  const {
    data: dbMessages,
    isLoading: loadingMessages,
  } = useMessages(selectedConvId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkAsRead();
  const togglePinMutation = useTogglePin();
  const toggleMuteMutation = useToggleMute();
  const deleteMessageMutation = useDeleteMessage();
  const updateMessageMutation = useUpdateMessage();

  // Realtime subscriptions
  useRealtimeMessages(selectedConvId);
  useRealtimeConversations();
  const { typingUsers, sendTyping } = useTypingIndicator(selectedConvId);
  const { isOnline } = usePresence();

  // Determine if using real data or mock fallback
  const useRealData = !conversationsError && dbConversations && dbConversations.length > 0;

  // Mock state fallback
  const [mockConversations, setMockConversations] = useState<ChatConversation[]>(mockChatConversations);
  const [mockMessages, setMockMessages] = useState<Record<string, ChatMessage[]>>(mockChatMessages);

  // Unified conversations
  const conversations: ChatConversation[] = useMemo(() => {
    if (useRealData) {
      return dbConversations.map((row: Record<string, any>) => mapDbConversationToChat(row, isOnline));
    }
    return mockConversations;
  }, [useRealData, dbConversations, mockConversations, isOnline]);

  // Unified messages for selected conversation
  const selectedMessages: ChatMessage[] = useMemo(() => {
    if (!selectedConvId) return [];
    if (useRealData && dbMessages) {
      return dbMessages.map((row: Record<string, any>) => mapDbMessageToChat(row));
    }
    return mockMessages[selectedConvId] || [];
  }, [selectedConvId, useRealData, dbMessages, mockMessages]);

  const selectedConv = selectedConvId
    ? conversations.find((c) => c.id === selectedConvId)
    : null;
  const otherParticipant = selectedConv?.participants.find((p) => p.id !== currentUser.id);

  // Filtered conversations
  const filteredConvs = useMemo(() => {
    const sorted = [...conversations].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });
    if (!searchQuery) return sorted;
    return sorted.filter((c) => {
      const other = c.participants.find((p) => p.id !== currentUser.id);
      return (
        other?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [conversations, searchQuery]);

  const filteredQuickReplies = useMemo(() => {
    if (!quickReplyFilter) return mockQuickReplies;
    return mockQuickReplies.filter((qr) =>
      `${qr.label} ${qr.text}`.toLowerCase().includes(quickReplyFilter.toLowerCase())
    );
  }, [quickReplyFilter]);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedMessages.length]);

  // Typing indicator debounce
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = useCallback(
    (value: string) => {
      setMessageInput(value);
      if (useRealData && selectedConvId) {
        sendTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          sendTyping(false);
        }, 2000);
      }
    },
    [useRealData, selectedConvId, sendTyping]
  );

  // ── Handlers ────────────────────────────────────

  const handleSelectConv = (convId: string) => {
    setSelectedConvId(convId);
    setEditingMessageId(null);
    setReplyToMessage(null);

    if (useRealData) {
      markAsReadMutation.mutate(convId);
    } else {
      setMockConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
      );
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConvId) return;

    // Editing existing message
    if (editingMessageId) {
      if (useRealData) {
        updateMessageMutation.mutate({
          messageId: editingMessageId,
          conversationId: selectedConvId,
          content: messageInput.trim(),
        });
      } else {
        setMockMessages((prev) => ({
          ...prev,
          [selectedConvId]: (prev[selectedConvId] || []).map((m) =>
            m.id === editingMessageId
              ? { ...m, text: messageInput.trim(), isEdited: true }
              : m
          ),
        }));
      }
      setEditingMessageId(null);
      setMessageInput('');
      return;
    }

    // New message
    if (useRealData) {
      sendMessageMutation.mutate({
        conversationId: selectedConvId,
        content: messageInput.trim(),
        type: 'text',
        replyTo: replyToMessage?.id,
      });
      sendTyping(false);
    } else {
      const newMsg: ChatMessage = {
        id: `cm-${Date.now()}`,
        conversationId: selectedConvId,
        senderId: currentUser.id,
        text: messageInput.trim(),
        type: 'text',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        deliveryStatus: 'sent',
        isEdited: false,
        replyTo: replyToMessage?.id,
      };
      setMockMessages((prev) => ({
        ...prev,
        [selectedConvId]: [...(prev[selectedConvId] || []), newMsg],
      }));
      setMockConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvId
            ? {
                ...c,
                lastMessage: messageInput.trim(),
                lastMessageTime: newMsg.timestamp,
                lastMessageSenderId: currentUser.id,
              }
            : c
        )
      );
    }
    setMessageInput('');
    setShowQuickReplies(false);
    setReplyToMessage(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!selectedConvId) return;
    if (useRealData) {
      deleteMessageMutation.mutate({ messageId, conversationId: selectedConvId });
    } else {
      setMockMessages((prev) => ({
        ...prev,
        [selectedConvId]: (prev[selectedConvId] || []).filter((m) => m.id !== messageId),
      }));
    }
  };

  const handleEditMessage = (msg: ChatMessage) => {
    setEditingMessageId(msg.id);
    setMessageInput(msg.text);
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyToMessage(msg);
  };

  const handleQuickReply = (qr: QuickReply) => {
    setMessageInput(qr.text);
    setShowQuickReplies(false);
  };

  const handleTogglePin = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const newPinned = !conv.isPinned;
    if (useRealData) {
      togglePinMutation.mutate({ conversationId: convId, isPinned: newPinned });
    } else {
      setMockConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, isPinned: newPinned } : c))
      );
      toast({
        title: newPinned ? 'Conversation epinglee' : 'Conversation desepinglee',
      });
    }
  };

  const handleToggleMute = (convId: string) => {
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    const newMuted = !conv.isMuted;
    if (useRealData) {
      toggleMuteMutation.mutate({ conversationId: convId, isMuted: newMuted });
    } else {
      setMockConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, isMuted: newMuted } : c))
      );
      toast({
        title: newMuted ? 'Notifications desactivees' : 'Notifications activees',
      });
    }
  };

  // ── Time Formatting ─────────────────────────────

  const formatTime = (ts: string) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatMsgTime = (ts: string) => {
    return new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getDateSeparator = (timestamp: string, prevTimestamp?: string) => {
    const date = new Date(timestamp);
    const prev = prevTimestamp ? new Date(prevTimestamp) : null;
    if (prev && date.toDateString() === prev.toDateString()) return null;
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return "Aujourd'hui";
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Hier';
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  // Check if currently someone is typing
  const isAnyoneTyping = selectedConv?.isTyping || typingUsers.length > 0;

  return (
    <div className="flex h-full">
      {/* Conversations sidebar */}
      <div
        className={cn(
          'w-80 lg:w-96 border-r border-border flex flex-col flex-shrink-0',
          selectedConvId ? 'hidden md:flex' : 'flex flex-1 md:flex-none'
        )}
      >
        {/* Header */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Conversations</h2>
              <Badge className={cn("h-5 min-w-[20px] justify-center text-xs", totalUnread === 0 && "invisible")}>
                {totalUnread}
              </Badge>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? [...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-border animate-pulse">
              <div className="h-10 w-10 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2 py-0.5">
                <div className="flex items-center justify-between">
                  <div className="h-3.5 bg-muted rounded" style={{ width: `${80 + (i % 3) * 30}px` }} />
                  <div className="h-3 bg-muted rounded w-10" />
                </div>
                <div className="h-3 bg-muted rounded" style={{ width: `${120 + (i % 4) * 25}px` }} />
              </div>
            </div>
          )) : filteredConvs.map((conv) => {
            const other = conv.participants.find((p) => p.id !== currentUser.id);
            if (!other) return null;
            const isSelected = selectedConvId === conv.id;
            const isMine = conv.lastMessageSenderId === currentUser.id;
            const otherIsOnline = useRealData ? isOnline(other.id) : other.isOnline;
            return (
              <button
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={cn(
                  'w-full text-left px-4 py-3 border-b border-border hover:bg-muted/40 transition-colors',
                  isSelected && 'bg-primary/5',
                  conv.unreadCount > 0 && !isSelected && 'bg-blue-50/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback
                        className={cn(
                          'text-sm font-medium',
                          other.avatarColor || 'bg-primary/10 text-primary'
                        )}
                      >
                        {other.initials}
                      </AvatarFallback>
                    </Avatar>
                    {otherIsOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {conv.isPinned && <Pin className="h-3 w-3 text-primary flex-shrink-0" />}
                        {conv.isMuted && (
                          <BellOff className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                        <span
                          className={cn(
                            'text-sm truncate',
                            conv.unreadCount > 0 ? 'font-semibold' : 'font-medium'
                          )}
                        >
                          {other.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        {isMine && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            Vous :{' '}
                          </span>
                        )}
                        <p
                          className={cn(
                            'text-xs truncate',
                            conv.unreadCount > 0
                              ? 'text-foreground font-medium'
                              : 'text-muted-foreground'
                          )}
                        >
                          {conv.lastMessage}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        {conv.isTyping && (
                          <span className="text-xs text-primary font-medium animate-pulse">
                            ecrit...
                          </span>
                        )}
                        {conv.unreadCount > 0 && !conv.isTyping && (
                          <Badge className="h-5 min-w-[20px] justify-center text-xs">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          !selectedConvId ? 'hidden md:flex' : 'flex'
        )}
      >
        {selectedConv && otherParticipant ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => setSelectedConvId(null)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarFallback
                  className={cn(
                    'text-sm font-medium',
                    otherParticipant.avatarColor || 'bg-primary/10 text-primary'
                  )}
                >
                  {otherParticipant.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{otherParticipant.name}</p>
                <p className="text-xs text-muted-foreground">
                  {isAnyoneTyping ? (
                    <span className="text-primary animate-pulse">Ecrit un message...</span>
                  ) : (useRealData ? isOnline(otherParticipant.id) : otherParticipant.isOnline) ? (
                    <span className="text-green-600">En ligne</span>
                  ) : (
                    'Hors ligne'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toast({ title: 'Appel telephonique' })}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toast({ title: 'Appel video' })}
                >
                  <Video className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleTogglePin(selectedConv.id)}>
                      <Pin className="h-3.5 w-3.5 mr-2" />
                      {selectedConv.isPinned ? 'Desepingler' : 'Epingler'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleMute(selectedConv.id)}>
                      <BellOff className="h-3.5 w-3.5 mr-2" />
                      {selectedConv.isMuted ? 'Activer notifications' : 'Couper notifications'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toast({ title: 'Informations du contact' })}
                    >
                      <Info className="h-3.5 w-3.5 mr-2" />
                      Voir le profil
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {loadingMessages && (
                <div className="space-y-3 py-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={cn("flex animate-pulse", i % 2 === 0 ? "justify-start" : "justify-end")}>
                      {i % 2 === 0 && <div className="h-7 w-7 rounded-full bg-muted mr-2 flex-shrink-0" />}
                      <div
                        className={cn("rounded-2xl px-4 py-3 space-y-1.5", i % 2 === 0 ? "bg-muted" : "bg-primary/10")}
                        style={{ width: `${100 + (i % 3) * 50}px` }}
                      >
                        <div className="h-3 bg-muted-foreground/10 rounded w-full" />
                        {i % 3 !== 2 && <div className="h-3 bg-muted-foreground/10 rounded w-2/3" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!loadingMessages && selectedMessages.map((msg, idx) => {
                const isMine = msg.senderId === currentUser.id;
                const isSystem = msg.type === 'system';
                const dateSep = getDateSeparator(
                  msg.timestamp,
                  idx > 0 ? selectedMessages[idx - 1].timestamp : undefined
                );

                return (
                  <React.Fragment key={msg.id}>
                    {dateSep && (
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground font-medium px-2">
                          {dateSep}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    {isSystem ? (
                      <div className="flex justify-center my-3">
                        <div className="bg-muted/60 border border-border rounded-full px-4 py-1.5">
                          <p className="text-xs text-muted-foreground">{msg.text}</p>
                        </div>
                      </div>
                    ) : (
                      <div className={cn('flex mb-3 group', isMine ? 'justify-end' : 'justify-start')}>
                        {!isMine && (
                          <Avatar className="h-7 w-7 mr-2 mt-1 flex-shrink-0">
                            <AvatarFallback
                              className={cn(
                                'text-xs',
                                otherParticipant.avatarColor || 'bg-primary/10 text-primary'
                              )}
                            >
                              {otherParticipant.initials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn('max-w-[70%]')}>
                          {/* Reply preview */}
                          {msg.replyTo && (
                            <div className="mb-1 px-3 py-1 bg-muted/50 rounded-lg border-l-2 border-primary/40">
                              <p className="text-xs text-muted-foreground truncate">
                                Message cite
                              </p>
                            </div>
                          )}
                          <div
                            className={cn(
                              'rounded-2xl px-4 py-2.5 relative',
                              isMine
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            )}
                          >
                            {/* Voice message rendering */}
                            {msg.type === 'voice' && msg.voiceData ? (
                              <VoicePlayer voiceData={msg.voiceData} isMine={isMine} />
                            ) : (
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            )}

                            {/* File attachments */}
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2 space-y-1.5">
                                {msg.attachments.map((att) => (
                                  <AttachmentPreview
                                    key={att.id}
                                    attachment={att}
                                    isMine={isMine}
                                  />
                                ))}
                              </div>
                            )}

                            {/* Context menu on hover */}
                            {isMine && (
                              <div className="absolute -left-20 top-1 hidden group-hover:flex items-center gap-0.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleReply(msg)}
                                >
                                  <Reply className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleEditMessage(msg)}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            {!isMine && (
                              <div className="absolute -right-8 top-1 hidden group-hover:flex">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleReply(msg)}
                                >
                                  <Reply className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div
                            className={cn(
                              'flex items-center gap-1 mt-0.5 px-1',
                              isMine ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <span
                              className={cn(
                                'text-xs',
                                isMine ? 'text-muted-foreground' : 'text-muted-foreground/70'
                              )}
                            >
                              {formatMsgTime(msg.timestamp)}
                            </span>
                            {isMine && <DeliveryIcon status={msg.deliveryStatus} />}
                            {msg.isEdited && (
                              <span className="text-xs text-muted-foreground italic">modifie</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies panel */}
            {showQuickReplies && (
              <div className="border-t border-border bg-muted/20 px-4 py-3 max-h-48 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    Reponses rapides
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowQuickReplies(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  placeholder="Filtrer..."
                  value={quickReplyFilter}
                  onChange={(e) => setQuickReplyFilter(e.target.value)}
                  className="h-7 text-xs mb-2"
                />
                <div className="space-y-1">
                  {filteredQuickReplies.map((qr) => (
                    <button
                      key={qr.id}
                      onClick={() => handleQuickReply(qr)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs h-4 flex-shrink-0">
                          {qr.category}
                        </Badge>
                        <span className="text-xs font-medium">{qr.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{qr.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reply preview bar */}
            {replyToMessage && (
              <div className="px-4 py-2 border-t border-border bg-muted/30 flex items-center gap-2">
                <Reply className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    Reponse a : {replyToMessage.text}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setReplyToMessage(null)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Edit indicator */}
            {editingMessageId && (
              <div className="px-4 py-2 border-t border-border bg-amber-50 flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <span className="text-xs text-amber-700">Modification en cours</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto"
                  onClick={() => {
                    setEditingMessageId(null);
                    setMessageInput('');
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* File upload panel */}
            {showFileUpload && (
              <ChatFileUpload
                onFilesReady={(attachments) => {
                  setPendingAttachments(attachments);
                  setShowFileUpload(false);
                  // Auto-send with attachments
                  if (selectedConvId && useRealData) {
                    sendMessageMutation.mutate({
                      conversationId: selectedConvId,
                      content: messageInput.trim() || 'Piece(s) jointe(s)',
                      type: 'file',
                      attachments,
                    });
                    setMessageInput('');
                    setPendingAttachments([]);
                  } else {
                    toast({ title: `${attachments.length} fichier(s) pret(s) a envoyer` });
                  }
                }}
                onCancel={() => setShowFileUpload(false)}
              />
            )}

            {/* Input area */}
            <div className="px-4 py-3 border-t border-border">
              {showVoiceRecorder ? (
                <VoiceRecorder
                  onRecordingComplete={async (audioBlob, durationMs, waveform) => {
                    setShowVoiceRecorder(false);
                    if (selectedConvId && useRealData) {
                      const { uploadVoiceMessage } = await import('@/services/supabase/messagesService');
                      const voiceData = await uploadVoiceMessage(audioBlob, durationMs, waveform);
                      sendMessageMutation.mutate({
                        conversationId: selectedConvId,
                        content: 'Message vocal',
                        type: 'voice',
                        voiceData,
                      });
                    } else {
                      toast({ title: `Message vocal enregistre (${Math.floor(durationMs / 1000)}s)` });
                    }
                  }}
                  onCancel={() => setShowVoiceRecorder(false)}
                />
              ) : (
                <div className="flex items-end gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn('h-9 w-9', showFileUpload && 'bg-primary/10 text-primary')}
                      onClick={() => {
                        setShowFileUpload(!showFileUpload);
                        setShowVoiceRecorder(false);
                      }}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => {
                        setShowVoiceRecorder(true);
                        setShowFileUpload(false);
                      }}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        'h-9 w-9',
                        showQuickReplies && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => {
                        setShowQuickReplies(!showQuickReplies);
                        setQuickReplyFilter('');
                      }}
                    >
                      <Zap className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Ecrire un message..."
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-9 w-9 flex-shrink-0"
                    disabled={!messageInput.trim() || sendMessageMutation.isPending}
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8 opacity-30" />
              </div>
              <p className="text-sm font-medium">Messagerie securisee</p>
              <p className="text-xs mt-1 max-w-xs">
                Selectionnez une conversation pour echanger en toute confidentialite.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMode;
