import React, { useState } from 'react';
import { Plus, GripVertical, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockMotifConfigs } from '@/data/settingsMockData';
import { ConsultationMotifConfig } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#22C55E', '#06B6D4'];

const MotifsConsultation: React.FC = () => {
  const { toast } = useToast();
  const [motifs, setMotifs] = useState<ConsultationMotifConfig[]>(mockMotifConfigs);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [newMotif, setNewMotif] = useState({
    name: '',
    color: '#3B82F6',
    duration: 20,
    isOnlineBookable: true,
    category: '',
  });

  const handleCreate = () => {
    if (!newMotif.name) return;
    const motif: ConsultationMotifConfig = {
      id: `motif-${Date.now()}`,
      ...newMotif,
    };
    setMotifs((prev) => [...prev, motif]);
    setShowCreateDialog(false);
    setCreateStep(1);
    setNewMotif({ name: '', color: '#3B82F6', duration: 20, isOnlineBookable: true, category: '' });
    toast({ title: 'Motif cree', description: `Le motif "${motif.name}" a ete cree.` });
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Motifs de consultation</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-1">Besoin d'aide ?</p>
        <button className="text-sm text-primary hover:underline block">
          Ajouter et parametrer les motifs de consultation
        </button>
        <button className="text-sm text-primary hover:underline block">
          Personnaliser le delai d'annulation maximum d'un rendez-vous par motif
        </button>
      </div>

      <div className="mb-6">
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Creer un nouveau motif
        </Button>
      </div>

      {/* Motifs Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[auto_auto_1fr] gap-4 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
          <span className="w-8" />
          <span className="w-8" />
          <span>Motif de consultation</span>
        </div>

        {motifs.map((motif) => (
          <div
            key={motif.id}
            className="grid grid-cols-[auto_auto_1fr] gap-4 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <Checkbox />
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: motif.color }}
                />
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm truncate">{motif.name}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Motif Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) setCreateStep(1); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Creer un motif de consultation</DialogTitle>
          </DialogHeader>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 text-sm">
            <div className={`flex items-center gap-1.5 ${createStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${createStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {createStep > 1 ? '\u2713' : '1'}
              </div>
              <span className="font-medium">Nom</span>
            </div>
            <span className="text-muted-foreground">&gt;</span>
            <div className={`flex items-center gap-1.5 ${createStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${createStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {createStep > 2 ? '\u2713' : '2'}
              </div>
              <span className="font-medium">Parametres</span>
            </div>
            <span className="text-muted-foreground">&gt;</span>
            <div className={`flex items-center gap-1.5 ${createStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${createStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="font-medium">Ouvertures</span>
            </div>
          </div>

          {createStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={newMotif.name}
                  onChange={(e) => setNewMotif((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Renseigner un motif"
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {newMotif.name.length}/255
                </p>
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Couleur</Label>
                <div className="flex gap-2 mt-1">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setNewMotif((p) => ({ ...p, color: c }))}
                      className={`w-8 h-8 rounded-full transition-all ${newMotif.color === c ? 'ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Duree (minutes)</Label>
                <Select value={String(newMotif.duration)} onValueChange={(v) => setNewMotif((p) => ({ ...p, duration: Number(v) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="25">25 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={newMotif.isOnlineBookable}
                  onCheckedChange={(v) => setNewMotif((p) => ({ ...p, isOnlineBookable: !!v }))}
                />
                <Label>Reservable en ligne</Label>
              </div>
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Configurez les horaires d'ouverture pour ce motif. Vous pourrez les modifier ulterieurement depuis les parametres de l'agenda.
              </p>
              <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
                Les ouvertures seront configurees apres la creation du motif.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              if (createStep === 1) setShowCreateDialog(false);
              else setCreateStep((s) => (s - 1) as 1 | 2);
            }}>
              {createStep === 1 ? 'Annuler' : 'Retour'}
            </Button>
            {createStep < 3 ? (
              <Button onClick={() => setCreateStep((s) => (s + 1) as 2 | 3)} disabled={createStep === 1 && !newMotif.name}>
                Suivant
              </Button>
            ) : (
              <Button onClick={handleCreate}>Creer le motif</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MotifsConsultation;
