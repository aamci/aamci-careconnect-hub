import React, { useState } from 'react';
import { Eye, Globe, Clock, Ban, Tag, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockOnlineVisibility } from '@/data/settingsMockData';
import { OnlineVisibility } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const VisibiliteReservation: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<OnlineVisibility>(mockOnlineVisibility);
  const [newKeyword, setNewKeyword] = useState('');

  const handleSave = () => {
    toast({ title: 'Parametres enregistres', description: 'Les parametres de visibilite ont ete mis a jour.' });
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setSettings((prev) => ({
      ...prev,
      keywords: [...prev.keywords, newKeyword.trim()],
    }));
    setNewKeyword('');
  };

  const removeKeyword = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">
        Visibilite et reservation en ligne
      </h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-1">Besoin d'aide ?</p>
        <button className="text-sm text-primary hover:underline block">
          Comment rendre votre profil visible aux patients en ligne
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Visibility */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Profil visible en ligne</CardTitle>
              </div>
              <Switch
                checked={settings.isProfileVisible}
                onCheckedChange={(v) => setSettings((p) => ({ ...p, isProfileVisible: v }))}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Votre profil est visible par les patients qui recherchent un praticien en ligne.
            </p>
          </CardContent>
        </Card>

        {/* Online Booking */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Reservation en ligne</CardTitle>
              </div>
              <Switch
                checked={settings.isOnlineBookingEnabled}
                onCheckedChange={(v) => setSettings((p) => ({ ...p, isOnlineBookingEnabled: v }))}
              />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">
              Les patients peuvent prendre rendez-vous directement en ligne.
            </p>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Mots-cles de recherche</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-xs text-muted-foreground">
              Aidez les patients a vous trouver en ajoutant des mots-cles pertinents.
            </p>
            <div className="flex flex-wrap gap-2">
              {settings.keywords.map((kw, i) => (
                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                  {kw}
                  <button onClick={() => removeKeyword(i)} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                placeholder="Ajouter un mot-cle"
                className="max-w-xs"
              />
              <Button variant="outline" size="sm" onClick={addKeyword}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Booking Delays */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-sm">Delais de reservation</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <Label>Delai minimum avant le RDV (heures)</Label>
              <Select
                value={String(settings.bookingDelay)}
                onValueChange={(v) => setSettings((p) => ({ ...p, bookingDelay: Number(v) }))}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Pas de delai</SelectItem>
                  <SelectItem value="1">1 heure</SelectItem>
                  <SelectItem value="2">2 heures</SelectItem>
                  <SelectItem value="4">4 heures</SelectItem>
                  <SelectItem value="24">24 heures</SelectItem>
                  <SelectItem value="48">48 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Delai d'annulation (heures)</Label>
              <Select
                value={String(settings.cancellationDelay)}
                onValueChange={(v) => setSettings((p) => ({ ...p, cancellationDelay: Number(v) }))}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Pas de delai</SelectItem>
                  <SelectItem value="2">2 heures</SelectItem>
                  <SelectItem value="4">4 heures</SelectItem>
                  <SelectItem value="12">12 heures</SelectItem>
                  <SelectItem value="24">24 heures</SelectItem>
                  <SelectItem value="48">48 heures</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={handleSave}>Valider</Button>
      </div>
    </div>
  );
};

export default VisibiliteReservation;
