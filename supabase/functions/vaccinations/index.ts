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
  const vaccinationId = pathParts[1];

  try {
    switch (req.method) {
      case 'GET': {
        if (vaccinationId) {
          const { data, error } = await supabaseClient
            .from('vaccinations')
            .select(`
              *,
              practitioner:practitioners(id, first_name, last_name)
            `)
            .eq('id', vaccinationId)
            .single();

          if (error || !data) {
            return notFoundResponse('Vaccination');
          }
          return jsonResponse(data);
        } else {
          const pagination = getPaginationParams(url);
          const patientId = url.searchParams.get('patient_id');

          if (!patientId) {
            return errorResponse('patient_id is required', 400);
          }

          const { data, error, count } = await supabaseClient
            .from('vaccinations')
            .select(`
              *,
              practitioner:practitioners(id, first_name, last_name)
            `, { count: 'exact' })
            .eq('patient_id', patientId)
            .order('administration_date', { ascending: false })
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
          .from('vaccinations')
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
        if (!vaccinationId) {
          return errorResponse('Vaccination ID required', 400);
        }

        const body = await req.json();
        const { data, error } = await supabaseClient
          .from('vaccinations')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', vaccinationId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!vaccinationId) {
          return errorResponse('Vaccination ID required', 400);
        }

        const { error } = await supabaseClient
          .from('vaccinations')
          .delete()
          .eq('id', vaccinationId);

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
