/**
 * Supabase Services - Central Export
 * 
 * All services provide:
 * - Automatic fallback to mockData when Supabase fails
 * - Type-safe mappers between DB and frontend types
 * - Audit trails (created_by, updated_by)
 * - Soft delete where appropriate
 */

// Base utilities
export * from './baseService';

// Entity services
export * from './sitesService';
export * from './practitionersService';
export * from './patientsService';
export * from './appointmentsService';
export * from './notesService';
export * from './tasksService';
