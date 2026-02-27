/**
 * VideoRoom - Salle de téléconsultation principale
 * Gestion complète: WebRTC, participants, documents, notes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Loader2,
  Users,
  Clock,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { VideoParticipant } from './VideoParticipant';
import { VideoControls } from './VideoControls';
import { DocumentsSidebar } from './DocumentsSidebar';
import { useLiveKit, useMediaDevices } from '@/hooks/useLiveKit';
import {
  useTeleconsultation,
  useUpdateTeleconsultation,
  useUpdateConnectionQuality,
  useSessionHeartbeat,
  useLogEvent,
  useTeleconsultationDocuments,
  useCreateInvoiceForTeleconsultation,
} from '@/hooks/data/useTeleconsultation';
import { generateLiveKitToken, createRoomName } from '@/services/livekit/livekitService';
import type { ParticipantType } from '@/types/teleconsultation';
import type { Track } from 'livekit-client';

interface VideoRoomProps {
  teleconsultationId: string;
  token: string;
  participantType: ParticipantType;
  sessionId: string;
}

export function VideoRoom({
  teleconsultationId,
  token,
  participantType,
  sessionId,
}: VideoRoomProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isInitializing, setIsInitializing] = useState(true);
  const [duration, setDuration] = useState(0);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [showDocumentsPanel, setShowDocumentsPanel] = useState(false);

  const isPractitioner = participantType === 'practitioner';

  // Hooks data
  const { data: teleconsultation, isLoading: isLoadingTeleconsultation } = useTeleconsultation(teleconsultationId);
  const { data: documents = [] } = useTeleconsultationDocuments(teleconsultationId);
  const updateTeleconsultationMutation = useUpdateTeleconsultation();
  const updateConnectionQualityMutation = useUpdateConnectionQuality();
  const heartbeatMutation = useSessionHeartbeat();
  const logEventMutation = useLogEvent();
  const createInvoiceMutation = useCreateInvoiceForTeleconsultation();

  // Hooks LiveKit
  const devices = useMediaDevices();
  const {
    room,
    isConnected,
    isConnecting,
    error: roomError,
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
  } = useLiveKit({
    onParticipantConnected: (participant) => {
      toast.success(`${participant.name} a rejoint la consultation`);
      logEventMutation.mutate({
        teleconsultation_id: teleconsultationId,
        session_id: sessionId,
        event_type: participantType === 'patient' ? 'practitioner_joined' : 'patient_joined',
        actor_type: 'system',
        event_data: { participant_name: participant.name },
        severity: 'info',
      });
    },
    onParticipantDisconnected: (participant) => {
      toast.info(`${participant.name} a quitté la consultation`);
      logEventMutation.mutate({
        teleconsultation_id: teleconsultationId,
        session_id: sessionId,
        event_type: participantType === 'patient' ? 'practitioner_left' : 'patient_left',
        actor_type: 'system',
        event_data: { participant_name: participant.name },
        severity: 'info',
      });
    },
    onConnectionQualityChanged: (quality) => {
      updateConnectionQualityMutation.mutate({
        session_id: sessionId,
        quality: quality === 0 ? 'excellent' : quality === 1 ? 'good' : quality === 2 ? 'fair' : 'poor',
        network_stats: {
          latency_ms: null,
          packet_loss_percent: null,
          bandwidth_kbps: null,
          jitter_ms: null,
        },
      });
    },
    onError: (error) => {
      console.error('LiveKit error:', error);
      toast.error('Erreur de connexion vidéo');
    },
  });

  /**
   * Initialiser la connexion LiveKit au chargement
   */
  useEffect(() => {
    const initializeRoom = async () => {
      if (!teleconsultation) return;

      try {
        setIsInitializing(true);

        // Générer un token LiveKit
        const roomName = createRoomName(teleconsultationId);
        const livekitToken = await generateLiveKitToken({
          roomName,
          participantName: participantType === 'patient' ? 'Patient' : 'Praticien',
          participantMetadata: {
            participantType,
            userId: teleconsultationId,
            displayName: participantType === 'patient' ? 'Patient' : 'Dr. Praticien',
            role: participantType,
          },
        });

        // Se connecter à la room
        await connect(livekitToken.serverUrl, livekitToken.token);

        // Mettre à jour le statut de la téléconsultation
        if (participantType === 'practitioner' && teleconsultation.status === 'waiting') {
          await updateTeleconsultationMutation.mutateAsync({
            id: teleconsultationId,
            updates: {
              status: 'in_progress',
              actual_start: new Date().toISOString(),
            },
          });
        }

        setIsInitializing(false);
      } catch (error) {
        console.error('Error initializing room:', error);
        toast.error('Erreur lors de la connexion');
        setIsInitializing(false);
      }
    };

    initializeRoom();

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [teleconsultation, teleconsultationId, participantType, connect, disconnect, updateTeleconsultationMutation]);

  /**
   * Heartbeat toutes les 30 secondes
   */
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      heartbeatMutation.mutate(sessionId);
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [isConnected, sessionId, heartbeatMutation]);

  /**
   * Calculer la durée de la consultation
   */
  useEffect(() => {
    if (!isConnected || !teleconsultation?.actual_start) return;

    const startTime = new Date(teleconsultation.actual_start).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000); // en secondes
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, teleconsultation]);

  /**
   * Gérer le toggle caméra
   */
  const handleToggleCamera = useCallback(async () => {
    await toggleCamera();
    logEventMutation.mutate({
      teleconsultation_id: teleconsultationId,
      session_id: sessionId,
      event_type: localParticipant?.isVideoEnabled ? 'video_disabled' : 'video_enabled',
      actor_type: participantType,
      event_data: {},
      severity: 'info',
    });
  }, [toggleCamera, localParticipant, teleconsultationId, sessionId, participantType, logEventMutation]);

  /**
   * Gérer le toggle microphone
   */
  const handleToggleMicrophone = useCallback(async () => {
    await toggleMicrophone();
    logEventMutation.mutate({
      teleconsultation_id: teleconsultationId,
      session_id: sessionId,
      event_type: localParticipant?.isMuted ? 'audio_enabled' : 'audio_disabled',
      actor_type: participantType,
      event_data: {},
      severity: 'info',
    });
  }, [toggleMicrophone, localParticipant, teleconsultationId, sessionId, participantType, logEventMutation]);

  /**
   * Gérer le toggle partage d'écran
   */
  const handleToggleScreenShare = useCallback(async () => {
    if (localParticipant?.isScreenSharing) {
      await stopScreenShare();
      logEventMutation.mutate({
        teleconsultation_id: teleconsultationId,
        session_id: sessionId,
        event_type: 'screen_share_stopped',
        actor_type: participantType,
        event_data: {},
        severity: 'info',
      });
    } else {
      await startScreenShare();
      logEventMutation.mutate({
        teleconsultation_id: teleconsultationId,
        session_id: sessionId,
        event_type: 'screen_share_started',
        actor_type: participantType,
        event_data: {},
        severity: 'info',
      });
    }
  }, [localParticipant, startScreenShare, stopScreenShare, teleconsultationId, sessionId, participantType, logEventMutation]);

  /**
   * Raccrocher
   */
  const handleHangUp = useCallback(async () => {
    if (!teleconsultation) return;

    try {
      // Mettre à jour le statut
      if (isPractitioner) {
        await updateTeleconsultationMutation.mutateAsync({
          id: teleconsultationId,
          updates: {
            status: 'completed',
            actual_end: new Date().toISOString(),
          },
        });

        // Créer automatiquement une facture
        try {
          await createInvoiceMutation.mutateAsync(teleconsultationId);
        } catch (invoiceError) {
          console.error('Error creating invoice:', invoiceError);
          // Ne pas bloquer la fin de consultation si la facture échoue
        }
      }

      // Logger l'événement
      logEventMutation.mutate({
        teleconsultation_id: teleconsultationId,
        session_id: sessionId,
        event_type: 'session_ended',
        actor_type: participantType,
        event_data: {},
        severity: 'info',
      });

      // Déconnecter
      await disconnect();

      // Rediriger
      toast.success('Consultation terminée');
      navigate('/');
    } catch (error) {
      console.error('Error hanging up:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  }, [teleconsultation, teleconsultationId, sessionId, participantType, isPractitioner, disconnect, navigate, updateTeleconsultationMutation, logEventMutation, createInvoiceMutation]);

  /**
   * Formater la durée en HH:MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  };

  // Loading
  if (isInitializing || isLoadingTeleconsultation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-white" />
          <p className="text-white">Connexion à la consultation...</p>
        </div>
      </div>
    );
  }

  // Error
  if (roomError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erreur de connexion. Veuillez réessayer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Récupérer les tracks du participant distant
  const remoteParticipant = participants[0];
  const remoteVideoTrack = remoteParticipant
    ? Array.from(room?.remoteParticipants.values() || [])[0]?.videoTracks.values().next().value?.track
    : null;
  const remoteAudioTrack = remoteParticipant
    ? Array.from(room?.remoteParticipants.values() || [])[0]?.audioTracks.values().next().value?.track
    : null;

  // Récupérer les tracks locaux
  const localVideoTrack = room?.localParticipant?.videoTracks.values().next().value?.track;
  const localAudioTrack = room?.localParticipant?.audioTracks.values().next().value?.track;

  return (
    <div className="h-screen flex flex-col bg-gray-900 relative overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Info consultation */}
          <div className="flex items-center gap-4">
            <Badge variant="default" className="bg-green-500">
              En cours
            </Badge>

            <div className="flex items-center gap-2 text-white">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-sm">{formatDuration(duration)}</span>
            </div>

            {teleconsultation && (
              <span className="text-sm text-gray-300">
                {format(new Date(teleconsultation.scheduled_start), 'HH:mm', { locale: fr })}
              </span>
            )}
          </div>

          {/* Participants count */}
          <div className="flex items-center gap-2 text-white">
            <Users className="h-4 w-4" />
            <span className="text-sm">{participants.length + 1} participants</span>
          </div>
        </div>
      </div>

      {/* Zone vidéo */}
      <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vidéo participant distant */}
        {remoteParticipant && (
          <VideoParticipant
            participant={remoteParticipant}
            videoTrack={remoteVideoTrack as Track}
            audioTrack={remoteAudioTrack as Track}
            className="h-full"
          />
        )}

        {/* Message si personne */}
        {!remoteParticipant && (
          <div className="flex items-center justify-center bg-gray-800 rounded-lg">
            <div className="text-center text-gray-400">
              <Users className="h-12 w-12 mx-auto mb-3" />
              <p>En attente de l'autre participant...</p>
            </div>
          </div>
        )}

        {/* Vidéo locale */}
        {localParticipant && (
          <VideoParticipant
            participant={localParticipant}
            videoTrack={localVideoTrack as Track}
            audioTrack={localAudioTrack as Track}
            isLocal
            className="h-full"
          />
        )}
      </div>

      {/* Contrôles */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
        <VideoControls
          isMuted={localParticipant?.isMuted || false}
          isVideoEnabled={localParticipant?.isVideoEnabled || false}
          isScreenSharing={localParticipant?.isScreenSharing || false}
          devices={devices}
          onToggleMicrophone={handleToggleMicrophone}
          onToggleCamera={handleToggleCamera}
          onToggleScreenShare={handleToggleScreenShare}
          onSwitchCamera={switchCamera}
          onSwitchMicrophone={switchMicrophone}
          onHangUp={handleHangUp}
          onOpenNotes={isPractitioner ? () => setShowNotesPanel(true) : undefined}
          onOpenDocuments={isPractitioner ? () => setShowDocumentsPanel(true) : undefined}
          isPractitioner={isPractitioner}
        />
      </div>

      {/* Sidebar Documents */}
      <DocumentsSidebar
        teleconsultationId={teleconsultationId}
        documents={documents}
        participantType={participantType}
        isOpen={showDocumentsPanel}
        onClose={() => setShowDocumentsPanel(false)}
      />
    </div>
  );
}
