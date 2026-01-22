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
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  FileEdit,
  MoreHorizontal,
  Lock,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  usePatientDocuments,
  useUpdateDocumentStatus,
  useDeleteDocument,
  WORKFLOW_STATUS_CONFIG,
  type PatientDocument as Document,
  type DocumentWorkflowStatus,
} from '@/hooks/data/useDocuments';
import DossierPageLayout from './shared/DossierPageLayout';
import EmptyState from './shared/EmptyState';
import { toast } from 'sonner';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { DocumentViewerModal } from '@/components/documents/DocumentViewerModal';
import { downloadFileFromStorage } from '@/lib/fileUtils';

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

// P0-010: Status icons mapping
const statusIcons: Record<DocumentWorkflowStatus, React.ElementType> = {
  draft: FileEdit,
  pending_validation: Clock,
  validated: CheckCircle,
  rejected: XCircle,
  archived: Archive,
};

const PatientDocumentsTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const { data: documents, isLoading, error } = usePatientDocuments(patient.id);
  const updateStatusMutation = useUpdateDocumentStatus();
  const deleteMutation = useDeleteDocument();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [documentToView, setDocumentToView] = useState<Document | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // Filter documents
  const filteredDocuments = documents?.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const docStatus = doc.workflow_status || 'draft';
    const matchesStatus = statusFilter === 'all' || docStatus === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  }) ?? [];

  // Status counts for filter badges
  const statusCounts = documents?.reduce((acc, doc) => {
    const status = doc.workflow_status || 'draft';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) ?? {};

  // Handle status change
  const handleStatusChange = (doc: Document, newStatus: DocumentWorkflowStatus) => {
    updateStatusMutation.mutate({
      id: doc.id,
      patientId: patient.id,
      status: newStatus,
    });
  };

  // Group by month/year
  const groupedDocuments = filteredDocuments.reduce((groups, doc) => {
    const date = new Date(doc.created_at);
    const key = format(date, 'MMMM yyyy', { locale: fr });
    if (!groups[key]) groups[key] = [];
    groups[key].push(doc);
    return groups;
  }, {} as Record<string, Document[]>);

  const handleUpload = () => {
    setUploadModalOpen(true);
  };

  const handleView = (doc: Document) => {
    setDocumentToView(doc);
    setViewerModalOpen(true);
  };

  const handleDownload = async (doc: Document) => {
    if (!doc.file_path) {
      toast.error('URL du document manquante');
      return;
    }

    setIsDownloading(doc.id);
    try {
      await downloadFileFromStorage(doc.file_path, doc.name);
      toast.success(`Téléchargement de "${doc.name}" démarré`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(
        { id: documentToDelete.id, patientId: patient.id },
        {
          onSuccess: () => {
            setDeleteDialogOpen(false);
            setDocumentToDelete(null);
          }
        }
      );
    }
  };

  const handleUploadSuccess = () => {
    // Query will be automatically invalidated by the mutation
    toast.success('Document ajouté avec succès');
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
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {Object.entries(categoryConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous statuts</SelectItem>
            {Object.entries(WORKFLOW_STATUS_CONFIG).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  {label}
                  {statusCounts[key] > 0 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                      {statusCounts[key]}
                    </Badge>
                  )}
                </span>
              </SelectItem>
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
                const catConfig = getCategoryConfig(doc.category);
                const CatIcon = catConfig.icon;
                const docStatus = (doc.workflow_status || 'draft') as DocumentWorkflowStatus;
                const statusConf = WORKFLOW_STATUS_CONFIG[docStatus];
                const StatusIcon = statusIcons[docStatus];
                const nextStatuses = statusConf.nextStatuses;

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group"
                  >
                    <div className={cn('h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0', catConfig.color)}>
                      <CatIcon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-medium text-foreground truncate">{doc.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {catConfig.label}
                        </Badge>
                        {/* P0-010: Status badge */}
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] px-1.5 py-0 h-4 gap-1', statusConf.bgColor, statusConf.color, statusConf.borderColor)}
                        >
                          <StatusIcon className="h-2.5 w-2.5" />
                          {statusConf.label}
                        </Badge>
                        {doc.is_confidential && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Lock className="h-3 w-3 text-amber-600" />
                            </TooltipTrigger>
                            <TooltipContent>Document confidentiel</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(doc.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        {doc.file_size && ` · ${(doc.file_size / 1024).toFixed(0)} Ko`}
                        {doc.validated_at && docStatus === 'validated' && (
                          <> · Validé le {format(new Date(doc.validated_at), 'dd/MM/yyyy', { locale: fr })}</>
                        )}
                      </p>
                      {doc.rejected_reason && docStatus === 'rejected' && (
                        <p className="text-xs text-red-600 mt-0.5">Motif: {doc.rejected_reason}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* View & Download always visible */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(doc)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Aperçu</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDownload(doc)}
                            disabled={isDownloading === doc.id}
                          >
                            {isDownloading === doc.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Télécharger</TooltipContent>
                      </Tooltip>

                      {/* P0-010: Status actions dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {nextStatuses.length > 0 && (
                            <>
                              {nextStatuses.map((status) => {
                                const targetConf = WORKFLOW_STATUS_CONFIG[status];
                                const TargetIcon = statusIcons[status];
                                return (
                                  <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleStatusChange(doc, status)}
                                    className="gap-2"
                                  >
                                    <TargetIcon className={cn('h-4 w-4', targetConf.color)} />
                                    Marquer comme {targetConf.label.toLowerCase()}
                                  </DropdownMenuItem>
                                );
                              })}
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(doc)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
              Le document "{documentToDelete?.name}" sera archivé (soft delete).
              Il restera récupérable par un administrateur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        patientId={patient.id}
        onSuccess={handleUploadSuccess}
      />

      {/* Viewer Modal */}
      <DocumentViewerModal
        isOpen={viewerModalOpen}
        onClose={() => {
          setViewerModalOpen(false);
          setDocumentToView(null);
        }}
        document={documentToView}
      />
    </DossierPageLayout>
  );
};

export default PatientDocumentsTab;
