import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsHeaders } from '../_shared/cors.ts';
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
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const user = await getUserFromRequest(req);
  if (!user) {
    return unauthorizedResponse();
  }

  const { supabaseClient } = createSupabaseClient(req);
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const patientId = pathParts[1]; // /patients/:id

  try {
    switch (req.method) {
      case 'GET': {
        if (patientId) {
          // Get single patient
          const { data, error } = await supabaseClient
            .from('patients')
            .select(`
              *,
              patient_alerts(*)
            `)
            .eq('id', patientId)
            .eq('is_active', true)
            .single();

          if (error || !data) {
            return notFoundResponse('Patient');
          }
          return jsonResponse(data);
        } else {
          // List patients with search and pagination
          const pagination = getPaginationParams(url);
          const search = url.searchParams.get('search') || '';

          let query = supabaseClient
            .from('patients')
            .select('*, patient_alerts(*)', { count: 'exact' })
            .eq('is_active', true)
            .order('last_name', { ascending: true });

          if (search) {
            query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
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
          .from('patients')
          .insert({
            ...body,
            created_by: user.id,
            updated_by: user.id,
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
        if (!patientId) {
          return errorResponse('Patient ID required', 400);
        }

        const body = await req.json();
        const { data, error } = await supabaseClient
          .from('patients')
          .update({
            ...body,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', patientId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!patientId) {
          return errorResponse('Patient ID required', 400);
        }

        // Soft delete
        const { error } = await supabaseClient
          .from('patients')
          .update({ is_active: false, updated_by: user.id })
          .eq('id', patientId);

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
