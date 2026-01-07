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
  const invoiceId = pathParts[1];

  try {
    switch (req.method) {
      case 'GET': {
        if (invoiceId) {
          const { data, error } = await supabaseClient
            .from('invoices')
            .select(`
              *,
              patient:patients(id, first_name, last_name),
              practitioner:practitioners(id, first_name, last_name),
              items:invoice_items(*),
              payments:payments(*)
            `)
            .eq('id', invoiceId)
            .single();

          if (error || !data) {
            return notFoundResponse('Invoice');
          }
          return jsonResponse(data);
        } else {
          const pagination = getPaginationParams(url);
          const patientId = url.searchParams.get('patient_id');
          const status = url.searchParams.get('status');

          let query = supabaseClient
            .from('invoices')
            .select(`
              *,
              patient:patients(id, first_name, last_name),
              practitioner:practitioners(id, first_name, last_name)
            `, { count: 'exact' })
            .order('issue_date', { ascending: false });

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
        const { items, ...invoiceData } = body;

        // Create invoice
        const { data: invoice, error } = await supabaseClient
          .from('invoices')
          .insert({
            ...invoiceData,
            created_by: user.id,
            updated_by: user.id,
          })
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }

        // Create invoice items if provided
        if (items && items.length > 0) {
          const itemsWithInvoiceId = items.map((item: any, index: number) => ({
            ...item,
            invoice_id: invoice.id,
            sort_order: index,
          }));

          await supabaseClient.from('invoice_items').insert(itemsWithInvoiceId);
        }

        return jsonResponse(invoice, 201);
      }

      case 'PUT':
      case 'PATCH': {
        if (!invoiceId) {
          return errorResponse('Invoice ID required', 400);
        }

        const body = await req.json();
        const { items, ...invoiceData } = body;

        const { data, error } = await supabaseClient
          .from('invoices')
          .update({
            ...invoiceData,
            updated_by: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId)
          .select()
          .single();

        if (error) {
          return errorResponse(error.message, 400);
        }

        // Update items if provided
        if (items) {
          // Delete existing items
          await supabaseClient
            .from('invoice_items')
            .delete()
            .eq('invoice_id', invoiceId);

          // Insert new items
          if (items.length > 0) {
            const itemsWithInvoiceId = items.map((item: any, index: number) => ({
              ...item,
              invoice_id: invoiceId,
              sort_order: index,
            }));

            await supabaseClient.from('invoice_items').insert(itemsWithInvoiceId);
          }
        }

        return jsonResponse(data);
      }

      case 'DELETE': {
        if (!invoiceId) {
          return errorResponse('Invoice ID required', 400);
        }

        // Only allow cancellation, not deletion
        const { error } = await supabaseClient
          .from('invoices')
          .update({ 
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_by: user.id,
          })
          .eq('id', invoiceId);

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
