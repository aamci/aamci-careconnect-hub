/**
 * React Query hooks for Sites and Rooms
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Site, Room } from '@/types';
import * as sitesService from '@/services/supabase/sitesService';
import { toast } from 'sonner';

// Query keys
export const sitesKeys = {
  all: ['sites'] as const,
  lists: () => [...sitesKeys.all, 'list'] as const,
  list: (filters?: string) => [...sitesKeys.lists(), filters] as const,
  details: () => [...sitesKeys.all, 'detail'] as const,
  detail: (id: string) => [...sitesKeys.details(), id] as const,
};

export const roomsKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomsKeys.all, 'list'] as const,
  bySite: (siteId: string) => [...roomsKeys.lists(), { siteId }] as const,
};

// ==================== SITES HOOKS ====================

export function useSites() {
  return useQuery({
    queryKey: sitesKeys.lists(),
    queryFn: async () => {
      const result = await sitesService.fetchSites();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSite(id: string) {
  return useQuery({
    queryKey: sitesKeys.detail(id),
    queryFn: async () => {
      const result = await sitesService.fetchSiteById(id);
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!id,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (site: Omit<Site, 'id' | 'rooms'>) => {
      const result = await sitesService.createSite(site);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sitesKeys.all });
      toast.success('Site créé avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}

// ==================== ROOMS HOOKS ====================

export function useRooms() {
  return useQuery({
    queryKey: roomsKeys.lists(),
    queryFn: async () => {
      const result = await sitesService.fetchRooms();
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (room: Omit<Room, 'id'>) => {
      const result = await sitesService.createRoom(room);
      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sitesKeys.all });
      queryClient.invalidateQueries({ queryKey: roomsKeys.all });
      toast.success('Salle créée avec succès');
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });
}
