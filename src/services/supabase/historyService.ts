/**
 * History Service - Récupération de l'historique patient
 */

import { subDays, subHours, subMonths } from 'date-fns';
import type { HistoryEvent, HistoryEventType } from '@/types/history';
import { executeQuery, ServiceResult } from './baseService';

/**
 * Get patient history events
 */
export async function getPatientHistory(patientId: string): Promise<ServiceResult<HistoryEvent[]>> {
  return executeQuery(
    async () => {
      // TODO: Implement Supabase query to fetch actual history
      // This would join appointments, documents, consultations, notes, etc.

      // For now, return empty array (will be populated from mock in dev)
      return { data: [], error: null };
    },
    () => {
      // Mock data for development
      return {
        data: generateMockHistory(patientId),
        error: null
      };
    }
  );
}

/**
 * Get history events by type
 */
export async function getHistoryByType(
  patientId: string,
  type: HistoryEventType
): Promise<ServiceResult<HistoryEvent[]>> {
  const result = await getPatientHistory(patientId);

  if (result.error) return result;

  return {
    data: result.data?.filter((event) => event.type === type) || [],
    error: null
  };
}

/**
 * Get history events in date range
 */
export async function getHistoryInRange(
  patientId: string,
  start: Date,
  end: Date
): Promise<ServiceResult<HistoryEvent[]>> {
  const result = await getPatientHistory(patientId);

  if (result.error) return result;

  return {
    data: result.data?.filter(
      (event) => event.timestamp >= start && event.timestamp <= end
    ) || [],
    error: null
  };
}

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

