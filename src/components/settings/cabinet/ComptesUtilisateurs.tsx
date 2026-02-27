import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, CalendarDays, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { mockUserAccounts } from '@/data/settingsMockData';
import { UserAccount } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  practitioner: 'Praticien',
  secretary: 'Secretaire',
  assistant: 'Assistant(e)',
};

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  practitioner: 'bg-blue-100 text-blue-800 border-blue-200',
  secretary: 'bg-green-100 text-green-800 border-green-200',
  assistant: 'bg-amber-100 text-amber-800 border-amber-200',
};

const adminRights = [
  { id: 'manage-accounts', label: 'Gerer les comptes utilisateurs' },
  { id: 'manage-agendas', label: 'Gerer les agendas' },
  { id: 'manage-motifs', label: 'Gerer les motifs de consultation' },
  { id: 'manage-settings', label: 'Modifier les parametres de l\'etablissement' },
  { id: 'view-stats', label: 'Consulter les statistiques' },
  { id: 'export-data', label: 'Exporter les donnees' },
];

const ComptesUtilisateurs: React.FC = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<UserAccount[]>(mockUserAccounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [newAccount, setNewAccount] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'practitioner' as UserAccount['role'],
  });
  const [selectedRights, setSelectedRights] = useState<string[]>([]);

  const filtered = accounts.filter((a) => {
    const matchesSearch = `${a.firstName} ${a.lastName} ${a.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || a.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateAccount = () => {
    if (!newAccount.firstName || !newAccount.lastName || !newAccount.email) return;

    const account: UserAccount = {
      id: `user-${Date.now()}`,
      ...newAccount,
      agendaCount: 0,
      isActive: true,
      createdAt: new Date(),
    };
    setAccounts((prev) => [...prev, account]);
    setShowCreateDialog(false);
    setCreateStep(1);
    setNewAccount({ firstName: '', lastName: '', email: '', role: 'practitioner' });
    setSelectedRights([]);
    toast({ title: 'Compte cree', description: `Le compte de ${account.firstName} ${account.lastName} a ete cree.` });
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast({ title: 'Compte supprime', description: 'Le compte a ete supprime.' });
  };

  const handleToggleActive = (id: string) => {
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a)));
  };

  const handleToggleRight = (rightId: string) => {
    setSelectedRights((prev) =>
      prev.includes(rightId) ? prev.filter((r) => r !== rightId) : [...prev, rightId]
    );
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-foreground mb-6">
        Comptes utilisateurs et autorisations
      </h1>

      {/* Help Banner */}
      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 flex items-start gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground mb-1">Besoin d'aide ?</p>
          <button onClick={() => toast({ title: 'Aide', description: 'Utilisez le bouton Creer un compte ci-dessous.' })} className="text-sm text-primary hover:underline block">
            Ajouter ou supprimer un compte utilisateur
          </button>
          <button onClick={() => toast({ title: 'Aide', description: 'Cliquez sur un compte pour modifier ses droits.' })} className="text-sm text-primary hover:underline block">
            Modifier les droits d'acces d'un compte utilisateur
          </button>
        </div>
      </div>

      {/* Search + Filters + Create */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Prenom, nom de famille ou e-mail de la personne"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filtrer par role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les roles</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
            <SelectItem value="practitioner">Praticien</SelectItem>
            <SelectItem value="secretary">Secretaire</SelectItem>
            <SelectItem value="assistant">Assistant(e)</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Creer un compte
        </Button>
      </div>

      {/* Result Count */}
      <p className="text-xs text-muted-foreground mb-3">
        {filtered.length} compte{filtered.length > 1 ? 's' : ''} trouve{filtered.length > 1 ? 's' : ''}
      </p>

      {/* Accounts Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
          <span>Compte</span>
          <span className="w-24 text-center">Agendas</span>
          <span className="w-28 text-center">Role</span>
          <span className="w-20 text-center">Statut</span>
          <span className="w-20 text-center">Admin</span>
          <span className="w-20 text-center">Actions</span>
        </div>

        {filtered.map((account) => (
          <div
            key={account.id}
            className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {account.firstName[0]}{account.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{account.firstName} {account.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{account.email}</p>
              </div>
            </div>

            <div className="w-24 flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{account.agendaCount}</span>
            </div>

            <div className="w-28 flex justify-center">
              <Badge variant="outline" className={`text-xs ${roleColors[account.role]}`}>
                {roleLabels[account.role]}
              </Badge>
            </div>

            <div className="w-20 flex justify-center">
              <Switch
                checked={account.isActive}
                onCheckedChange={() => handleToggleActive(account.id)}
              />
            </div>

            <div className="w-20 flex justify-center">
              {account.role === 'admin' ? (
                <ShieldCheck className="h-4 w-4 text-purple-600" />
              ) : (
                <span className="text-xs text-muted-foreground">-</span>
              )}
            </div>

            <div className="flex items-center gap-1 w-20 justify-center">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setNewAccount({ firstName: account.firstName, lastName: account.lastName, email: account.email, role: account.role }); setCreateStep(1); setShowCreateDialog(true); }} aria-label={`Modifier ${account.firstName} ${account.lastName}`}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDeleteAccount(account.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Aucun compte trouve.
          </div>
        )}
      </div>

      {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) { setCreateStep(1); setSelectedRights([]); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Creer un compte</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex items-center gap-1.5 ${createStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${createStep > 1 ? 'bg-primary text-primary-foreground' : createStep === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {createStep > 1 ? '\u2713' : '1'}
              </div>
              <span className="text-sm font-medium">Informations</span>
            </div>
            <span className="text-muted-foreground">&gt;</span>
            <div className={`flex items-center gap-1.5 ${createStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${createStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <span className="text-sm font-medium">Droits et acces</span>
            </div>
          </div>

          {createStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Prenom</Label>
                  <Input
                    value={newAccount.firstName}
                    onChange={(e) => setNewAccount((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="Prenom"
                  />
                </div>
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={newAccount.lastName}
                    onChange={(e) => setNewAccount((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Nom"
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount((p) => ({ ...p, email: e.target.value }))}
                  placeholder="email@exemple.fr"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={newAccount.role}
                  onValueChange={(v) => setNewAccount((p) => ({ ...p, role: v as UserAccount['role'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practitioner">Praticien</SelectItem>
                    <SelectItem value="secretary">Secretaire</SelectItem>
                    <SelectItem value="assistant">Assistant(e)</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Appliquer les memes droits que l'utilisateur suivant</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.firstName} {a.lastName} ({roleLabels[a.role]})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-border pt-4">
                <Label className="mb-3 block">Ou selectionner les droits manuellement</Label>
                <div className="space-y-3">
                  {adminRights.map((right) => (
                    <div key={right.id} className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedRights.includes(right.id)}
                        onCheckedChange={() => handleToggleRight(right.id)}
                      />
                      <span className="text-sm">{right.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Vous pourrez modifier les droits individuellement apres la creation du compte.
              </p>
            </div>
          )}

          <DialogFooter>
            {createStep === 2 && (
              <Button variant="outline" onClick={() => setCreateStep(1)}>
                Retour
              </Button>
            )}
            {createStep === 1 ? (
              <Button
                onClick={() => setCreateStep(2)}
                disabled={!newAccount.firstName || !newAccount.lastName || !newAccount.email}
              >
                Suivant
              </Button>
            ) : (
              <Button onClick={handleCreateAccount}>
                Creer un compte
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ComptesUtilisateurs;
