// MediSync Pro - Teleconsultation Types
// Based on database schema: 20260123_teleconsultation_complete_schema.sql

import type { Json } from '@/integrations/supabase/types';

// ============================================================================
// ENUMS & UNION TYPES
// ============================================================================

export type TeleconsultationStatus =
  | 'scheduled'
  | 'waiting'
  | 'ready'
  | 'in_progress'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type SessionStatus =
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'failed';

export type ParticipantType = 'patient' | 'practitioner';

export type ConnectionQuality =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'critical';

export type EventType =
  // Connection events
  | 'patient_joined'
  | 'practitioner_joined'
  | 'patient_left'
  | 'practitioner_left'
  | 'reconnection_attempt'
  | 'reconnection_success'
  | 'reconnection_failed'
  // Session events
  | 'session_started'
  | 'session_paused'
  | 'session_resumed'
  | 'session_ended'
  // Media events
  | 'video_enabled'
  | 'video_disabled'
  | 'audio_enabled'
  | 'audio_disabled'
  | 'screen_share_started'
  | 'screen_share_stopped'
  // Quality events
  | 'network_issue'
  | 'quality_degraded'
  // Action events
  | 'document_shared'
  | 'document_viewed'
  | 'prescription_created'
  | 'note_added'
  // Security events
  | 'unauthorized_access_attempt'
  | 'link_expired';

export type EventSeverity = 'info' | 'warning' | 'error' | 'critical';

export type ActorType = 'patient' | 'practitioner' | 'system';

export type VideoQuality = 'auto' | 'high' | 'medium' | 'low';

export type DocumentShareStatus = 'pending' | 'shared' | 'viewed' | 'downloaded';

export type RecordingStatus = 'requested' | 'in_progress' | 'processing' | 'completed' | 'failed' | 'deleted';

// ============================================================================
// SETTINGS & CONFIGURATION
// ============================================================================

export interface TeleconsultationSettings {
  video_enabled: boolean;
  audio_enabled: boolean;
  screen_share_enabled: boolean;
  recording_enabled: boolean;
  quality: VideoQuality;
}

export interface NetworkStats {
  latency_ms: number | null;
  packet_loss_percent: number | null;
  bandwidth_kbps: number | null;
  jitter_ms: number | null;
}

export interface DeviceInfo {
  browser: string | null;
  browser_version: string | null;
  os: string | null;
  device_type: string | null;
  screen_resolution: string | null;
  camera_enabled: boolean | null;
  microphone_enabled: boolean | null;
}

export interface ConsentData {
  recording_consent: boolean | null;
  data_processing_consent: boolean | null;
  terms_accepted: boolean | null;
  consent_timestamp: string | null;
}

// ============================================================================
// MAIN ENTITIES
// ============================================================================

/**
 * Teleconsultation - Main entity (1:1 with appointment)
 */
export interface Teleconsultation {
  id: string;
  appointment_id: string;
  consultation_id: string | null;
  patient_id: string;
  practitioner_id: string;

  // Security & Access
  room_token: string;
  patient_link: string;
  practitioner_link: string;
  room_expires_at: string;

  // Status
  status: TeleconsultationStatus;

  // Timing
  scheduled_start: string;
  actual_start: string | null;
  actual_end: string | null;
  duration_minutes: number | null;

  // Clinical context
  consultation_reason: string | null;
  chief_complaint: string | null;

  // Technical
  technical_check_done: boolean;
  settings: TeleconsultationSettings;

  // Metadata
  metadata: Record<string, unknown>;

  // Audit fields
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
}

/**
 * TeleconsultationSession - WebRTC connection session (supports reconnection)
 */
export interface TeleconsultationSession {
  id: string;
  teleconsultation_id: string;
  participant_type: ParticipantType;
  user_id: string | null;

  // WebRTC identifiers
  peer_id: string;
  connection_id: string;

  // Session state
  status: SessionStatus;
  connected_at: string | null;
  disconnected_at: string | null;

