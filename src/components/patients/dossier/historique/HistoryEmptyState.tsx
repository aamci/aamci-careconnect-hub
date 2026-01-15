import React from 'react';
import { History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const HistoryEmptyState: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <History className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Aucun historique
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Ce patient n'a pas encore d'historique de consultations ou rendez-vous passés.
        </p>
      </CardContent>
    </Card>
  );
};

export default HistoryEmptyState;