function generateMockHistory(patientId: string): HistoryEvent[] {
  const now = new Date();

  return [
    // Consultations récentes
    {
      id: 'hist-1',
      type: 'consultation',
      category: 'clinical',
      title: 'Consultation de suivi',
      description: 'Contrôle post-opératoire, évolution favorable',
      timestamp: subDays(now, 2),
      authorId: 'pract-1',
      authorName: 'Dr. Martin Dubois',
      authorRole: 'Cardiologue',
      metadata: { duration: 30, status: 'completed' },
      relatedEntities: { appointmentId: 'apt-123', consultationId: 'cons-123' }
    },
    {
      id: 'hist-2',
      type: 'prescription',
      category: 'clinical',
      title: 'Ordonnance pharmaceutique',
      description: 'Aspirine 100mg, 1 comprimé/jour pendant 3 mois',
      timestamp: subDays(subHours(now, 3), 2),
      authorId: 'pract-1',
      authorName: 'Dr. Martin Dubois',
      authorRole: 'Cardiologue',
      metadata: { documentType: 'prescription', medicationCount: 1 },
      relatedEntities: { documentId: 'doc-456', consultationId: 'cons-123' }
    },
    {
      id: 'hist-3',
      type: 'note',
      category: 'communication',
      title: 'Note clinique',
      description: 'Patient se plaint de fatigue persistante, à surveiller',
      timestamp: subDays(subHours(now, 4), 2),
      authorId: 'pract-1',
      authorName: 'Dr. Martin Dubois',
      metadata: { isUrgent: false },
      relatedEntities: { consultationId: 'cons-123' }
    },
    // Semaine dernière
    {
      id: 'hist-4',
      type: 'teleconsultation',
      category: 'clinical',
      title: 'Téléconsultation de contrôle',
      description: 'Résultats d\'analyses sanguines discutés, tout est normal',
      timestamp: subDays(now, 7),
      authorId: 'pract-2',
      authorName: 'Dr. Sophie Laurent',
      authorRole: 'Médecin généraliste',
      metadata: { duration: 15, platform: 'jitsi' },
      relatedEntities: { appointmentId: 'apt-124' }
    },
    {
      id: 'hist-5',
      type: 'document',
      category: 'clinical',
      title: 'Compte-rendu d\'examen',
      description: 'Résultats IRM cérébrale - Pas d\'anomalie détectée',
      timestamp: subDays(subHours(now, 2), 7),
      authorId: 'pract-3',
      authorName: 'Dr. Pierre Moreau',
      authorRole: 'Radiologue',
      metadata: { documentType: 'report' },
      relatedEntities: { documentId: 'doc-457' }
    },
    {
      id: 'hist-6',
      type: 'invoice',
      category: 'administrative',
      title: 'Facture émise',
      description: 'Consultation + actes techniques - 85€',
      timestamp: subDays(subHours(now, 5), 7),
      authorId: 'sec-1',
      authorName: 'Marie Durand',
      authorRole: 'Secrétaire médicale',
      metadata: { amount: 85, status: 'paid' },
      relatedEntities: { appointmentId: 'apt-124' }
    },
    // Il y a 2 semaines
    {
      id: 'hist-7',
      type: 'consultation',
      category: 'clinical',
      title: 'Consultation initiale',
      description: 'Premier bilan cardiologique, prescription d\'examens complémentaires',
      timestamp: subDays(now, 14),
      authorId: 'pract-1',
      authorName: 'Dr. Martin Dubois',
      authorRole: 'Cardiologue',
      metadata: { duration: 45, status: 'completed', isFirstVisit: true },
      relatedEntities: { appointmentId: 'apt-125', consultationId: 'cons-125' }
    },
    {
      id: 'hist-8',
      type: 'certificate',
      category: 'administrative',
      title: 'Certificat médical',
      description: 'Arrêt de travail 7 jours',
      timestamp: subDays(subHours(now, 1), 14),
      authorId: 'pract-1',
      authorName: 'Dr. Martin Dubois',
      metadata: { documentType: 'certificate', days: 7 },
      relatedEntities: { documentId: 'doc-458', consultationId: 'cons-125' }
    },
    {
      id: 'hist-9',
      type: 'prescription',
      category: 'clinical',
      title: 'Prescription d\'examens',
      description: 'Bilan sanguin complet, ECG, IRM cérébrale',
      timestamp: subDays(subHours(now, 2), 14),
      authorId: 'pract-1',
      authorName: 'Dr. Martin Dubois',
      metadata: { documentType: 'prescription_exams', examCount: 3 },
      relatedEntities: { documentId: 'doc-459', consultationId: 'cons-125' }
    },
    // Il y a 1 mois
    {
      id: 'hist-10',
      type: 'appointment_created',
      category: 'administrative',
      title: 'Rendez-vous créé',
      description: 'Consultation cardiologie - Dr. Dubois',
      timestamp: subMonths(now, 1),
      authorId: 'sec-1',
      authorName: 'Marie Durand',
      authorRole: 'Secrétaire médicale',
      metadata: { channel: 'phone' },
      relatedEntities: { appointmentId: 'apt-125' }
    },
    {
      id: 'hist-11',
      type: 'patient_updated',
      category: 'administrative',
      title: 'Fiche patient mise à jour',
      description: 'Coordonnées et informations administratives actualisées',
      timestamp: subMonths(subDays(now, 5), 1),
      authorId: 'sec-1',
      authorName: 'Marie Durand',
      metadata: { fields: ['phone', 'email', 'address'] }
    },
    // Il y a 2 mois
    {
      id: 'hist-12',
      type: 'note',
      category: 'communication',
      title: 'Rappel vaccination',
      description: 'Patient à contacter pour rappel vaccin grippe',
      timestamp: subMonths(now, 2),
      authorId: 'sec-2',
      authorName: 'Julie Bernard',
      authorRole: 'Secrétaire médicale',
      metadata: { isUrgent: false, sendToSecretariat: true }
    },
    {
      id: 'hist-13',
      type: 'appointment_rescheduled',
      category: 'administrative',
      title: 'Rendez-vous déplacé',
      description: 'RDV déplacé du 15/01 au 20/01 à la demande du patient',
      timestamp: subMonths(subDays(now, 10), 2),
      authorId: 'sec-1',
      authorName: 'Marie Durand',
      metadata: { reason: 'patient_request', oldDate: '2024-01-15', newDate: '2024-01-20' },
      relatedEntities: { appointmentId: 'apt-126' }
    },
    {
      id: 'hist-14',
      type: 'consultation',
      category: 'clinical',
      title: 'Consultation de routine',
      description: 'Bilan annuel, état général satisfaisant',
      timestamp: subMonths(subDays(now, 15), 2),
      authorId: 'pract-2',
      authorName: 'Dr. Sophie Laurent',
      authorRole: 'Médecin généraliste',
      metadata: { duration: 20, status: 'completed' },
      relatedEntities: { appointmentId: 'apt-127', consultationId: 'cons-127' }
    },
    // Il y a 3 mois
    {
      id: 'hist-15',
      type: 'appointment_cancelled',
      category: 'administrative',
      title: 'Rendez-vous annulé',
      description: 'RDV annulé par le patient (raison familiale)',
      timestamp: subMonths(now, 3),
      authorId: 'sec-1',
      authorName: 'Marie Durand',
      metadata: { reason: 'personal', cancelledBy: 'patient' },
      relatedEntities: { appointmentId: 'apt-128' }
    }
  ];
}
