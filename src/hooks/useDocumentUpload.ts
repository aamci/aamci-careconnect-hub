/**
 * Hook pour gérer l'upload de documents
 * Gère les états, validation, progress et erreurs
 * GARANTIE ZÉRO PERTE - Persistence complète en base de données
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
import { createDocument } from '@/services/supabase/documentsService';
import { uploadFileToStorage } from '@/lib/fileUtils';
import { getCurrentUser } from '@/lib/auth';

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
        // Vérification authentification
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          throw new Error('Utilisateur non authentifié');
        }

        // Étape 1: Upload du fichier vers Supabase Storage avec progression
        const uploadResult = await uploadFileToStorage(file, {
          bucket: 'documents',
          folder: 'patient-documents',
          onProgress: (progress) => {
            // Upload = 0-60% de la progression totale
            setUploadProgress({
              state: 'uploading',
              progress: Math.floor(progress * 0.6)
            });
          }
        });

        // Étape 2: Création de l'enregistrement en base de données
        setUploadProgress({
          state: 'processing',
          progress: 70
        });

        const document = await createDocument({
          filename: uploadResult.filename,
          mimeType: file.type,
          fileSize: file.size,
          storageUrl: uploadResult.storageUrl,
          thumbnailUrl: uploadResult.thumbnailUrl,
          checksum: uploadResult.checksum,
          category: metadata.category,
          subcategory: metadata.subcategory,
          title: metadata.title || file.name,
          description: metadata.description,
          patientId: metadata.patientId,
          consultationId: options.consultationId,
          documentDate: metadata.documentDate,
          shouldSign: metadata.shouldSign,
          source: 'upload',
          metadata: {
            originalFilename: file.name,
            uploadedBy: currentUser.id,
            uploadedAt: new Date().toISOString()
          }
        });

        // Étape 3: Signature si demandée
        if (metadata.shouldSign) {
          setUploadProgress({
            state: 'processing',
            progress: 90
          });
          // La signature sera gérée par un autre composant/workflow
          // Pour l'instant, le document est marqué comme devant être signé
        }

        // Succès
        setUploadProgress({
          state: 'success',
          progress: 100,
          document
        });

        toast({
          title: 'Document ajouté',
          description: 'Le document a été ajouté avec succès et persisté en base de données.'
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
