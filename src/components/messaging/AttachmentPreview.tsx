/**
 * AttachmentPreview - Renders file attachment previews inside chat messages
 * Supports images (with thumbnail), PDFs, documents, audio, and generic files
 */

import React from 'react';
import {
  FileText,
  Image,
  Film,
  Music,
  Archive,
  File,
  Download,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageAttachment } from '@/types/messaging';
import { downloadFileFromStorage } from '@/lib/fileUtils';

interface AttachmentPreviewProps {
  attachment: MessageAttachment;
  isMine?: boolean;
  compact?: boolean;
}

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

const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachment,
  isMine = false,
  compact = false,
}) => {
  const fileUrl = attachment.storageUrl || attachment.url;
  const Icon = getFileIcon(attachment.type);
  const isImage = attachment.type.startsWith('image/');

  const handleDownload = async () => {
    if (!fileUrl) return;
    try {
      await downloadFileFromStorage(fileUrl, attachment.name);
    } catch {
      // Fallback: open in new tab
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Image attachment with thumbnail
  if (isImage && (attachment.thumbnailUrl || fileUrl)) {
    return (
      <div
        className={cn(
          'rounded-lg overflow-hidden cursor-pointer group/att',
          compact ? 'max-w-[200px]' : 'max-w-[300px]'
        )}
        onClick={handleDownload}
      >
        <img
          src={attachment.thumbnailUrl || fileUrl}
          alt={attachment.name}
          className="w-full h-auto rounded-lg"
          loading="lazy"
        />
        <div className="flex items-center gap-1 mt-1">
          <span className={cn('text-xs truncate', isMine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
            {attachment.name}
          </span>
          <Download className={cn(
            'h-3 w-3 opacity-0 group-hover/att:opacity-100 transition-opacity flex-shrink-0',
            isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )} />
        </div>
      </div>
    );
  }

  // Generic file attachment
  return (
    <div
      className={cn(
        'flex items-center gap-2 p-2 rounded-lg cursor-pointer',
        isMine ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20' : 'bg-foreground/5 hover:bg-foreground/10',
        'transition-colors'
      )}
      onClick={handleDownload}
    >
      <div className={cn(
        'h-8 w-8 rounded flex items-center justify-center flex-shrink-0',
        isMine ? 'bg-primary-foreground/20' : 'bg-primary/10'
      )}>
        <Icon className={cn('h-4 w-4', isMine ? 'text-primary-foreground' : 'text-primary')} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn('text-xs font-medium truncate', isMine ? 'text-primary-foreground' : 'text-foreground')}>
          {attachment.name}
        </p>
        <p className={cn('text-xs', isMine ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
          {formatFileSize(attachment.size)}
        </p>
      </div>

      <Download className={cn('h-3.5 w-3.5 flex-shrink-0', isMine ? 'text-primary-foreground/60' : 'text-muted-foreground')} />
    </div>
  );
};

export default AttachmentPreview;
