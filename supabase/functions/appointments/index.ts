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
  const appointmentId = pathParts[1];

  try {
    switch (req.method) {
      case 'GET': {
        if (appointmentId) {
          const { data, error } = await supabaseClient
            .from('appointments')
            .select(`
              *,
              patient:patients(*),
              practitioner:practitioners(*),
              motif:appointment_motifs(*),
              room:rooms(*),
              history:appointment_history(*)
            `)
            .eq('id', appointmentId)
            .single();

          if (error || !data) {
            return notFoundResponse('Appointment');
          }
          return jsonResponse(data);
        } else {
          const pagination = getPaginationParams(url);
          const startDate = url.searchParams.get('start_date');
          const endDate = url.searchParams.get('end_date');
          const practitionerId = url.searchParams.get('practitioner_id');
          const patientId = url.searchParams.get('patient_id');
          const status = url.searchParams.get('status');

          let query = supabaseClient
            .from('appointments')
            .select(`
              *,
              patient:patients(id, first_name, last_name, phone),
              practitioner:practitioners(id, first_name, last_name, color),
              motif:appointment_motifs(id, name, short_name, color, duration)
            `, { count: 'exact' })
            .order('start_time', { ascending: true });

          if (startDate) {
            query = query.gte('start_time', startDate);
          }
          if (endDate) {
            query = query.lte('start_time', endDate);
          }
          if (practitionerId) {
            query = query.eq('practitioner_id', practitionerId);
          }
          if (patientId) {
            query = query.eq('patient_id', patientId);
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
        
        // Calculate end_time if not provided
        if (!body.end_time && body.start_time && body.duration) {
          const start = new Date(body.start_time);
          start.setMinutes(start.getMinutes() + body.duration);
          body.end_time = start.toISOString();
        }

        const { data, error } = await supabaseClient
          .from('appointments')
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

        // Create history entry
        await supabaseClient.from('appointment_history').insert({
          appointment_id: data.id,
          action: 'created',
          user_id: user.id,
          user_name: user.email,
          details: 'Appointment created',
        });

        return jsonResponse(data, 201);
      }

      case 'PUT':
      case 'PATCH': {
        if (!appointmentId) {
          return errorResponse('Appointment ID required', 400);
        }

        // Get current state for history
        const { data: current } = await supabaseClient
          .from('appointments')
          .select('*')
          .eq('id', appointmentId)
          .single();

        const body = await req.json();
        const { data, error } = await supabaseClient
          .from('appointments')
          .update({
            ...body,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', appointmentId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }

        // Create history entry
        await supabaseClient.from('appointment_history').insert({
          appointment_id: appointmentId,
          action: body.status !== current?.status ? 'status_changed' : 'modified',
          user_id: user.id,
          user_name: user.email,
          previous_value: current,
          new_value: data,
          details: body.status !== current?.status 
            ? `Status changed from ${current?.status} to ${body.status}`
            : 'Appointment modified',
        });

        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!appointmentId) {
          return errorResponse('Appointment ID required', 400);
        }

        // Soft delete via status change
        const { error } = await supabaseClient
          .from('appointments')
          .update({ 
            status: 'cancelled', 
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', appointmentId);

        if (error) {
          return errorResponse(error.message, 400);
        }

        await supabaseClient.from('appointment_history').insert({
          appointment_id: appointmentId,
          action: 'cancelled',
          user_id: user.id,
          user_name: user.email,
          details: 'Appointment cancelled',
        });

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
