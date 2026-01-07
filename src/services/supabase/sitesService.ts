/**
 * Sites & Rooms Service
 * Handles CRUD operations for sites and rooms
 */

import { supabase } from '@/integrations/supabase/client';
import { Site, Room } from '@/types';
import { mockSites } from '@/data/mockData';
import { executeQuery, ServiceResult } from './baseService';

// ==================== TYPE MAPPERS ====================

interface DbSite {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

interface DbRoom {
  id: string;
  name: string;
  site_id: string;
  capacity: number | null;
  equipment: any;
  is_active: boolean | null;
}

function mapDbSiteToSite(dbSite: DbSite, rooms: Room[] = []): Site {
  return {
    id: dbSite.id,
    name: dbSite.name,
    address: dbSite.address || '',
    city: dbSite.city || '',
    postalCode: dbSite.postal_code || '',
    phone: dbSite.phone || undefined,
    rooms,
  };
}

function mapDbRoomToRoom(dbRoom: DbRoom): Room {
  return {
    id: dbRoom.id,
    name: dbRoom.name,
    siteId: dbRoom.site_id,
    capacity: dbRoom.capacity || undefined,
    equipment: Array.isArray(dbRoom.equipment) ? dbRoom.equipment : undefined,
  };
}

// ==================== QUERIES ====================

export async function fetchSites(): Promise<ServiceResult<Site[]>> {
  return executeQuery(
    async () => {
      // Fetch sites
      const { data: sitesData, error: sitesError } = await supabase
        .from('sites')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (sitesError) return { data: null, error: sitesError };

      // Fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (roomsError) return { data: null, error: roomsError };

      // Map rooms to their sites
      const roomsBySite = (roomsData || []).reduce((acc, room) => {
        const siteId = room.site_id;
        if (!acc[siteId]) acc[siteId] = [];
        acc[siteId].push(mapDbRoomToRoom(room as DbRoom));
        return acc;
      }, {} as Record<string, Room[]>);

      // Map sites with their rooms
      const sites = (sitesData || []).map((site) =>
        mapDbSiteToSite(site as DbSite, roomsBySite[site.id] || [])
      );

      return { data: sites, error: null };
    },
    () => mockSites
  );
}

export async function fetchSiteById(id: string): Promise<ServiceResult<Site | null>> {
  return executeQuery(
    async () => {
      const { data: siteData, error: siteError } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .single();

      if (siteError) return { data: null, error: siteError };

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('site_id', id)
        .eq('is_active', true);

      if (roomsError) return { data: null, error: roomsError };

      const rooms = (roomsData || []).map((r) => mapDbRoomToRoom(r as DbRoom));
      return { data: mapDbSiteToSite(siteData as DbSite, rooms), error: null };
    },
    () => mockSites.find((s) => s.id === id) || null
  );
}

export async function fetchRooms(): Promise<ServiceResult<Room[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) return { data: null, error };

      return {
        data: (data || []).map((r) => mapDbRoomToRoom(r as DbRoom)),
        error: null,
      };
    },
    () => mockSites.flatMap((s) => s.rooms)
  );
}

// ==================== MUTATIONS ====================

export async function createSite(site: Omit<Site, 'id' | 'rooms'>): Promise<ServiceResult<Site>> {
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('sites')
      .insert({
        name: site.name,
        address: site.address,
        city: site.city,
        postal_code: site.postalCode,
        phone: site.phone,
      })
      .select()
      .single();

    if (error) return { data: null, error };

    return { data: mapDbSiteToSite(data as DbSite), error: null };
  });
}

export async function createRoom(room: Omit<Room, 'id'>): Promise<ServiceResult<Room>> {
  return executeQuery(async () => {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        name: room.name,
        site_id: room.siteId,
        capacity: room.capacity,
        equipment: room.equipment,
      })
      .select()
      .single();

    if (error) return { data: null, error };

    return { data: mapDbRoomToRoom(data as DbRoom), error: null };
  });
}
