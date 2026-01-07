/**
 * Base service with common utilities for Supabase operations
 * Provides fallback to mock data for graceful degradation
 */

import { supabase } from '@/integrations/supabase/client';

export interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
  source: 'supabase' | 'mock' | 'cache';
}

export interface QueryOptions {
  useMockFallback?: boolean;
  throwOnError?: boolean;
}

const defaultOptions: QueryOptions = {
  useMockFallback: true,
  throwOnError: false,
};

/**
 * Executes a Supabase query with optional fallback to mock data
 */
export async function executeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  mockFallbackFn?: () => T,
  options: QueryOptions = defaultOptions
): Promise<ServiceResult<T>> {
  try {
    const { data, error } = await queryFn();
    
    if (error) {
      console.warn('[Supabase] Query error:', error.message);
      
      if (options.useMockFallback && mockFallbackFn) {
        console.info('[Supabase] Using mock fallback data');
        return {
          data: mockFallbackFn(),
          error: null,
          source: 'mock',
        };
      }
      
      if (options.throwOnError) {
        throw new Error(error.message);
      }
      
      return { data: null, error: new Error(error.message), source: 'supabase' };
    }
    
    return { data, error: null, source: 'supabase' };
  } catch (err) {
    console.error('[Supabase] Unexpected error:', err);
    
    if (options.useMockFallback && mockFallbackFn) {
      console.info('[Supabase] Using mock fallback data after exception');
      return {
        data: mockFallbackFn(),
        error: null,
        source: 'mock',
      };
    }
    
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
      source: 'supabase',
    };
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Convert Date to ISO string for DB storage
 */
export function dateToIso(date: Date | undefined | null): string | null {
  if (!date) return null;
  return date.toISOString();
}

/**
 * Parse ISO string to Date
 */
export function isoToDate(isoString: string | undefined | null): Date | undefined {
  if (!isoString) return undefined;
  return new Date(isoString);
}
