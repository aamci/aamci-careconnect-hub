import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { mockRdvDocuments } from '@/data/settingsMockData';
import { RdvDocument } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const DocumentsRdv: React.FC = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<RdvDocument[]>(mockRdvDocuments);
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', isRequired: false });

  const handleCreate = () => {
    if (!form.name) return;
    const doc: RdvDocument = {
      id: `doc-${Date.now()}`,
      ...form,
      motifIds: [],
    };
    setDocuments((prev) => [...prev, doc]);
    setShowDialog(false);
    setForm({ name: '', description: '', isRequired: false });
    toast({ title: 'Document ajoute' });
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast({ title: 'Document supprime' });
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Documents</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          Definissez les documents que les patients doivent apporter lors de leur rendez-vous.
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={() => setShowDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Aucun document requis configure.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{doc.name}</p>
                  {doc.isRequired && (
                    <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                  )}
                </div>
                {doc.description && (
                  <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost" size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du document</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ex: Carte vitale" />
            </div>
            <div>
              <Label>Description (optionnelle)</Label>
              <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.isRequired} onCheckedChange={(v) => setForm((p) => ({ ...p, isRequired: !!v }))} />
              <Label>Document obligatoire</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={!form.name}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsRdv;
