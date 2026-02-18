import React, { useState } from 'react';
import { Plus, MapPin, Phone, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
import { mockLocations } from '@/data/settingsMockData';
import { ConsultationLocation } from '@/types/settings';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const LieuxConsultation: React.FC = () => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<ConsultationLocation[]>(mockLocations);
  const [selectedLocation, setSelectedLocation] = useState<ConsultationLocation | null>(locations[0] || null);
  const [editForm, setEditForm] = useState<ConsultationLocation | null>(null);

  const handleSave = () => {
    if (!editForm) return;
    setLocations((prev) => prev.map((l) => (l.id === editForm.id ? editForm : l)));
    setSelectedLocation(editForm);
    setEditForm(null);
    toast({ title: 'Lieu mis a jour' });
  };

  const handleAddLocation = () => {
    const newLoc: ConsultationLocation = {
      id: `loc-${Date.now()}`,
      address: '',
      hasElevator: false,
      hasAccessibleEntrance: false,
      parking: 'none',
    };
    setLocations((prev) => [...prev, newLoc]);
    setSelectedLocation(newLoc);
    setEditForm(newLoc);
  };

  const current = editForm || selectedLocation;

  return (
    <div className="max-w-5xl">
      <h1 className="text-lg font-bold text-foreground mb-6">Lieux de consultation</h1>

      <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
        <p className="text-sm font-medium text-foreground mb-1">Besoin d'aide ?</p>
        <button className="text-sm text-primary hover:underline block">Programmer un demenagement</button>
        <button className="text-sm text-primary hover:underline block">
          Creer un nouvel agenda pour un nouveau praticien et/ou un nouveau lieu
        </button>
      </div>

      <div className="mb-6">
        <Button onClick={handleAddLocation} className="gap-2" variant="outline">
          <Plus className="h-4 w-4" />
          Ajouter un lieu
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Left: Location List */}
        <div className="w-64 flex-shrink-0 space-y-2">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => { setSelectedLocation(loc); setEditForm(null); }}
              className={cn(
                'w-full flex items-center gap-2 text-left p-3 rounded-lg text-sm transition-colors',
                selectedLocation?.id === loc.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-muted text-foreground'
              )}
            >
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{loc.address || 'Nouvelle adresse'}</span>
            </button>
          ))}
        </div>

        {/* Right: Location Details */}
        {current && (
          <div className="flex-1 border border-border rounded-lg p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Lieu</h2>
              {!editForm && (
                <Button variant="outline" size="sm" onClick={() => setEditForm({ ...current })}>
                  <Edit className="h-3.5 w-3.5 mr-1" /> Modifier
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label>Adresse</Label>
                <Input
                  value={current.address}
                  onChange={(e) => editForm && setEditForm({ ...editForm, address: e.target.value })}
                  disabled={!editForm}
                  placeholder="Adresse complete"
                />
              </div>

              <div>
                <Label>Nom de l'etablissement</Label>
                <Input
                  value={current.establishmentName || ''}
                  onChange={(e) => editForm && setEditForm({ ...editForm, establishmentName: e.target.value })}
                  disabled={!editForm}
                  placeholder="Apparait sur le profil et dans les rappels"
                />
              </div>

              <div>
                <Label>Nom court du lieu de consultation (optionnel)</Label>
                <Input
                  value={current.shortName || ''}
                  onChange={(e) => editForm && setEditForm({ ...editForm, shortName: e.target.value })}
                  disabled={!editForm}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Numero de telephone du bureau</Label>
                  <Input
                    value={current.phone || ''}
                    onChange={(e) => editForm && setEditForm({ ...editForm, phone: e.target.value })}
                    disabled={!editForm}
                  />
                </div>
                <div>
                  <Label>Fax</Label>
                  <Input
                    value={current.fax || ''}
                    onChange={(e) => editForm && setEditForm({ ...editForm, fax: e.target.value })}
                    disabled={!editForm}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Accessibilite</Label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={current.hasElevator}
                      onCheckedChange={(v) => editForm && setEditForm({ ...editForm, hasElevator: !!v })}
                      disabled={!editForm}
                    />
                    <span className="text-sm">Ascenseur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={current.hasAccessibleEntrance}
                      onCheckedChange={(v) => editForm && setEditForm({ ...editForm, hasAccessibleEntrance: !!v })}
                      disabled={!editForm}
                    />
                    <span className="text-sm">Entree accessible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Etage</Label>
                    <Input
                      value={current.floor || ''}
                      onChange={(e) => editForm && setEditForm({ ...editForm, floor: e.target.value })}
                      disabled={!editForm}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Parking</Label>
                <Select
                  value={current.parking}
                  onValueChange={(v) => editForm && setEditForm({ ...editForm, parking: v as ConsultationLocation['parking'] })}
                  disabled={!editForm}
                >
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun</SelectItem>
                    <SelectItem value="free">Gratuit</SelectItem>
                    <SelectItem value="paid">Payant</SelectItem>
                    <SelectItem value="street">Voirie</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Interphone</Label>
                  <Input
                    value={current.intercom || ''}
                    onChange={(e) => editForm && setEditForm({ ...editForm, intercom: e.target.value })}
                    disabled={!editForm}
                    placeholder="Nom"
                  />
                </div>
                <div>
                  <Label>Autres informations pratiques d'acces</Label>
                  <Input
                    value={current.accessInfo || ''}
                    onChange={(e) => editForm && setEditForm({ ...editForm, accessInfo: e.target.value })}
                    disabled={!editForm}
                    placeholder="Ex: numero du batiment ou escalier"
                  />
                </div>
              </div>
            </div>

            {editForm && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditForm(null)}>Annuler</Button>
                <Button onClick={handleSave}>Valider</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LieuxConsultation;
