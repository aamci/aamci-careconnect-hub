import React, { useState } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { usePractitioners } from '@/hooks/data/usePractitioners';

interface ApplySubstituteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  practitionerId: string;
  onConfirm: (substituteId: string, endDate?: Date) => void;
}

const ApplySubstituteDialog: React.FC<ApplySubstituteDialogProps> = ({
  isOpen,
  onClose,
  date,
  practitionerId,
  onConfirm,
}) => {
  const { data: practitioners = [] } = usePractitioners();
  const [substituteId, setSubstituteId] = useState<string>('');
  const [durationType, setDurationType] = useState<'single' | 'range'>('single');
  const [endDate, setEndDate] = useState<Date>(addDays(date, 7));

  const availableSubstitutes = practitioners.filter(
    p => p.id !== practitionerId
  );

  const handleConfirm = () => {
    if (!substituteId) return;
    onConfirm(substituteId, durationType === 'range' ? endDate : undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Appliquer un remplaçant
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Substitute selection */}
          <div className="space-y-2">
            <Label>Choisir le remplaçant</Label>
            <Select value={substituteId} onValueChange={setSubstituteId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un praticien" />
              </SelectTrigger>
              <SelectContent>
                {availableSubstitutes.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    Dr. {p.firstName} {p.lastName}
                    {p.specialty && (
                      <span className="text-muted-foreground ml-2">({p.specialty})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Duration type */}
          <div className="space-y-3">
            <Label>Durée du remplacement</Label>
            <RadioGroup value={durationType} onValueChange={(v: any) => setDurationType(v)}>
              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="single" id="duration-single" />
                <Label htmlFor="duration-single" className="flex-1 cursor-pointer">
                  <span className="font-medium">Uniquement le {format(date, 'd MMMM', { locale: fr })}</span>
                </Label>
              </div>

              <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="range" id="duration-range" />
                <Label htmlFor="duration-range" className="flex-1 cursor-pointer">
                  <span className="font-medium">Sur une période</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date range */}
          {durationType === 'range' && (
            <div className="space-y-2 pl-8">
              <Label>Jusqu'au</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(endDate, 'EEEE d MMMM yyyy', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => d && setEndDate(d)}
                    locale={fr}
                    disabled={(d) => d < date}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-semibold"
            onClick={handleConfirm}
            disabled={!substituteId}
          >
            VALIDER
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApplySubstituteDialog;
