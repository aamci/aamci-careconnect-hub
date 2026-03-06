import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  User,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Patient } from '@/types';

export type TaskCategory = 'rendez-vous' | 'patient-contact' | 'document' | 'facturation' | 'resultats' | 'autre';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
  assignee: string;
  patientName: string;
  patientId: string;
  isPersonal: boolean;
  unlinkPatient: boolean;
}

export const categoryConfig: Record<TaskCategory, { label: string; color: string }> = {
  'rendez-vous': { label: 'Rendez-vous', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  'patient-contact': { label: 'Patient a contacter', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'document': { label: 'Document', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  'facturation': { label: 'Facturation', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  'resultats': { label: 'Resultats', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  'autre': { label: 'Autre', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export const assignees = ['Dr Dupont', 'Secretariat', 'Infirmiere', 'Dr Laurent'];

export const emptyTaskForm: TaskFormData = {
  title: '',
  description: '',
  priority: 'medium',
  category: 'autre',
  dueDate: '',
  assignee: 'Dr Dupont',
  patientName: '',
  patientId: '',
  isPersonal: false,
  unlinkPatient: false,
};

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TaskFormData) => void;
  patients: Patient[];
  preselectedPatient?: { id: string; name: string } | null;
  editingTask?: TaskFormData | null;
  dialogTitle?: string;
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSave,
  patients,
  preselectedPatient = null,
  editingTask = null,
  dialogTitle,
}: TaskFormDialogProps) {
  const [form, setForm] = useState<TaskFormData>(emptyTaskForm);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const patientSearchRef = useRef<HTMLDivElement>(null);

  const isFromDossier = !!preselectedPatient;

  // Initialize form when dialog opens
  useEffect(() => {
    if (!open) return;

    if (editingTask) {
      setForm(editingTask);
      setPatientSearch(editingTask.patientName);
    } else if (preselectedPatient) {
      setForm({
        ...emptyTaskForm,
        patientName: preselectedPatient.name,
        patientId: preselectedPatient.id,
      });
      setPatientSearch(preselectedPatient.name);
    } else {
      setForm(emptyTaskForm);
      setPatientSearch('');
    }
  }, [open, editingTask, preselectedPatient]);

  // Close patient dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (patientSearchRef.current && !patientSearchRef.current.contains(e.target as Node)) {
        setShowPatientDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return patients.slice(0, 8);
    const q = patientSearch.toLowerCase();
    return patients.filter((p) => {
      const fullName = `${p.lastName} ${p.firstName}`.toLowerCase();
      return fullName.includes(q) || p.phone?.includes(q);
    }).slice(0, 8);
  }, [patientSearch, patients]);

  const handleSubmit = () => {
    if (!form.title) return;
    const isPatientRequired = !form.isPersonal && !isFromDossier;
    const hasPatientFromDossier = isFromDossier && !(form.isPersonal && form.unlinkPatient);
    if (isPatientRequired && !form.patientName) return;

    const finalData: TaskFormData = {
      ...form,
      patientName: form.isPersonal && form.unlinkPatient ? '' : form.patientName,
      patientId: form.isPersonal && form.unlinkPatient ? '' : form.patientId,
    };

    onSave(finalData);
    setForm(emptyTaskForm);
    setPatientSearch('');
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    setForm(emptyTaskForm);
    setPatientSearch('');
  };

  const isSubmitDisabled = !form.title || (!form.isPersonal && !isFromDossier && !form.patientName);

  const title = dialogTitle || (editingTask ? 'Modifier la tache' : 'Nouvelle tache');

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) handleClose(); else onOpenChange(val); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2 max-h-[65vh] overflow-y-auto pr-1">
          {/* Patient section */}
          <div className="space-y-3">
            {isFromDossier ? (
              /* From patient dossier: patient pre-filled, option to unlink */
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1.5">
                    Patient
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[220px] text-xs">
                          La tache sera associee a ce patient dans le suivi medical
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <div className={cn(
                    "flex items-center gap-2 mt-1.5 px-3 py-2.5 rounded-md border transition-all",
                    form.isPersonal && form.unlinkPatient
                      ? "border-dashed border-muted-foreground/30 bg-muted/10"
                      : "border-border bg-muted/30"
                  )}>
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className={cn(
                      "text-sm font-medium",
                      form.isPersonal && form.unlinkPatient && "line-through text-muted-foreground/50"
                    )}>
                      {preselectedPatient?.name}
                    </span>
                    {form.isPersonal && form.unlinkPatient && (
                      <span className="text-[10px] text-muted-foreground ml-auto">Non associe</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6 px-4 py-2.5 rounded-lg border border-border bg-muted/20">
                  <Checkbox
                    id="task-personal"
                    checked={form.isPersonal}
                    onCheckedChange={(checked) => {
                      const isPersonal = checked === true;
                      setForm((p) => ({
                        ...p,
                        isPersonal,
                        unlinkPatient: isPersonal ? p.unlinkPatient : false,
                      }));
                    }}
                  />
                  <label htmlFor="task-personal" className="text-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5">
                    Tache personnelle
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-xs">
                          Une tache personnelle n'est visible que par vous. Elle n'apparait pas dans le tableau de bord de l'equipe.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                </div>
              </div>
            ) : (
              /* From tasks page: personal toggle + patient search */
              <>
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-muted/20">
                  <Checkbox
                    id="task-personal"
                    checked={form.isPersonal}
                    onCheckedChange={(checked) => {
                      const isPersonal = checked === true;
                      setForm((p) => ({
                        ...p,
                        isPersonal,
                        patientName: isPersonal ? '' : p.patientName,
                        patientId: isPersonal ? '' : p.patientId,
                        unlinkPatient: false,
                      }));
                      if (isPersonal) setPatientSearch('');
                    }}
                  />
                  <label htmlFor="task-personal" className="text-sm cursor-pointer whitespace-nowrap flex items-center gap-1.5">
                    Tache personnelle (sans patient)
                    <TooltipProvider delayDuration={200}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[240px] text-xs">
                          Une tache personnelle n'est visible que par vous. Elle n'apparait pas dans le tableau de bord de l'equipe.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </label>
                </div>

                {!form.isPersonal && (
                  <div ref={patientSearchRef} className="relative">
                    <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1.5">
                      Patient <span className="text-destructive">*</span>
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[220px] text-xs">
                            La tache sera associee a ce patient dans le suivi medical
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={patientSearch}
                        onChange={(e) => {
                          setPatientSearch(e.target.value);
                          setShowPatientDropdown(true);
                          setForm((p) => ({ ...p, patientName: '', patientId: '' }));
                        }}
                        onFocus={() => setShowPatientDropdown(true)}
                        placeholder="Rechercher un patient..."
                        className="pl-9"
                      />
                      {form.patientName && (
                        <button
                          type="button"
                          onClick={() => {
                            setPatientSearch('');
                            setForm((p) => ({ ...p, patientName: '', patientId: '' }));
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    {showPatientDropdown && !form.patientName && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredPatients.length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-muted-foreground">Aucun patient trouve</div>
                        ) : (
                          filteredPatients.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                const name = `${p.lastName} ${p.firstName}`;
                                setForm((prev) => ({ ...prev, patientName: name, patientId: p.id }));
                                setPatientSearch(name);
                                setShowPatientDropdown(false);
                              }}
                            >
                              <User className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">{p.lastName}</span>
                              <span>{p.firstName}</span>
                              {p.phone && <span className="ml-auto text-xs text-muted-foreground">{p.phone}</span>}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Unlink patient option - only when personal is checked AND from dossier */}
            {form.isPersonal && isFromDossier && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 animate-in fade-in-50 slide-in-from-top-1 duration-200">
                <Checkbox
                  id="task-unlink-patient"
                  checked={form.unlinkPatient}
                  onCheckedChange={(checked) => setForm((p) => ({ ...p, unlinkPatient: checked === true }))}
                />
                <label htmlFor="task-unlink-patient" className="text-sm cursor-pointer flex-1">
                  Ne pas associer cette tache au patient
                </label>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-amber-500 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[260px] text-xs">
                      En activant cette option, la tache ne sera pas liee au dossier du patient. Utile pour des rappels personnels sans rapport direct avec ce patient (ex: commande de materiel, formation...).
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>

          {/* Task description */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Description de la tache <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Decrire la tache a effectuer..."
              rows={3}
              className="mt-1.5 text-sm"
            />
          </div>

          {/* Priority levels - visual buttons */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold flex items-center gap-1.5">
              Priorite
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[240px] text-xs">
                    Urgent : necessite une action immediate. Haute : a traiter dans la journee. Moyenne : sous 48h. Basse : pas de delai strict.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="grid grid-cols-4 gap-2.5 mt-1.5">
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, priority: 'low' }))}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                  form.priority === 'low'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200'
                    : 'border-border text-muted-foreground hover:border-emerald-300 hover:bg-emerald-50/50'
                )}
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                Basse
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, priority: 'medium' }))}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                  form.priority === 'medium'
                    ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200'
                    : 'border-border text-muted-foreground hover:border-amber-300 hover:bg-amber-50/50'
                )}
              >
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                Moyenne
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, priority: 'high' }))}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                  form.priority === 'high'
                    ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                    : 'border-border text-muted-foreground hover:border-red-300 hover:bg-red-50/50'
                )}
              >
                <div className="w-3 h-3 rounded-full bg-red-500" />
                Haute
              </button>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, priority: 'urgent' }))}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-all text-sm font-medium',
                  form.priority === 'urgent'
                    ? 'border-rose-600 bg-rose-50 text-rose-700 ring-2 ring-rose-300 shadow-sm shadow-rose-100'
                    : 'border-border text-muted-foreground hover:border-rose-400 hover:bg-rose-50/50'
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Urgent
              </button>
            </div>
          </div>

          {/* Category chips */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Categorie</Label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {(Object.keys(categoryConfig) as TaskCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, category: cat }))}
                  className={cn(
                    'text-xs font-medium px-3 py-1.5 rounded-full border transition-all',
                    form.category === cat
                      ? categoryConfig[cat].color + ' ring-2 ring-offset-1 ring-primary/30'
                      : 'border-border text-muted-foreground hover:border-border/80'
                  )}
                >
                  {categoryConfig[cat].label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date + Assignee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Echeance</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Assigne a</Label>
              <Select value={form.assignee} onValueChange={(v) => setForm((p) => ({ ...p, assignee: v }))}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Notes supplementaires</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Details, instructions, contexte... (optionnel)"
              rows={2}
              className="mt-1.5 text-sm"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 border-t mt-2">
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            {editingTask ? 'Enregistrer' : 'Creer la tache'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
