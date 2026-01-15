import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Upload,
  Filter,
  Search,
  File,
  Image,
  FileSpreadsheet,
  Loader2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { usePatientDocuments, type PatientDocument as Document } from '@/hooks/data/useDocuments';
import DossierPageLayout from './shared/DossierPageLayout';
import EmptyState from './shared/EmptyState';
import { toast } from 'sonner';

interface OutletContext {
  patient: Patient;
}

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  ordonnance: { label: 'Ordonnance', icon: FileText, color: 'text-primary' },
  'compte-rendu': { label: 'Compte-rendu', icon: FileText, color: 'text-blue-600' },
  imagerie: { label: 'Imagerie', icon: Image, color: 'text-purple-600' },
  biologie: { label: 'Biologie', icon: FileSpreadsheet, color: 'text-green-600' },
  certificat: { label: 'Certificat', icon: FileText, color: 'text-orange-600' },
  courrier: { label: 'Courrier', icon: FileText, color: 'text-gray-600' },
  administratif: { label: 'Administratif', icon: File, color: 'text-muted-foreground' },
  autre: { label: 'Autre', icon: File, color: 'text-muted-foreground' },
};

const PatientDocumentsTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const { data: documents, isLoading, error } = usePatientDocuments(patient.id);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

  // Filter documents
  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) ?? [];

  // Group by month/year
  const groupedDocuments = filteredDocuments.reduce((groups, doc) => {
    const date = new Date(doc.created_at);
    const key = format(date, 'MMMM yyyy', { locale: fr });
    if (!groups[key]) groups[key] = [];
    groups[key].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);

  const handleUpload = () => {
    toast.info('Upload de document à implémenter');
  };

  const handleView = (doc: Document) => {
    toast.info(`Aperçu de "${doc.name}" à implémenter`);
  };

  const handleDownload = (doc: Document) => {
    toast.info(`Téléchargement de "${doc.name}" à implémenter`);
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      toast.success(`Document "${documentToDelete.name}" supprimé`);
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
    }
  };

  const getCategoryConfig = (category: string | null) => {
    return categoryConfig[category || 'autre'] || categoryConfig.autre;
  };

  if (error) {
    return (
      <DossierPageLayout patient={patient} title="Documents" breadcrumbLabel="Documents">
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Erreur lors du chargement des documents</p>
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
      title="Documents" 
      breadcrumbLabel="Documents"
      isLoading={isLoading}
      headerActions={
        <Button className="gap-1.5" onClick={handleUpload}>
          <Upload className="h-4 w-4" />
          Ajouter un document
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {Object.entries(categoryConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && !isLoading && (
        <EmptyState
          icon={FileText}
          title="Aucun document"
          description="Ce patient n'a pas encore de documents. Ajoutez des ordonnances, comptes-rendus, ou autres documents médicaux."
          actionLabel="Ajouter un document"
          actionIcon={Plus}
          onAction={handleUpload}
        />
      )}

      {/* Documents List */}
      {Object.entries(groupedDocuments).map(([period, docs]) => (
        <div key={period} className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize">{period}</h3>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {docs.map((doc) => {
                const config = getCategoryConfig(doc.category);
                const Icon = config.icon;
                
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className={cn('h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0', config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-foreground truncate">{doc.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(doc.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        {doc.file_size && ` · ${(doc.file_size / 1024).toFixed(0)} Ko`}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(doc)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(doc)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive" 
                        onClick={() => handleDeleteClick(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      ))}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce document ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le document "{documentToDelete?.name}" sera définitivement supprimé.
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DossierPageLayout>
  );
};

export default PatientDocumentsTab;
