/**
 * VideoRoom - Enterprise teleconsultation room
 * Features: PiP layout, clinical sidebar, post-consultation dialog,
 * graceful fallback to demo mode when LiveKit is unavailable.
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Loader2,
  Users,
  Clock,
  Shield,
  Wifi,
  WifiOff,
  User,
  Video,
  RefreshCw,
  ArrowLeft,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { VideoParticipant } from './VideoParticipant';
import { VideoControls } from './VideoControls';
import { ClinicalSidebar, type SidebarMode } from './ClinicalSidebar';
import { PostConsultationDialog } from './PostConsultationDialog';
import { useLiveKit, useMediaDevices } from '@/hooks/useLiveKit';
import {
  useTeleconsultation,
  useTeleconsultationWithRelations,
  useUpdateTeleconsultation,
  useUpdateConnectionQuality,
  useSessionHeartbeat,
  useLogEvent,
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

  const [isInitializing, setIsInitializing] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showClinicalSidebar, setShowClinicalSidebar] = useState(true);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('compact');
  const [showPostConsultationDialog, setShowPostConsultationDialog] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [demoStream, setDemoStream] = useState<MediaStream | null>(null);
  const [demoCameraOn, setDemoCameraOn] = useState(true);
  const [demoMicOn, setDemoMicOn] = useState(true);
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const localDemoVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isPractitioner = participantType === 'practitioner';

  // Data hooks
  const { data: teleconsultation, isLoading: isLoadingTeleconsultation } = useTeleconsultation(teleconsultationId);
  const { data: teleconsultationWithRelations } = useTeleconsultationWithRelations(teleconsultationId);
  const updateTeleconsultationMutation = useUpdateTeleconsultation();
  const updateConnectionQualityMutation = useUpdateConnectionQuality();
  const heartbeatMutation = useSessionHeartbeat();
  const logEventMutation = useLogEvent();
  const createInvoiceMutation = useCreateInvoiceForTeleconsultation();

  // LiveKit hooks
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
      toast.info(`${participant.name} a quitte la consultation`);
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
    },
  });

  // Patient display info
  const patientName = useMemo(() => {
    const p = teleconsultationWithRelations?.patient;
    if (!p) return 'Patient';
    return `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Patient';
  }, [teleconsultationWithRelations]);

  const patientInitials = useMemo(() => {
    const p = teleconsultationWithRelations?.patient;
    if (!p) return 'P';
    const first = (p.firstName || 'P')[0];
    const last = (p.lastName || '')[0] || '';
    return `${first}${last}`.toUpperCase();
  }, [teleconsultationWithRelations]);

  /**
   * Initialize: try LiveKit, fallback to demo mode
   */
  useEffect(() => {
    let cancelled = false;

    const initializeRoom = async () => {
      if (!teleconsultation) return;

      try {
        setIsInitializing(true);

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

        if (cancelled) return;
        await connect(livekitToken.serverUrl, livekitToken.token);

        if (participantType === 'practitioner' && teleconsultation.status === 'waiting') {
          await updateTeleconsultationMutation.mutateAsync({
            id: teleconsultationId,
            updates: {
              status: 'in_progress',
              actual_start: new Date().toISOString(),
            },
          });
        }

        if (!cancelled) setIsInitializing(false);
      } catch (error) {
        console.warn('[VideoRoom] LiveKit unavailable, entering demo mode:', error);
        if (!cancelled) {
          setIsDemoMode(true);
          setIsInitializing(false);
        }
      }
    };

    initializeRoom();

    return () => {
      cancelled = true;
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teleconsultation?.id]);

  /**
   * Demo mode: acquire local camera/mic
   */
  useEffect(() => {
    if (!isDemoMode) return;

    let stream: MediaStream | null = null;

    const acquireMedia = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' },
          audio: true,
        });
        setDemoStream(stream);
      } catch (err) {
        console.warn('[VideoRoom] Cannot access camera in demo mode:', err);
      }
    };

    acquireMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isDemoMode]);

  /**
   * Attach demo stream to local video elements
   */
  useEffect(() => {
    if (demoStream && localDemoVideoRef.current) {
      localDemoVideoRef.current.srcObject = demoStream;
    }
  }, [demoStream]);

  /**
   * Heartbeat every 30 seconds
   */
  useEffect(() => {
    if (!isConnected && !isDemoMode) return;

    const interval = setInterval(() => {
      heartbeatMutation.mutate(sessionId);
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, isDemoMode, sessionId, heartbeatMutation]);

  /**
   * Track consultation duration (from actual_start or from mount time in demo)
   */
  useEffect(() => {
    if (!isConnected && !isDemoMode) return;

    const startTime = teleconsultation?.actual_start
      ? new Date(teleconsultation.actual_start).getTime()
      : Date.now();

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isConnected, isDemoMode, teleconsultation]);

  // ---------- Handlers ----------

  const handleToggleCamera = useCallback(async () => {
    if (isDemoMode && demoStream) {
      const videoTrack = demoStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setDemoCameraOn(videoTrack.enabled);
      }
      return;
    }
    await toggleCamera();
    logEventMutation.mutate({
      teleconsultation_id: teleconsultationId,
      session_id: sessionId,
      event_type: localParticipant?.isVideoEnabled ? 'video_disabled' : 'video_enabled',
      actor_type: participantType,
      event_data: {},
      severity: 'info',
    });
  }, [isDemoMode, demoStream, toggleCamera, localParticipant, teleconsultationId, sessionId, participantType, logEventMutation]);

  const handleToggleMicrophone = useCallback(async () => {
    if (isDemoMode && demoStream) {
      const audioTrack = demoStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setDemoMicOn(audioTrack.enabled);
      }
      return;
    }
    await toggleMicrophone();
    logEventMutation.mutate({
      teleconsultation_id: teleconsultationId,
      session_id: sessionId,
      event_type: localParticipant?.isMuted ? 'audio_enabled' : 'audio_disabled',
      actor_type: participantType,
      event_data: {},
      severity: 'info',
    });
  }, [isDemoMode, demoStream, toggleMicrophone, localParticipant, teleconsultationId, sessionId, participantType, logEventMutation]);

  const handleToggleScreenShare = useCallback(async () => {
    if (isDemoMode) {
      toast.info('Partage d\'ecran indisponible en mode demonstration');
      return;
    }
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
  }, [isDemoMode, localParticipant, startScreenShare, stopScreenShare, teleconsultationId, sessionId, participantType, logEventMutation]);

  const handleHangUp = useCallback(() => {
    if (isPractitioner) {
      setShowPostConsultationDialog(true);
    } else {
      if (demoStream) {
        demoStream.getTracks().forEach((t) => t.stop());
      }
      disconnect();
      toast.success('Consultation terminee');
      navigate('/teleconsult');
    }
  }, [isPractitioner, disconnect, navigate, demoStream]);

  const handleConfirmEnd = useCallback(async () => {
    if (!teleconsultation) return;

    try {
      await updateTeleconsultationMutation.mutateAsync({
        id: teleconsultationId,
        updates: {
          status: 'completed',
          actual_end: new Date().toISOString(),
        },
      });

      try {
        await createInvoiceMutation.mutateAsync(teleconsultationId);
      } catch (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
      }

      logEventMutation.mutate({
        teleconsultation_id: teleconsultationId,
        session_id: sessionId,
        event_type: 'session_ended',
        actor_type: participantType,
        event_data: {},
        severity: 'info',
      });

      if (demoStream) {
        demoStream.getTracks().forEach((t) => t.stop());
      }
      await disconnect();
      setShowPostConsultationDialog(false);
      toast.success('Consultation terminee');
      navigate('/teleconsult');
    } catch (error) {
      console.error('Error ending consultation:', error);
      toast.error('Erreur lors de la cloture');
    }
  }, [teleconsultation, teleconsultationId, sessionId, participantType, disconnect, navigate, updateTeleconsultationMutation, logEventMutation, createInvoiceMutation, demoStream]);

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  const handleBack = useCallback(() => {
    if (demoStream) {
      demoStream.getTracks().forEach((t) => t.stop());
    }
    disconnect();
    navigate('/teleconsult');
  }, [disconnect, navigate, demoStream]);

  const formatDurationDisplay = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return [hours, minutes, secs].map((v) => v.toString().padStart(2, '0')).join(':');
  };

  // ---------- Loading ----------
  if (isInitializing || isLoadingTeleconsultation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center space-y-6 max-w-sm mx-auto px-4">
          <div className="relative">
            <div className="h-20 w-20 mx-auto rounded-full bg-gray-800 flex items-center justify-center">
              <Video className="h-9 w-9 text-primary animate-pulse" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
          <div>
            <p className="text-white font-medium text-lg">Preparation de la consultation</p>
            <p className="text-gray-400 text-sm mt-1">Connexion en cours...</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span>Connexion chiffree de bout en bout</span>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Critical error (not demo-recoverable) ----------
  if (roomError && !isDemoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-16 w-16 mx-auto rounded-full bg-red-900/30 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-white font-semibold text-lg">Erreur de connexion</h2>
          <p className="text-gray-400 text-sm">
            Impossible de se connecter au serveur video. Verifiez votre connexion internet et reessayez.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleBack} className="gap-2 border-gray-700 text-gray-300 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button onClick={() => window.location.reload()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reessayer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- Resolve tracks ----------
  const remoteParticipant = participants[0];
  const remoteVideoTrack = remoteParticipant
    ? Array.from(room?.remoteParticipants.values() || [])[0]?.videoTracks.values().next().value?.track
    : null;
  const remoteAudioTrack = remoteParticipant
    ? Array.from(room?.remoteParticipants.values() || [])[0]?.audioTracks.values().next().value?.track
    : null;
  const localVideoTrack = room?.localParticipant?.videoTracks.values().next().value?.track;
  const localAudioTrack = room?.localParticipant?.audioTracks.values().next().value?.track;

  const effectiveMuted = isDemoMode ? !demoMicOn : (localParticipant?.isMuted || false);
  const effectiveVideoOn = isDemoMode ? demoCameraOn : (localParticipant?.isVideoEnabled || false);
  const effectiveScreenShare = isDemoMode ? false : (localParticipant?.isScreenSharing || false);

  return (
    <div ref={containerRef} className="h-screen flex flex-col bg-gray-900 overflow-hidden select-none">
      {/* ===== HEADER ===== */}
      <div className="flex-shrink-0 bg-gray-800/90 backdrop-blur-sm border-b border-gray-700/50 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: back + status + timer */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="h-5 w-px bg-gray-700" />

            <Badge className="bg-green-600/90 text-white text-[10px] px-2 py-0.5 font-medium">
              {isDemoMode ? 'DEMO' : 'EN DIRECT'}
            </Badge>

            <div className="flex items-center gap-1.5 text-white">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-mono text-sm tabular-nums">{formatDurationDisplay(duration)}</span>
            </div>

            {teleconsultation && (
              <span className="text-xs text-gray-500 hidden sm:inline">
                Debut prevu {format(new Date(teleconsultation.scheduled_start), 'HH:mm', { locale: fr })}
              </span>
            )}
          </div>

          {/* Center: patient info */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-[10px] font-bold text-primary">{patientInitials}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-white leading-none">{patientName}</p>
              {teleconsultationWithRelations?.consultation_reason && (
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5 max-w-[200px] truncate">
                  {teleconsultationWithRelations.consultation_reason}
                </p>
              )}
            </div>
          </div>

          {/* Right: indicators */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-gray-400 text-xs">
              <Shield className="h-3 w-3 text-green-500" />
              <span className="text-[10px]">Chiffre</span>
            </div>

            <div className="h-4 w-px bg-gray-700 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-gray-400">
              {isConnected ? (
                <Wifi className="h-3.5 w-3.5 text-green-400" />
              ) : isDemoMode ? (
                <Wifi className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-red-400" />
              )}
              <span className="text-xs">
                {(isDemoMode ? 0 : participants.length) + 1}
              </span>
              <Users className="h-3.5 w-3.5" />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFullscreen}
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* ===== Demo mode banner ===== */}
      {isDemoMode && (
        <div className="flex-shrink-0 bg-amber-900/30 border-b border-amber-800/30 px-4 py-1.5">
          <div className="flex items-center justify-center gap-2 text-amber-300 text-xs">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>Mode demonstration - Serveur video non configure. L'apercu camera est actif.</span>
          </div>
        </div>
      )}

      {/* ===== MAIN: Video + Sidebar ===== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video area */}
        <div className="flex-1 relative p-2">
          {/* Remote video (or waiting placeholder) */}
          {remoteParticipant && !isDemoMode ? (
            <VideoParticipant
              participant={remoteParticipant}
              videoTrack={remoteVideoTrack as Track}
              audioTrack={remoteAudioTrack as Track}
              className="w-full h-full rounded-xl"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-850 rounded-xl border border-gray-700/30">
              <div className="text-center space-y-4">
                <div className="h-24 w-24 mx-auto rounded-full bg-gray-700/50 flex items-center justify-center ring-4 ring-gray-700/30">
                  <span className="text-3xl font-bold text-gray-400">{patientInitials}</span>
                </div>
                <div>
                  <p className="text-white font-medium text-lg">{patientName}</p>
                  {teleconsultationWithRelations?.consultation_reason && (
                    <p className="text-gray-400 text-sm mt-1 max-w-xs mx-auto">
                      {teleconsultationWithRelations.consultation_reason}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  {isDemoMode ? (
                    <span>Apercu en mode demonstration</span>
                  ) : (
                    <>
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>En attente de connexion du patient...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Local video - PiP overlay */}
          <div className="absolute bottom-4 right-4 w-52 h-40 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-600/50 z-10 bg-gray-800">
            {/* LiveKit local video */}
            {!isDemoMode && localParticipant && (
              <VideoParticipant
                participant={localParticipant}
                videoTrack={localVideoTrack as Track}
                audioTrack={localAudioTrack as Track}
                isLocal
                className="w-full h-full"
              />
            )}

            {/* Demo mode local camera */}
            {isDemoMode && demoStream && demoCameraOn && (
              <video
                ref={localDemoVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}

            {/* Camera off placeholder */}
            {((isDemoMode && (!demoStream || !demoCameraOn)) || (!isDemoMode && !localParticipant)) && (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto rounded-full bg-gray-600 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">Vous</p>
                </div>
              </div>
            )}

            {/* PiP label */}
            <div className="absolute top-2 left-2">
              <Badge className="bg-black/60 text-white text-[9px] px-1.5 py-0 font-normal border-0">
                Vous
              </Badge>
            </div>
          </div>
        </div>

        {/* Clinical sidebar (practitioner only) */}
        {isPractitioner && teleconsultationWithRelations && (
          <ClinicalSidebar
            teleconsultationId={teleconsultationId}
            teleconsultation={teleconsultationWithRelations}
            participantType={participantType}
            isOpen={showClinicalSidebar}
            onToggle={() => setShowClinicalSidebar((prev) => !prev)}
            sidebarMode={sidebarMode}
            onToggleMode={() => setSidebarMode((prev) => prev === 'compact' ? 'consultation' : 'compact')}
          />
        )}
      </div>

      {/* ===== CONTROLS ===== */}
      <div className="flex-shrink-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700/50 px-6 py-3">
        <VideoControls
          isMuted={effectiveMuted}
          isVideoEnabled={effectiveVideoOn}
          isScreenSharing={effectiveScreenShare}
          devices={devices}
          onToggleMicrophone={handleToggleMicrophone}
          onToggleCamera={handleToggleCamera}
          onToggleScreenShare={handleToggleScreenShare}
          onSwitchCamera={switchCamera}
          onSwitchMicrophone={switchMicrophone}
          onHangUp={handleHangUp}
          onOpenNotes={isPractitioner ? () => setShowClinicalSidebar(true) : undefined}
          onOpenDocuments={isPractitioner ? () => setShowClinicalSidebar(true) : undefined}
          isPractitioner={isPractitioner}
        />
      </div>

      {/* ===== Post-consultation dialog ===== */}
      {isPractitioner && teleconsultationWithRelations && (
        <PostConsultationDialog
          teleconsultation={teleconsultationWithRelations}
          duration={duration}
          open={showPostConsultationDialog}
          onConfirmEnd={handleConfirmEnd}
          onCancel={() => setShowPostConsultationDialog(false)}
        />
      )}
    </div>
  );
}
