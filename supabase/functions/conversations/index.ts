import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from '../_shared/cors.ts';
import { createSupabaseClient, getUserFromRequest } from '../_shared/supabase.ts';
import { 
  jsonResponse, 
  errorResponse, 
  notFoundResponse, 
  unauthorizedResponse,
  getPaginationParams,
  paginatedResponse
} from '../_shared/response.ts';

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const user = await getUserFromRequest(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const { supabaseClient } = createSupabaseClient(req);
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const conversationId = pathParts[1];
  const subResource = pathParts[2]; // messages

  try {
    // Handle messages sub-resource
    if (conversationId && subResource === 'messages') {
      return handleMessages(req, supabaseClient, user, conversationId, url);
    }

    switch (req.method) {
      case 'GET': {
        if (conversationId) {
          const { data, error } = await supabaseClient
            .from('conversations')
            .select(`
              *,
              patient:patients(id, first_name, last_name),
              participants:conversation_participants(
                *,
                user:profiles(*)
              ),
              messages:messages(*)
            `)
            .eq('id', conversationId)
            .single();

          if (error || !data) {
            return notFoundResponse('Conversation');
          }
          return jsonResponse(data);
        } else {
          const pagination = getPaginationParams(url);
          const patientId = url.searchParams.get('patient_id');

          let query = supabaseClient
            .from('conversations')
            .select(`
              *,
              patient:patients(id, first_name, last_name),
              participants:conversation_participants(user_id)
            `, { count: 'exact' })
            .eq('is_archived', false)
            .order('last_message_at', { ascending: false, nullsFirst: false });

          if (patientId) {
            query = query.eq('patient_id', patientId);
          }

          const { data, error, count } = await query
            .range(pagination.offset, pagination.offset + pagination.limit - 1);

          if (error) {
            return errorResponse(error.message, 500);
          }
          return paginatedResponse(data || [], count || 0, pagination);
        }
      }

      case 'POST': {
        const body = await req.json();
        const { participants, ...conversationData } = body;

        // Create conversation
        const { data: conversation, error } = await supabaseClient
          .from('conversations')
          .insert({
            ...conversationData,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }

        // Add creator as participant
        await supabaseClient.from('conversation_participants').insert({
          conversation_id: conversation.id,
          user_id: user.id,
          role: 'admin',
        });

        // Add other participants
        if (participants && participants.length > 0) {
          const participantRows = participants.map((userId: string) => ({
            conversation_id: conversation.id,
            user_id: userId,
            role: 'member',
          }));
          await supabaseClient.from('conversation_participants').insert(participantRows);
        }

        return jsonResponse(conversation, 201);
      }

      case 'PUT':
      case 'PATCH': {
        if (!conversationId) {
          return errorResponse('Conversation ID required', 400);
        }

        const body = await req.json();
        const { data, error } = await supabaseClient
          .from('conversations')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversationId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!conversationId) {
          return errorResponse('Conversation ID required', 400);
        }

        // Archive instead of delete
        const { error } = await supabaseClient
          .from('conversations')
          .update({ is_archived: true })
          .eq('id', conversationId);

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse({ success: true });
      }

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});

async function handleMessages(
  req: Request,
  supabaseClient: any,
  user: any,
  conversationId: string,
  url: URL
) {
  const pagination = getPaginationParams(url);

  switch (req.method) {
    case 'GET': {
      const { data, error, count } = await supabaseClient
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .range(pagination.offset, pagination.offset + pagination.limit - 1);

      if (error) {
        return errorResponse(error.message, 500);
      }
      return paginatedResponse(data || [], count || 0, pagination);
    }

    case 'POST': {
      const body = await req.json();
      const { data, error } = await supabaseClient
        .from('messages')
        .insert({
          ...body,
          conversation_id: conversationId,
          sender_id: user.id,
        })
        .select()
        .single();

      if (error) {
        return errorResponse(error.message, 400);
      }

      // Update conversation last_message_at
      await supabaseClient
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      return jsonResponse(data, 201);
    }

    default:
      return errorResponse('Method not allowed', 405);
  }
}
