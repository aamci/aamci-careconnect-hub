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
  const waitingListId = pathParts[1];

  try {
    switch (req.method) {
      case 'GET': {
        if (waitingListId) {
          const { data, error } = await supabaseClient
            .from('waiting_list')
            .select(`
              *,
              patient:patients(id, first_name, last_name, phone),
              practitioner:practitioners(id, first_name, last_name),
              motif:appointment_motifs(id, name)
            `)
            .eq('id', waitingListId)
            .single();

          if (error || !data) {
            return notFoundResponse('Waiting list entry');
          }
          return jsonResponse(data);
        } else {
          const pagination = getPaginationParams(url);
          const practitionerId = url.searchParams.get('practitioner_id');
          const status = url.searchParams.get('status') || 'active';

          let query = supabaseClient
            .from('waiting_list')
            .select(`
              *,
              patient:patients(id, first_name, last_name, phone),
              practitioner:practitioners(id, first_name, last_name),
              motif:appointment_motifs(id, name)
            `, { count: 'exact' })
            .eq('status', status)
            .order('priority', { ascending: true })
            .order('created_at', { ascending: true });

          if (practitionerId) {
            query = query.eq('practitioner_id', practitionerId);
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
        const { data, error } = await supabaseClient
          .from('waiting_list')
          .insert({
            ...body,
            created_by: user.id,
          })
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data, 201);
      }

      case 'PUT':
      case 'PATCH': {
        if (!waitingListId) {
          return errorResponse('Waiting list ID required', 400);
        }

        const body = await req.json();
        
        // Handle contact action
        if (body.action === 'contact') {
          body.status = 'contacted';
          body.contacted_at = new Date().toISOString();
          delete body.action;
        }
        
        // Handle schedule action
        if (body.action === 'schedule' && body.appointment_id) {
          body.status = 'scheduled';
          body.scheduled_appointment_id = body.appointment_id;
          delete body.action;
          delete body.appointment_id;
        }

        const { data, error } = await supabaseClient
          .from('waiting_list')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', waitingListId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!waitingListId) {
          return errorResponse('Waiting list ID required', 400);
        }

        const { error } = await supabaseClient
          .from('waiting_list')
          .update({ status: 'cancelled' })
          .eq('id', waitingListId);

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
