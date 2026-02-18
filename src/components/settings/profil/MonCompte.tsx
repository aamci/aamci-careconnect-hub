import React, { useState } from 'react';
import { User, Mail, Phone, Shield, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
          <Button variant="outline" onClick={() => toast({ title: 'Fonctionnalite', description: 'Un lien de reinitialisation vous sera envoye par email.' })}>
            Changer le mot de passe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonCompte;
