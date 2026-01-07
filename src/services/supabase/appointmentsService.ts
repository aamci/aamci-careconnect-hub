/**
 * Appointments Service
 * Handles CRUD operations for appointments, motifs and history
 */

import { supabase } from '@/integrations/supabase/client';
import { Appointment, AppointmentMotif, AppointmentHistoryEntry, Patient, Practitioner } from '@/types';
import { mockAppointments, mockMotifs, mockPatients, mockPractitioners } from '@/data/mockData';
import { executeQuery, ServiceResult, getCurrentUserId } from './baseService';

// ==================== TYPE MAPPERS ====================

interface DbAppointmentMotif {
  id: string;
  name: string;
  short_name: string | null;
  duration: number;
  color: string | null;
  type: string;
  requires_room: boolean | null;
  is_online_bookable: boolean | null;
  instructions: string | null;
  is_active: boolean | null;
}

interface DbAppointment {
  id: string;
  patient_id: string;
  practitioner_id: string;
  room_id: string | null;
  motif_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: string;
  type: string;
  is_first_visit: boolean | null;
  is_on_waiting_list: boolean | null;
  referred_by: string | null;
  notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface DbAppointmentHistory {
  id: string;
  appointment_id: string;
  action: string;
  user_id: string | null;
  user_name: string | null;
  details: string | null;
  previous_value: any;
  new_value: any;
  created_at: string;
}

function mapDbToMotif(db: DbAppointmentMotif): AppointmentMotif {
  return {
    id: db.id,
    name: db.name,
    shortName: db.short_name || db.name.substring(0, 10),
    duration: db.duration,
    color: db.color || '#3B82F6',
    type: db.type as AppointmentMotif['type'],
    requiresRoom: db.requires_room || false,
    isOnlineBookable: db.is_online_bookable ?? true,
    instructions: db.instructions || undefined,
  };
}

function mapDbToHistory(db: DbAppointmentHistory): AppointmentHistoryEntry {
  return {
    id: db.id,
    action: db.action as AppointmentHistoryEntry['action'],
    userId: db.user_id || '',
    userName: db.user_name || 'Système',
    timestamp: new Date(db.created_at),
    details: db.details || undefined,
    previousValue: db.previous_value ? JSON.stringify(db.previous_value) : undefined,
    newValue: db.new_value ? JSON.stringify(db.new_value) : undefined,
  };
}

function mapDbToAppointment(
  db: DbAppointment,
  patient: Patient,
  practitioner: Practitioner,
  motif: AppointmentMotif,
  history: AppointmentHistoryEntry[] = []
): Appointment {
  return {
    id: db.id,
    patientId: db.patient_id,
    patient,
    practitionerId: db.practitioner_id,
    practitioner,
    roomId: db.room_id || undefined,
    motifId: db.motif_id,
    motif,
    startTime: new Date(db.start_time),
    endTime: new Date(db.end_time),
    duration: db.duration,
    status: db.status as Appointment['status'],
    type: db.type as Appointment['type'],
    isFirstVisit: db.is_first_visit ?? false,
    isOnWaitingList: db.is_on_waiting_list ?? false,
    referredBy: db.referred_by || undefined,
    notes: db.notes || undefined,
    internalNotes: db.internal_notes || undefined,
    createdAt: new Date(db.created_at),
    updatedAt: new Date(db.updated_at),
    history,
  };
}

// ==================== MOTIFS QUERIES ====================

export async function fetchMotifs(): Promise<ServiceResult<AppointmentMotif[]>> {
  return executeQuery(
    async () => {
      const { data, error } = await supabase
        .from('appointment_motifs')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) return { data: null, error };

      return {
        data: (data || []).map((m) => mapDbToMotif(m as DbAppointmentMotif)),
        error: null,
      };
    },
    () => mockMotifs
  );
}

// ==================== APPOINTMENTS QUERIES ====================

