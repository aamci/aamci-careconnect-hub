import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  code: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percent: number;
  tax_rate: number;
  sort_order: number;
}

export interface Invoice {
  id: string;
  patient_id: string;
  practitioner_id: string | null;
  organization_id: string | null;
  appointment_id: string | null;
  consultation_id: string | null;
  invoice_number: string | null;
  status: string;
  issue_date: string;
  due_date: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  paid_at: string | null;
  cancelled_at: string | null;
  sent_at: string | null;
  notes: string | null;
  payment_terms: string | null;
  currency: string;
  billing_address: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  items?: InvoiceItem[];
}

// Fetch invoices for a patient
export function usePatientInvoices(patientId: string) {
  return useQuery({
    queryKey: ['patient-invoices', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('patient_id', patientId)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      return data as Invoice[];
    },
    enabled: !!patientId,
  });
}

// Fetch invoice with items
export function useInvoiceWithItems(invoiceId: string) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      const [invoiceResult, itemsResult] = await Promise.all([
        supabase.from('invoices').select('*').eq('id', invoiceId).single(),
        supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('sort_order'),
      ]);

      if (invoiceResult.error) throw invoiceResult.error;
      if (itemsResult.error) throw itemsResult.error;

      return {
        ...invoiceResult.data,
        items: itemsResult.data,
      } as Invoice;
    },
    enabled: !!invoiceId,
  });
}

// Create invoice
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      invoice, 
      items 
    }: { 
      invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'items'>; 
      items: Omit<InvoiceItem, 'id' | 'invoice_id'>[] 
    }) => {
      // Create invoice first
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          patient_id: invoice.patient_id,
          practitioner_id: invoice.practitioner_id || null,
          organization_id: invoice.organization_id || null,
          appointment_id: invoice.appointment_id || null,
          consultation_id: invoice.consultation_id || null,
          invoice_number: invoice.invoice_number || null,
          status: invoice.status,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date || null,
          subtotal: invoice.subtotal,
          discount_amount: invoice.discount_amount || 0,
          tax_amount: invoice.tax_amount || 0,
          total_amount: invoice.total_amount,
          paid_amount: invoice.paid_amount || 0,
          paid_at: invoice.paid_at || null,
          cancelled_at: invoice.cancelled_at || null,
          sent_at: invoice.sent_at || null,
          notes: invoice.notes || null,
          payment_terms: invoice.payment_terms || null,
          currency: invoice.currency,
          billing_address: (invoice.billing_address || null) as unknown as Record<string, unknown> | null,
          created_by: invoice.created_by || null,
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create items
      if (items.length > 0) {
        const itemsWithInvoiceId = items.map((item, index) => ({
          ...item,
          invoice_id: newInvoice.id,
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvoiceId);

        if (itemsError) throw itemsError;
      }

      return newInvoice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-invoices', data.patient_id] });
      toast.success('Facture créée');
    },
    onError: (error) => {
      toast.error('Erreur lors de la création');
      console.error(error);
    },
  });
}

// Update invoice status
export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      patientId, 
      status, 
      paidAmount,
      paidAt,
    }: { 
      id: string; 
      patientId: string; 
      status: string;
      paidAmount?: number;
      paidAt?: string;
    }) => {
      const updates: Record<string, unknown> = { 
        status, 
        updated_at: new Date().toISOString(),
      };
      
      if (paidAmount !== undefined) updates.paid_amount = paidAmount;
      if (paidAt) updates.paid_at = paidAt;
      if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, patientId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-invoices', data.patientId] });
      queryClient.invalidateQueries({ queryKey: ['invoice', data.id] });
      toast.success('Facture mise à jour');
    },
    onError: (error) => {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    },
  });
}
