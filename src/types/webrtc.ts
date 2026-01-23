// MediSync Pro - WebRTC & LiveKit Types
// LiveKit integration types for teleconsultation

import type {
  Room,
  RemoteParticipant,
  LocalParticipant,
  RemoteTrackPublication,
  LocalTrackPublication,
  Track,
  ConnectionQuality as LiveKitQuality,
} from 'livekit-client';
import type { ConnectionQuality, ParticipantType } from './teleconsultation';

// ============================================================================
// LIVEKIT CONFIGURATION
// ============================================================================

/**
 * LiveKit server configuration
 */
export interface LiveKitConfig {
  serverUrl: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * LiveKit room options
 */
export interface LiveKitRoomOptions {
  // Audio settings
  audioCaptureDefaults?: {
    deviceId?: string;
    autoGainControl?: boolean;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
  };

  // Video settings
  videoCaptureDefaults?: {
    deviceId?: string;
    resolution?: VideoResolution;
    frameRate?: number;
  };

  // Connection settings
  adaptiveStream?: boolean;
  dynacast?: boolean;
  stopLocalTrackOnUnpublish?: boolean;

  // Publishing options
  publishDefaults?: {
    videoSimulcastLayers?: VideoSimulcastLayer[];
    videoCodec?: 'vp8' | 'h264' | 'vp9' | 'av1';
    dtx?: boolean;
    red?: boolean;
  };
}

/**
 * Video resolution configuration
 */
export interface VideoResolution {
  width: number;
  height: number;
  frameRate?: number;
  aspectRatio?: number;
}

/**
 * Video simulcast layer (for adaptive streaming)
 */
export interface VideoSimulcastLayer {
  width: number;
  height: number;
  bitrate: number;
  fps?: number;
}

// ============================================================================
// ROOM & PARTICIPANT STATE
// ============================================================================

/**
 * Enhanced room state
 */
export interface RoomState {
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  participants: ParticipantState[];
  localParticipant: LocalParticipantState | null;
}

/**
 * Participant state
 */
export interface ParticipantState {
  identity: string;
  name: string;
  metadata: ParticipantMetadata;
  isSpeaking: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  connectionQuality: ConnectionQuality;
  joinedAt: Date;
  lastSpokeAt?: Date;
}

/**
 * Local participant state (extends ParticipantState)
 */
export interface LocalParticipantState extends ParticipantState {
  isPublishingAudio: boolean;
  isPublishingVideo: boolean;
  isPublishingScreen: boolean;
  devices: MediaDeviceState;
}

/**
 * Participant metadata (stored in LiveKit participant.metadata)
 */
export interface ParticipantMetadata {
  participantType: ParticipantType;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  role: 'patient' | 'practitioner';
}

/**
 * Media device state
 */
export interface MediaDeviceState {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  selectedCamera?: string;
  selectedMicrophone?: string;
  selectedSpeaker?: string;
}

// ============================================================================
// TRACKS & MEDIA
// ============================================================================

/**
 * Track state
 */
export interface TrackState {
  publication: RemoteTrackPublication | LocalTrackPublication;
  track: Track | null;
  isSubscribed: boolean;
  isMuted: boolean;
  source: Track.Source;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Screen share state
 */
export interface ScreenShareState {
  isSharing: boolean;
  sharedBy?: ParticipantState;
  track?: TrackState;
  startedAt?: Date;
}

/**
 * Audio level info
 */
export interface AudioLevelInfo {
  participantIdentity: string;
  level: number; // 0-1
  isSpeaking: boolean;
}

// ============================================================================
// CONNECTION & QUALITY
// ============================================================================

/**
 * Connection state
 */
export interface ConnectionState {
  status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected';
  quality: ConnectionQuality;
  stats: ConnectionStats;
  lastReconnectAttempt?: Date;
  reconnectAttempts: number;
}

/**
 * Connection statistics
 */
export interface ConnectionStats {
  // Latency
  rtt: number; // round-trip time in ms

  // Packet loss
  packetLoss: number; // percentage

  // Bandwidth
  availableOutgoingBitrate: number; // kbps
  availableIncomingBitrate: number; // kbps

  // Video quality
  videoResolution?: {
    width: number;
    height: number;
  };
  videoFrameRate?: number;
  videoBitrate?: number;

  // Audio quality
  audioBitrate?: number;
  audioLevel?: number;

