/**
 * History Timeline Types - Pour l'affichage chronologique de l'historique patient
 */

export type HistoryEventType =
  | 'consultation'
  | 'document'
  | 'note'
  | 'prescription'
  | 'certificate'
  | 'invoice'
  | 'teleconsultation'
  | 'appointment_created'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'patient_updated';

export type HistoryEventCategory = 'clinical' | 'administrative' | 'communication';

export interface HistoryEvent {
  id: string;
  type: HistoryEventType;
  category: HistoryEventCategory;
  title: string;
  description?: string;
  timestamp: Date;
  authorId: string;
  authorName: string;
  authorRole?: string;
  metadata?: Record<string, any>;
  relatedEntities?: {
    appointmentId?: string;
    documentId?: string;
    consultationId?: string;
    invoiceId?: string;
  };
}

export interface HistoryTimelineFilters {
  dateRange: {
    start: Date;
    end: Date;
  };
  types: HistoryEventType[];
  categories: HistoryEventCategory[];
  authors: string[];
  searchQuery?: string;
}

export interface HistoryComparisonPeriod {
  label: string;
  start: Date;
  end: Date;
  color: string;
}

export interface HistoryStats {
  totalEvents: number;
  eventsByType: Record<HistoryEventType, number>;
  eventsByCategory: Record<HistoryEventCategory, number>;
  uniqueAuthors: number;
  mostActiveDay?: Date;
}
