import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors } from '../_shared/cors.ts';
import { createSupabaseClient, getUserFromRequest } from '../_shared/supabase.ts';
import { 
  jsonResponse, 
  errorResponse, 
  notFoundResponse, 
  unauthorizedResponse 
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
  const practitionerId = pathParts[1];

  try {
    switch (req.method) {
      case 'GET': {
        if (practitionerId) {
          const { data, error } = await supabaseClient
            .from('practitioners')
            .select(`
              *,
              availability:practitioner_availability(*),
              exceptions:practitioner_exceptions(*)
            `)
            .eq('id', practitionerId)
            .eq('is_active', true)
            .single();

          if (error || !data) {
            return notFoundResponse('Practitioner');
          }
          return jsonResponse(data);
        } else {
          const siteId = url.searchParams.get('site_id');
          const specialty = url.searchParams.get('specialty');

          let query = supabaseClient
            .from('practitioners')
            .select('*')
            .eq('is_active', true)
            .order('last_name', { ascending: true });

          if (siteId) {
            query = query.contains('site_ids', [siteId]);
          }
          if (specialty) {
            query = query.eq('specialty', specialty);
          }

          const { data, error } = await query;

          if (error) {
            return errorResponse(error.message, 500);
          }
          return jsonResponse(data || []);
        }
      }

      case 'POST': {
        const body = await req.json();
        const { data, error } = await supabaseClient
          .from('practitioners')
          .insert(body)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data, 201);
      }

      case 'PUT':
      case 'PATCH': {
        if (!practitionerId) {
          return errorResponse('Practitioner ID required', 400);
        }

        const body = await req.json();
        const { data, error } = await supabaseClient
          .from('practitioners')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', practitionerId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!practitionerId) {
          return errorResponse('Practitioner ID required', 400);
        }

        const { error } = await supabaseClient
          .from('practitioners')
          .update({ is_active: false })
          .eq('id', practitionerId);

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
