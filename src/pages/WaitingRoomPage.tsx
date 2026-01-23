/**
 * WaitingRoomPage - Page de la salle d'attente
 * Route: /visio/waiting/:teleconsultationId
 */

import React from 'react';
import { useParams, useSearchParams, Navigate } from 'react-router-dom';
import { WaitingRoom } from '@/components/teleconsultation/waiting-room/WaitingRoom';
import type { ParticipantType } from '@/types/teleconsultation';

export default function WaitingRoomPage() {
  const { teleconsultationId } = useParams<{ teleconsultationId: string }>();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const type = searchParams.get('type') as ParticipantType | null;

  // Validation des paramètres
  if (!teleconsultationId || !token || !type) {
    return <Navigate to="/" replace />;
  }

  if (type !== 'patient' && type !== 'practitioner') {
    return <Navigate to="/" replace />;
  }

  return (
    <WaitingRoom
      teleconsultationId={teleconsultationId}
      token={token}
      participantType={type}
    />
  );
}
