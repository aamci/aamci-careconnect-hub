import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Loader2, Plus, Trash2 } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const labResultItemSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  value: z.string().min(1, 'Valeur requise'),
  unit: z.string().min(1, 'Unité requise'),
  reference_range: z.string().optional(),
  is_abnormal: z.boolean().default(false),
});

const labResultFormSchema = z.object({
  test_date: z.date({ required_error: 'Date requise' }),
  lab_name: z.string().optional(),
  category: z.string().optional(),
  interpretation: z.string().optional(),
  notes: z.string().optional(),
  results: z.array(labResultItemSchema).min(1, 'Au moins un résultat requis'),
});

type LabResultFormData = z.infer<typeof labResultFormSchema>;

interface AddLabResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    test_date: string;
    lab_name?: string | null;
    category?: string | null;
    interpretation?: string | null;
    notes?: string | null;
    results: Array<{
      name: string;
      value: string;
      unit: string;
      reference_range?: string;
      is_abnormal: boolean;
    }>;
    is_abnormal: boolean;
  }) => void;
  isLoading?: boolean;
}

const LAB_CATEGORIES = [
  { value: 'hematology', label: 'Hématologie' },
  { value: 'biochemistry', label: 'Biochimie' },
  { value: 'immunology', label: 'Immunologie' },
  { value: 'microbiology', label: 'Microbiologie' },
  { value: 'endocrinology', label: 'Endocrinologie' },
  { value: 'coagulation', label: 'Coagulation' },
  { value: 'urinalysis', label: 'Analyse urinaire' },
  { value: 'other', label: 'Autre' },
];

const AddLabResultModal: React.FC<AddLabResultModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm<LabResultFormData>({
    resolver: zodResolver(labResultFormSchema),
    defaultValues: {
      test_date: new Date(),
      lab_name: '',
      category: '',
      interpretation: '',
      notes: '',
      results: [{ name: '', value: '', unit: '', reference_range: '', is_abnormal: false }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'results',
  });

  const handleSubmit = (data: LabResultFormData) => {
    const hasAbnormal = data.results.some(r => r.is_abnormal);
    onSubmit({
      test_date: data.test_date.toISOString().split('T')[0],
      lab_name: data.lab_name || null,
      category: data.category || null,
      interpretation: data.interpretation || null,
      notes: data.notes || null,
      results: data.results,
      is_abnormal: hasAbnormal,
    });
    form.reset();
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Ajouter des résultats biologiques
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="test_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date du prélèvement <span className="text-destructive">*</span></FormLabel>
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
                            {field.value
                              ? format(field.value, 'dd/MM/yyyy', { locale: fr })
                              : 'Sélectionner'}
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
                name="lab_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Laboratoire</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom du laboratoire" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {LAB_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Results array */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel className="text-sm font-medium">
                  Résultats <span className="text-destructive">*</span>
                </FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => append({ name: '', value: '', unit: '', reference_range: '', is_abnormal: false })}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Ajouter
                </Button>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start p-3 rounded-lg border bg-muted/20">
                  <div className="col-span-12 sm:col-span-3">
                    <FormField
                      control={form.control}
                      name={`results.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Paramètre" className="text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <FormField
                      control={form.control}
                      name={`results.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Valeur" className="text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <FormField
                      control={form.control}
                      name={`results.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Unité" className="text-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <FormField
                      control={form.control}
                      name={`results.${index}.reference_range`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Réf." className="text-sm" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex items-center gap-1">
                    <FormField
                      control={form.control}
                      name={`results.${index}.is_abnormal`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-1.5">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs font-normal !mt-0 hidden sm:inline">
                            Anormal
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {form.formState.errors.results?.message && (
                <p className="text-sm text-destructive">{form.formState.errors.results.message}</p>
              )}
            </div>

            <FormField
              control={form.control}
              name="interpretation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interprétation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Interprétation des résultats..."
                      className="resize-none min-h-[60px]"
                      {...field}
                    />
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
                      placeholder="Notes complémentaires..."
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

export default AddLabResultModal;
