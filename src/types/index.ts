// MediSync Pro - Core Types

export type AppointmentType = 
  | 'consultation' 
  | 'followup' 
  | 'emergency' 
  | 'procedure' 
  | 'checkup';

export type AppointmentStatus = 
  | 'scheduled' 
  | 'waiting' 
  | 'in-progress' 
  | 'completed' 
  | 'absent-excused' 
  | 'absent-unexcused' 
  | 'cancelled';

export type Gender = 'male' | 'female' | 'other';

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  usedFirstName?: string;
  usedLastName?: string;
  gender: Gender;
  dateOfBirth: Date;
  phone: string;
  phoneSecondary?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  birthPlace?: string;
  insuranceNumber?: string;
  insuranceProvider?: string;
  referringDoctor?: string;
  notes?: string;
  alerts?: PatientAlert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientAlert {
  id: string;
  type: 'medical' | 'administrative' | 'vip' | 'payment';
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Appointment {
  id: string;
  patientId: string;
  patient: Patient;
  practitionerId: string;
  practitioner: Practitioner;
  roomId?: string;
  motifId: string;
  motif: AppointmentMotif;
  startTime: Date;
  endTime: Date;
  duration: number; // in minutes
  status: AppointmentStatus;
  type: AppointmentType;
  isFirstVisit: boolean;
  isOnWaitingList: boolean;
  referredBy?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  history: AppointmentHistoryEntry[];
}

export interface AppointmentHistoryEntry {
  id: string;
  action: 'created' | 'modified' | 'status_changed' | 'cancelled' | 'rescheduled';
  userId: string;
  userName: string;
  timestamp: Date;
  details?: string;
  previousValue?: string;
  newValue?: string;
}

export interface AppointmentMotif {
  id: string;
  name: string;
  shortName: string;
  duration: number; // default duration in minutes
  color: string;
  type: AppointmentType;
  requiresRoom?: boolean;
  isOnlineBookable: boolean;
  instructions?: string;
}

export interface Practitioner {
  id: string;
  firstName: string;
  lastName: string;
  title: string; // Dr, Prof, etc.
  specialty: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  color: string;
  siteIds: string[];
}

export interface Site {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  name: string;
  siteId: string;
  capacity?: number;
  equipment?: string[];
}

export interface Note {
  id: string;
  content: string;
  patientId?: string;
  appointmentId?: string;
  authorId: string;
  authorName: string;
  isUrgent: boolean;
  sendToSecretariat: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'document' | 'preparation' | 'followup' | 'administrative' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in-progress' | 'done';
  assigneeId?: string;
  assigneeName?: string;
  patientId?: string;
  appointmentId?: string;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  isAvailable: boolean;
  isUnavailable?: boolean;
  appointment?: Appointment;
}

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  hasAppointments: boolean;
  appointmentCount?: number;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  practitionerId?: string;
  siteIds: string[];
  avatarUrl?: string;
}

export type UserRole = 
  | 'admin' 
  | 'practitioner' 
  | 'secretary' 
  | 'assistant' 
  | 'coordinator';

export interface FilterState {
  practitioners: string[];
  motifs: string[];
  statuses: AppointmentStatus[];
  sites: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

// Document Management Types
export * from './document';
export * from './audit';

// Teleconsultation Types
export * from './teleconsultation';
export * from './webrtc';

// History Types
export * from './history';

// Advanced Analytics Types
export * from './advancedAnalytics';
