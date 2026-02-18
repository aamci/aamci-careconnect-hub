import React, { useState } from 'react';
import { ScrollText, Search, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockSecurityLog } from '@/data/settingsMockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const JournalSecurite: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = mockSecurityLog.filter(
    (entry) =>
      `${entry.action} ${entry.details} ${entry.userName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Journal de securite</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Ce journal enregistre toutes les actions de securite effectuees sur votre compte et ceux de votre etablissement.
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans le journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
          <span>Action</span>
          <span>Details</span>
          <span className="w-28">Utilisateur</span>
          <span className="w-40 text-right">Date</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucune entree trouvee.</p>
          </div>
        ) : (
          filtered.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{entry.action}</span>
              </div>
              <span className="text-sm text-muted-foreground truncate">{entry.details}</span>
              <span className="text-sm text-muted-foreground w-28 truncate">{entry.userName}</span>
              <div className="w-40 text-right">
                <span className="text-xs text-muted-foreground">
                  {format(entry.timestamp, 'dd MMM yyyy HH:mm', { locale: fr })}
                </span>
                <p className="text-xs text-muted-foreground">{entry.ipAddress}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default JournalSecurite;