export async function fetchAppointments(
  startDate: Date,
  endDate: Date,
  practitionerIds?: string[]
): Promise<ServiceResult<Appointment[]>> {
  return executeQuery(
    async () => {
      let query = supabase
        .from('appointments')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time');

      if (practitionerIds && practitionerIds.length > 0) {
        query = query.in('practitioner_id', practitionerIds);
      }

      const { data: appointmentsData, error: appointmentsError } = await query;

      if (appointmentsError) return { data: null, error: appointmentsError };

      if (!appointmentsData || appointmentsData.length === 0) {
        return { data: [], error: null };
      }

      // Collect unique IDs
      const patientIds = [...new Set(appointmentsData.map((a) => a.patient_id))];
      const practitionerIdsUnique = [...new Set(appointmentsData.map((a) => a.practitioner_id))];
      const motifIds = [...new Set(appointmentsData.map((a) => a.motif_id))];
      const appointmentIds = appointmentsData.map((a) => a.id);

      // Fetch related data in parallel
      const [patientsRes, practitionersRes, motifsRes, historyRes] = await Promise.all([
        supabase.from('patients').select('*').in('id', patientIds),
        supabase.from('practitioners').select('*').in('id', practitionerIdsUnique),
        supabase.from('appointment_motifs').select('*').in('id', motifIds),
        supabase.from('appointment_history').select('*').in('appointment_id', appointmentIds).order('created_at'),
      ]);

      // Create lookup maps
      const patientsMap = new Map(
        (patientsRes.data || []).map((p) => [p.id, p])
      );
      const practitionersMap = new Map(
        (practitionersRes.data || []).map((p) => [p.id, p])
      );
      const motifsMap = new Map(
        (motifsRes.data || []).map((m) => [m.id, mapDbToMotif(m as DbAppointmentMotif)])
      );
      
      const historyMap = new Map<string, AppointmentHistoryEntry[]>();
      (historyRes.data || []).forEach((h) => {
        const list = historyMap.get(h.appointment_id) || [];
        list.push(mapDbToHistory(h as DbAppointmentHistory));
        historyMap.set(h.appointment_id, list);
      });

      // Map appointments with related data
      const appointments = appointmentsData.map((appt) => {
        const dbPatient = patientsMap.get(appt.patient_id);
        const dbPractitioner = practitionersMap.get(appt.practitioner_id);
        const motif = motifsMap.get(appt.motif_id);
        const history = historyMap.get(appt.id) || [];

        if (!dbPatient || !dbPractitioner || !motif) {
          console.warn('Missing related data for appointment', appt.id);
          return null;
        }

        const patient: Patient = {
          id: dbPatient.id,
          firstName: dbPatient.first_name,
          lastName: dbPatient.last_name,
          usedFirstName: dbPatient.used_first_name || undefined,
          gender: dbPatient.gender as Patient['gender'],
          dateOfBirth: new Date(dbPatient.date_of_birth),
          phone: dbPatient.phone || '',
          email: dbPatient.email || undefined,
          createdAt: new Date(dbPatient.created_at),
          updatedAt: new Date(dbPatient.updated_at),
        };

        const practitioner: Practitioner = {
          id: dbPractitioner.id,
          firstName: dbPractitioner.first_name,
          lastName: dbPractitioner.last_name,
          title: dbPractitioner.title || 'Dr',
          specialty: dbPractitioner.specialty || '',
          email: dbPractitioner.email || '',
          color: dbPractitioner.color || '#3B82F6',
          siteIds: dbPractitioner.site_ids || [],
        };

        return mapDbToAppointment(appt as DbAppointment, patient, practitioner, motif, history);
      });

      return {
        data: appointments.filter((a): a is Appointment => a !== null),
        error: null,
      };
    },
    () => {
      return mockAppointments.filter(
        (a) => a.startTime >= startDate && a.startTime <= endDate
      );
    }
  );
}