  // Quality monitoring
  connection_quality: ConnectionQuality | null;
  network_stats: NetworkStats;

  // Device & location
  device_info: DeviceInfo;
  ip_address: string | null;
  user_agent: string | null;

  // Health check
  last_heartbeat: string | null;

  // Audit
  created_at: string;
  updated_at: string;
}

/**
 * TeleconsultationEvent - Event journal for audit & real-time
 */
export interface TeleconsultationEvent {
  id: string;
  teleconsultation_id: string;
  session_id: string | null;

  // Event details
  event_type: EventType;
  actor_type: ActorType;
  actor_id: string | null;

  // Event data (flexible JSONB)
  event_data: Record<string, unknown>;

  // Categorization
  severity: EventSeverity;

  // Timing
  occurred_at: string;

  // Context
  ip_address: string | null;
  user_agent: string | null;
}

/**
 * TeleconsultationDocument - Documents shared during consultation
 */
export interface TeleconsultationDocument {
  id: string;
  teleconsultation_id: string;
  document_id: string;

  // Sharing details
  shared_by: ParticipantType;
  shared_by_id: string;
  shared_at: string;

  // Visibility
  visible_to_patient: boolean;
  visible_to_practitioner: boolean;

  // Share type
  share_type: 'pre_consultation' | 'during_consultation' | 'post_consultation';

  // View tracking
  viewed_by_patient: boolean;
  viewed_by_practitioner: boolean;
  viewed_at: string | null;

  // Audit
  created_at: string;

  // Joined document data (from documents table)
  document?: {
    id: string;
    title: string;
    file_path: string;
    file_type: string;
    file_size: number;
    url: string;
  };
}

/**
 * TeleconsultationNote - Private practitioner notes during consultation
 */
export interface TeleconsultationNote {
  id: string;
  teleconsultation_id: string;
  practitioner_id: string;

  // Content
  content: string;
  note_type: string;

  // Categorization
  tags: string[];

  // Medical coding (optional)
  icd10_codes: string[];

  // Privacy
  is_private: boolean;

  // Timing
  created_at: string;
  updated_at: string;

  // Soft delete
  deleted_at: string | null;
  deleted_by: string | null;
}

/**
 * TeleconsultationRecording - Video recording metadata (RGPD compliant)
 */
export interface TeleconsultationRecording {
  id: string;
  teleconsultation_id: string;

  // Storage
  storage_path: string | null;
  file_size_bytes: number | null;
  duration_seconds: number | null;

  // Status
  status: RecordingStatus;

  // Consent & legal
  consent_data: ConsentData;

  // Lifecycle
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  deleted_at: string | null;

  // Processing
  processing_started_at: string | null;
  processing_completed_at: string | null;
  processing_error: string | null;

  // Audit
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

// ============================================================================
// EXTENDED TYPES WITH RELATIONS
// ============================================================================

/**
 * Full teleconsultation with relations
 */
export interface TeleconsultationWithRelations extends Teleconsultation {
  // Related entities
  patient?: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    email?: string;
  };
  practitioner?: {
    id: string;
    firstName: string;
    lastName: string;
    title: string;
    specialty: string;
  };
  appointment?: {
    id: string;
    startTime: string;
    endTime: string;
    motif: string;
  };

