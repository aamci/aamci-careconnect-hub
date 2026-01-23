/**
 * Service LiveKit pour gestion WebRTC
 * Génération de tokens, gestion des rooms, statistiques
 */

import { AccessToken } from 'livekit-server-sdk';
import type {
  LiveKitTokenRequest,
  LiveKitTokenResponse,
  ParticipantMetadata,
} from '@/types/webrtc';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Configuration LiveKit depuis les variables d'environnement
 * En production, ces valeurs doivent être configurées côté serveur
 */
const LIVEKIT_CONFIG = {
  serverUrl: import.meta.env.VITE_LIVEKIT_URL || 'ws://localhost:7880',
  apiKey: import.meta.env.VITE_LIVEKIT_API_KEY || '',
  apiSecret: import.meta.env.VITE_LIVEKIT_API_SECRET || '',
};

// ============================================================================
// TOKEN GENERATION (Should be done server-side in production!)
// ============================================================================

/**
 * IMPORTANT: Cette fonction devrait être exécutée côté serveur en production
 * pour sécuriser les secrets API.
 *
 * Pour la démo, nous la gardons ici avec des variables d'environnement.
 * En production, créer un endpoint Supabase Edge Function.
 */
export async function generateLiveKitToken(
  request: LiveKitTokenRequest
): Promise<LiveKitTokenResponse> {
  if (!LIVEKIT_CONFIG.apiKey || !LIVEKIT_CONFIG.apiSecret) {
    throw new Error('LiveKit API credentials not configured');
  }

  try {
    // Create access token
    const token = new AccessToken(
      LIVEKIT_CONFIG.apiKey,
      LIVEKIT_CONFIG.apiSecret,
      {
        identity: request.participantName,
        name: request.participantMetadata.displayName,
        metadata: JSON.stringify(request.participantMetadata),
      }
    );

    // Grant permissions based on participant type
    token.addGrant({
      room: request.roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,

      // Permissions spécifiques
      ...(request.participantMetadata.role === 'practitioner' && {
        canPublishSources: ['camera', 'microphone', 'screen_share'],
        canUpdateOwnMetadata: true,
        roomAdmin: true, // Le praticien peut gérer la room
      }),

      ...(request.participantMetadata.role === 'patient' && {
        canPublishSources: ['camera', 'microphone'],
        canUpdateOwnMetadata: false,
      }),
    });

    // Token expires in 24 hours
    const expiresAt = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    const jwt = await token.toJwt();

    return {
      token: jwt,
      serverUrl: LIVEKIT_CONFIG.serverUrl,
      expiresAt,
    };
  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    throw new Error(`Failed to generate access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// ROOM MANAGEMENT
// ============================================================================

/**
 * Créer un nom de room unique pour une téléconsultation
 */
export function createRoomName(teleconsultationId: string): string {
  return `teleconsult_${teleconsultationId}`;
}

/**
 * Parser un nom de room pour extraire l'ID de téléconsultation
 */
export function parseRoomName(roomName: string): string | null {
  const match = roomName.match(/^teleconsult_(.+)$/);
  return match ? match[1] : null;
}

// ============================================================================
// QUALITY PRESETS
// ============================================================================

/**
 * Presets de qualité vidéo pour différents usages
 */
export const VIDEO_PRESETS = {
  high: {
    width: 1280,
    height: 720,
    frameRate: 30,
    bitrate: 2500000, // 2.5 Mbps
  },
  medium: {
    width: 640,
    height: 480,
    frameRate: 24,
    bitrate: 1000000, // 1 Mbps
  },
  low: {
    width: 320,
    height: 240,
    frameRate: 15,
    bitrate: 500000, // 500 Kbps
  },
};

/**
 * Simulcast layers pour adaptive streaming
 */
export const SIMULCAST_LAYERS = [
  {
    width: 1280,
    height: 720,
    bitrate: 2500000,
    fps: 30,
  },
  {
    width: 640,
    height: 480,
    bitrate: 1000000,
    fps: 24,
  },
  {
    width: 320,
    height: 240,
    bitrate: 500000,
    fps: 15,
  },
];

// ============================================================================
// DEVICE HELPERS
// ============================================================================

/**
 * Obtenir les devices média disponibles
 */
export async function getMediaDevices(): Promise<{
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();

    return {
      cameras: devices.filter((d) => d.kind === 'videoinput'),
      microphones: devices.filter((d) => d.kind === 'audioinput'),
      speakers: devices.filter((d) => d.kind === 'audiooutput'),
    };
  } catch (error) {
    console.error('Error enumerating devices:', error);
    return {
      cameras: [],
      microphones: [],
      speakers: [],
    };
  }
}

/**
 * Tester l'accès à un device (caméra ou micro)
 */
export async function testDeviceAccess(
  deviceId: string,
  kind: 'videoinput' | 'audioinput'
): Promise<{ success: boolean; error?: string }> {
  try {
    const constraints: MediaStreamConstraints = {
      video: kind === 'videoinput' ? { deviceId: { exact: deviceId } } : false,
      audio: kind === 'audioinput' ? { deviceId: { exact: deviceId } } : false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Stop all tracks immediately
    stream.getTracks().forEach((track) => track.stop());

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Demander les permissions pour caméra et micro
 */
export async function requestMediaPermissions(): Promise<{
  camera: PermissionState;
  microphone: PermissionState;
}> {
  const result = {
    camera: 'denied' as PermissionState,
    microphone: 'denied' as PermissionState,
  };

  try {
    // Try to get camera permission
    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.getTracks().forEach((track) => track.stop());
    result.camera = 'granted';
  } catch {
    result.camera = 'denied';
  }

  try {
    // Try to get microphone permission
    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioStream.getTracks().forEach((track) => track.stop());
    result.microphone = 'granted';
  } catch {
    result.microphone = 'denied';
  }

  return result;
}

// ============================================================================
// BROWSER COMPATIBILITY
// ============================================================================

/**
 * Vérifier la compatibilité du navigateur avec WebRTC
 */
export function checkBrowserCompatibility(): {
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
} {
  const userAgent = navigator.userAgent;
  const warnings: string[] = [];

  // Detect browser
  let browser = 'Unknown';
  let version = 'Unknown';

  if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  }

  // Check required features
  const requiredFeatures = {
    webrtc: !!(window.RTCPeerConnection),
    getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    getDisplayMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
    webAudio: !!(window.AudioContext || (window as any).webkitAudioContext),
  };

  // Check for known issues
  if (browser === 'Safari') {
    warnings.push('Safari peut avoir des problèmes avec certains codecs vidéo');
  }

  if (browser === 'Firefox' && parseInt(version) < 60) {
    warnings.push('Version Firefox trop ancienne, veuillez mettre à jour');
  }

  if (browser === 'Chrome' && parseInt(version) < 80) {
    warnings.push('Version Chrome trop ancienne, veuillez mettre à jour');
  }

  // Check if all required features are supported
  const isSupported = Object.values(requiredFeatures).every((supported) => supported);

  if (!isSupported) {
    warnings.push('Certaines fonctionnalités WebRTC ne sont pas supportées');
  }

  return {
    isSupported,
    browser,
    version,
    warnings,
    requiredFeatures,
  };
}

// ============================================================================
// NETWORK TESTING
// ============================================================================

/**
 * Tester la qualité du réseau (simple ping test)
 * En production, utiliser un service dédié comme networktest.twilio.com
 */
export async function testNetworkQuality(): Promise<{
  latency: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}> {
  try {
    const startTime = Date.now();

    // Ping le serveur LiveKit
    await fetch(LIVEKIT_CONFIG.serverUrl.replace('ws://', 'http://').replace('wss://', 'https://'), {
      method: 'HEAD',
      cache: 'no-cache',
    });

    const latency = Date.now() - startTime;

    let quality: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (latency < 50) quality = 'excellent';
    else if (latency < 100) quality = 'good';
    else if (latency < 200) quality = 'fair';
    else if (latency < 400) quality = 'poor';
    else quality = 'critical';

    return { latency, quality };
  } catch (error) {
    console.error('Network test failed:', error);
    return { latency: 9999, quality: 'critical' };
  }
}

/**
 * Obtenir les statistiques WebRTC d'une connexion
 */
export async function getConnectionStats(
  peerConnection: RTCPeerConnection
): Promise<{
  rtt: number;
  packetLoss: number;
  jitter: number;
  bytesReceived: number;
  bytesSent: number;
}> {
  const stats = await peerConnection.getStats();
  let rtt = 0;
  let packetLoss = 0;
  let jitter = 0;
  let bytesReceived = 0;
  let bytesSent = 0;

  stats.forEach((report) => {
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      rtt = report.currentRoundTripTime ? report.currentRoundTripTime * 1000 : 0;
    }

    if (report.type === 'inbound-rtp') {
      if (report.packetsLost && report.packetsReceived) {
        packetLoss = (report.packetsLost / (report.packetsLost + report.packetsReceived)) * 100;
      }
      if (report.jitter) {
        jitter = report.jitter * 1000;
      }
      if (report.bytesReceived) {
        bytesReceived += report.bytesReceived;
      }
    }

    if (report.type === 'outbound-rtp' && report.bytesSent) {
      bytesSent += report.bytesSent;
    }
  });

  return {
    rtt,
    packetLoss,
    jitter,
    bytesReceived,
    bytesSent,
  };
}
