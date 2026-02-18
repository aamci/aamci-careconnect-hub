import React, { useState } from 'react';
import { Database, Shield, Cookie, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPrivacySettings } from '@/data/settingsMockData';
import { PrivacySettings } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const DonneesSettings: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>(mockPrivacySettings);

  const handleSave = () => {
    toast({ title: 'Parametres enregistres' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Donnees</h1>

      <Tabs defaultValue="donnees" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="donnees">Donnees</TabsTrigger>
          <TabsTrigger value="droits">Droits et acces</TabsTrigger>
          <TabsTrigger value="marketing">Communications marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="donnees" className="space-y-6">
          {/* Donnees personnelles */}
          <section>
            <h2 className="text-base font-semibold mb-4">Donnees personnelles</h2>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm">Activation de la prise de RDV via votre profil Google Business</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={settings.googleBusinessActive ? 'default' : 'secondary'} className="text-xs">
                      {settings.googleBusinessActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm">Amelioration des publicites sur des sites tiers</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={settings.thirdPartyAdsActive ? 'default' : 'secondary'} className="text-xs">
                      {settings.thirdPartyAdsActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Donnees de l'etablissement */}
          <section>
            <h2 className="text-base font-semibold mb-4">Donnees de l'etablissement</h2>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="text-sm">Politique de conservation des donnees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {settings.dataRetentionYears} ans
                    </Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm">Gestion des donnees des bases patients</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={settings.patientDataManagement ? 'default' : 'secondary'} className="text-xs">
                      {settings.patientDataManagement ? 'Actif' : 'Inactif'}
                    </Badge>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Protection des donnees */}
          <section>
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Protection des donnees personnelles</span>
                </div>
                <div className="space-y-2">
                  <button className="text-sm text-primary hover:underline flex items-center gap-1">
                    Accord sur la Protection des Donnees a Caractere Personnel
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <button className="text-sm text-primary hover:underline flex items-center gap-1">
                    Confidentialite
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Gestion des cookies */}
          <section>
            <Card className="bg-muted/30">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Cookie className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Gestion des cookies</span>
                </div>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  Gestion des cookies et du consentement
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  Politique de cookies
                  <ExternalLink className="h-3 w-3" />
                </button>
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        <TabsContent value="droits">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Gestion des droits et acces aux donnees.</p>
              <p className="text-xs mt-2">Contactez l'administrateur pour modifier les droits.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Gerez vos preferences de communication marketing.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recevoir les newsletters</span>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recevoir les offres partenaires</span>
                <Switch />
              </div>
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

export default DonneesSettings;
