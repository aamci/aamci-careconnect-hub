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
  const prescriptionId = pathParts[1];

  try {
    switch (req.method) {
      case 'GET': {
        if (prescriptionId) {
          const { data, error } = await supabaseClient
            .from('prescriptions')
            .select(`
              *,
              patient:patients(id, first_name, last_name),
              practitioner:practitioners(id, first_name, last_name, title)
            `)
            .eq('id', prescriptionId)
            .single();

          if (error || !data) {
            return notFoundResponse('Prescription');
          }
          return jsonResponse(data);
        } else {
          const pagination = getPaginationParams(url);
          const patientId = url.searchParams.get('patient_id');
          const status = url.searchParams.get('status');
          const type = url.searchParams.get('type');

          let query = supabaseClient
            .from('prescriptions')
            .select(`
              *,
              patient:patients(id, first_name, last_name),
              practitioner:practitioners(id, first_name, last_name)
            `, { count: 'exact' })
            .order('created_at', { ascending: false });

          if (patientId) {
            query = query.eq('patient_id', patientId);
          }
          if (status) {
            query = query.eq('status', status);
          }
          if (type) {
            query = query.eq('type', type);
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
          .from('prescriptions')
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
        if (!prescriptionId) {
          return errorResponse('Prescription ID required', 400);
        }

        const body = await req.json();
        
        // Handle signing
        if (body.sign === true) {
          body.signed_at = new Date().toISOString();
          body.signed_by = user.id;
          delete body.sign;
        }

        const { data, error } = await supabaseClient
          .from('prescriptions')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', prescriptionId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!prescriptionId) {
          return errorResponse('Prescription ID required', 400);
        }

        // Cancel instead of delete
        const { error } = await supabaseClient
          .from('prescriptions')
          .update({ status: 'cancelled' })
          .eq('id', prescriptionId);

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
