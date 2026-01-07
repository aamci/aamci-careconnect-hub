import { supabase } from '@/integrations/supabase/client';

export async function fetchConversations(options?: { patientId?: string }) {
  let query = supabase
    .from('conversations')
    .select('*')
    .eq('is_archived', false)
    .order('last_message_at', { ascending: false, nullsFirst: false });
  if (options?.patientId) query = query.eq('patient_id', options.patientId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createConversation(conversation: any, participantIds: string[]) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  
  const { data: conv, error } = await supabase
    .from('conversations')
    .insert({ ...conversation, created_by: user.user.id } as any)
    .select()
    .single();
  if (error) throw error;
  
  await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: user.user.id, role: 'admin' } as any);
  
  for (const userId of participantIds) {
    await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: userId, role: 'member' } as any);
  }
  return conv;
}

export async function sendMessage(conversationId: string, content: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('Not authenticated');
  
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: user.user.id, content, type: 'text' } as any)
    .select()
    .single();
  if (error) throw error;
  
  await supabase.from('conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
  return data;
}
