/**
 * Timeline Types - Patient History Module
 * Types for the HISTORIQUE section of patient dossier
 */

// ==================== EVENT TYPES ====================

export type TimelineEventType =
  | 'appointment'
  | 'document_received'
  | 'document_created'
  | 'clinical_note'
  | 'prescription'
  | 'letter'
  | 'lab_result'
  | 'imaging'
  | 'reminder'
  | 'task';

export type DocumentCategory =
  | 'letter'
  | 'imaging'
  | 'lab'
  | 'prescription'
  | 'report'
  | 'administrative'
  | 'other';

// ==================== MAIN INTERFACES ====================

export interface TimelineEvent {
  id: string;
  patient_id: string;
  event_type: TimelineEventType;
  event_subtype?: string;

  title: string;
  subtitle?: string;
  description?: string;

  // References
  appointment_id?: string;
  document_ids?: string[];

  // Metadata
  metadata: TimelineEventMetadata;

  // Audit
  created_by: string;
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    role?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TimelineEventMetadata {
  // For appointments
  status?: string;
  practitioner_id?: string;
  practitioner_name?: string;
  motif_id?: string;
  motif_name?: string;
  duration?: number;

  // For documents
  category?: DocumentCategory;
  source?: 'internal' | 'external';
  file_type?: string;
  file_size?: number;
  file_path?: string;
  can_share?: boolean;

  // For notes
  is_urgent?: boolean;
  confidentiality_level?: string;

  // Generic
  [key: string]: unknown;
}

// ==================== FILTERS ====================

export interface TimelineFilters {
  types?: TimelineEventType[];
  subtypes?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  practitionerId?: string;
  searchQuery?: string;
  hasDocuments?: boolean;
  isUrgent?: boolean;
  statuses?: string[];
}

export interface TimelinePagination {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ==================== STATISTICS ====================

export interface PatientAttendanceStats {
  patient_id: string;
  completed_count: number;
  absent_excused_count: number;
  no_show_count: number;
  cancelled_count: number;
  total_count: number;
  attendance_rate: number;
}

// ==================== REMINDERS ====================

export type ReminderStatus = 'pending' | 'completed' | 'cancelled';

export interface PatientReminder {
  id: string;
  patient_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: ReminderStatus;
  completed_at?: string;
  completed_by?: string;
  notify_days_before: number;
  notification_sent: boolean;
  created_by: string;
  created_at: string;
}

export interface CreateReminderInput {
  patient_id: string;
  title: string;
  description?: string;
  due_date: string;
  notify_days_before?: number;
}

export interface UpdateReminderInput {
  title?: string;
  description?: string;
  due_date?: string;
  status?: ReminderStatus;
}

// ==================== TASKS ====================

export type PatientTaskStatus = 'todo' | 'in_progress' | 'done';
export type PatientTaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type PatientTaskType = 'call' | 'document' | 'preparation' | 'followup' | 'administrative' | 'other';

export interface PatientTask {
  id: string;
  patient_id: string;
  title: string;
  description?: string;
  type: PatientTaskType;
  priority: PatientTaskPriority;
  status: PatientTaskStatus;
  assignee_id?: string;
  assignee_name?: string;
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ==================== UI CONFIG ====================

export const EVENT_TYPE_CONFIG: Record<TimelineEventType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  appointment: {
    label: 'Rendez-vous',
    icon: 'Calendar',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  document_received: {
    label: 'Document reçu',
    icon: 'FileText',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  document_created: {
    label: 'Document créé',
    icon: 'FilePlus',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  clinical_note: {
    label: 'Note clinique',
    icon: 'StickyNote',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  prescription: {
    label: 'Ordonnance',
    icon: 'Pill',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  letter: {
    label: 'Courrier',
    icon: 'Mail',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
  },
  lab_result: {
    label: 'Analyse',
    icon: 'TestTube',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  imaging: {
    label: 'Imagerie',
    icon: 'Image',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  reminder: {
    label: 'Rappel',
    icon: 'Bell',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  task: {
    label: 'Tâche',
    icon: 'CheckSquare',
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
};

export const APPOINTMENT_STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  scheduled: {
    label: 'Planifié',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    icon: 'Calendar',
  },
  waiting: {
    label: 'En attente',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
    icon: 'Clock',
  },
  'in-progress': {
    label: 'En cours',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    icon: 'Activity',
  },
  completed: {
    label: 'Honoré',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
    icon: 'CheckCircle',
  },
  cancelled: {
    label: 'Annulé',
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-200',
    icon: 'XCircle',
  },
  'absent-unexcused': {
    label: 'Non honoré',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    icon: 'UserX',
  },
  'absent-excused': {
    label: 'Absence excusée',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    icon: 'AlertCircle',
  },
};

export const DOCUMENT_CATEGORY_CONFIG: Record<DocumentCategory, {
  label: string;
  icon: string;
  color: string;
}> = {
  letter: { label: 'Courrier', icon: 'Mail', color: 'text-slate-600' },
  imaging: { label: 'Imagerie', icon: 'Image', color: 'text-indigo-600' },
  lab: { label: 'Analyse', icon: 'TestTube', color: 'text-cyan-600' },
  prescription: { label: 'Ordonnance', icon: 'Pill', color: 'text-emerald-600' },
  report: { label: 'Compte-rendu', icon: 'FileText', color: 'text-blue-600' },
  administrative: { label: 'Administratif', icon: 'FileCheck', color: 'text-gray-600' },
  other: { label: 'Autre', icon: 'File', color: 'text-gray-500' },
};
