import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Plus, Trash2, FileCheck, Info } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface IdentityDocument {
  id: string;
  name: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  isActive: boolean;
}

const initialDocuments: IdentityDocument[] = [
  { id: 'doc-1', name: 'Carte nationale d\'identite', confidenceLevel: 'high', isActive: true },
  { id: 'doc-2', name: 'Passeport', confidenceLevel: 'high', isActive: true },
  { id: 'doc-3', name: 'Permis de conduire', confidenceLevel: 'medium', isActive: true },
  { id: 'doc-4', name: 'Carte de sejour', confidenceLevel: 'high', isActive: true },
  { id: 'doc-5', name: 'Carte Vitale', confidenceLevel: 'medium', isActive: true },
  { id: 'doc-6', name: 'Livret de famille', confidenceLevel: 'low', isActive: false },
  { id: 'doc-7', name: 'Acte de naissance', confidenceLevel: 'low', isActive: false },
  { id: 'doc-8', name: 'Carte d\'assurance maladie europeenne', confidenceLevel: 'medium', isActive: true },
];

const confidenceLevelConfig = {
  high: { label: 'Eleve', color: 'bg-green-100 text-green-800 border-green-200' },
  medium: { label: 'Moyen', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  low: { label: 'Faible', color: 'bg-red-100 text-red-800 border-red-200' },
};

const Identitovigilance: React.FC = () => {
  const { toast } = useToast();
  const [doubleCheckEnabled, setDoubleCheckEnabled] = useState(true);
  const [strictMode, setStrictMode] = useState(false);
  const [insEnabled, setInsEnabled] = useState(true);
  const [verificationMethod, setVerificationMethod] = useState('name-dob');
  const [documents, setDocuments] = useState<IdentityDocument[]>(initialDocuments);
  const [showAddDocDialog, setShowAddDocDialog] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', confidenceLevel: 'medium' as IdentityDocument['confidenceLevel'] });

  const handleSave = () => {
    toast({ title: 'Parametres enregistres', description: 'Les parametres d\'identitovigilance ont ete mis a jour.' });
  };

  const handleToggleDocument = (id: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)));
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast({ title: 'Document supprime' });
  };

  const handleAddDocument = () => {
    if (!newDoc.name) return;
    const doc: IdentityDocument = {
      id: `doc-${Date.now()}`,
      name: newDoc.name,
      confidenceLevel: newDoc.confidenceLevel,
      isActive: true,
    };
    setDocuments((prev) => [...prev, doc]);
    setShowAddDocDialog(false);
    setNewDoc({ name: '', confidenceLevel: 'medium' });
    toast({ title: 'Document ajoute' });
  };

  const activeDocsCount = documents.filter((d) => d.isActive).length;

  return (
    <TooltipProvider>
      <div className="max-w-4xl">
        <h1 className="text-lg font-bold text-foreground mb-6">Identitovigilance</h1>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-2 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            L'identitovigilance permet de securiser l'identification des patients et d'eviter les erreurs
            lors de la prise en charge. Ces parametres s'appliquent a tous les utilisateurs de l'etablissement.
          </p>
        </div>

        <div className="space-y-6">
          {/* INS Toggle */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Identite Nationale de Sante (INS)</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">L'INS est l'identifiant unique du patient dans le systeme de sante francais. Il permet de securiser l'echange de donnees entre professionnels.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Switch checked={insEnabled} onCheckedChange={setInsEnabled} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Activer la verification de l'Identite Nationale de Sante pour tous les patients.
                L'INS est recuperee via le teleservice INSi de l'Assurance Maladie.
              </p>
              {insEnabled && (
                <Badge variant="outline" className="mt-2 text-xs bg-green-50 text-green-700 border-green-200">
                  INSi connecte
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Double Verification */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Double verification d'identite</CardTitle>
                </div>
                <Switch checked={doubleCheckEnabled} onCheckedChange={setDoubleCheckEnabled} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Demande une confirmation d'identite avant chaque consultation.
                Le praticien doit verifier l'identite du patient avant de commencer.
              </p>
            </CardContent>
          </Card>

          {/* Strict Mode */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <CardTitle className="text-sm">Mode strict</CardTitle>
                </div>
                <Switch checked={strictMode} onCheckedChange={setStrictMode} />
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                En mode strict, la consultation ne peut pas commencer tant que l'identite n'est pas verifiee.
                En mode normal, un avertissement est affiche mais la consultation peut demarrer.
              </p>
            </CardContent>
          </Card>

          {/* Verification Method */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <Label>Methode de verification</Label>
              <Select value={verificationMethod} onValueChange={setVerificationMethod}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-dob">Nom + Date de naissance</SelectItem>
                  <SelectItem value="name-dob-ins">Nom + Date de naissance + INS</SelectItem>
                  <SelectItem value="card">Carte vitale</SelectItem>
                  <SelectItem value="id-document">Piece d'identite</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Methode utilisee pour verifier l'identite du patient.
              </p>
            </CardContent>
          </Card>

          {/* Identity Documents Table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold">Justificatifs d'identite acceptes</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeDocsCount} document{activeDocsCount > 1 ? 's' : ''} actif{activeDocsCount > 1 ? 's' : ''} sur {documents.length}
                </p>
              </div>
              <Button onClick={() => setShowAddDocDialog(true)} size="sm" className="gap-2">
                <Plus className="h-3.5 w-3.5" />
                Ajouter un document
              </Button>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
                <span>Document</span>
                <span className="w-28 text-center">Niveau de confiance</span>
                <span className="w-20 text-center">Actif</span>
                <span className="w-16 text-center">Actions</span>
              </div>

              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <span className="text-sm">{doc.name}</span>
                  <div className="w-28 flex justify-center">
                    <Badge
                      variant="outline"
                      className={`text-xs ${confidenceLevelConfig[doc.confidenceLevel].color}`}
                    >
                      {confidenceLevelConfig[doc.confidenceLevel].label}
                    </Badge>
                  </div>
                  <div className="w-20 flex justify-center">
                    <Switch
                      checked={doc.isActive}
                      onCheckedChange={() => handleToggleDocument(doc.id)}
                    />
                  </div>
                  <div className="w-16 flex justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave}>Valider</Button>
        </div>

        {/* Add Document Dialog */}
        <Dialog open={showAddDocDialog} onOpenChange={setShowAddDocDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un justificatif d'identite</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nom du document</Label>
                <Input
                  value={newDoc.name}
                  onChange={(e) => setNewDoc((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Titre de sejour, Carte consulaire..."
                />
              </div>
              <div>
                <Label>Niveau de confiance</Label>
                <Select value={newDoc.confidenceLevel} onValueChange={(v) => setNewDoc((p) => ({ ...p, confidenceLevel: v as IdentityDocument['confidenceLevel'] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Eleve - Document officiel avec photo</SelectItem>
                    <SelectItem value="medium">Moyen - Document officiel sans photo</SelectItem>
                    <SelectItem value="low">Faible - Document non officiel</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Le niveau de confiance determine la fiabilite du document pour l'identification.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDocDialog(false)}>Annuler</Button>
              <Button onClick={handleAddDocument} disabled={!newDoc.name}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default Identitovigilance;
