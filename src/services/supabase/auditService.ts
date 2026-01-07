import { supabase } from '@/integrations/supabase/client';

export async function logAudit(action: string, tableName: string, recordId?: string, oldData?: any, newData?: any) {
  const { data: user } = await supabase.auth.getUser();
  await supabase.from('audit_logs').insert({ action, table_name: tableName, record_id: recordId, old_data: oldData, new_data: newData, performed_by: user.user?.id } as any);
}

export async function fetchAuditLogs(options?: { tableName?: string; limit?: number }) {
  let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false });
  if (options?.tableName) query = query.eq('table_name', options.tableName);
  const { data, error } = await query.limit(options?.limit || 50);
  if (error) throw error;
  return data;
}

export async function fetchUserRole(userId: string) {
  const { data, error } = await supabase.from('user_roles').select('*').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').single();
  return !!data;
}

export async function assignRole(userId: string, role: string) {
  const { data, error } = await supabase.from('user_roles').upsert({ user_id: userId, role } as any, { onConflict: 'user_id,role' }).select().single();
  if (error) throw error;
  return data;
}
