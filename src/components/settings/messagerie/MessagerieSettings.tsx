import React, { useState } from 'react';
import { Mail, MessageSquare, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMessagingConfig } from '@/data/settingsMockData';
import { MessagingConfig } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const MessagerieSettings: React.FC = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<MessagingConfig>(mockMessagingConfig);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSave = () => {
    toast({ title: 'Parametres enregistres', description: 'La configuration de la messagerie a ete mise a jour.' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">
        Messagerie patients et communication
      </h1>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-2 text-sm text-blue-800">
        <Bell className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Ces parametres ne concernent que les rendez-vous pris par votre equipe, et non les rendez-vous pris en ligne par les patients.
        </p>
      </div>

      {/* Tabs for different notification types */}
      <Tabs defaultValue="confirmation" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="confirmation" className="text-xs">E-mail de confirmation</TabsTrigger>
          <TabsTrigger value="rappel-j7" className="text-xs">Rappel e-mail J-7</TabsTrigger>
          <TabsTrigger value="sms" className="text-xs">SMS ou notification</TabsTrigger>
          <TabsTrigger value="rappel-j1" className="text-xs">E-mail de rappel J-1</TabsTrigger>
        </TabsList>

        <TabsContent value="confirmation">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">E-mail de confirmation</CardTitle>
                </div>
                <Switch
                  checked={config.confirmationEmail}
                  onCheckedChange={(v) => setConfig((p) => ({ ...p, confirmationEmail: v }))}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Un e-mail de confirmation est envoye au patient immediatement apres la prise de rendez-vous par votre equipe.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rappel-j7">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Rappel e-mail J-7</CardTitle>
                </div>
                <Switch
                  checked={config.reminderEmailJ7}
                  onCheckedChange={(v) => setConfig((p) => ({ ...p, reminderEmailJ7: v }))}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Un e-mail de rappel est envoye au patient 7 jours avant le rendez-vous.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">SMS ou notification</CardTitle>
                </div>
                <Switch
                  checked={config.smsNotification}
                  onCheckedChange={(v) => setConfig((p) => ({ ...p, smsNotification: v }))}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Un SMS ou une notification push est envoye au patient la veille du rendez-vous.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rappel-j1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">E-mail de rappel J-1</CardTitle>
                </div>
                <Switch
                  checked={config.reminderEmailJ1}
                  onCheckedChange={(v) => setConfig((p) => ({ ...p, reminderEmailJ1: v }))}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Un e-mail de rappel est envoye au patient la veille du rendez-vous.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>Valider</Button>
      </div>
    </div>
  );
};

export default MessagerieSettings;
