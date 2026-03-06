/**
 * VideoRoomPage - Page de la consultation video
 * Route: /visio/:teleconsultationId
 * Accepts token & type as query params; auto-generates sessionId if missing.
 */

import React, { useMemo } from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { VideoRoom } from '@/components/teleconsultation/video-room/VideoRoom';
import type { ParticipantType } from '@/types/teleconsultation';

export default function VideoRoomPage() {
  const { teleconsultationId } = useParams<{ teleconsultationId: string }>();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const type = searchParams.get('type') as ParticipantType | null;
  const sessionIdParam = searchParams.get('sessionId');

  // Auto-generate a stable session ID if not provided (practitioner joining from list)
  const sessionId = useMemo(
    () => sessionIdParam || `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    [sessionIdParam]
  );

  // Only teleconsultationId, token, and type are strictly required
  if (!teleconsultationId || !token || !type) {
    return <Navigate to="/teleconsult" replace />;
  }

  if (type !== 'patient' && type !== 'practitioner') {
    return <Navigate to="/teleconsult" replace />;
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
