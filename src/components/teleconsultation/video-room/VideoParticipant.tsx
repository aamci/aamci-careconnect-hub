/**
 * VideoParticipant - Affichage de la vidéo d'un participant
 * Supporte local et remote participants avec indicateurs visuels
 */

import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { Track } from 'livekit-client';
import type { ParticipantState, LocalParticipantState } from '@/types/webrtc';

interface VideoParticipantProps {
  participant: ParticipantState | LocalParticipantState;
  videoTrack?: Track | null;
  audioTrack?: Track | null;
  isLocal?: boolean;
  className?: string;
  showConnectionQuality?: boolean;
}

export function VideoParticipant({
  participant,
  videoTrack,
  audioTrack,
  isLocal = false,
  className,
  showConnectionQuality = true,
}: VideoParticipantProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Attacher la piste vidéo
  useEffect(() => {
    if (videoRef.current && videoTrack) {
      videoTrack.attach(videoRef.current);

      return () => {
        videoTrack.detach(videoRef.current!);
      };
    }
  }, [videoTrack]);

  // Attacher la piste audio (sauf pour local)
  useEffect(() => {
    if (!isLocal && audioRef.current && audioTrack) {
      audioTrack.attach(audioRef.current);

      return () => {
        audioTrack.detach(audioRef.current!);
      };
    }
  }, [audioTrack, isLocal]);

  /**
   * Obtenir la couleur de l'indicateur de qualité
   */
  const getQualityColor = () => {
    const colors = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      fair: 'bg-yellow-500',
      poor: 'bg-orange-500',
      critical: 'bg-red-500',
    };

    return colors[participant.connectionQuality] || 'bg-gray-500';
  };

  /**
   * Obtenir l'icône de qualité
   */
  const getQualityIcon = () => {
    if (participant.connectionQuality === 'critical' || participant.connectionQuality === 'poor') {
      return <WifiOff className="h-3 w-3" />;
    }
    return <Wifi className="h-3 w-3" />;
  };

  return (
    <Card className={cn('relative overflow-hidden bg-gray-900', className)}>
      {/* Conteneur vidéo */}
      <div className="relative w-full h-full">
        {/* Vidéo */}
        {videoTrack && participant.isVideoEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isLocal}
            className={cn(
              'w-full h-full object-cover',
              isLocal && 'scale-x-[-1]' // Effet miroir pour la vidéo locale
            )}
          />
        ) : (
          // Placeholder quand pas de vidéo
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-3 bg-gray-700 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-white font-medium">{participant.name}</p>
            </div>
          </div>
        )}

        {/* Audio (caché) */}
        {!isLocal && <audio ref={audioRef} autoPlay playsInline />}

        {/* Overlay top - Nom et statuts */}
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex items-center justify-between">
            {/* Nom */}
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm">{participant.name}</span>
              {isLocal && (
                <Badge variant="secondary" className="text-xs">
                  Vous
                </Badge>
              )}
            </div>

            {/* Qualité de connexion */}
            {showConnectionQuality && (
              <div
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs',
                  getQualityColor()
                )}
              >
                {getQualityIcon()}
              </div>
            )}
          </div>
        </div>

        {/* Overlay bottom - Indicateurs */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-center gap-2">
            {/* Indicateur microphone */}
            <div
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full',
                participant.isMuted ? 'bg-red-500' : 'bg-green-500'
              )}
            >
              {participant.isMuted ? (
                <MicOff className="h-4 w-4 text-white" />
              ) : (
                <Mic className="h-4 w-4 text-white" />
              )}
            </div>

            {/* Indicateur caméra */}
            {!participant.isVideoEnabled && (
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-700">
                <VideoOff className="h-4 w-4 text-white" />
              </div>
            )}

            {/* Indicateur speaking */}
            {participant.isSpeaking && !participant.isMuted && (
              <div className="flex-1">
                <div className="h-1 bg-green-400 rounded-full animate-pulse" />
              </div>
            )}

            {/* Indicateur partage d'écran */}
            {participant.isScreenSharing && (
              <Badge variant="secondary" className="text-xs">
                Partage d'écran
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
