import React, { useState, useMemo } from 'react';
import { Plus, GripVertical, ChevronDown, Settings2, Edit, MoreVertical } from 'lucide-react';
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

const MOTIF_SUGGESTIONS = [
  'Consultation de suivi de medecine generale',
  'Premiere consultation de medecine generale',
  'Consultation de medecine generale',
  'Consultation de pediatrie',
  'Consultation de geriatrie',
  'Consultation de medecine du sport',
  'Consultation d\'homeopathie',
  'Consultation d\'acupuncture',
  'Consultation de medecine esthetique',
  'Consultation pour permis de conduire',
  'Urgence',
  'Visite a domicile',
  'Suivi de traitement',
];

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

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>([]);

  const openEditDialog = (motif: ConsultationMotifConfig) => {
    setEditingId(motif.id);
    setNewMotif({ name: motif.name, color: motif.color, duration: motif.duration, isOnlineBookable: motif.isOnlineBookable, category: motif.category || '' });
    setCreateStep(2);
    setShowCreateDialog(true);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedMotifs((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  const suggestions = useMemo(() => {
    if (!newMotif.name || newMotif.name.length < 2) return [];
    const q = newMotif.name.toLowerCase();
    return MOTIF_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q));
  }, [newMotif.name]);

  const handleSave = () => {
    if (!newMotif.name) return;
    if (editingId) {
      setMotifs((prev) => prev.map((m) => (m.id === editingId ? { ...m, ...newMotif } : m)));
      toast({ title: 'Motif modifie', description: `Le motif "${newMotif.name}" a ete mis a jour.` });
    } else {
      const motif: ConsultationMotifConfig = { id: `motif-${Date.now()}`, ...newMotif };
      setMotifs((prev) => [...prev, motif]);
      toast({ title: 'Motif cree', description: `Le motif "${motif.name}" a ete cree.` });
    }
    setShowCreateDialog(false);
    setCreateStep(1);
    setEditingId(null);
    setNewMotif({ name: '', color: '#3B82F6', duration: 20, isOnlineBookable: true, category: '' });
  };

  const formatDuration = (min: number) => {
    if (min >= 60) return `${Math.floor(min / 60)}h${min % 60 > 0 ? min % 60 : ''}`;
    return `${min} min`;
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Motifs de consultation</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-1">Besoin d'aide ?</p>
        <button onClick={() => toast({ title: 'Aide', description: 'Utilisez le bouton Creer un nouveau motif ci-dessous.' })} className="text-sm text-primary hover:underline block">
          Ajouter et parametrer les motifs de consultation
        </button>
        <button onClick={() => toast({ title: 'Aide', description: 'Le delai d\'annulation se configure dans les parametres de chaque motif.' })} className="text-sm text-primary hover:underline block">
          Personnaliser le delai d'annulation maximum d'un rendez-vous par motif
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Creer un nouveau motif
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            toast({
              title: 'Options avancees',
              description: 'Delais d\'annulation, regles de reservation en ligne et plages horaires specifiques sont configurables depuis chaque motif.',
            });
          }}
        >
          <Settings2 className="h-4 w-4" />
          Options avancees
        </Button>
      </div>

      {/* Motifs Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
          <span className="w-6" />
          <span className="w-6" />
          <span>Motif de consultation</span>
          <span className="w-16 text-center">Duree</span>
          <span className="w-28 text-center">Reservation en ligne</span>
          <span className="w-20 text-center">Actions</span>
        </div>

        {motifs.map((motif) => (
          <div
            key={motif.id}
            className="grid grid-cols-[auto_auto_1fr_auto_auto_auto] gap-4 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <Checkbox checked={selectedMotifs.includes(motif.id)} onCheckedChange={() => handleToggleSelect(motif.id)} aria-label={`Selectionner ${motif.name}`} />
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
            <span className="w-16 text-center text-sm text-muted-foreground">
              {formatDuration(motif.duration)}
            </span>
            <div className="w-28 flex justify-center">
              <Badge variant={motif.isOnlineBookable ? 'default' : 'secondary'} className="text-xs">
                {motif.isOnlineBookable ? 'Patients' : 'Usage interne'}
              </Badge>
            </div>
            <div className="w-20 flex items-center justify-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(motif)} aria-label={`Modifier ${motif.name}`}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setMotifs((prev) => prev.filter((m) => m.id !== motif.id)); toast({ title: 'Motif supprime' }); }} aria-label={`Supprimer ${motif.name}`}>
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Motif Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) { setCreateStep(1); setEditingId(null); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier le motif' : 'Creer un motif de consultation'}</DialogTitle>
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
              <p className="text-xs text-muted-foreground">
                Pour debuter la creation de votre motif renseignez son nom. Des suggestions standardisees apparaitront.
              </p>
              <div className="relative">
                <Label>Nom</Label>
                <Input
                  value={newMotif.name}
                  onChange={(e) => { setNewMotif((p) => ({ ...p, name: e.target.value })); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Renseigner un motif"
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {newMotif.name.length}/255
                </p>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 left-0 right-0 top-[calc(100%-1.25rem)] bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                        onClick={() => { setNewMotif((p) => ({ ...p, name: s })); setShowSuggestions(false); }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
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
              <Button onClick={handleSave}>{editingId ? 'Enregistrer' : 'Creer le motif'}</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MotifsConsultation;
