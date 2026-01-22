/**
 * DocumentsTimeline - Affiche les documents du patient dans une timeline
 * Supporte le filtrage par catégorie et période
 */

import { useState } from 'react';
import { Document } from '@/types/document';
import { Patient } from '@/types';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import { SendDocumentsModal } from '@/components/documents/SendDocumentsModal';
import { DeleteDocumentDialog } from '@/components/documents/DeleteDocumentDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileText, Calendar } from 'lucide-react';
import { DOCUMENT_CATEGORIES, DocumentCategory } from '@/constants/documentCategories';

interface DocumentsTimelineProps {
  patientId: string;
  documents: Document[];
  onDocumentUpdate?: () => void;
}

export function DocumentsTimeline({
  patientId,
  documents,
  onDocumentUpdate
}: DocumentsTimelineProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');

  // Filtrer les documents par catégorie
  const filteredDocuments = categoryFilter === 'all'
    ? documents
    : documents.filter(doc => doc.category === categoryFilter);

  // Grouper par mois
  const groupedByMonth = filteredDocuments.reduce((acc, doc) => {
    const date = new Date(doc.documentDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });

    if (!acc[monthKey]) {
      acc[monthKey] = { label: monthLabel, documents: [] };
    }
    acc[monthKey].documents.push(doc);
    return acc;
  }, {} as Record<string, { label: string; documents: Document[] }>);

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setViewerOpen(true);
  };

  const handleShareDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setSendModalOpen(true);
  };

  const handleDeleteDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDocument) return;

    try {
      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setDeleteDialogOpen(false);
      setSelectedDocument(null);
      onDocumentUpdate?.();
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-base font-medium text-foreground mb-2">
          Aucun document
        </h3>
        <p className="text-sm text-muted-foreground">
          Les documents du patient apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres par catégorie */}
      <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as DocumentCategory | 'all')}>
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
          <TabsTrigger value="all">
            Tous ({documents.length})
          </TabsTrigger>
          {Object.entries(DOCUMENT_CATEGORIES).map(([key, config]) => {
            const count = documents.filter(d => d.category === config.id).length;
            if (count === 0) return null;

            return (
              <TabsTrigger key={key} value={config.id}>
                {config.label} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={categoryFilter} className="mt-6 space-y-8">
          {Object.entries(groupedByMonth)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(([monthKey, group]) => (
              <div key={monthKey}>
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{group.label}</span>
                  <span>({group.documents.length})</span>
                </div>

                <div className="space-y-3">
                  {group.documents.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      onView={() => handleViewDocument(doc)}
                      onShare={() => handleShareDocument(doc)}
                      onDelete={() => handleDeleteDocument(doc)}
                      canDelete={true}
                    />
                  ))}
                </div>
              </div>
            ))}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedDocument && (
        <>
          <DocumentViewer
            open={viewerOpen}
            onClose={() => {
              setViewerOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
            onShare={() => {
              setViewerOpen(false);
              setSendModalOpen(true);
            }}
            onDelete={() => {
              setViewerOpen(false);
              setDeleteDialogOpen(true);
            }}
            canDelete={true}
          />

          <SendDocumentsModal
            open={sendModalOpen}
            onClose={() => {
              setSendModalOpen(false);
              setSelectedDocument(null);
            }}
            patient={{ id: patientId } as Patient}
            documents={[selectedDocument]}
            onSend={async () => {
              setSendModalOpen(false);
              setSelectedDocument(null);
              onDocumentUpdate?.();
            }}
          />

          <DeleteDocumentDialog
            open={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  );
}
