import React from 'react';
import { Users, Video } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TeleconsultationWithRelations } from '@/types/teleconsultation';

interface WaitingRoomSectionProps {
  waitingPatients: TeleconsultationWithRelations[];
  onJoin: (teleconsultationId: string) => void;
}

export function WaitingRoomSection({ waitingPatients, onJoin }: WaitingRoomSectionProps) {
  if (waitingPatients.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
        <Users className="h-4 w-4 text-teal-600" />
        <span className="text-sm font-semibold text-teal-700">
          Salle d'attente ({waitingPatients.length})
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto py-1 px-0.5">
        {waitingPatients.map((tc) => {
          const initials = `${tc.patient?.firstName?.[0] || ''}${tc.patient?.lastName?.[0] || ''}`.toUpperCase();
          const waitingSince = formatDistanceToNow(new Date(tc.updated_at), {
            locale: fr,
            addSuffix: false,
          });

          return (
            <div
              key={tc.id}
              className="bg-card border rounded-lg p-3 min-w-[240px] max-w-[280px] flex items-center gap-3 shadow-sm"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-primary">{initials}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {tc.patient?.firstName} {tc.patient?.lastName}
                </p>
                {tc.consultation_reason && (
                  <p className="text-xs text-muted-foreground truncate">{tc.consultation_reason}</p>
                )}
                <p className="text-xs text-amber-600 mt-0.5">
                  En attente depuis {waitingSince}
                </p>
              </div>

              <Button
                size="sm"
                className="gap-1.5 flex-shrink-0"
                onClick={() => onJoin(tc.id)}
              >
                <Video className="h-3.5 w-3.5" />
                Rejoindre
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
