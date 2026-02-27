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
export * from './useOpenings';
export * from './useAppointments';
export * from './useNotes';
export * from './useTasks';
export * from './useAllergies';
export * from './usePatientHistory';
export * from './useDocuments';
export * from './useObservations';
export * from './useInvoices';
export * from './useConsultations';
export * from './usePrescriptions';
export * from './useLabResults';
export * from './useVitalSigns';
export * from './useVaccinations';
export * from './useMessaging';
