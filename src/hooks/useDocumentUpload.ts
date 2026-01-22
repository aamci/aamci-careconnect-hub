/**
 * Hook pour gérer l'upload de documents
 * Gère les états, validation, progress et erreurs
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Document,
  DocumentUploadMetadata,
  UploadState,
  DocumentUploadProgress
} from '@/types/document';
import {
  validateFileSize,
  validateFileType
} from '@/constants/documentCategories';

interface UseDocumentUploadOptions {
  onSuccess?: (document: Document) => void;
  onError?: (error: string) => void;
  consultationId?: string;
}

export function useDocumentUpload(options: UseDocumentUploadOptions = {}) {
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress>({
    state: 'idle',
    progress: 0
  });

  const upload = useCallback(
    async (file: File, metadata: DocumentUploadMetadata) => {
      // Validation fichier
      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        setUploadProgress({
          state: 'error',
          progress: 0,
          error: sizeValidation.error
        });
        toast({
          variant: 'destructive',
          title: 'Erreur de validation',
          description: sizeValidation.error
        });
        options.onError?.(sizeValidation.error!);
        return;
      }

      const typeValidation = validateFileType(file);
      if (!typeValidation.valid) {
        setUploadProgress({
          state: 'error',
          progress: 0,
          error: typeValidation.error
        });
        toast({
          variant: 'destructive',
          title: 'Erreur de validation',
          description: typeValidation.error
        });
        options.onError?.(typeValidation.error!);
        return;
      }

      // Début upload
      setUploadProgress({
        state: 'uploading',
        progress: 0
      });

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patientId', metadata.patientId);
        formData.append('category', metadata.category);
        formData.append('subcategory', metadata.subcategory);
        formData.append('documentDate', metadata.documentDate.toISOString());

        if (metadata.description) {
          formData.append('description', metadata.description);
        }

        if (metadata.shouldSign) {
          formData.append('shouldSign', 'true');
        }

        if (options.consultationId) {
          formData.append('consultationId', options.consultationId);
        }

        // Simulation de progression (à remplacer par vraie API)
        setUploadProgress({
          state: 'uploading',
          progress: 30
        });

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Erreur lors de l\'upload');
        }

        setUploadProgress({
          state: 'processing',
          progress: 70
        });

        const document: Document = await response.json();

        setUploadProgress({
          state: 'success',
          progress: 100,
          document
        });

        toast({
          title: 'Document ajouté',
          description: 'Le document a été ajouté avec succès.'
        });

        options.onSuccess?.(document);

        // Reset après 1s
        setTimeout(() => {
          setUploadProgress({
            state: 'idle',
            progress: 0
          });
        }, 1000);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Erreur inconnue';

        setUploadProgress({
          state: 'error',
          progress: 0,
          error: errorMessage
        });

        toast({
          variant: 'destructive',
          title: 'Erreur d\'upload',
          description: errorMessage
        });

        options.onError?.(errorMessage);
      }
    },
    [toast, options]
  );

  const reset = useCallback(() => {
    setUploadProgress({
      state: 'idle',
      progress: 0
    });
  }, []);

  const retry = useCallback(() => {
    setUploadProgress(prev => ({
      ...prev,
      state: 'idle',
      error: undefined
    }));
  }, []);

  return {
    upload,
    reset,
    retry,
    uploadProgress,
    isUploading: uploadProgress.state === 'uploading' || uploadProgress.state === 'processing',
    isError: uploadProgress.state === 'error',
    isSuccess: uploadProgress.state === 'success'
  };
}
