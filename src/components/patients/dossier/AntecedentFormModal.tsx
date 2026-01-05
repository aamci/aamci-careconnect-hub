import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { fr } from 'date-fns/locale';

export type AntecedentCategory = 
  | 'medical' 
  | 'cardiovascular' 
  | 'surgical' 
  | 'allergies' 
  | 'family' 
  | 'lifestyle';

export type AntecedentSeverity = 'low' | 'medium' | 'high' | 'critical';

const antecedentFormSchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Le titre est requis')
    .max(200, 'Le titre doit faire moins de 200 caractères'),
  description: z.string()
    .trim()
    .max(1000, 'La description doit faire moins de 1000 caractères')
    .optional(),
  occurrence_date: z.date().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).default('low'),
  notes: z.string()
    .trim()
    .max(500, 'Les notes doivent faire moins de 500 caractères')
    .optional(),
});

export type AntecedentFormData = z.infer<typeof antecedentFormSchema>;

interface AntecedentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AntecedentFormData) => Promise<void>;
  category: AntecedentCategory;
  isLoading?: boolean;
}

const categoryLabels: Record<AntecedentCategory, string> = {
  medical: 'Antécédent médical',
  cardiovascular: 'Appareil cardiovasculaire',
  surgical: 'Antécédent chirurgical',
  allergies: 'Allergie',
  family: 'Antécédent familial',
  lifestyle: 'Mode de vie',
};

const categoryPlaceholders: Record<AntecedentCategory, { title: string; description: string }> = {
  medical: { 
    title: 'Ex: Diabète de type 2, Hypertension...',
    description: 'Précisez les détails, traitements en cours...'
  },
  cardiovascular: { 
    title: 'Ex: Insuffisance cardiaque, Arythmie...',
    description: 'Précisez le diagnostic, les examens réalisés...'
  },
  surgical: { 
    title: 'Ex: Appendicectomie, Cholécystectomie...',
    description: 'Précisez les circonstances, complications éventuelles...'
  },
  allergies: { 
    title: 'Ex: Pénicilline, Arachides, Latex...',
    description: 'Précisez les réactions, la sévérité...'
  },
  family: { 
    title: 'Ex: Cancer du sein (mère), Diabète (père)...',
    description: 'Précisez le lien de parenté et les détails...'
  },
  lifestyle: { 
    title: 'Ex: Tabagisme, Alcool, Activité physique...',
    description: 'Précisez la fréquence, quantité...'
  },
};

const severityLabels: Record<AntecedentSeverity, string> = {
  low: 'Faible',
  medium: 'Modéré',
  high: 'Élevé',
  critical: 'Critique',
};

const AntecedentFormModal: React.FC<AntecedentFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading = false,
}) => {
  const form = useForm<AntecedentFormData>({
    resolver: zodResolver(antecedentFormSchema),
    defaultValues: {
      title: '',
      description: '',
      severity: 'low',
      notes: '',
    },
  });

  const handleSubmit = async (data: AntecedentFormData) => {
    await onSubmit(data);
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Ajouter - {categoryLabels[category]}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">
                    Titre <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={categoryPlaceholders[category].title}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={categoryPlaceholders[category].description}
                      className="resize-none min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="occurrence_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium">Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'dd/MM/yyyy', { locale: fr })
                            ) : (
                              <span>Sélectionner</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Sévérité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(severityLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Notes complémentaires</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notes internes ou observations..."
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

export default AntecedentFormModal;
