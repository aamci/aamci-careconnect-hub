import React, { useState } from 'react';
import { Plus, Edit, Trash2, CalendarDays, Globe, MonitorSmartphone, Users, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const handleCreate = () => {
    const agenda: AgendaConfig = {
      id: `agenda-${Date.now()}`,
      name: newAgenda.name,
      type: selectedType,
      specialty: newAgenda.specialty,
      siteId: 'site-1',
      siteName: 'Centre Medical Saint-Michel',
      isOnlineBookable: false,
      slotDuration: newAgenda.slotDuration,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      isActive: true,
    };
    setAgendas((prev) => [...prev, agenda]);
    setShowCreateDialog(false);
    setCreateStep(1);
    setNewAgenda({ name: '', specialty: '', slotDuration: 20 });
    toast({ title: 'Agenda cree', description: `L'agenda "${agenda.name}" a ete cree.` });
  };

  const handleToggleOnline = (id: string) => {
    setAgendas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isOnlineBookable: !a.isOnlineBookable } : a))
    );
  };

  const handleDelete = (id: string) => {
    setAgendas((prev) => prev.filter((a) => a.id !== id));
    toast({ title: 'Agenda supprime' });
  };

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Agendas</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-1">Besoin d'aide ?</p>
        <button className="text-sm text-primary hover:underline block">
          Creer un nouvel agenda pour un nouveau praticien et/ou un nouveau lieu
        </button>
      </div>

      <div className="mb-6">
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter un agenda
        </Button>
      </div>

      <div className="space-y-3">
        {agendas.map((agenda) => (
          <div
            key={agenda.id}
            className="border border-border rounded-lg p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: agenda.color }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{agenda.name}</p>
                <p className="text-xs text-muted-foreground">
                  {agenda.siteName} - {agenda.slotDuration} min par creneau
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">En ligne</span>
                <Switch
                  checked={agenda.isOnlineBookable}
                  onCheckedChange={() => handleToggleOnline(agenda.id)}
                />
              </div>

              <Badge variant="outline" className="text-xs capitalize">
                {agendaTypeConfig[agenda.type]?.label || agenda.type}
              </Badge>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(agenda.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Agenda Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => { setShowCreateDialog(open); if (!open) setCreateStep(1); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Ajouter un agenda</DialogTitle>
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
              <Button onClick={handleCreate} disabled={!newAgenda.name}>
                Creer l'agenda
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgendasSettings;
