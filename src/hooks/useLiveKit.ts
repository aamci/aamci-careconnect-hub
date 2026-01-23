/**
 * Hook LiveKit pour gestion WebRTC
 * Gestion de la room, participants, tracks, quality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Room,
  RoomEvent,
  LocalParticipant,
  RemoteParticipant,
  Track,
  ConnectionState,
  ParticipantEvent,
  TrackPublication,
  RemoteTrackPublication,
  ConnectionQuality,
  createLocalTracks,
} from 'livekit-client';
import { toast } from 'sonner';
import type {
  RoomState,
  ParticipantState,
  LocalParticipantState,
  MediaDeviceState,
  ConnectionStats,
} from '@/types/webrtc';
import { mapLiveKitQuality } from '@/types/webrtc';

export interface UseLiveKitOptions {
  onParticipantConnected?: (participant: ParticipantState) => void;
  onParticipantDisconnected?: (participant: ParticipantState) => void;
  onConnectionQualityChanged?: (quality: ConnectionQuality) => void;
  onTrackSubscribed?: (track: TrackPublication, participant: RemoteParticipant) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook principal pour gérer une room LiveKit
 */
export function useLiveKit(options: UseLiveKitOptions = {}) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [participants, setParticipants] = useState<ParticipantState[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipantState | null>(null);

  const roomRef = useRef<Room | null>(null);

  /**
   * Connecter à une room LiveKit
   */
  const connect = useCallback(
    async (serverUrl: string, token: string) => {
      try {
        setIsConnecting(true);
        setError(null);

        const newRoom = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        // Setup event listeners BEFORE connecting
        newRoom
          .on(RoomEvent.Connected, () => {
            setIsConnected(true);
            setIsConnecting(false);
            toast.success('Connecté à la consultation');
          })
          .on(RoomEvent.Disconnected, () => {
            setIsConnected(false);
            toast.info('Déconnecté de la consultation');
          })
          .on(RoomEvent.Reconnecting, () => {
            toast.info('Reconnexion en cours...');
          })
          .on(RoomEvent.Reconnected, () => {
            toast.success('Reconnecté');
          })
          .on(RoomEvent.ParticipantConnected, (participant) => {
            const participantState = mapParticipant(participant as RemoteParticipant);
            setParticipants((prev) => [...prev, participantState]);
            options.onParticipantConnected?.(participantState);
          })
          .on(RoomEvent.ParticipantDisconnected, (participant) => {
            const participantState = mapParticipant(participant as RemoteParticipant);
            setParticipants((prev) => prev.filter((p) => p.identity !== participant.identity));
            options.onParticipantDisconnected?.(participantState);
          })
          .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            options.onTrackSubscribed?.(publication, participant);
          })
          .on(RoomEvent.ConnectionQualityChanged, (quality) => {
            options.onConnectionQualityChanged?.(quality);
          })
          .on(RoomEvent.LocalTrackPublished, () => {
            // Update local participant state
            if (newRoom.localParticipant) {
              setLocalParticipant(mapLocalParticipant(newRoom.localParticipant));
            }
          })
          .on(RoomEvent.LocalTrackUnpublished, () => {
            // Update local participant state
            if (newRoom.localParticipant) {
              setLocalParticipant(mapLocalParticipant(newRoom.localParticipant));
            }
          });

        // Connect to room
        await newRoom.connect(serverUrl, token);

        setRoom(newRoom);
        roomRef.current = newRoom;

        // Set initial local participant
        if (newRoom.localParticipant) {
          setLocalParticipant(mapLocalParticipant(newRoom.localParticipant));
        }

        // Set initial remote participants
        const remoteParticipants = Array.from(newRoom.remoteParticipants.values()).map(
          mapParticipant
        );
        setParticipants(remoteParticipants);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Connection failed');
        setError(error);
        setIsConnecting(false);
        options.onError?.(error);
        toast.error('Erreur de connexion');
        throw error;
      }
    },
    [options]
  );

  /**
   * Se déconnecter de la room
   */
  const disconnect = useCallback(async () => {
    if (roomRef.current) {
      await roomRef.current.disconnect();
      roomRef.current = null;
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
      setLocalParticipant(null);
    }
  }, []);

  /**
   * Activer/désactiver la caméra
   */
  const toggleCamera = useCallback(async () => {
    if (!roomRef.current) return false;

    try {
      const enabled = await roomRef.current.localParticipant.setCameraEnabled(
        !roomRef.current.localParticipant.isCameraEnabled
      );

      // Update local participant state
      if (roomRef.current.localParticipant) {
        setLocalParticipant(mapLocalParticipant(roomRef.current.localParticipant));
      }

      return enabled;
    } catch (error) {
      console.error('Error toggling camera:', error);
      toast.error('Erreur lors de l\'activation de la caméra');
      return false;
    }
  }, []);

  /**
   * Activer/désactiver le microphone
   */
  const toggleMicrophone = useCallback(async () => {
    if (!roomRef.current) return false;

    try {
      const enabled = await roomRef.current.localParticipant.setMicrophoneEnabled(
        !roomRef.current.localParticipant.isMicrophoneEnabled
      );

      // Update local participant state
      if (roomRef.current.localParticipant) {
        setLocalParticipant(mapLocalParticipant(roomRef.current.localParticipant));
      }

      return enabled;
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast.error('Erreur lors de l\'activation du microphone');
      return false;
    }
  }, []);

  /**
   * Démarrer le partage d'écran
   */
  const startScreenShare = useCallback(async () => {
    if (!roomRef.current) return false;

    try {
      await roomRef.current.localParticipant.setScreenShareEnabled(true);

      // Update local participant state
      if (roomRef.current.localParticipant) {
        setLocalParticipant(mapLocalParticipant(roomRef.current.localParticipant));
      }

      toast.success('Partage d\'écran activé');
      return true;
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error('Erreur lors du partage d\'écran');
      return false;
    }
  }, []);

  /**
   * Arrêter le partage d'écran
   */
  const stopScreenShare = useCallback(async () => {
    if (!roomRef.current) return false;

    try {
      await roomRef.current.localParticipant.setScreenShareEnabled(false);

      // Update local participant state
      if (roomRef.current.localParticipant) {
        setLocalParticipant(mapLocalParticipant(roomRef.current.localParticipant));
      }

      toast.info('Partage d\'écran désactivé');
      return true;
    } catch (error) {
      console.error('Error stopping screen share:', error);
      return false;
    }
  }, []);

  /**
   * Changer la caméra
   */
  const switchCamera = useCallback(
    async (deviceId: string) => {
      if (!roomRef.current) return false;

      try {
        await roomRef.current.switchActiveDevice('videoinput', deviceId);
        return true;
      } catch (error) {
        console.error('Error switching camera:', error);
        toast.error('Erreur lors du changement de caméra');
        return false;
      }
    },
    []
  );

  /**
   * Changer le microphone
   */
  const switchMicrophone = useCallback(
    async (deviceId: string) => {
      if (!roomRef.current) return false;

      try {
        await roomRef.current.switchActiveDevice('audioinput', deviceId);
        return true;
      } catch (error) {
        console.error('Error switching microphone:', error);
        toast.error('Erreur lors du changement de microphone');
        return false;
      }
    },
    []
  );

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return {
    room,
    isConnected,
    isConnecting,
    error,
    participants,
    localParticipant,
    connect,
    disconnect,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare,
    switchCamera,
    switchMicrophone,
  };
}

