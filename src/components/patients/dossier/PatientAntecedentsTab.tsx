import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Plus, 
  Heart,
  Stethoscope,
  Scissors,
  AlertTriangle,
  Users,
  Cigarette,
  ChevronRight,
  FileText,
  Trash2,
  Loader2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { usePatientAntecedents, type Antecedent } from '@/hooks/usePatientAntecedents';
import AntecedentFormModal, { 
  type AntecedentCategory, 
  type AntecedentFormData 
} from './AntecedentFormModal';
import MemoModal from './MemoModal';
import PatientAllergyManager from '@/components/patients/PatientAllergyManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OutletContext {
  patient: Patient;
}

interface AntecedentSection {
  id: AntecedentCategory;
  title: string;
  icon: React.ElementType;
}

const sections: AntecedentSection[] = [
  { id: 'medical', title: 'Antécédents médicaux', icon: Stethoscope },
  { id: 'cardiovascular', title: 'Appareil cardiovasculaire', icon: Heart },
  { id: 'surgical', title: 'Antécédents chirurgicaux', icon: Scissors },
  // Note: allergies sont gérées par PatientAllergyManager maintenant
  { id: 'family', title: 'Antécédents familiaux', icon: Users },
  { id: 'lifestyle', title: 'Mode de vie', icon: Cigarette },
];

const severityConfig: Record<string, { label: string; className: string }> = {
  low: { label: 'Faible', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Modéré', className: 'bg-warning/20 text-warning' },
  high: { label: 'Élevé', className: 'bg-orange-100 text-orange-700' },
  critical: { label: 'Critique', className: 'bg-destructive/20 text-destructive' },
};

const PatientAntecedentsTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const {
    isLoading,
    isSaving,
    memo,
    addAntecedent,
    deleteAntecedent,
    saveMemo,
    getAntecedentsByCategory,
  } = usePatientAntecedents(patient.id);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [memoModalOpen, setMemoModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AntecedentCategory>('medical');
  const [expandedSection, setExpandedSection] = useState<AntecedentCategory | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [antecedentToDelete, setAntecedentToDelete] = useState<Antecedent | null>(null);

  const handleOpenForm = (category: AntecedentCategory) => {
    setSelectedCategory(category);
    setFormModalOpen(true);
  };

  const handleSubmitAntecedent = async (data: AntecedentFormData) => {
    const success = await addAntecedent(selectedCategory, data);
    if (success) {
      setFormModalOpen(false);
    }
  };

  const handleSaveMemo = async (content: string) => {
    const success = await saveMemo(content);
    if (success) {
      setMemoModalOpen(false);
    }
  };

  const handleDeleteClick = (antecedent: Antecedent) => {
    setAntecedentToDelete(antecedent);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (antecedentToDelete) {
      await deleteAntecedent(antecedentToDelete.id);
      setDeleteDialogOpen(false);
      setAntecedentToDelete(null);
    }
  };

  const toggleSection = (category: AntecedentCategory) => {
    setExpandedSection(prev => prev === category ? null : category);
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Antécédents et mode de vie</h2>
      </div>

      {/* Allergies Section - Dedicated Manager with real Supabase data */}
      <div className="mb-6">
        <PatientAllergyManager patientId={patient.id} />
      </div>

      {/* Main Sections List */}
      <Card className="mb-6">
        <CardContent className="p-0">
          {sections.map((section) => {
            const items = getAntecedentsByCategory(section.id);
            const isExpanded = expandedSection === section.id;
            const Icon = section.icon;

            return (
              <div key={section.id} className="border-b border-border last:border-b-0">
                {/* Section Header */}
                <div
                  className={cn(
                    'flex items-center justify-between p-4 cursor-pointer transition-colors',
                    'hover:bg-muted/30 group',
                    isExpanded && 'bg-muted/20'
                  )}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">{section.title}</h3>
                      {items.length > 0 ? (
                        <p className="text-xs text-primary font-medium mt-0.5">
                          {items.length} élément{items.length > 1 ? 's' : ''}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/70 italic mt-0.5">
                          Aucune donnée
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenForm(section.id);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Ajouter</span>
                    </Button>
                    <ChevronRight 
                      className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        isExpanded && 'rotate-90'
                      )} 
                    />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {items.length > 0 ? (
                      items.map((item) => (
                        <AntecedentItem
                          key={item.id}
                          antecedent={item}
                          onDelete={() => handleDeleteClick(item)}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center py-6 text-center">
                        <AlertCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Aucun élément enregistré
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1.5"
                          onClick={() => handleOpenForm(section.id)}
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter un élément
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Memo Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Mémo
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5"
              onClick={() => setMemoModalOpen(true)}
            >
              Ouvrir
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="p-4 rounded-lg bg-muted/30 border border-border min-h-[80px]">
            {memo && memo.content ? (
              <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-4">
                {memo.content}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Aucun mémo pour ce patient. Cliquez sur "Ouvrir" pour ajouter des notes importantes.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Modal */}
      <AntecedentFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleSubmitAntecedent}
        category={selectedCategory}
        isLoading={isSaving}
      />

      {/* Memo Modal */}
      <MemoModal
        isOpen={memoModalOpen}
        onClose={() => setMemoModalOpen(false)}
        onSave={handleSaveMemo}
        initialContent={memo?.content || ''}
        isLoading={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet antécédent ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'antécédent "{antecedentToDelete?.title}" 
              sera définitivement supprimé du dossier patient.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Antecedent Item Component
const AntecedentItem: React.FC<{
  antecedent: Antecedent;
  onDelete: () => void;
}> = ({ antecedent, onDelete }) => {
  const severity = severityConfig[antecedent.severity];

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h4 className="text-sm font-medium text-foreground">{antecedent.title}</h4>
          <Badge className={cn('text-xs', severity.className)}>
            {severity.label}
          </Badge>
        </div>
        
        {antecedent.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
            {antecedent.description}
          </p>
        )}
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {antecedent.occurrence_date && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(antecedent.occurrence_date), 'dd/MM/yyyy', { locale: fr })}
            </span>
          )}
          <span>
            Ajouté le {format(new Date(antecedent.created_at), 'dd/MM/yyyy', { locale: fr })}
          </span>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PatientAntecedentsTab;
