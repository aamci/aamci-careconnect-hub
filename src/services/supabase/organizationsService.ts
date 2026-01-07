import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  type: string;
  address?: string;
  city?: string;
  postal_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  settings?: Json;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  permissions?: Json;
  is_active: boolean;
  joined_at: string;
  left_at?: string;
}

export async function fetchOrganizations() {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data;
}

export async function fetchOrganizationById(id: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createOrganization(org: Partial<Organization>) {
  const { data, error } = await supabase
    .from('organizations')
    .insert(org as any)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrganization(id: string, updates: Partial<Organization>) {
  const { data, error } = await supabase
    .from('organizations')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