/**
 * Hook pour gérer les devices média
 */
export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDeviceState>({
    cameras: [],
    microphones: [],
    speakers: [],
  });

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();

        setDevices({
          cameras: deviceList.filter((d) => d.kind === 'videoinput'),
          microphones: deviceList.filter((d) => d.kind === 'audioinput'),
          speakers: deviceList.filter((d) => d.kind === 'audiooutput'),
        });
      } catch (error) {
        console.error('Error enumerating devices:', error);
      }
    };

    loadDevices();

    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', loadDevices);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', loadDevices);
    };
  }, []);

  return devices;
}

/**
 * Hook pour tester les devices média
 */
export function useDeviceTest() {
  const [isTestingCamera, setIsTestingCamera] = useState(false);
  const [isTestingMicrophone, setIsTestingMicrophone] = useState(false);
  const [testStream, setTestStream] = useState<MediaStream | null>(null);

  const testCamera = useCallback(async (deviceId?: string) => {
    setIsTestingCamera(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      });

      setTestStream(stream);
      return { success: true, stream };
    } catch (error) {
      console.error('Camera test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Camera access denied',
      };
    } finally {
      setIsTestingCamera(false);
    }
  }, []);

  const testMicrophone = useCallback(async (deviceId?: string) => {
    setIsTestingMicrophone(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      });

      setTestStream(stream);
      return { success: true, stream };
    } catch (error) {
      console.error('Microphone test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Microphone access denied',
      };
    } finally {
      setIsTestingMicrophone(false);
    }
  }, []);

  const stopTest = useCallback(() => {
    if (testStream) {
      testStream.getTracks().forEach((track) => track.stop());
      setTestStream(null);
    }
  }, [testStream]);

  useEffect(() => {
    return () => {
      if (testStream) {
        testStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [testStream]);

  return {
    isTestingCamera,
    isTestingMicrophone,
    testStream,
    testCamera,
    testMicrophone,
    stopTest,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Mapper un participant LiveKit vers notre type ParticipantState
 */
function mapParticipant(participant: RemoteParticipant): ParticipantState {
  return {
    identity: participant.identity,
    name: participant.name || participant.identity,
    metadata: participant.metadata ? JSON.parse(participant.metadata) : {},
    isSpeaking: participant.isSpeaking,
    isMuted: !participant.isMicrophoneEnabled,
    isVideoEnabled: participant.isCameraEnabled,
    isScreenSharing: participant.isScreenShareEnabled,
    connectionQuality: mapLiveKitQuality(participant.connectionQuality),
    joinedAt: new Date(), // LiveKit doesn't provide this, would need to track separately
  };
}

/**
 * Mapper le participant local LiveKit vers notre type LocalParticipantState
 */
function mapLocalParticipant(participant: LocalParticipant): LocalParticipantState {
  return {
    identity: participant.identity,
    name: participant.name || participant.identity,
    metadata: participant.metadata ? JSON.parse(participant.metadata) : {},
    isSpeaking: participant.isSpeaking,
    isMuted: !participant.isMicrophoneEnabled,
    isVideoEnabled: participant.isCameraEnabled,
    isScreenSharing: participant.isScreenShareEnabled,
    connectionQuality: mapLiveKitQuality(participant.connectionQuality),
    joinedAt: new Date(),
    isPublishingAudio: participant.isMicrophoneEnabled,
    isPublishingVideo: participant.isCameraEnabled,
    isPublishingScreen: participant.isScreenShareEnabled,
    devices: {
      cameras: [],
      microphones: [],
      speakers: [],
    },
  };
}
