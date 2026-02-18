// Settings Module Types

export interface UserAccount {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'practitioner' | 'secretary' | 'assistant';
  agendaCount: number;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Replacement {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty: string;
  phone?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

export interface AgendaConfig {
  id: string;
  name: string;
  type: 'practitioner' | 'room' | 'equipment' | 'mobile';
  practitionerId?: string;
  practitionerName?: string;
  specialty?: string;
  siteId: string;
  siteName: string;
  isOnlineBookable: boolean;
  slotDuration: number;
  color: string;
  isActive: boolean;
}

export interface OnlineVisibility {
  isProfileVisible: boolean;
  isOnlineBookingEnabled: boolean;
  keywords: string[];
  blockedPatients: string[];
  bookingDelay: number;
  cancellationDelay: number;
}

export interface ConsultationLocation {
  id: string;
  address: string;
  establishmentName?: string;
  shortName?: string;
  phone?: string;
  fax?: string;
  hasElevator: boolean;
  hasAccessibleEntrance: boolean;
  floor?: string;
  parking: 'none' | 'free' | 'paid' | 'street';
  intercom?: string;
  accessInfo?: string;
}

export interface ConsultationMotifConfig {
  id: string;
  name: string;
  color: string;
  duration: number;
  isOnlineBookable: boolean;
  category?: string;
  instructions?: string;
  questions?: string[];
}

export interface MotifCategory {
  id: string;
  name: string;
  order: number;
}

export interface InternalInstruction {
  id: string;
  title: string;
  content: string;
  motifIds: string[];
  isActive: boolean;
}

export interface PatientConsigne {
  id: string;
  title: string;
  content: string;
  motifIds: string[];
  type: 'before' | 'after' | 'both';
  isActive: boolean;
}

export interface PatientQuestion {
  id: string;
  question: string;
  type: 'text' | 'yesno' | 'choice' | 'number';
  choices?: string[];
  isRequired: boolean;
  motifIds: string[];
  isActive: boolean;
}

export interface RdvDocument {
  id: string;
  name: string;
  description?: string;
  motifIds: string[];
  isRequired: boolean;
}

export interface RdvField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select';
  isRequired: boolean;
  isActive: boolean;
  order: number;
}

export interface MessagingConfig {
  confirmationEmail: boolean;
  reminderEmailJ7: boolean;
  smsNotification: boolean;
  reminderEmailJ1: boolean;
  customMessage?: string;
}

export interface SecurityLogEntry {
  id: string;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

export interface PractitionerProfile {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  specialty: string;
  rppsNumber?: string;
  adeliNumber?: string;
  signature?: string;
}

export interface PrivacySettings {
  googleBusinessActive: boolean;
  thirdPartyAdsActive: boolean;
  dataRetentionYears: number;
  patientDataManagement: boolean;
  cookieConsent: boolean;
}

export type SettingsSection =
  | 'accueil'
  | 'comptes'
  | 'remplacants'
  | 'agendas'
  | 'visibilite'
  | 'lieux'
  | 'motifs'
  | 'categories'
  | 'instructions'
  | 'synthese-consignes'
  | 'consignes'
  | 'questions'
  | 'documents-rdv'
  | 'champs-rdv'
  | 'messagerie'
  | 'statistiques'
  | 'identitovigilance'
  | 'donnees'
  | 'mon-compte'
  | 'confidentialite'
  | 'journal-securite'
  | 'signature';
