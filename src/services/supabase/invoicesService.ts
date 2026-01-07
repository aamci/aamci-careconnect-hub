import { supabase } from '@/integrations/supabase/client';

export async function fetchInvoices(options?: { patientId?: string; status?: string }) {
  let query = supabase.from('invoices').select('*').order('issue_date', { ascending: false });
  if (options?.patientId) query = query.eq('patient_id', options.patientId);
  if (options?.status) query = query.eq('status', options.status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchInvoiceById(id: string) {
  const { data, error } = await supabase.from('invoices').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function createInvoice(invoice: any, items?: any[]) {
  const { data: user } = await supabase.auth.getUser();
  const { data: inv, error } = await supabase
    .from('invoices')
    .insert({ ...invoice, created_by: user.user?.id } as any)
    .select()
    .single();
  if (error) throw error;
  
  if (items?.length) {
    for (let i = 0; i < items.length; i++) {
      await supabase.from('invoice_items').insert({ ...items[i], invoice_id: inv.id, sort_order: i } as any);
    }
  }
  return inv;
}

export async function addPayment(payment: any) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('payments')
    .insert({ ...payment, created_by: user.user?.id } as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchPayments(options?: { patientId?: string }) {
  let query = supabase.from('payments').select('*').order('payment_date', { ascending: false });
  if (options?.patientId) query = query.eq('patient_id', options.patientId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
