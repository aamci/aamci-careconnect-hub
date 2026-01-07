/**
 * Data Hooks - Central Export
 * 
 * React Query hooks for all entities with:
 * - Automatic caching and background refresh
 * - Optimistic updates where appropriate
 * - Toast notifications for mutations
 * - Real Supabase data (no mock fallback in production)
 */

export * from './useSites';
export * from './usePractitioners';
export * from './usePatients';
export * from './useAppointments';
export * from './useNotes';
export * from './useTasks';
export * from './useAllergies';
