import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileEdit,
  Plus,
  Trash2,
  ChevronRight,
  Loader2,
  Clock,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { usePatientObservations, useCreateObservation, useDeleteObservation, type Observation } from '@/hooks/data/useObservations';
import DossierPageLayout from './shared/DossierPageLayout';
import EmptyState from './shared/EmptyState';

interface OutletContext {
  patient: Patient;
}

const PatientObservationsTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const { data: observations, isLoading, error } = usePatientObservations(patient.id);
  const createMutation = useCreateObservation();
  const deleteMutation = useDeleteObservation();
  
  const [newObsModalOpen, setNewObsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [obsToDelete, setObsToDelete] = useState<Observation | null>(null);

  const handleCreate = async () => {
    if (!content.trim()) return;
    
    await createMutation.mutateAsync({
      patient_id: patient.id,
      practitioner_id: null,
      consultation_id: null,
      appointment_id: null,
      author_name: null,
      author_id: null,
      is_urgent: false,
      send_to_secretariat: false,
      content: content.trim(),
    });
    
    setContent('');
    setNewObsModalOpen(false);
  };

  const handleDeleteClick = (obs: Observation) => {
    setObsToDelete(obs);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (obsToDelete) {
      await deleteMutation.mutateAsync({ id: obsToDelete.id, patientId: patient.id });
      setDeleteDialogOpen(false);
      setObsToDelete(null);
    }
  };

  if (error) {
    return (
      <DossierPageLayout patient={patient} title="Observations" breadcrumbLabel="Observations">
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Erreur lors du chargement des observations</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </DossierPageLayout>
    );
  }

  return (
    <DossierPageLayout 
      patient={patient} 
      title="Observations" 
      breadcrumbLabel="Observations"
      isLoading={isLoading}
      headerActions={
        <Button className="gap-1.5" onClick={() => setNewObsModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nouvelle observation
        </Button>
      }
    >
      {/* Empty State */}
      {(!observations || observations.length === 0) && !isLoading && (
        <EmptyState
          icon={FileEdit}
          title="Aucune observation"
          description="Ce patient n'a pas encore d'observations cliniques. Ajoutez des notes de consultation, examens ou suivis."
          actionLabel="Nouvelle observation"
          actionIcon={Plus}
          onAction={() => setNewObsModalOpen(true)}
        />
      )}

      {/* Observations List */}
      {observations && observations.length > 0 && (
        <div className="space-y-3">
          {observations.map((obs) => {
            const isExpanded = expandedId === obs.id;
            
            return (
              <Card 
                key={obs.id} 
                className={cn(
                  'transition-all cursor-pointer hover:border-primary/30',
                  isExpanded && 'border-primary/50'
                )}
                onClick={() => setExpandedId(isExpanded ? null : obs.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileEdit className="h-4 w-4 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          Observation du {format(new Date(obs.created_at), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        {obs.is_urgent && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      
                      <p className={cn(
                        'text-sm text-muted-foreground',
                        !isExpanded && 'line-clamp-2'
                      )}>
                        {obs.content}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {obs.author_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {obs.author_name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(obs.created_at), 'HH:mm', { locale: fr })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(obs);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <ChevronRight className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-90'
                      )} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Observation Modal */}
      <Dialog open={newObsModalOpen} onOpenChange={setNewObsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouvelle observation</DialogTitle>
            <DialogDescription>
              Ajoutez une note clinique ou une observation pour ce patient.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Saisissez votre observation clinique..."
              className="min-h-[200px] resize-none"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewObsModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreate} 
              disabled={!content.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette observation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette observation sera définitivement supprimée. Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DossierPageLayout>
  );
};

export default PatientObservationsTab;
