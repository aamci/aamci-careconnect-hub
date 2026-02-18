import React, { useState } from 'react';
import { PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockPractitionerProfile } from '@/data/settingsMockData';
import { useToast } from '@/hooks/use-toast';

const MaSignature: React.FC = () => {
  const { toast } = useToast();
  const [signature, setSignature] = useState(
    mockPractitionerProfile.signature ||
    `${mockPractitionerProfile.title} ${mockPractitionerProfile.firstName} ${mockPractitionerProfile.lastName}\n${mockPractitionerProfile.specialty}\nRPPS: ${mockPractitionerProfile.rppsNumber}`
  );

  const handleSave = () => {
    toast({ title: 'Signature enregistree', description: 'Votre signature a ete mise a jour.' });
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Ma signature</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Votre signature apparait en bas des documents generes (ordonnances, certificats, courriers).
          Personnalisez-la selon vos besoins.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm">Signature textuelle</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Contenu de la signature</Label>
            <Textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              rows={6}
              className="font-mono text-sm"
              placeholder="Votre signature..."
            />
          </div>

          {/* Preview */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Apercu</Label>
            <div className="border border-border rounded-lg p-4 bg-white">
              <pre className="text-sm whitespace-pre-wrap font-serif text-foreground">
                {signature}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Enregistrer</Button>
      </div>
    </div>
  );
};

export default MaSignature;
