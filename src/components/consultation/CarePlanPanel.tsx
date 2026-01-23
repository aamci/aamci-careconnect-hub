/**
 * Panneau de plan de soins
 * Onglets : Ordonnances, Documents, Courriers, etc.
 */

import { useState, useRef } from 'react';
import { Printer, MoreVertical, Upload, FolderOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Patient, Document } from '@/types';
import { ConsultationData } from '@/hooks/useConsultation';
import {
  DocumentCard,
  DocumentClassificationDrawer,
  DocumentViewer,
  SendDocumentsModal,
  DeleteDocumentDialog,
  DocumentDuplicationGuard,
  DocumentDuplicationWarning
} from '@/components/documents';
import { canDeleteDocument } from '@/constants/permissions';
import { useToast } from '@/hooks/use-toast';

interface CarePlanPanelProps {
  consultation: ConsultationData;
  patient: Patient;
  onAddDocument: (document: Document) => void;
  onRemoveDocument: (documentId: string) => void;
  patients?: Patient[];
}

export function CarePlanPanel({
  consultation,
  patient,
  onAddDocument,
  onRemoveDocument,
  patients = []
}: CarePlanPanelProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showClassificationDrawer, setShowClassificationDrawer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [showDuplicationGuard, setShowDuplicationGuard] = useState(false);
  const [pendingDocumentType, setPendingDocumentType] = useState<Document['type'] | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowClassificationDrawer(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDocumentUploaded = (document: Document) => {
    onAddDocument(document);
    setShowClassificationDrawer(false);
    setSelectedFile(null);
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowDocumentViewer(true);
  };

  const handleDeleteDocument = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await fetch(`/api/documents/${documentToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      onRemoveDocument(documentToDelete.id);
      toast({
        title: 'Document supprimé',
        description: 'Le document a été supprimé avec succès.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer le document.'
      });
    } finally {
      setShowDeleteDialog(false);
      setDocumentToDelete(null);
    }
  };

  const handlePrint = () => {
    toast({
      title: 'Impression',
      description: `Impression de ${consultation.documents.length} document(s)`
    });
  };

  const handleSendToPatient = () => {
    setShowSendModal(true);
  };

  const handleCreateDocument = (type: Document['type']) => {
    setPendingDocumentType(type);
    setShowDuplicationGuard(true);
  };

  const handleConfirmCreateNew = () => {
    setShowDuplicationGuard(false);
    setPendingDocumentType(null);
    // TODO: Ouvrir le formulaire de création de document
    toast({
      title: 'Création de document',
      description: `Création d'un nouveau ${pendingDocumentType || 'document'}`
    });
  };

  const currentUser = {
    id: 'current-user',
    role: 'doctor' as const,
    permissions: []
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">Plan de soins</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimer ({consultation.documents.length})
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="documents" className="flex-1 flex flex-col">
        <TabsList className="px-4">
          <TabsTrigger value="pharmacie" className="text-xs">
            Ordonnance pharmaceutique
          </TabsTrigger>
          <TabsTrigger value="biologie" className="text-xs">
            Biologie
          </TabsTrigger>
          <TabsTrigger value="courrier" className="text-xs">
            Courrier
          </TabsTrigger>
          <TabsTrigger value="imagerie" className="text-xs">
            Imagerie
          </TabsTrigger>
          <TabsTrigger value="documents" className="text-xs">
            <MoreVertical className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pharmacie" className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Document duplication guard */}
          {showDuplicationGuard && pendingDocumentType === 'prescription' && (
            <DocumentDuplicationGuard
              documentType="prescription"
              consultationId={consultation.id}
              existingDocuments={consultation.documents}
              onViewExisting={handleViewDocument}
              onEditExisting={(doc) => {
                toast({ title: 'Édition à implémenter' });
                setShowDuplicationGuard(false);
              }}
              onCreateNew={handleConfirmCreateNew}
            />
          )}

          {/* Create button */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleCreateDocument('prescription')}
          >
            <Plus className="h-4 w-4" />
            Créer une ordonnance pharmaceutique
          </Button>

          {/* Liste des ordonnances existantes */}
          {consultation.documents.filter(doc => doc.type === 'prescription').length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Ordonnances existantes</h4>
              {consultation.documents
                .filter(doc => doc.type === 'prescription')
                .map(document => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onView={() => handleViewDocument(document)}
                    onEdit={() => toast({ title: 'Édition à implémenter' })}
                    onCopy={() => toast({ title: 'Copie à implémenter' })}
                    onDelete={() => handleDeleteDocument(document)}
                    canDelete={canDeleteDocument(
                      currentUser,
                      { createdBy: document.createdBy, consultationId: document.consultationId },
                      { id: consultation.id, status: consultation.status, patientId: consultation.patientId, practitionerId: consultation.practitionerId }
                    )}
                    compact
                  />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="biologie" className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Document duplication guard */}
          {showDuplicationGuard && pendingDocumentType === 'exam_request' && (
            <DocumentDuplicationGuard
              documentType="exam_request"
              consultationId={consultation.id}
              existingDocuments={consultation.documents}
              onViewExisting={handleViewDocument}
              onEditExisting={(doc) => {
                toast({ title: 'Édition à implémenter' });
                setShowDuplicationGuard(false);
              }}
              onCreateNew={handleConfirmCreateNew}
            />
          )}

          {/* Create button */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleCreateDocument('exam_request')}
          >
            <Plus className="h-4 w-4" />
            Créer une demande de biologie
          </Button>

          {/* Warning si documents existants */}
          <DocumentDuplicationWarning
            documentType="exam_request"
            count={consultation.documents.filter(doc => doc.type === 'exam_request').length}
          />
        </TabsContent>

        <TabsContent value="courrier" className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Document duplication guard */}
          {showDuplicationGuard && pendingDocumentType === 'letter' && (
            <DocumentDuplicationGuard
              documentType="letter"
              consultationId={consultation.id}
              existingDocuments={consultation.documents}
              onViewExisting={handleViewDocument}
              onEditExisting={(doc) => {
                toast({ title: 'Édition à implémenter' });
                setShowDuplicationGuard(false);
              }}
              onCreateNew={handleConfirmCreateNew}
            />
          )}

          {/* Create button */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleCreateDocument('letter')}
          >
            <Plus className="h-4 w-4" />
            Créer un courrier
          </Button>

          {/* Warning si documents existants */}
          <DocumentDuplicationWarning
            documentType="letter"
            count={consultation.documents.filter(doc => doc.type === 'letter').length}
          />
        </TabsContent>

        <TabsContent value="imagerie" className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Document duplication guard */}
          {showDuplicationGuard && pendingDocumentType === 'exam_request' && (
            <DocumentDuplicationGuard
              documentType="exam_request"
              consultationId={consultation.id}
              existingDocuments={consultation.documents}
              onViewExisting={handleViewDocument}
              onEditExisting={(doc) => {
                toast({ title: 'Édition à implémenter' });
                setShowDuplicationGuard(false);
              }}
              onCreateNew={handleConfirmCreateNew}
            />
          )}

          {/* Create button */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => handleCreateDocument('exam_request')}
          >
            <Plus className="h-4 w-4" />
            Créer une demande d'imagerie
          </Button>

          {/* Warning si documents existants */}
          <DocumentDuplicationWarning
            documentType="exam_request"
            count={consultation.documents.filter(doc => doc.type === 'exam_request').length}
          />
        </TabsContent>

        <TabsContent value="documents" className="flex-1 flex flex-col overflow-hidden">
          {/* Dropdown menu Autres */}
          <div className="p-4 border-b">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter un document
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[250px]">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Documents de l'ordinateur
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Importer des documents
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Liste des documents */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {consultation.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun document ajouté
              </p>
            ) : (
              consultation.documents.map(document => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onView={() => handleViewDocument(document)}
                  onEdit={() => toast({ title: 'Édition à implémenter' })}
                  onCopy={() => toast({ title: 'Copie à implémenter' })}
                  onDelete={() => handleDeleteDocument(document)}
                  canDelete={canDeleteDocument(
                    currentUser,
                    { createdBy: document.createdBy, consultationId: document.consultationId },
                    { id: consultation.id, status: consultation.status, patientId: consultation.patientId, practitionerId: consultation.practitionerId }
                  )}
                  compact
                />
              ))
            )}
          </div>

          {/* Section À faire */}
          <div className="p-4 border-t">
            <h4 className="text-sm font-medium mb-2">À faire</h4>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une tâche
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Input caché pour sélection fichier */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.tiff,.dcm"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drawer classification */}
      <DocumentClassificationDrawer
        open={showClassificationDrawer}
        onClose={() => {
          setShowClassificationDrawer(false);
          setSelectedFile(null);
        }}
        file={selectedFile}
        defaultPatient={patient}
        patients={patients}
        consultationId={consultation.id}
        onSuccess={handleDocumentUploaded}
      />

      {/* Viewer document */}
      <DocumentViewer
        open={showDocumentViewer}
        onClose={() => {
          setShowDocumentViewer(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
        onShare={handleSendToPatient}
        onEdit={() => toast({ title: 'Édition à implémenter' })}
        onDelete={() => selectedDocument && handleDeleteDocument(selectedDocument)}
        canDelete={
          selectedDocument
            ? canDeleteDocument(
                currentUser,
                { createdBy: selectedDocument.createdBy, consultationId: selectedDocument.consultationId },
                { id: consultation.id, status: consultation.status, patientId: consultation.patientId, practitionerId: consultation.practitionerId }
              )
            : false
        }
      />

      {/* Modal envoi patient */}
      <SendDocumentsModal
        open={showSendModal}
        onClose={() => setShowSendModal(false)}
        patient={patient}
        documents={consultation.documents}
      />

      {/* Dialog suppression */}
      <DeleteDocumentDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDocumentToDelete(null);
        }}
        document={documentToDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
