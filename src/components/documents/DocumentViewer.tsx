/**
 * Composant viewer principal qui route vers le bon visualiseur
 * Gère aussi le drawer avec actions contextuelles
 */

import { X, MoreVertical, Share2, Edit, Trash2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';
import { Document } from '@/types/document';
import { isPDFFile, isImageFile } from '@/constants/documentCategories';

interface DocumentViewerProps {
  open: boolean;
  onClose: () => void;
  document: Document | null;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  relatedDocuments?: Document[];
  onSwitchDocument?: (documentId: string) => void;
}

export function DocumentViewer({
  open,
  onClose,
  document,
  onShare,
  onEdit,
  onDelete,
  canDelete = false,
  relatedDocuments = [],
  onSwitchDocument
}: DocumentViewerProps) {
  if (!document) return null;

  const file = { type: document.mimeType, name: document.filename };
  const isPDF = isPDFFile(file as any);
  const isImage = isImageFile(file as any);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = document.storageUrl;
    link.download = document.filename;
    link.click();
  };

  const handlePrint = () => {
    window.open(document.storageUrl, '_blank');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[60vw] sm:max-w-[900px] p-0 flex flex-col"
      >
        {/* Header avec actions */}
        <SheetHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
          <div className="flex-1 min-w-0">
            <SheetTitle className="truncate">{document.title}</SheetTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {document.filename}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {onShare && (
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Partager / Envoyer au patient
                  </DropdownMenuItem>
                )}

                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier métadonnées
                  </DropdownMenuItem>
                )}

                {canDelete && onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <SheetClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Layout avec navigation latérale si plusieurs documents */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation latérale (si documents liés) */}
          {relatedDocuments.length > 1 && (
            <aside className="w-[200px] border-r overflow-y-auto bg-muted/30">
              <nav className="p-2 space-y-1">
                {relatedDocuments.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => onSwitchDocument?.(doc.id)}
                    className={`w-full p-2 rounded text-left hover:bg-accent transition-colors ${
                      doc.id === document.id ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {doc.thumbnailUrl && (
                        <img
                          src={doc.thumbnailUrl}
                          alt={doc.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="text-xs flex-1 min-w-0">
                        <div className="font-medium truncate">{doc.title}</div>
                        <div className="text-muted-foreground truncate">
                          {new Date(doc.documentDate).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </aside>
          )}

          {/* Viewer principal */}
          <main className="flex-1 overflow-hidden">
            {isPDF && (
              <PDFViewer
                url={document.storageUrl}
                filename={document.filename}
                onDownload={handleDownload}
                onPrint={handlePrint}
              />
            )}

            {isImage && (
              <ImageViewer
                src={document.storageUrl}
                alt={document.title}
                filename={document.filename}
                onDownload={handleDownload}
                onPrint={handlePrint}
              />
            )}

            {!isPDF && !isImage && (
              <div className="flex items-center justify-center h-full p-8 text-center">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Aperçu non disponible pour ce type de fichier.
                  </p>
                  <Button onClick={handleDownload}>
                    Télécharger le document
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </SheetContent>
    </Sheet>
  );
}