  // Jitter
  jitter?: number; // ms

  // Timestamp
  timestamp: Date;
}

/**
 * Quality level mapping (LiveKit → App)
 */
export const mapLiveKitQuality = (quality: LiveKitQuality): ConnectionQuality => {
  switch (quality) {
    case LiveKitQuality.Excellent:
      return 'excellent';
    case LiveKitQuality.Good:
      return 'good';
    case LiveKitQuality.Poor:
      return 'poor';
    default:
      return 'fair';
  }
};

// ============================================================================
// EVENTS
// ============================================================================

/**
 * Room event types
 */
export type RoomEventType =
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'reconnected'
  | 'participant-connected'
  | 'participant-disconnected'
  | 'track-published'
  | 'track-unpublished'
  | 'track-subscribed'
  | 'track-unsubscribed'
  | 'active-speaker-changed'
  | 'connection-quality-changed'
  | 'data-received'
  | 'error';

/**
 * Room event payload
 */
export interface RoomEventPayload<T = unknown> {
  type: RoomEventType;
  timestamp: Date;
  data?: T;
}

/**
 * Participant event payload
 */
export interface ParticipantEventPayload {
  participant: ParticipantState;
}

/**
 * Track event payload
 */
export interface TrackEventPayload {
  participant: ParticipantState;
  track: TrackState;
}

/**
 * Data message payload
 */
export interface DataMessagePayload {
  from: string;
  data: Uint8Array;
  topic?: string;
}

// ============================================================================
// TOKEN & AUTHENTICATION
// ============================================================================

/**
 * LiveKit access token request
 */
export interface LiveKitTokenRequest {
  roomName: string;
  participantName: string;
  participantMetadata: ParticipantMetadata;
}

/**
 * LiveKit access token response
 */
export interface LiveKitTokenResponse {
  token: string;
  serverUrl: string;
  expiresAt: number;
}

// ============================================================================
// RECORDING
// ============================================================================

/**
 * Recording configuration
 */
export interface RecordingConfig {
  enabled: boolean;
  layout: 'grid' | 'speaker' | 'presentation';
  videoQuality: 'high' | 'medium' | 'low';
  audioOnly: boolean;
}

/**
 * Recording status
 */
export interface RecordingStatus {
  isRecording: boolean;
  startedAt?: Date;
  duration?: number; // seconds
  fileSizeEstimate?: number; // bytes
}

// ============================================================================
// DEVICE MANAGEMENT
// ============================================================================

/**
 * Device permissions
 */
export interface DevicePermissions {
  camera: PermissionState;
  microphone: PermissionState;
  speaker: PermissionState;
}

export type PermissionState = 'granted' | 'denied' | 'prompt' | 'error';

/**
 * Device test result
 */
export interface DeviceTestResult {
  deviceId: string;
  deviceLabel: string;
  success: boolean;
  error?: string;
  // For microphone
  audioLevel?: number;
  // For camera
  resolution?: VideoResolution;
  // For speaker
  volume?: number;
}

/**
 * Media constraints
 */
export interface MediaConstraints {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * WebRTC error types
 */
export type WebRTCErrorType =
  | 'connection-failed'
  | 'permission-denied'
  | 'device-not-found'
  | 'network-error'
  | 'server-error'
  | 'incompatible-browser'
  | 'token-expired'
  | 'room-full'
  | 'kicked'
  | 'unknown';

/**
 * WebRTC error
 */
export interface WebRTCError extends Error {
  type: WebRTCErrorType;
  code?: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
}

/**
 * Error recovery action
 */
export interface ErrorRecoveryAction {
  type: 'retry' | 'reconnect' | 'switch-device' | 'reload' | 'contact-support';
  label: string;
  autoExecute?: boolean;
  delay?: number; // ms
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Browser compatibility info
 */
export interface BrowserCompatibility {
  isSupported: boolean;
  browser: string;
  version: string;
  warnings: string[];
  requiredFeatures: {
    webrtc: boolean;
    getUserMedia: boolean;
    getDisplayMedia: boolean;
    webAudio: boolean;
  };
}

/**
 * Network test result
 */
export interface NetworkTestResult {
  quality: ConnectionQuality;
  download: number; // Mbps
  upload: number; // Mbps
  latency: number; // ms
  jitter: number; // ms
  packetLoss: number; // percentage
  timestamp: Date;
}
