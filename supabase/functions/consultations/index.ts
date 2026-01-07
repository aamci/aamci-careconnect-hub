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
  const consultationId = pathParts[1];

  try {
    switch (req.method) {
      case 'GET': {
        if (consultationId) {
          const { data, error } = await supabaseClient
            .from('consultations')
            .select(`
              *,
              patient:patients(id, first_name, last_name),
              practitioner:practitioners(id, first_name, last_name, title),
              appointment:appointments(*),
              prescriptions:prescriptions(*),
              vital_signs:vital_signs(*)
            `)
            .eq('id', consultationId)
            .single();

          if (error || !data) {
            return notFoundResponse('Consultation');
          }
          return jsonResponse(data);
        } else {
          const pagination = getPaginationParams(url);
          const patientId = url.searchParams.get('patient_id');
          const practitionerId = url.searchParams.get('practitioner_id');
          const status = url.searchParams.get('status');

          let query = supabaseClient
            .from('consultations')
            .select(`
              *,
              patient:patients(id, first_name, last_name),
              practitioner:practitioners(id, first_name, last_name)
            `, { count: 'exact' })
            .order('start_time', { ascending: false });

          if (patientId) {
            query = query.eq('patient_id', patientId);
          }
          if (practitionerId) {
            query = query.eq('practitioner_id', practitionerId);
          }
          if (status) {
            query = query.eq('status', status);
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
          .from('consultations')
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
        if (!consultationId) {
          return errorResponse('Consultation ID required', 400);
        }

        const body = await req.json();
        
        // If completing consultation, set end_time
        if (body.status === 'completed' && !body.end_time) {
          body.end_time = new Date().toISOString();
        }

        const { data, error } = await supabaseClient
          .from('consultations')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', consultationId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data);
      }

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});
