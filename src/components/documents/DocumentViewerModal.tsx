/**
 * Modal de prévisualisation de documents
 * Support: PDF, Images, avec téléchargement
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Download,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  ExternalLink,
  Lock,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadFileFromStorage } from '@/lib/fileUtils';
import { useToast } from '@/hooks/use-toast';
import type { PatientDocument } from '@/hooks/data/useDocuments';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: PatientDocument | null;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!document) return null;

  const isPDF = document.mime_type === 'application/pdf';
  const isImage = document.mime_type?.startsWith('image/');
  const isPreviewable = isPDF || isImage;

  const handleDownload = async () => {
    if (!document.file_path) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'URL du document manquante'
      });
      return;
    }

    setIsDownloading(true);
    try {
      await downloadFileFromStorage(document.file_path, document.name);
      toast({
        title: 'Téléchargement démarré',
        description: `"${document.name}" est en cours de téléchargement`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur de téléchargement',
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenInNewTab = () => {
    if (document.file_path) {
      window.open(document.file_path, '_blank');
    }
  };

  const getCategoryLabel = (): string => {
    const labels: Record<string, string> = {
      'ordonnance': 'Ordonnance',
      'compte-rendu': 'Compte-rendu',
      'imagerie': 'Imagerie',
      'biologie': 'Biologie',
      'certificat': 'Certificat',
      'courrier': 'Courrier',
      'administratif': 'Administratif',
      'autre': 'Autre'
    };
    return labels[document.category || 'autre'] || 'Autre';
  };

  const getStatusBadge = () => {
    const status = document.workflow_status || 'draft';
    const configs: Record<string, { label: string; color: string }> = {
      draft: { label: 'Brouillon', color: 'bg-slate-100 text-slate-600' },
      pending_validation: { label: 'À valider', color: 'bg-amber-100 text-amber-600' },
      validated: { label: 'Validé', color: 'bg-green-100 text-green-600' },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-600' },
      archived: { label: 'Archivé', color: 'bg-gray-100 text-gray-600' }
    };
    const config = configs[status] || configs.draft;
    return (
      <Badge variant="outline" className={cn('text-xs', config.color)}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl">{document.name}</DialogTitle>
              <DialogDescription className="mt-1">
                {getCategoryLabel()} • {format(new Date(document.created_at), 'PPP', { locale: fr })}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {document.is_confidential && (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                  <Lock className="h-3 w-3 mr-1" />
                  Confidentiel
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview Area */}
          <div className="flex-1 bg-muted/30 flex items-center justify-center overflow-hidden">
            {!isPreviewable && (
              <div className="text-center p-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-foreground mb-2">Aperçu non disponible</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Ce type de fichier ne peut pas être prévisualisé dans le navigateur
                </p>
                <Button onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Télécharger
                </Button>
              </div>
            )}

            {isImage && document.file_path && (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                {!imageLoaded && !imageError && (
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                )}
                {imageError && (
                  <div className="text-center">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
                    <p className="text-sm text-foreground">Erreur de chargement de l'image</p>
                  </div>
                )}
                <img
                  src={document.file_path}
                  alt={document.name}
                  className={cn(
                    'max-w-full max-h-full object-contain rounded-lg shadow-lg',
                    !imageLoaded && 'hidden',
                    imageError && 'hidden'
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </div>
            )}

            {isPDF && document.file_path && (
              <iframe
                src={document.file_path}
                className="w-full h-full border-0"
                title={document.name}
              />
            )}
          </div>

          {/* Sidebar Info */}
          <div className="w-80 border-l border-border flex flex-col">
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Metadata */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Informations</h3>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Type</dt>
                      <dd className="text-foreground">{document.mime_type || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Taille</dt>
                      <dd className="text-foreground">
                        {document.file_size
                          ? `${(document.file_size / 1024).toFixed(0)} Ko`
                          : 'N/A'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Catégorie</dt>
                      <dd className="text-foreground">{getCategoryLabel()}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Ajouté le</dt>
                      <dd className="text-foreground">
                        {format(new Date(document.created_at), 'PPP à HH:mm', { locale: fr })}
                      </dd>
                    </div>
                    {document.validated_at && document.workflow_status === 'validated' && (
                      <div>
                        <dt className="text-muted-foreground">Validé le</dt>
                        <dd className="text-foreground flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          {format(new Date(document.validated_at), 'PPP', { locale: fr })}
                        </dd>
                      </div>
                    )}
                    {document.rejected_reason && document.workflow_status === 'rejected' && (
                      <div>
                        <dt className="text-muted-foreground">Motif de rejet</dt>
                        <dd className="text-destructive text-xs">{document.rejected_reason}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <Separator />

                {/* Actions */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleDownload}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Télécharger
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleOpenInNewTab}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ouvrir dans un nouvel onglet
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer */}
        <Separator />
        <DialogFooter className="px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
