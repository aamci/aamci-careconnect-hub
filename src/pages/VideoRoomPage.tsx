/**
 * VideoRoomPage - Page de la consultation vidéo
 * Route: /visio/:teleconsultationId
 */

import React from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { VideoRoom } from '@/components/teleconsultation/video-room/VideoRoom';
import type { ParticipantType } from '@/types/teleconsultation';

export default function VideoRoomPage() {
  const { teleconsultationId } = useParams<{ teleconsultationId: string }>();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const type = searchParams.get('type') as ParticipantType | null;
  const sessionId = searchParams.get('sessionId');

  // Validation des paramètres
  if (!teleconsultationId || !token || !type || !sessionId) {
    return <Navigate to="/" replace />;
  }

  if (type !== 'patient' && type !== 'practitioner') {
    return <Navigate to="/" replace />;
  }

  return (
    <VideoRoom
      teleconsultationId={teleconsultationId}
      token={token}
      participantType={type}
      sessionId={sessionId}
    />
  );
}
