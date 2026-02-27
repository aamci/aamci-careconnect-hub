/**
 * ChatFileUpload - File attachment picker and upload for chat messages
 * Supports images, PDFs, documents, and other file types with preview
 */

import React, { useRef, useState } from 'react';
import {
  Paperclip,
  X,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  File,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageAttachment } from '@/types/messaging';
import { useUploadAttachment } from '@/hooks/data/useMessaging';

interface ChatFileUploadProps {
  onFilesReady: (attachments: MessageAttachment[]) => void;
  onCancel: () => void;
  maxFiles?: number;
  maxSizeMb?: number;
}

const ACCEPTED_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-7z-compressed',
  'audio/*',
  'video/*',
].join(',');

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return Image;
  if (type.startsWith('video/')) return Film;
  if (type.startsWith('audio/')) return Music;
  if (type.includes('pdf')) return FileText;
  if (type.includes('zip') || type.includes('7z') || type.includes('archive')) return Archive;
  return File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

interface PendingFile {
  file: File;
  previewUrl?: string;
  progress: number;
  uploaded: boolean;
  error?: string;
  attachment?: MessageAttachment;
}

const ChatFileUpload: React.FC<ChatFileUploadProps> = ({
  onFilesReady,
  onCancel,
  maxFiles = 5,
  maxSizeMb = 25,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadMutation = useUploadAttachment();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxBytes = maxSizeMb * 1024 * 1024;
    const valid = files
      .slice(0, maxFiles - pendingFiles.length)
      .filter((f) => f.size <= maxBytes);

    const newPending: PendingFile[] = valid.map((file) => ({
      file,
      previewUrl: file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined,
      progress: 0,
      uploaded: false,
    }));

    setPendingFiles((prev) => [...prev, ...newPending]);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => {
      const item = prev[index];
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    const results: MessageAttachment[] = [];

    for (let i = 0; i < pendingFiles.length; i++) {
      const item = pendingFiles[i];
      if (item.uploaded && item.attachment) {
        results.push(item.attachment);
        continue;
      }

      try {
        const attachment = await uploadMutation.mutateAsync({
          file: item.file,
          onProgress: (progress) => {
            setPendingFiles((prev) =>
              prev.map((f, idx) => (idx === i ? { ...f, progress } : f))
            );
          },
        });
        results.push(attachment);
        setPendingFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, uploaded: true, progress: 100, attachment } : f
          )
        );
      } catch {
        setPendingFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, error: 'Erreur upload' } : f
          )
        );
      }
    }

    setIsUploading(false);
    if (results.length > 0) {
      onFilesReady(results);
    }
  };

  const allUploaded = pendingFiles.length > 0 && pendingFiles.every((f) => f.uploaded);

  return (
    <div className="border-t border-border bg-muted/20 p-3 space-y-3">
      {/* File list */}
      {pendingFiles.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {pendingFiles.map((item, index) => {
            const Icon = getFileIcon(item.file.type);
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-background border border-border"
              >
                {/* Preview or icon */}
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-10 w-10 rounded object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                {/* File info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{item.file.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatFileSize(item.file.size)}</span>
                    {item.error && (
                      <span className="text-destructive">{item.error}</span>
                    )}
                    {isUploading && !item.uploaded && !item.error && (
                      <span>{item.progress}%</span>
                    )}
                    {item.uploaded && (
                      <span className="text-green-600">Pret</span>
                    )}
                  </div>
                  {/* Progress bar */}
                  {isUploading && !item.uploaded && !item.error && (
                    <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Remove */}
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 flex-shrink-0"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || pendingFiles.length >= maxFiles}
        >
          <Paperclip className="h-3.5 w-3.5" />
          {pendingFiles.length === 0 ? 'Choisir un fichier' : 'Ajouter'}
        </Button>

        <div className="flex-1" />

        <Button variant="ghost" size="sm" onClick={onCancel} disabled={isUploading}>
          Annuler
        </Button>

        {pendingFiles.length > 0 && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={handleUploadAll}
            disabled={isUploading || allUploaded}
          >
            {isUploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Paperclip className="h-3.5 w-3.5" />
            )}
            {allUploaded ? 'Envoyer' : 'Uploader'}
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ChatFileUpload;
