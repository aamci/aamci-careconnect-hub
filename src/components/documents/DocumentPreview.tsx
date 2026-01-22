/**
 * Composant d'aperçu de document
 * Affiche une miniature ou prévisualisation selon le type de fichier
 */

import { useState, useEffect } from 'react';
import { FileText, Image as ImageIcon, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isPDFFile, isImageFile } from '@/constants/documentCategories';

interface DocumentPreviewProps {
  file: File;
  maxHeight?: number;
  className?: string;
}

export function DocumentPreview({
  file,
  maxHeight = 200,
  className
}: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (isImageFile(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (isPDFFile(file)) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Octets';

    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <File className="h-12 w-12 mb-2 opacity-50" />
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (isImageFile(file) && previewUrl) {
      return (
        <img
          src={previewUrl}
          alt={file.name}
          className="max-w-full h-auto object-contain rounded"
          style={{ maxHeight: `${maxHeight}px` }}
          onError={() => setError('Impossible de charger l\'aperçu de l\'image')}
        />
      );
    }

    if (isPDFFile(file)) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
          <FileText className="h-16 w-16 mb-3 text-red-500" />
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs mt-1">{formatFileSize(file.size)}</p>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <File className="h-16 w-16 mb-3 opacity-50" />
        <p className="text-sm font-medium">{file.name}</p>
        <p className="text-xs mt-1">{formatFileSize(file.size)}</p>
      </div>
    );
  };

  return (
    <div
      className={cn(
        'w-full border rounded-lg bg-muted/30 overflow-hidden flex items-center justify-center',
        className
      )}
      style={{ minHeight: '120px', maxHeight: `${maxHeight}px` }}
    >
      {renderPreview()}
    </div>
  );
}
