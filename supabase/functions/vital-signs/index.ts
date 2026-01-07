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
  const vitalSignId = pathParts[1];

  try {
    switch (req.method) {
      case 'GET': {
        if (vitalSignId) {
          const { data, error } = await supabaseClient
            .from('vital_signs')
            .select('*')
            .eq('id', vitalSignId)
            .single();

          if (error || !data) {
            return notFoundResponse('Vital signs');
          }
          return jsonResponse(data);
        } else {
          const pagination = getPaginationParams(url);
          const patientId = url.searchParams.get('patient_id');

          if (!patientId) {
            return errorResponse('patient_id is required', 400);
          }

          const { data, error, count } = await supabaseClient
            .from('vital_signs')
            .select('*', { count: 'exact' })
            .eq('patient_id', patientId)
            .order('recorded_at', { ascending: false })
            .range(pagination.offset, pagination.offset + pagination.limit - 1);

          if (error) {
            return errorResponse(error.message, 500);
          }
          return paginatedResponse(data || [], count || 0, pagination);
        }
      }

      case 'POST': {
        const body = await req.json();
        
        // Calculate BMI if weight and height provided
        if (body.weight_kg && body.height_cm) {
          const heightM = body.height_cm / 100;
          body.bmi = parseFloat((body.weight_kg / (heightM * heightM)).toFixed(1));
        }

        const { data, error } = await supabaseClient
          .from('vital_signs')
          .insert({
            ...body,
            recorded_by: user.id,
          })
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }
        return jsonResponse(data, 201);
      }

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
});
