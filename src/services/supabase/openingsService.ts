import { supabase } from '@/integrations/supabase/client';

// Types for openings
export interface OpeningMotifRef {
  id: string;
  name: string;
  color: string;
  shortName?: string;
}

export interface PractitionerOpening {
  id: string;
  practitionerId: string;
  siteId?: string;
  seriesId?: string;
  openingDate: Date;
  startTime: string; // HH:mm format
  endTime: string;
  title: string;
  color: string;
  substituteId?: string;
  isException: boolean;
  isCancelled: boolean;
  isRecurring: boolean;
  recurrenceType?: 'none' | 'weekly' | 'biweekly' | 'weekdays' | 'custom';
  recurrenceDays?: number[];
  recurrenceInterval?: number;
  practitioner: {
    firstName: string;
    lastName: string;
    color: string;
  };
  siteName?: string;
  motifs: OpeningMotifRef[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OpeningSeries {
  id: string;
  practitionerId: string;
  siteId?: string;
  title: string;
  color: string;
  recurrenceType: 'none' | 'weekly' | 'biweekly' | 'weekdays' | 'custom';
  recurrenceDays: number[];
  recurrenceInterval: number;
  recurrenceEndDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOpeningInput {
  practitionerId: string;
  siteId?: string;
  openingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  title?: string;
  color?: string;
  substituteId?: string;
  // Recurrence
  isRecurring: boolean;
  recurrenceType?: 'none' | 'weekly' | 'biweekly' | 'weekdays' | 'custom';
  recurrenceDays?: number[];
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  // Motifs
  motifIds: string[];
}

export interface UpdateOpeningInput {
  id: string;
  startTime?: string;
  endTime?: string;
  title?: string;
  color?: string;
  substituteId?: string | null;
  motifIds?: string[];
  // For series updates
  updateSeries?: boolean;
  recurrenceType?: 'none' | 'weekly' | 'biweekly' | 'weekdays' | 'custom';
  recurrenceDays?: number[];
  recurrenceInterval?: number;
  recurrenceEndDate?: string | null;
}

// Fetch openings for a date range
export async function fetchOpenings(
  startDate: Date,
  endDate: Date,
  practitionerId?: string
): Promise<PractitionerOpening[]> {
  let query = supabase
    .from('v_openings_with_details')
    .select('*')
    .gte('opening_date', startDate.toISOString().split('T')[0])
    .lte('opening_date', endDate.toISOString().split('T')[0])
    .order('opening_date', { ascending: true })
    .order('start_time', { ascending: true });

  if (practitionerId) {
    query = query.eq('practitioner_id', practitionerId);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map(mapOpeningFromDb);
}

// Fetch single opening by ID
export async function fetchOpening(id: string): Promise<PractitionerOpening | null> {
  const { data, error } = await supabase
    .from('v_openings_with_details')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return mapOpeningFromDb(data);
}

// Create a new opening (with optional series)
export async function createOpening(input: CreateOpeningInput): Promise<PractitionerOpening> {
  let seriesId: string | null = null;

  // If recurring, create series first
  if (input.isRecurring && input.recurrenceType && input.recurrenceType !== 'none') {
    const { data: series, error: seriesError } = await supabase
      .from('opening_series')
      .insert({
        practitioner_id: input.practitionerId,
        site_id: input.siteId || null,
        title: input.title || 'Ouverture récurrente',
        color: input.color || '#FFFFFF',
        recurrence_type: input.recurrenceType,
        recurrence_days: input.recurrenceDays || [],
        recurrence_interval: input.recurrenceInterval || 1,
        recurrence_end_date: input.recurrenceEndDate || null,
      })
      .select()
      .single();

    if (seriesError) throw seriesError;
    seriesId = series.id;

    // Link motifs to series
    if (input.motifIds.length > 0) {
      const motifLinks = input.motifIds.map(motifId => ({
        series_id: seriesId,
        motif_id: motifId,
      }));

      const { error: motifError } = await supabase
        .from('opening_motifs')
        .insert(motifLinks);

      if (motifError) throw motifError;
    }

    // Generate occurrences for the series
    const occurrences = generateOccurrences(input, seriesId);
    
    if (occurrences.length > 0) {
      const { error: occError } = await supabase
        .from('practitioner_openings')
        .insert(occurrences);

      if (occError) throw occError;
    }
  }

  // Create the initial opening
  const { data: opening, error: openingError } = await supabase
    .from('practitioner_openings')
    .insert({
      practitioner_id: input.practitionerId,
      site_id: input.siteId || null,
      series_id: seriesId,
      opening_date: input.openingDate,
      start_time: input.startTime,
      end_time: input.endTime,
      title: input.title || 'Ouverture',
      color: input.color || '#FFFFFF',
      substitute_id: input.substituteId || null,
    })
    .select()
    .single();

  if (openingError) throw openingError;

  // Link motifs to opening (if not recurring, motifs go to opening not series)
  if (!input.isRecurring && input.motifIds.length > 0) {
    const motifLinks = input.motifIds.map(motifId => ({
      opening_id: opening.id,
      motif_id: motifId,
    }));

    const { error: motifError } = await supabase
      .from('opening_motifs')
      .insert(motifLinks);

    if (motifError) throw motifError;
  }

  // Fetch and return the created opening with full details
  const created = await fetchOpening(opening.id);
  if (!created) throw new Error('Failed to fetch created opening');
  return created;
}

// Update a single opening occurrence
export async function updateOpening(input: UpdateOpeningInput): Promise<PractitionerOpening> {
  const updates: Record<string, unknown> = {};

  if (input.startTime !== undefined) updates.start_time = input.startTime;
  if (input.endTime !== undefined) updates.end_time = input.endTime;
  if (input.title !== undefined) updates.title = input.title;
  if (input.color !== undefined) updates.color = input.color;
  if (input.substituteId !== undefined) updates.substitute_id = input.substituteId;

  // Mark as exception if it was part of a series
  const { data: existing } = await supabase
    .from('practitioner_openings')
    .select('series_id')
    .eq('id', input.id)
    .single();

  if (existing?.series_id && !input.updateSeries) {
    updates.is_exception = true;
  }

  const { error: updateError } = await supabase
    .from('practitioner_openings')
    .update(updates)
    .eq('id', input.id);

  if (updateError) throw updateError;

  // Update motifs if provided
  if (input.motifIds !== undefined) {
    // Delete existing motifs for this opening
    await supabase
      .from('opening_motifs')
      .delete()
      .eq('opening_id', input.id);

    // Insert new motifs
    if (input.motifIds.length > 0) {
      const motifLinks = input.motifIds.map(motifId => ({
        opening_id: input.id,
        motif_id: motifId,
      }));

      const { error: motifError } = await supabase
        .from('opening_motifs')
        .insert(motifLinks);

      if (motifError) throw motifError;
    }
  }

  const updated = await fetchOpening(input.id);
  if (!updated) throw new Error('Failed to fetch updated opening');
  return updated;
}

// Update entire series
export async function updateOpeningSeries(
  seriesId: string,
  input: Partial<UpdateOpeningInput>
): Promise<void> {
  const seriesUpdates: Record<string, unknown> = {};

  if (input.title !== undefined) seriesUpdates.title = input.title;
  if (input.color !== undefined) seriesUpdates.color = input.color;
  if (input.recurrenceType !== undefined) seriesUpdates.recurrence_type = input.recurrenceType;
  if (input.recurrenceDays !== undefined) seriesUpdates.recurrence_days = input.recurrenceDays;
  if (input.recurrenceInterval !== undefined) seriesUpdates.recurrence_interval = input.recurrenceInterval;
  if (input.recurrenceEndDate !== undefined) seriesUpdates.recurrence_end_date = input.recurrenceEndDate;

  if (Object.keys(seriesUpdates).length > 0) {
    const { error } = await supabase
      .from('opening_series')
      .update(seriesUpdates)
      .eq('id', seriesId);

    if (error) throw error;
  }

  // Update all non-exception occurrences
  const openingUpdates: Record<string, unknown> = {};
  if (input.startTime !== undefined) openingUpdates.start_time = input.startTime;
  if (input.endTime !== undefined) openingUpdates.end_time = input.endTime;
  if (input.title !== undefined) openingUpdates.title = input.title;
  if (input.color !== undefined) openingUpdates.color = input.color;

  if (Object.keys(openingUpdates).length > 0) {
    const { error } = await supabase
      .from('practitioner_openings')
      .update(openingUpdates)
      .eq('series_id', seriesId)
      .eq('is_exception', false);

    if (error) throw error;
  }

  // Update series motifs if provided
  if (input.motifIds !== undefined) {
    await supabase
      .from('opening_motifs')
      .delete()
      .eq('series_id', seriesId);

    if (input.motifIds.length > 0) {
      const motifLinks = input.motifIds.map(motifId => ({
        series_id: seriesId,
        motif_id: motifId,
      }));

      const { error: motifError } = await supabase
        .from('opening_motifs')
        .insert(motifLinks);

      if (motifError) throw motifError;
    }
  }
}

// Delete/cancel an opening
export async function deleteOpening(id: string, deleteSeries: boolean = false): Promise<void> {
  const { data: opening } = await supabase
    .from('practitioner_openings')
    .select('series_id')
    .eq('id', id)
    .single();

  if (deleteSeries && opening?.series_id) {
    // Soft delete all occurrences in series
    const { error } = await supabase
      .from('practitioner_openings')
      .update({ is_cancelled: true })
      .eq('series_id', opening.series_id);

    if (error) throw error;

    // Deactivate series
    await supabase
      .from('opening_series')
      .update({ is_active: false })
      .eq('id', opening.series_id);
  } else {
    // Soft delete just this occurrence
    const { error } = await supabase
      .from('practitioner_openings')
      .update({ is_cancelled: true, is_exception: true })
      .eq('id', id);

    if (error) throw error;
  }
}

// Check for overlapping openings
export async function checkOpeningOverlap(
  practitionerId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: string
): Promise<boolean> {
  let query = supabase
    .from('practitioner_openings')
    .select('id')
    .eq('practitioner_id', practitionerId)
    .eq('opening_date', date)
    .eq('is_cancelled', false)
    .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

  if (excludeId) {
    query = query.neq('id', excludeId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).length > 0;
}

// Helper: Map DB row to TypeScript type
function mapOpeningFromDb(row: Record<string, unknown>): PractitionerOpening {
  const motifs = Array.isArray(row.motifs) 
    ? row.motifs.map((m: Record<string, unknown>) => ({
        id: String(m.id || ''),
        name: String(m.name || ''),
        color: String(m.color || '#888888'),
        shortName: m.short_name ? String(m.short_name) : undefined,
      }))
    : [];

  return {
    id: String(row.id),
    practitionerId: String(row.practitioner_id),
    siteId: row.site_id ? String(row.site_id) : undefined,
    seriesId: row.series_id ? String(row.series_id) : undefined,
    openingDate: new Date(String(row.opening_date)),
    startTime: String(row.start_time).slice(0, 5), // HH:mm
    endTime: String(row.end_time).slice(0, 5),
    title: String(row.title || 'Ouverture'),
    color: String(row.color || '#FFFFFF'),
    substituteId: row.substitute_id ? String(row.substitute_id) : undefined,
    isException: Boolean(row.is_exception),
    isCancelled: Boolean(row.is_cancelled),
    isRecurring: Boolean(row.is_recurring),
    recurrenceType: row.recurrence_type as PractitionerOpening['recurrenceType'],
    recurrenceDays: Array.isArray(row.recurrence_days) ? row.recurrence_days as number[] : [],
    recurrenceInterval: row.recurrence_interval ? Number(row.recurrence_interval) : 1,
    practitioner: {
      firstName: String(row.practitioner_first_name || ''),
      lastName: String(row.practitioner_last_name || ''),
      color: String(row.practitioner_color || '#3B82F6'),
    },
    siteName: row.site_name ? String(row.site_name) : undefined,
    motifs,
    createdAt: new Date(String(row.created_at)),
    updatedAt: new Date(String(row.updated_at)),
  };
}

// Helper: Generate occurrences for recurring openings
interface OpeningInsert {
  practitioner_id: string;
  site_id: string | null;
  series_id: string;
  opening_date: string;
  start_time: string;
  end_time: string;
  title: string;
  color: string;
  substitute_id: string | null;
}

function generateOccurrences(
  input: CreateOpeningInput,
  seriesId: string
): OpeningInsert[] {
  const occurrences: OpeningInsert[] = [];
  const startDate = new Date(input.openingDate);
  const endDate = input.recurrenceEndDate 
    ? new Date(input.recurrenceEndDate)
    : new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days default

  const daysToGenerate = input.recurrenceDays || [startDate.getDay()];
  const interval = input.recurrenceInterval || 1;

  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() - currentDate.getDay()); // Start of week

  while (currentDate <= endDate) {
    for (const day of daysToGenerate) {
      const occDate = new Date(currentDate);
      occDate.setDate(occDate.getDate() + day);

      // Skip if before start or after end
      if (occDate < startDate || occDate > endDate) continue;
      
      // Skip the first occurrence (will be created separately)
      if (occDate.toISOString().split('T')[0] === input.openingDate) continue;

      occurrences.push({
        practitioner_id: input.practitionerId,
        site_id: input.siteId || null,
        series_id: seriesId,
        opening_date: occDate.toISOString().split('T')[0],
        start_time: input.startTime,
        end_time: input.endTime,
        title: input.title || 'Ouverture récurrente',
        color: input.color || '#FFFFFF',
        substitute_id: input.substituteId || null,
      });
    }

    // Advance by interval weeks
    currentDate.setDate(currentDate.getDate() + 7 * interval);
  }

  return occurrences;
}