export async function fetchAppointmentById(id: string): Promise<ServiceResult<Appointment | null>> {
  return executeQuery(
    async () => {
      const { data: appt, error: apptError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .single();

      if (apptError) return { data: null, error: apptError };

      // Fetch related data
      const [patientRes, practitionerRes, motifRes, historyRes] = await Promise.all([
        supabase.from('patients').select('*').eq('id', appt.patient_id).single(),
        supabase.from('practitioners').select('*').eq('id', appt.practitioner_id).single(),
        supabase.from('appointment_motifs').select('*').eq('id', appt.motif_id).single(),
        supabase.from('appointment_history').select('*').eq('appointment_id', id).order('created_at'),
      ]);

      if (patientRes.error || practitionerRes.error || motifRes.error) {
        return { data: null, error: patientRes.error || practitionerRes.error || motifRes.error };
      }

      const patient: Patient = {
        id: patientRes.data.id,
        firstName: patientRes.data.first_name,
        lastName: patientRes.data.last_name,
        gender: patientRes.data.gender as Patient['gender'],
        dateOfBirth: new Date(patientRes.data.date_of_birth),
        phone: patientRes.data.phone || '',
        createdAt: new Date(patientRes.data.created_at),
        updatedAt: new Date(patientRes.data.updated_at),
      };

      const practitioner: Practitioner = {
        id: practitionerRes.data.id,
        firstName: practitionerRes.data.first_name,
        lastName: practitionerRes.data.last_name,
        title: practitionerRes.data.title || 'Dr',
        specialty: practitionerRes.data.specialty || '',
        email: practitionerRes.data.email || '',
        color: practitionerRes.data.color || '#3B82F6',
        siteIds: practitionerRes.data.site_ids || [],
      };

      const motif = mapDbToMotif(motifRes.data as DbAppointmentMotif);
      const history = (historyRes.data || []).map((h) => mapDbToHistory(h as DbAppointmentHistory));

      return {
        data: mapDbToAppointment(appt as DbAppointment, patient, practitioner, motif, history),
        error: null,
      };
    },
    () => mockAppointments.find((a) => a.id === id) || null
  );
}

// ==================== MUTATIONS ====================

export async function createAppointment(
  appointment: Omit<Appointment, 'id' | 'patient' | 'practitioner' | 'motif' | 'history' | 'createdAt' | 'updatedAt'>
): Promise<ServiceResult<{ id: string }>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();
    
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: appointment.patientId,
        practitioner_id: appointment.practitionerId,
        room_id: appointment.roomId,
        motif_id: appointment.motifId,
        start_time: appointment.startTime.toISOString(),
        end_time: appointment.endTime.toISOString(),
        duration: appointment.duration,
        status: appointment.status,
        type: appointment.type,
        is_first_visit: appointment.isFirstVisit,
        is_on_waiting_list: appointment.isOnWaitingList,
        referred_by: appointment.referredBy,
        notes: appointment.notes,
        internal_notes: appointment.internalNotes,
        created_by: userId,
        updated_by: userId,
      })
      .select('id')
      .single();

    if (error) return { data: null, error };

    // Add history entry
    await supabase.from('appointment_history').insert({
      appointment_id: data.id,
      action: 'created',
      user_id: userId,
      user_name: 'Utilisateur',
    });

    return { data: { id: data.id }, error: null };
  });
}

export async function updateAppointment(
  id: string,
  updates: Partial<Omit<Appointment, 'patient' | 'practitioner' | 'motif' | 'history'>>
): Promise<ServiceResult<boolean>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();

    const updateData: any = { updated_by: userId };
    
    if (updates.startTime) updateData.start_time = updates.startTime.toISOString();
    if (updates.endTime) updateData.end_time = updates.endTime.toISOString();
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.status) updateData.status = updates.status;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.internalNotes !== undefined) updateData.internal_notes = updates.internalNotes;
    if (updates.roomId !== undefined) updateData.room_id = updates.roomId;

    const { error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id);

    if (error) return { data: null, error };

    // Add history entry
    await supabase.from('appointment_history').insert({
      appointment_id: id,
      action: 'modified',
      user_id: userId,
      user_name: 'Utilisateur',
      new_value: updateData,
    });

    return { data: true, error: null };
  });
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment['status']
): Promise<ServiceResult<boolean>> {
  return executeQuery(async () => {
    const userId = await getCurrentUserId();

    const { error } = await supabase
      .from('appointments')
      .update({ status, updated_by: userId })
      .eq('id', id);

    if (error) return { data: null, error };

    await supabase.from('appointment_history').insert({
      appointment_id: id,
      action: 'status_changed',
      user_id: userId,
      user_name: 'Utilisateur',
      new_value: { status },
    });

    return { data: true, error: null };
  });
}

export async function deleteAppointment(id: string): Promise<ServiceResult<boolean>> {
  return executeQuery(async () => {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) return { data: null, error };

    return { data: true, error: null };
  });
}
