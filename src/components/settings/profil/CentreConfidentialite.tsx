import React, { useState } from 'react';
import { Database, Shield, Cookie, ExternalLink, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPrivacySettings } from '@/data/settingsMockData';
import { useToast } from '@/hooks/use-toast';

const CentreConfidentialite: React.FC = () => {
  const { toast } = useToast();
  const [settings] = useState(mockPrivacySettings);
  const [newsletters, setNewsletters] = useState(true);
  const [partnerOffers, setPartnerOffers] = useState(false);

  const handleSave = () => {
    toast({ title: 'Preferences enregistrees' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Centre de confidentialite</h1>

      <Tabs defaultValue="donnees" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="donnees">Donnees</TabsTrigger>
          <TabsTrigger value="droits">Droits et acces</TabsTrigger>
          <TabsTrigger value="marketing">Communications marketing</TabsTrigger>
        </TabsList>

        <TabsContent value="donnees" className="space-y-6">
          <section>
            <h2 className="text-base font-semibold mb-4">Donnees personnelles</h2>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm">Activation de la prise de RDV via votre profil Google Business</span>
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

          <section>
            <h2 className="text-base font-semibold mb-4">Donnees de l'etablissement</h2>
            <div className="space-y-3">
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-primary" />
                    <span className="text-sm">Politique de conservation des donnees</span>
                  </div>
                  <Badge variant="outline" className="text-xs">{settings.dataRetentionYears} ans</Badge>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm">Gestion des donnees des bases patients</span>
                  <Badge variant="default" className="text-xs">Actif</Badge>
                </CardContent>
              </Card>
            </div>
          </section>

          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-3">
              <span className="text-sm font-medium">Protection des donnees personnelles</span>
              <div className="space-y-2">
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  Accord sur la Protection des Donnees a Caractere Personnel
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  Confidentialite <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Cookie className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Gestion des cookies</span>
              </div>
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                Gestion des cookies et du consentement <ExternalLink className="h-3 w-3" />
              </button>
              <button className="text-sm text-primary hover:underline flex items-center gap-1">
                Politique de cookies <ExternalLink className="h-3 w-3" />
              </button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="droits">
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Gestion des droits et acces aux donnees.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <Card>
            <CardContent className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">Gerez vos preferences de communication.</p>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recevoir les newsletters</span>
                <Switch checked={newsletters} onCheckedChange={setNewsletters} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recevoir les offres partenaires</span>
                <Switch checked={partnerOffers} onCheckedChange={setPartnerOffers} />
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

export default CentreConfidentialite;
