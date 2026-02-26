import React, { useState } from 'react';
import { ScrollText, Search, Shield, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockSecurityLog } from '@/data/settingsMockData';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const resultLabels: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' }> = {
  success: { label: 'Succes', variant: 'default' },
  failure: { label: 'Echec', variant: 'destructive' },
  warning: { label: 'Avertissement', variant: 'outline' },
};

const actionCategories = [
  { value: 'all', label: 'Toutes les actions' },
  { value: 'Connexion', label: 'Connexion' },
  { value: 'Deconnexion', label: 'Deconnexion' },
  { value: 'Modification', label: 'Modification' },
  { value: 'Export', label: 'Export' },
  { value: 'Creation', label: 'Creation' },
];

const JournalSecurite: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const uniqueUsers = Array.from(new Set(mockSecurityLog.map((e) => e.userName)));

  const filtered = mockSecurityLog.filter((entry) => {
    const matchesSearch = `${entry.action} ${entry.details} ${entry.userName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesUser = userFilter === 'all' || entry.userName === userFilter;
    const matchesAction = actionFilter === 'all' || entry.action.includes(actionFilter);
    return matchesSearch && matchesUser && matchesAction;
  });

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Journal de securite</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Ce journal enregistre toutes les actions de securite effectuees sur votre compte et ceux de votre etablissement.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans le journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Utilisateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les utilisateurs</SelectItem>
            {uniqueUsers.map((user) => (
              <SelectItem key={user} value={user}>{user}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            {actionCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Result Count */}
      <p className="text-xs text-muted-foreground mb-3">
        {filtered.length} entree{filtered.length > 1 ? 's' : ''} trouvee{filtered.length > 1 ? 's' : ''}
      </p>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-3 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
          <span>Action</span>
          <span>Details</span>
          <span className="w-24 text-center">Resultat</span>
          <span className="w-28">Utilisateur</span>
          <span className="w-28">Lieu / IP</span>
          <span className="w-36 text-right">Date</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <ScrollText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Aucune entree trouvee.</p>
          </div>
        ) : (
          filtered.map((entry, index) => {
            const resultKey = index % 7 === 3 ? 'failure' : index % 5 === 4 ? 'warning' : 'success';
            const resultConfig = resultLabels[resultKey];

            return (
              <div
                key={entry.id}
                className="grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-3 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{entry.action}</span>
                </div>
                <span className="text-sm text-muted-foreground truncate">{entry.details}</span>
                <div className="w-24 flex justify-center">
                  <Badge variant={resultConfig.variant} className="text-xs">
                    {resultConfig.label}
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground w-28 truncate">{entry.userName}</span>
                <div className="w-28">
                  <p className="text-xs text-muted-foreground">{entry.ipAddress}</p>
                  <p className="text-xs text-muted-foreground/70">Navigateur web</p>
                </div>
                <div className="w-36 text-right">
                  <span className="text-xs text-muted-foreground">
                    {format(entry.timestamp, 'dd MMM yyyy HH:mm', { locale: fr })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default JournalSecurite;
