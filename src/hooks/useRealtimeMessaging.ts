/**
 * Supabase Realtime hooks for live messaging
 * Handles new messages, typing indicators, and presence
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { messagingKeys } from '@/hooks/data/useMessaging';
import { TypingEvent } from '@/types/messaging';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ── New Messages Subscription ───────────────────

export function useRealtimeMessages(conversationId: string | null) {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          // Invalidate messages query to refetch
          queryClient.invalidateQueries({
            queryKey: messagingKeys.messages(conversationId),
          });
          // Also update conversations list (last message preview)
          queryClient.invalidateQueries({
            queryKey: messagingKeys.conversations(),
          });
          queryClient.invalidateQueries({
            queryKey: messagingKeys.unreadCount(),
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId, queryClient]);
}

// ── Conversations List Subscription ─────────────

export function useRealtimeConversations() {
  const queryClient = useQueryClient();
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel('conversations:all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: messagingKeys.conversations(),
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient]);
}

// ── Typing Indicators ───────────────────────────

export function useTypingIndicator(conversationId: string | null) {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!conversationId) {
      setTypingUsers([]);
      return;
    }

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const event = payload as TypingEvent;

        if (event.isTyping) {
          setTypingUsers((prev) => {
            if (prev.includes(event.userId)) return prev;
            return [...prev, event.userId];
          });

          // Auto-clear after 5 seconds
          const existing = timeoutsRef.current.get(event.userId);
          if (existing) clearTimeout(existing);

          const timeout = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((id) => id !== event.userId));
            timeoutsRef.current.delete(event.userId);
          }, 5000);

          timeoutsRef.current.set(event.userId, timeout);
        } else {
          setTypingUsers((prev) => prev.filter((id) => id !== event.userId));
          const existing = timeoutsRef.current.get(event.userId);
          if (existing) {
            clearTimeout(existing);
            timeoutsRef.current.delete(event.userId);
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
      setTypingUsers([]);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [conversationId]);

  const sendTyping = useCallback(
    async (isTyping: boolean) => {
      if (!conversationId) return;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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
      } catch {
        // Typing indicators are non-critical
      }
    },
    [conversationId]
  );

  return { typingUsers, sendTyping };
}

// ── Presence (Online/Offline) ───────────────────

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const setupPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('presence:global')
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          const users = new Set<string>();
          Object.values(state).forEach((presences) => {
            (presences as Array<{ user_id: string }>).forEach((p) => {
              users.add(p.user_id);
            });
          });
          setOnlineUsers(users);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({ user_id: user.id, online_at: new Date().toISOString() });
          }
        });

      channelRef.current = channel;
    };

    setupPresence();

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  const isOnline = useCallback(
    (userId: string) => onlineUsers.has(userId),
    [onlineUsers]
  );

  return { onlineUsers, isOnline };
}