  // Activity data
  sessions?: TeleconsultationSession[];
  events?: TeleconsultationEvent[];
  documents?: TeleconsultationDocument[];
  notes?: TeleconsultationNote[];
  recording?: TeleconsultationRecording;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

/**
 * Create teleconsultation request
 */
export interface CreateTeleconsultationRequest {
  appointment_id: string;
  patient_id: string;
  practitioner_id: string;
  scheduled_start: string;
  consultation_reason?: string;
  chief_complaint?: string;
  settings?: Partial<TeleconsultationSettings>;
}

/**
 * Update teleconsultation request
 */
export interface UpdateTeleconsultationRequest {
  status?: TeleconsultationStatus;
  actual_start?: string;
  actual_end?: string;
  consultation_reason?: string;
  chief_complaint?: string;
  technical_check_done?: boolean;
  settings?: Partial<TeleconsultationSettings>;
}

/**
 * Join teleconsultation request
 */
export interface JoinTeleconsultationRequest {
  teleconsultation_id: string;
  participant_type: ParticipantType;
  token: string;
  device_info: DeviceInfo;
}

/**
 * Teleconsultation access validation
 */
export interface TeleconsultationAccess {
  isValid: boolean;
  teleconsultation?: Teleconsultation;
  participantType?: ParticipantType;
  error?: string;
}

/**
 * Connection quality update
 */
export interface ConnectionQualityUpdate {
  session_id: string;
  quality: ConnectionQuality;
  network_stats: NetworkStats;
}

/**
 * Share document during teleconsultation
 */
export interface ShareDocumentRequest {
  teleconsultation_id: string;
  document_id: string;
  shared_by: ParticipantType;
  shared_by_id: string;
  share_type?: 'pre_consultation' | 'during_consultation' | 'post_consultation';
  visible_to_patient?: boolean;
  visible_to_practitioner?: boolean;
}

/**
 * Create note during teleconsultation
 */
export interface CreateNoteRequest {
  teleconsultation_id: string;
  content: string;
  note_type?: string;
  tags?: string[];
  icd10_codes?: string[];
  is_private?: boolean;
}

/**
 * Start recording request
 */
export interface StartRecordingRequest {
  teleconsultation_id: string;
  consent_data: ConsentData;
}

// ============================================================================
// REAL-TIME EVENT PAYLOADS
// ============================================================================

/**
 * Real-time event payload structure
 */
export interface RealtimeEventPayload {
  teleconsultation_id: string;
  event_type: EventType;
  actor_type: ActorType;
  actor_id?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Participant joined event
 */
export interface ParticipantJoinedPayload extends RealtimeEventPayload {
  event_type: 'patient_joined' | 'practitioner_joined';
  data: {
    participant_type: ParticipantType;
    participant_name: string;
    session_id: string;
  };
}

/**
 * Connection quality changed event
 */
export interface QualityChangedPayload extends RealtimeEventPayload {
  event_type: 'quality_degraded' | 'network_issue';
  data: {
    session_id: string;
    old_quality: ConnectionQuality;
    new_quality: ConnectionQuality;
    network_stats: NetworkStats;
  };
}

/**
 * Document shared event
 */
export interface DocumentSharedPayload extends RealtimeEventPayload {
  event_type: 'document_shared';
  data: {
    document_id: string;
    document_name: string;
    shared_by: ParticipantType;
  };
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

/**
 * Waiting room state
 */
export interface WaitingRoomState {
  teleconsultation: Teleconsultation;
  participantType: ParticipantType;
  isReady: boolean;
  deviceCheckComplete: boolean;
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  speakerEnabled: boolean;
  error?: string;
}

/**
 * Video room state
 */
export interface VideoRoomState {
  teleconsultation: Teleconsultation;
  participantType: ParticipantType;
  localParticipant?: {
    name: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    isScreenSharing: boolean;
  };
  remoteParticipant?: {
    name: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
    isScreenSharing: boolean;
    connectionQuality: ConnectionQuality;
  };
  duration: number; // seconds
  isRecording: boolean;
  sharedDocuments: TeleconsultationDocument[];
}

/**
 * Technical check result
 */
export interface TechnicalCheckResult {
  camera: {
    available: boolean;
    error?: string;
  };
  microphone: {
    available: boolean;
    error?: string;
  };
  speaker: {
    available: boolean;
    error?: string;
  };
  network: {
    quality: ConnectionQuality;
    latency_ms: number;
    bandwidth_kbps: number;
  };
  browser: {
    supported: boolean;
    name: string;
    version: string;
    warnings: string[];
  };
}
