import React, { useState } from 'react';
import { User, Mail, Shield, Key, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { mockPractitionerProfile } from '@/data/settingsMockData';
import { PractitionerProfile } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const MonCompte: React.FC = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<PractitionerProfile>(mockPractitionerProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    toast({ title: 'Profil mis a jour', description: 'Vos informations ont ete enregistrees.' });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Mon compte</h1>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {profile.firstName[0]}{profile.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-base font-semibold">
                {profile.title} {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">{profile.specialty}</p>
              <p className="text-xs text-muted-foreground">{profile.email}</p>
            </div>
            <div className="ml-auto">
              {!isEditing ? (
                <Button variant="outline" onClick={() => setIsEditing(true)}>Modifier</Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                  <Button onClick={handleSave}>Enregistrer</Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Informations personnelles</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={profile.title}
                onChange={(e) => setProfile((p) => ({ ...p, title: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Specialite</Label>
              <Input
                value={profile.specialty}
                onChange={(e) => setProfile((p) => ({ ...p, specialty: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prenom</Label>
              <Input
                value={profile.firstName}
                onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label>Nom</Label>
              <Input
                value={profile.lastName}
                onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Coordonnees</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Telephone</Label>
            <Input
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional IDs */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Identifiants professionnels</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Numero RPPS</Label>
            <Input
              value={profile.rppsNumber || ''}
              onChange={(e) => setProfile((p) => ({ ...p, rppsNumber: e.target.value }))}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label>Numero ADELI</Label>
            <Input
              value={profile.adeliNumber || ''}
              onChange={(e) => setProfile((p) => ({ ...p, adeliNumber: e.target.value }))}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Securite</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
            Changer le mot de passe
          </Button>
        </CardContent>
      </Card>

      <PasswordChangeDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
      />
    </div>
  );
};

// ── Password Change Dialog ──────────────────────
const PasswordChangeDialog: React.FC<{ open: boolean; onOpenChange: (o: boolean) => void }> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState('');

  const isValid = currentPwd.length >= 1 && newPwd.length >= 8 && newPwd === confirmPwd;

  const handleSubmit = () => {
    setError('');
    if (newPwd.length < 8) {
      setError('Le nouveau mot de passe doit contenir au moins 8 caracteres.');
      return;
    }
    if (newPwd !== confirmPwd) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!/[A-Z]/.test(newPwd) || !/[0-9]/.test(newPwd)) {
      setError('Le mot de passe doit contenir au moins une majuscule et un chiffre.');
      return;
    }
    toast({ title: 'Mot de passe modifie', description: 'Votre mot de passe a ete mis a jour avec succes.' });
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    onOpenChange(false);
  };

  const reset = () => {
    setCurrentPwd('');
    setNewPwd('');
    setConfirmPwd('');
    setError('');
    setShowCurrent(false);
    setShowNew(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer le mot de passe</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Mot de passe actuel</Label>
            <div className="relative">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="Saisissez votre mot de passe actuel"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label>Nouveau mot de passe</Label>
            <div className="relative">
              <Input
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => { setNewPwd(e.target.value); setError(''); }}
                placeholder="Minimum 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-2 space-y-1">
              <p className={`text-xs ${newPwd.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                {newPwd.length >= 8 ? '\u2713' : '\u2022'} Au moins 8 caracteres
              </p>
              <p className={`text-xs ${/[A-Z]/.test(newPwd) ? 'text-green-600' : 'text-muted-foreground'}`}>
                {/[A-Z]/.test(newPwd) ? '\u2713' : '\u2022'} Au moins une majuscule
              </p>
              <p className={`text-xs ${/[0-9]/.test(newPwd) ? 'text-green-600' : 'text-muted-foreground'}`}>
                {/[0-9]/.test(newPwd) ? '\u2713' : '\u2022'} Au moins un chiffre
              </p>
            </div>
          </div>
          <div>
            <Label>Confirmer le nouveau mot de passe</Label>
            <Input
              type="password"
              value={confirmPwd}
              onChange={(e) => { setConfirmPwd(e.target.value); setError(''); }}
              placeholder="Ressaisissez le nouveau mot de passe"
            />
            {confirmPwd && newPwd !== confirmPwd && (
              <p className="text-xs text-destructive mt-1">Les mots de passe ne correspondent pas.</p>
            )}
          </div>
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={!isValid}>Confirmer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MonCompte;
