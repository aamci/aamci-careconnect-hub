import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, CalendarDays } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
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
import { mockUserAccounts } from '@/data/settingsMockData';
import { UserAccount } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const roleLabels: Record<string, string> = {
  admin: 'Administrateur',
  practitioner: 'Praticien',
  secretary: 'Secretaire',
  assistant: 'Assistant(e)',
};

const ComptesUtilisateurs: React.FC = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<UserAccount[]>(mockUserAccounts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [newAccount, setNewAccount] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'practitioner' as UserAccount['role'],
  });

  const filtered = accounts.filter(
    (a) =>
      `${a.firstName} ${a.lastName} ${a.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

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
    toast({ title: 'Compte cree', description: `Le compte de ${account.firstName} ${account.lastName} a ete cree.` });
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast({ title: 'Compte supprime', description: 'Le compte a ete supprime.' });
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
          <button className="text-sm text-primary hover:underline block">
            Ajouter ou supprimer un compte utilisateur
          </button>
          <button className="text-sm text-primary hover:underline block">
            Modifier les droits d'acces d'un compte utilisateur
          </button>
        </div>
      </div>

      {/* Search + Create */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Prenom, nom de famille ou e-mail de la personne"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Creer un compte
        </Button>
      </div>

      {/* Accounts Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
          <span>Compte</span>
          <span>Proprietaire de</span>
          <span className="w-20 text-center">Role</span>
          <span className="w-20 text-center">Actions</span>
        </div>

        {filtered.map((account) => (
          <div
            key={account.id}
            className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
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

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{account.agendaCount} agenda{account.agendaCount > 1 ? 's' : ''}</span>
            </div>

            <Badge variant="outline" className="w-20 justify-center text-xs">
              {roleLabels[account.role]}
            </Badge>

            <div className="flex items-center gap-1 w-20 justify-center">
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
              <span className="text-sm font-medium">Informations du compte</span>
            </div>
            <span className="text-muted-foreground">&gt;</span>
            <div className={`flex items-center gap-1.5 ${createStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${createStep === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                2
              </div>
              <span className="text-sm font-medium">Acces et droits aux agendas</span>
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
                <Label>Appliquer les memes droits que l'utilisateur suivant</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.firstName} {a.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
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
