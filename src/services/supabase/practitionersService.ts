/**
 * Practitioners Service
 * Handles CRUD operations for practitioners
 */

import { supabase } from '@/integrations/supabase/client';
import { Practitioner } from '@/types';
import { mockPractitioners } from '@/data/mockData';
import { executeQuery, ServiceResult } from './baseService';

// ==================== TYPE MAPPERS ====================

interface DbPractitioner {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  specialty: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  color: string | null;
  site_ids: string[] | null;
  is_active: boolean | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbToPractitioner(db: DbPractitioner): Practitioner {
  return {
    id: db.id,
    firstName: db.first_name,
    lastName: db.last_name,
    title: db.title || 'Dr',
    specialty: db.specialty || '',
    email: db.email || '',
    phone: db.phone || undefined,
    avatarUrl: db.avatar_url || undefined,
    color: db.color || '#3B82F6',
    siteIds: db.site_ids || [],
  };
}

function mapPractitionerToDb(practitioner: Partial<Practitioner>) {
  return {
    first_name: practitioner.firstName,
    last_name: practitioner.lastName,
    title: practitioner.title,
    specialty: practitioner.specialty,
    email: practitioner.email,
    phone: practitioner.phone,
    avatar_url: practitioner.avatarUrl,
    color: practitioner.color,
    site_ids: practitioner.siteIds,
  };
}

// ==================== QUERIES ====================

export async function fetchPractitioners(): Promise<ServiceResult<Practitioner[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('practitioners')
        .select('*')
        .eq('is_active', true)
        .order('last_name');

      if (error) return { data: null, error };

      return {
        data: (data || []).map((p) => mapDbToPractitioner(p as DbPractitioner)),
        error: null,
      };
    },
    () => mockPractitioners
  );
}

export async function fetchPractitionerById(id: string): Promise<ServiceResult<Practitioner | null>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('practitioners')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return { data: null, error };

      return { data: mapDbToPractitioner(data as DbPractitioner), error: null };
    },
    () => mockPractitioners.find((p) => p.id === id) || null
  );
}

export async function fetchPractitionerByUserId(userId: string): Promise<ServiceResult<Practitioner | null>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('practitioners')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) return { data: null, error };

      return { data: mapDbToPractitioner(data as DbPractitioner), error: null };
    },
    () => null
  );
}

// ==================== MUTATIONS ====================

export async function createPractitioner(
  practitioner: Omit<Practitioner, 'id'>
): Promise<ServiceResult<Practitioner>> {
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('practitioners')
      .insert(mapPractitionerToDb(practitioner))
      .select()
      .single();

    if (error) return { data: null, error };

    return { data: mapDbToPractitioner(data as DbPractitioner), error: null };
  });
}

export async function updatePractitioner(
  id: string,
  updates: Partial<Practitioner>
): Promise<ServiceResult<Practitioner>> {
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('practitioners')
      .update(mapPractitionerToDb(updates))
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error };

    return { data: mapDbToPractitioner(data as DbPractitioner), error: null };
  });
}
