import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const vitalSignsFormSchema = z.object({
  weight_kg: z.coerce.number().min(0.1).max(500).optional().or(z.literal('')),
  height_cm: z.coerce.number().min(20).max(300).optional().or(z.literal('')),
  systolic_bp: z.coerce.number().min(40).max(300).optional().or(z.literal('')),
  diastolic_bp: z.coerce.number().min(20).max(200).optional().or(z.literal('')),
  heart_rate: z.coerce.number().min(20).max(300).optional().or(z.literal('')),
  temperature_c: z.coerce.number().min(30).max(45).optional().or(z.literal('')),
  respiratory_rate: z.coerce.number().min(5).max(80).optional().or(z.literal('')),
  oxygen_saturation: z.coerce.number().min(50).max(100).optional().or(z.literal('')),
  blood_glucose: z.coerce.number().min(0.1).max(50).optional().or(z.literal('')),
  notes: z.string().optional(),
});

type VitalSignsFormData = z.infer<typeof vitalSignsFormSchema>;

interface AddVitalSignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    weight_kg?: number | null;
    height_cm?: number | null;
    systolic_bp?: number | null;
    diastolic_bp?: number | null;
    heart_rate?: number | null;
    temperature_c?: number | null;
    respiratory_rate?: number | null;
    oxygen_saturation?: number | null;
    blood_glucose?: number | null;
    notes?: string | null;
  }) => void;
  isLoading?: boolean;
}

const AddVitalSignsModal: React.FC<AddVitalSignsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<VitalSignsFormData>({
    resolver: zodResolver(vitalSignsFormSchema),
    defaultValues: {
      weight_kg: '',
      height_cm: '',
      systolic_bp: '',
      diastolic_bp: '',
      heart_rate: '',
      temperature_c: '',
      respiratory_rate: '',
      oxygen_saturation: '',
      blood_glucose: '',
      notes: '',
    },
  });

  const handleSubmit = (data: VitalSignsFormData) => {
    const toNum = (v: unknown): number | null => {
      if (v === '' || v === undefined || v === null) return null;
      const n = Number(v);
      return isNaN(n) ? null : n;
    };

    onSubmit({
      weight_kg: toNum(data.weight_kg),
      height_cm: toNum(data.height_cm),
      systolic_bp: toNum(data.systolic_bp),
      diastolic_bp: toNum(data.diastolic_bp),
      heart_rate: toNum(data.heart_rate),
      temperature_c: toNum(data.temperature_c),
      respiratory_rate: toNum(data.respiratory_rate),
      oxygen_saturation: toNum(data.oxygen_saturation),
      blood_glucose: toNum(data.blood_glucose),
      notes: data.notes || null,
    });
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Ajouter des constantes vitales
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {/* Morphologie */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Morphologie</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weight_kg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poids (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="72.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="height_cm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taille (cm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="175" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Tension arterielle */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Tension artérielle</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="systolic_bp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systolique (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="diastolic_bp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diastolique (mmHg)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="80" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Signes vitaux */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Signes vitaux</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="heart_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fréquence cardiaque (bpm)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="72" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="temperature_c"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Température (°C)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="36.8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="respiratory_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fréq. respiratoire (/min)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="16" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="oxygen_saturation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SpO2 (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="98" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Glycemie */}
            <FormField
              control={form.control}
              name="blood_glucose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Glycémie (g/L)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="1.05" className="max-w-[200px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observations complémentaires..."
                      className="resize-none min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Enregistrer'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddVitalSignsModal;
