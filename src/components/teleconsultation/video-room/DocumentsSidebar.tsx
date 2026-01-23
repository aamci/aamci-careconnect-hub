/**
 * Sidebar pour le partage de documents pendant la téléconsultation
 * Permet au praticien de partager des documents et voir ceux déjà partagés
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Upload,
  Download,
  Eye,
  EyeOff,
  Image,
  FileIcon,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { useShareDocument, useMarkDocumentAsViewed } from '@/hooks/data/useTeleconsultation';
import type { TeleconsultationDocument, ParticipantType } from '@/types/teleconsultation';
import { supabase } from '@/integrations/supabase/client';

interface DocumentsSidebarProps {
  teleconsultationId: string;
  documents: TeleconsultationDocument[];
  participantType: ParticipantType;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentsSidebar({
  teleconsultationId,
  documents,
  participantType,
  isOpen,
  onClose,
}: DocumentsSidebarProps) {
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const shareDocumentMutation = useShareDocument();
  const markAsViewedMutation = useMarkDocumentAsViewed();

  const isPractitioner = participantType === 'practitioner';

  // Upload de documents
  const handleFilesSelected = async (files: File[]) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast.error('Vous devez être connecté');
      return;
    }

    for (const file of files) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        continue;
      }

      // Ajouter au set des uploads en cours
      setUploadingFiles((prev) => new Set(prev).add(file.name));

      try {
        // Upload vers Supabase Storage
        const fileName = `${teleconsultationId}/${Date.now()}-${file.name}`;
        const filePath = `teleconsultations/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        // Créer d'abord un document dans la table documents
        const { data: documentData, error: docError } = await supabase
          .from('documents')
          .insert({
            title: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
            url: urlData.publicUrl,
            patient_id: null, // À remplir si nécessaire
            category: 'teleconsultation',
            uploaded_by: userData.user.id,
          })
          .select('id')
          .single();

        if (docError) throw docError;

        // Créer l'enregistrement de partage
        await shareDocumentMutation.mutateAsync({
          teleconsultation_id: teleconsultationId,
          document_id: documentData.id,
          shared_by: participantType,
          shared_by_id: userData.user.id,
          share_type: 'during_consultation',
        });

        toast.success(`${file.name} partagé avec succès`);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error(`Erreur lors du partage de ${file.name}`);
      } finally {
        // Retirer du set des uploads en cours
        setUploadingFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
      }
    }
  };

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFilesSelected,
    disabled: !isPractitioner,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  });

  // Télécharger un document
  const handleDownload = (doc: TeleconsultationDocument) => {
    if (doc.document?.url) {
      window.open(doc.document.url, '_blank');
    }
  };

  // Marquer comme vu
  const handleMarkAsViewed = async (doc: TeleconsultationDocument) => {
    if (doc.viewed_by_patient && doc.viewed_by_practitioner) return; // Déjà vu par tous

    try {
      await markAsViewedMutation.mutateAsync({
        documentShareId: doc.id,
        viewedBy: participantType,
      });
    } catch (error) {
      console.error('Error marking document as viewed:', error);
    }
  };

  // Icône selon le type de document
  const getDocumentIcon = (doc: TeleconsultationDocument) => {
    const type = doc.document?.file_type || '';
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return FileText;
    return FileIcon;
  };

  // Statut de vue
  const getViewStatus = (doc: TeleconsultationDocument) => {
    if (doc.viewed_by_patient && doc.viewed_by_practitioner) {
      return { icon: CheckCircle2, text: 'Vu par tous', color: 'text-success' };
    }
    if (isPractitioner && doc.viewed_by_patient) {
      return { icon: CheckCircle2, text: 'Vu par le patient', color: 'text-success' };
    }
    if (!isPractitioner && doc.viewed_by_practitioner) {
      return { icon: CheckCircle2, text: 'Vu par le praticien', color: 'text-success' };
    }
    return { icon: AlertCircle, text: 'Non vu', color: 'text-warning' };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Documents partagés</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Upload Zone (Praticien seulement) */}
          {isPractitioner && (
            <div className="p-4 border-b border-border">
              <div
                {...getRootProps()}
                className={cn(
                  'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                  isDragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary hover:bg-muted/50'
                )}
              >
                <input {...getInputProps()} />
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">
                  {isDragActive ? 'Déposez les fichiers ici' : 'Glissez des fichiers ici'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, Images, Word, Excel (max 10MB)
                </p>
              </div>

              {/* Fichiers en cours d'upload */}
              {uploadingFiles.size > 0 && (
                <div className="mt-3 space-y-2">
                  {Array.from(uploadingFiles).map((fileName) => (
                    <div
                      key={fileName}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="truncate">{fileName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Liste des documents */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Aucun document partagé
                  </p>
                </div>
              ) : (
                documents.map((doc) => {
                  if (!doc.document) return null; // Skip if document data not loaded

                  const Icon = getDocumentIcon(doc);
                  const viewStatus = getViewStatus(doc);
                  const isViewedByMe =
                    (isPractitioner && doc.viewed_by_practitioner) ||
                    (!isPractitioner && doc.viewed_by_patient);

                  return (
                    <Card
                      key={doc.id}
                      className={cn(
                        'p-3 hover:shadow-md transition-shadow cursor-pointer',
                        !isViewedByMe && 'border-primary/50'
                      )}
                      onClick={() => {
                        if (!isViewedByMe) {
                          handleMarkAsViewed(doc);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {doc.document.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {(doc.document.file_size / 1024).toFixed(0)} KB
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(doc.shared_at), 'HH:mm', { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <viewStatus.icon className={cn('w-3 h-3', viewStatus.color)} />
                            <span className={cn('text-xs', viewStatus.color)}>
                              {viewStatus.text}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(doc);
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
