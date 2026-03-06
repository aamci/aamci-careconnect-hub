import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Search, UserPlus, Calendar, Clock, Video } from 'lucide-react';
import { Patient } from '@/types';
import { cn } from '@/lib/utils';

interface CreateAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  selectedHour: number | null;
  patients: Patient[];
  motifs: any[];
  preselectedPatient?: Patient | null;
  onCreateNewPatient: () => void;
  onCreateAppointment: (data: {
    patient: Patient;
    date: Date;
    hour: number;
    motif: string;
    duration: number;
    createTeleconsultation?: boolean;
  }) => void;
}

export function CreateAppointmentModal({
  open,
  onOpenChange,
  selectedDate,
  selectedHour,
  patients,
  motifs,
  preselectedPatient,
  onCreateNewPatient,
  onCreateAppointment,
}: CreateAppointmentModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedMotif, setSelectedMotif] = useState<string>('');
  const [duration, setDuration] = useState(30);
  const [createTeleconsultation, setCreateTeleconsultation] = useState(false);

  // Pre-fill patient when provided from navigation
  React.useEffect(() => {
    if (preselectedPatient && open) {
      setSelectedPatient(preselectedPatient);
      setSearchQuery(`${preselectedPatient.lastName} ${preselectedPatient.firstName}`);
    }
  }, [preselectedPatient, open]);

  // Filter patients based on search
  const filteredPatients = patients.filter((p) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const usedName = `${p.usedFirstName || p.firstName} ${p.usedLastName || p.lastName}`.toLowerCase();
    return fullName.includes(query) || usedName.includes(query);
  });

  const handleSubmit = () => {
    if (!selectedPatient || !selectedMotif || !selectedDate || selectedHour === null) return;

    onCreateAppointment({
      patient: selectedPatient,
      date: selectedDate,
      hour: selectedHour,
      motif: selectedMotif,
      duration,
      createTeleconsultation,
    });

    // Reset
    setSelectedPatient(null);
    setSelectedMotif('');
    setDuration(30);
    setCreateTeleconsultation(false);
    setSearchQuery('');
    onOpenChange(false);
  };

  const handleCreateNewAndClose = () => {
    onOpenChange(false);
    onCreateNewPatient();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Nouveau rendez-vous</DialogTitle>
          <DialogDescription>
            {selectedDate && selectedHour !== null && (
              <div className="flex items-center gap-4 mt-2 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{`${selectedHour}:00`}</span>
                </div>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Search or Create Patient */}
          <div className="space-y-2">
            <Label>Patient</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un patient (nom, prénom)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-48 rounded-md border">
              <div className="p-2 space-y-1">
                {filteredPatients.length === 0 && searchQuery && (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    Aucun patient trouvé
                  </div>
                )}
                {filteredPatients.map((patient) => (
                  <Card
                    key={patient.id}
                    className={cn(
                      'p-3 cursor-pointer transition-colors hover:bg-muted/50',
                      selectedPatient?.id === patient.id && 'bg-primary/10 border-primary'
                    )}
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {patient.usedLastName || patient.lastName}{' '}
                          {patient.usedFirstName || patient.firstName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(patient.dateOfBirth, 'dd/MM/yyyy')}
                        </p>
                      </div>
                      {selectedPatient?.id === patient.id && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleCreateNewAndClose}
            >
              <UserPlus className="h-4 w-4" />
              Créer un nouveau patient
            </Button>
          </div>

          {/* Step 2: Select Motif */}
          <div className="space-y-2">
            <Label>Motif de consultation</Label>
            <Select value={selectedMotif} onValueChange={setSelectedMotif}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un motif" />
              </SelectTrigger>
              <SelectContent>
                {motifs.map((motif) => (
                  <SelectItem key={motif.id} value={motif.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: motif.color }}
                      />
                      <span>{motif.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Step 3: Duration */}
          <div className="space-y-2">
            <Label>Durée</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 heure</SelectItem>
                <SelectItem value="90">1h30</SelectItem>
                <SelectItem value="120">2 heures</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Téléconsultation option */}
          <div className="flex items-start space-x-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
            <Checkbox
              id="teleconsultation"
              checked={createTeleconsultation}
              onCheckedChange={(checked) => setCreateTeleconsultation(checked === true)}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="teleconsultation"
                className="text-sm font-medium text-blue-900 cursor-pointer flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Créer une téléconsultation vidéo
              </label>
              <p className="text-xs text-blue-700">
                Les liens de visioconférence seront générés automatiquement pour vous et le patient
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end mt-4 flex-shrink-0 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedPatient || !selectedMotif}
          >
            Créer le rendez-vous
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
