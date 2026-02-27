import React, { useState } from 'react';
import { Plus, Edit, Trash2, MonitorSmartphone, Stethoscope, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Card, CardContent } from '@/components/ui/card';
import { mockAgendaConfigs } from '@/data/settingsMockData';
import { AgendaConfig } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const agendaTypeConfig = {
  practitioner: { label: 'Un(e) soignant(e)', icon: Stethoscope, description: 'Gerez les rendez-vous d\'un soignant dans votre etablissement' },
  room: { label: 'Une salle de consultation', icon: MonitorSmartphone, description: 'Creez un agenda pour une salle' },
  equipment: { label: 'Une salle avec machine(s)', icon: MonitorSmartphone, description: 'Gerez les rendez-vous d\'une salle avec un equipement partage' },
  mobile: { label: 'Un equipement mobile', icon: MonitorSmartphone, description: 'Gerez la disponibilite des rendez-vous necessitant un equipement' },
};

const AgendasSettings: React.FC = () => {
  const { toast } = useToast();
  const [agendas, setAgendas] = useState<AgendaConfig[]>(mockAgendaConfigs);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [selectedType, setSelectedType] = useState<AgendaConfig['type']>('practitioner');
  const [newAgenda, setNewAgenda] = useState({
    name: '',
    specialty: '',
    slotDuration: 20,
  });

  const handleSave = () => {
    if (!newAgenda.name) return;
    if (editingId) {
      setAgendas((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, name: newAgenda.name, type: selectedType, specialty: newAgenda.specialty, slotDuration: newAgenda.slotDuration }
            : a
        )
      );
      toast({ title: 'Agenda modifie', description: `L'agenda "${newAgenda.name}" a ete mis a jour.` });
    } else {
      const agenda: AgendaConfig = {
        id: `agenda-${Date.now()}`,
        name: newAgenda.name,
        type: selectedType,
        specialty: newAgenda.specialty,
        siteId: 'site-1',
        siteName: 'CareConnect Hub',
        isOnlineBookable: false,
        slotDuration: newAgenda.slotDuration,
        color: ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#06B6D4'][agendas.length % 6],
        isActive: true,
      };
      setAgendas((prev) => [...prev, agenda]);
      toast({ title: 'Agenda cree', description: `L'agenda "${agenda.name}" a ete cree.` });
    }
    setShowCreateDialog(false);
    setCreateStep(1);
    setEditingId(null);
    setNewAgenda({ name: '', specialty: '', slotDuration: 20 });
  };

  const handleDelete = (id: string) => {
    setAgendas((prev) => prev.filter((a) => a.id !== id));
    toast({ title: 'Agenda supprime' });
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('created');
  const [editingId, setEditingId] = useState<string | null>(null);

  const openEditDialog = (agenda: AgendaConfig) => {
    setEditingId(agenda.id);
    setSelectedType(agenda.type);
    setNewAgenda({ name: agenda.name, specialty: agenda.specialty || '', slotDuration: agenda.slotDuration });
    setCreateStep(2);
    setShowCreateDialog(true);
  };

  const filtered = agendas.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) && a.isActive
  );

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Agendas</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-1">Besoin d'aide ?</p>
        <button onClick={() => toast({ title: 'Aide', description: 'Contactez le support pour gerer le depart d\'un collaborateur.' })} className="text-sm text-primary hover:underline block">
          Vous ou un collaborateur quittez le cabinet, que faire ?
        </button>
        <button onClick={() => toast({ title: 'Aide', description: 'Utilisez le bouton Creer un agenda ci-dessous.' })} className="text-sm text-primary hover:underline block">
          Creer un nouvel agenda pour un nouveau praticien et/ou un nouveau lieu
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="created">Agendas crees</TabsTrigger>
          <TabsTrigger value="pending">Agendas en attente</TabsTrigger>
          <TabsTrigger value="deleted">Agendas supprimes</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-4 mb-6">
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un nouvel agenda
        </Button>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un agenda"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Agendas Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 bg-muted/30 text-sm font-medium text-muted-foreground border-b border-border">
          <span>Nom de l'agenda</span>
          <span className="w-32 text-center">Specialite</span>
          <span className="w-24 text-center">Type</span>
          <span className="w-24 text-center">Acces</span>
          <span className="w-20 text-center">Actions</span>
        </div>

        {activeTab === 'created' && filtered.map((agenda) => (
          <div
            key={agenda.id}
            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: agenda.color }}
              />
              <span className="text-sm font-medium truncate">{agenda.name}</span>
            </div>

            <span className="w-32 text-center text-xs text-muted-foreground">
              {agenda.specialty || '-'}
            </span>

            <Badge variant="outline" className="w-24 justify-center text-xs">
              {agenda.type === 'practitioner' ? 'Soignant' : agenda.type === 'room' ? 'Salle' : agenda.type === 'equipment' ? 'Machine' : 'Mobile'}
            </Badge>

            <span className="w-24 text-center text-xs text-muted-foreground">1 acces</span>

            <div className="w-20 flex items-center justify-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(agenda)} aria-label={`Modifier ${agenda.name}`}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => handleDelete(agenda.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {activeTab === 'pending' && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Aucun agenda en attente.</div>
        )}
        {activeTab === 'deleted' && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Aucun agenda supprime.</div>
        )}
      </div>

      {/* Create Agenda Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) { setCreateStep(1); setEditingId(null); } }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Modifier l\'agenda' : 'Ajouter un agenda'}</DialogTitle>
          </DialogHeader>

          {createStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm font-medium">Quel type d'agenda souhaitez-vous ajouter ?</p>
              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(agendaTypeConfig) as [AgendaConfig['type'], typeof agendaTypeConfig.practitioner][]).map(([type, config]) => (
                  <Card
                    key={type}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      selectedType === type && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedType(type)}
                  >
                    <CardContent className="p-4">
                      <config.icon className="h-8 w-8 text-primary mb-2" />
                      <p className="text-sm font-semibold">{config.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Nom de l'agenda</Label>
                <Input
                  value={newAgenda.name}
                  onChange={(e) => setNewAgenda((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Dr Dupont, Salle ECG..."
                />
              </div>
              <div>
                <Label>Specialite</Label>
                <Select value={newAgenda.specialty} onValueChange={(v) => setNewAgenda((p) => ({ ...p, specialty: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selectionner une specialite" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Medecine Generale">Medecine Generale</SelectItem>
                    <SelectItem value="Cardiologie">Cardiologie</SelectItem>
                    <SelectItem value="Dermatologie">Dermatologie</SelectItem>
                    <SelectItem value="Pediatrie">Pediatrie</SelectItem>
                    <SelectItem value="Gynecologie">Gynecologie</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duree de creneau par defaut (minutes)</Label>
                <Select value={String(newAgenda.slotDuration)} onValueChange={(v) => setNewAgenda((p) => ({ ...p, slotDuration: Number(v) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="20">20 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="45">45 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            {createStep > 1 && (
              <Button variant="outline" onClick={() => setCreateStep((s) => s - 1 as 1)}>
                Retour
              </Button>
            )}
            {createStep === 1 ? (
              <Button onClick={() => setCreateStep(2)}>Suivant</Button>
            ) : (
              <Button onClick={handleSave} disabled={!newAgenda.name}>
                {editingId ? 'Enregistrer' : 'Creer l\'agenda'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendasSettings;
