import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { X, History, User, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type PractitionerOpening } from '@/services/supabase/openingsService';

interface OpeningHistoryPanelProps {
  opening: PractitionerOpening;
  onClose: () => void;
}

interface HistoryEntry {
  id: string;
  action: string;
  details: string;
  timestamp: Date;
  user: string;
}

const OpeningHistoryPanel: React.FC<OpeningHistoryPanelProps> = ({
  opening,
  onClose,
}) => {
  // In a real implementation, this would fetch from an audit log table
  // For now, we generate mock history from the opening data
  const history: HistoryEntry[] = React.useMemo(() => {
    const entries: HistoryEntry[] = [
      {
        id: '1',
        action: 'Création',
        details: `Plage créée pour ${opening.startTime} - ${opening.endTime}`,
        timestamp: opening.createdAt,
        user: `Dr. ${opening.practitioner.firstName} ${opening.practitioner.lastName}`,
      },
    ];

    if (opening.updatedAt > opening.createdAt) {
      entries.push({
        id: '2',
        action: 'Modification',
        details: 'Plage mise à jour',
        timestamp: opening.updatedAt,
        user: `Dr. ${opening.practitioner.firstName} ${opening.practitioner.lastName}`,
      });
    }

    if (opening.substituteId) {
      entries.push({
        id: '3',
        action: 'Remplaçant ajouté',
        details: 'Un remplaçant a été assigné à cette plage',
        timestamp: opening.updatedAt,
        user: `Dr. ${opening.practitioner.firstName} ${opening.practitioner.lastName}`,
      });
    }

    return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [opening]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Historique des actions</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="h-[400px] p-4">
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div 
                key={entry.id}
                className="relative pl-6 pb-4 border-l-2 border-muted last:border-l-0"
              >
                <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-primary" />
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{entry.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(entry.timestamp, 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{entry.details}</p>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>{entry.user}</span>
                  </div>
                </div>
              </div>
            ))}

            {history.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucun historique disponible</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default OpeningHistoryPanel;
