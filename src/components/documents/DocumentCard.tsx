/**
 * Carte document avec actions contextuelles
 * Utilisée dans plan de soins, historique et section documents
 */

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Copy, Edit2, Eye, Trash2, FileText, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';
import { getCategoryIcon } from '@/constants/documentCategories';
import { isPDFFile, isImageFile } from '@/constants/documentCategories';

interface DocumentCardProps {
  document: Document;
  onView?: () => void;
  onEdit?: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
  className?: string;
  compact?: boolean;
}

export function DocumentCard({
  document,
  onView,
  onEdit,
  onCopy,
  onDelete,
  canDelete = false,
  className,
  compact = false
}: DocumentCardProps) {
  const icon = getCategoryIcon(document.category);

  const getFileIcon = () => {
    const file = { type: document.mimeType, name: document.filename };
    if (isPDFFile(file as any)) {
      return <FileText className="h-4 w-4 text-red-500" />;
    }
    if (isImageFile(file as any)) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="mt-0.5">{getFileIcon()}</div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs">{icon}</span>
              <h4 className="font-medium text-sm truncate">{document.title}</h4>
            </div>

            {!compact && (
              <p className="text-xs text-muted-foreground">
                Ajouté le {format(new Date(document.createdAt), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              </p>
            )}

            {document.description && !compact && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {document.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {document.isSigned && (
                <Badge variant="success" className="text-xs">
                  Signé
                </Badge>
              )}

              {document.isEncrypted && (
                <Badge variant="secondary" className="text-xs">
                  Chiffré
                </Badge>
              )}

              {document.sharedWithPatient && (
                <Badge variant="outline" className="text-xs">
                  Partagé
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <TooltipProvider>
            {onCopy && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copier</p>
                </TooltipContent>
              </Tooltip>
            )}

            {onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onEdit}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Modifier</p>
                </TooltipContent>
              </Tooltip>
            )}

            {onView && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={onView}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Voir</p>
                </TooltipContent>
              </Tooltip>
            )}

            {canDelete && onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Supprimer</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
