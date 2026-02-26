import React, { useState, useRef } from 'react';
import { PenTool, Upload, Camera, FileImage, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPractitionerProfile } from '@/data/settingsMockData';
import { useToast } from '@/hooks/use-toast';

const MaSignature: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('text');
  const [signature, setSignature] = useState(
    mockPractitionerProfile.signature ||
    `${mockPractitionerProfile.title} ${mockPractitionerProfile.firstName} ${mockPractitionerProfile.lastName}\n${mockPractitionerProfile.specialty}\nRPPS: ${mockPractitionerProfile.rppsNumber}`
  );
  const [importedFile, setImportedFile] = useState<{ name: string; url: string } | null>(null);
  const [cameraCapture, setCameraCapture] = useState<string | null>(null);

  const handleSave = () => {
    toast({ title: 'Signature enregistree', description: 'Votre signature a ete mise a jour.' });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({ title: 'Format non supporte', description: 'Veuillez importer une image (PNG, JPG) ou un PDF.', variant: 'destructive' });
      return;
    }

    const url = URL.createObjectURL(file);
    setImportedFile({ name: file.name, url });
    toast({ title: 'Document importe', description: `Le fichier "${file.name}" a ete importe.` });
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      stream.getTracks().forEach((track) => track.stop());

      const dataUrl = canvas.toDataURL('image/png');
      setCameraCapture(dataUrl);
      toast({ title: 'Photo capturee', description: 'La photo de votre signature a ete prise.' });
    } catch {
      toast({ title: 'Camera non disponible', description: 'Impossible d\'acceder a la camera. Verifiez les permissions.', variant: 'destructive' });
    }
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="text">Signature textuelle</TabsTrigger>
          <TabsTrigger value="import">Importer un document</TabsTrigger>
          <TabsTrigger value="photo">Prendre une photo</TabsTrigger>
        </TabsList>

        {/* Text Signature */}
        <TabsContent value="text">
          <Card>
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
        </TabsContent>

        {/* Import Document */}
        <TabsContent value="import">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Importer un document</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Importez une image de votre signature manuscrite (PNG, JPG) ou un document PDF.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileImport}
                className="hidden"
              />

              {importedFile ? (
                <div className="space-y-3">
                  <div className="border border-border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{importedFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setImportedFile(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={importedFile.url}
                        alt="Signature importee"
                        className="max-h-48 object-contain rounded"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Remplacer le document
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Cliquez pour importer un document</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG ou PDF - 5 Mo max</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Camera Capture */}
        <TabsContent value="photo">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm">Prendre une photo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Utilisez votre camera pour photographier votre signature manuscrite.
                Ecrivez votre signature sur une feuille blanche et prenez-la en photo.
              </p>

              {cameraCapture ? (
                <div className="space-y-3">
                  <div className="border border-border rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Photo capturee</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setCameraCapture(null)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <img
                        src={cameraCapture}
                        alt="Signature photographiee"
                        className="max-h-48 object-contain rounded"
                      />
                    </div>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={handleCameraCapture}>
                    <Camera className="h-4 w-4" />
                    Reprendre la photo
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
                  onClick={handleCameraCapture}
                >
                  <Camera className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Cliquez pour prendre une photo</p>
                  <p className="text-xs text-muted-foreground">Votre camera sera activee</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave}>Enregistrer</Button>
      </div>
    </div>
  );
};

export default MaSignature;
