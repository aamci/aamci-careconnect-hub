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
  const labResultId = pathParts[1];

  try {
    switch (req.method) {
      case 'GET': {
        if (labResultId) {
          const { data, error } = await supabaseClient
            .from('lab_results')
            .select(`
              *,
              patient:patients(id, first_name, last_name),
              practitioner:practitioners(id, first_name, last_name),
              document:documents(id, name, file_path)
            `)
            .eq('id', labResultId)
            .single();

          if (error || !data) {
            return notFoundResponse('Lab result');
          }
          return jsonResponse(data);
        } else {
          const pagination = getPaginationParams(url);
          const patientId = url.searchParams.get('patient_id');
          const status = url.searchParams.get('status');
          const category = url.searchParams.get('category');

          let query = supabaseClient
            .from('lab_results')
            .select(`
              *,
              patient:patients(id, first_name, last_name)
            `, { count: 'exact' })
            .order('test_date', { ascending: false });

          if (patientId) {
            query = query.eq('patient_id', patientId);
          }
          if (status) {
            query = query.eq('status', status);
          }
          if (category) {
            query = query.eq('category', category);
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
          .from('lab_results')
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
        if (!labResultId) {
          return errorResponse('Lab result ID required', 400);
        }

        const body = await req.json();
        
        // Handle review action
        if (body.action === 'review') {
          body.status = 'reviewed';
          body.reviewed_by = user.id;
          body.reviewed_at = new Date().toISOString();
          delete body.action;
        }

        const { data, error } = await supabaseClient
          .from('lab_results')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', labResultId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!labResultId) {
          return errorResponse('Lab result ID required', 400);
        }

        const { error } = await supabaseClient
          .from('lab_results')
          .update({ status: 'archived' })
          .eq('id', labResultId);

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
