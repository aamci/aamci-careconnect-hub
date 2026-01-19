/**
 * TimelineEventCard - Individual event card in the timeline
 * Displays appointments, documents, notes, etc.
 */

import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar,
  FileText,
  FilePlus,
  StickyNote,
  Pill,
  Mail,
  TestTube,
  Image,
  Bell,
  CheckSquare,
  ChevronRight,
  Eye,
  Download,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  UserX,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  TimelineEvent,
  TimelineEventType,
  EVENT_TYPE_CONFIG,
  APPOINTMENT_STATUS_CONFIG,
} from '@/types/timeline';

interface TimelineEventCardProps {
  event: TimelineEvent;
  onViewDetails?: () => void;
  onViewDocument?: (documentId: string) => void;
  onDownloadDocument?: (documentId: string) => void;
  searchHighlight?: string;
}

// Icon mapping
const eventIcons: Record<TimelineEventType, React.ElementType> = {
  appointment: Calendar,
  document_received: FileText,
  document_created: FilePlus,
  clinical_note: StickyNote,
  prescription: Pill,
  letter: Mail,
  lab_result: TestTube,
  imaging: Image,
  reminder: Bell,
  task: CheckSquare,
};

const statusIcons: Record<string, React.ElementType> = {
  scheduled: Calendar,
  waiting: Clock,
  'in-progress': Activity,
  completed: CheckCircle,
  cancelled: XCircle,
  'absent-unexcused': UserX,
  'absent-excused': AlertCircle,
};

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  onViewDetails,
  onViewDocument,
  onDownloadDocument,
  searchHighlight,
}) => {
  const config = EVENT_TYPE_CONFIG[event.event_type];
  const Icon = eventIcons[event.event_type] || FileText;

  // For appointments, get status config
  const status = event.metadata?.status as string | undefined;
  const statusConfig = status ? APPOINTMENT_STATUS_CONFIG[status] : null;
  const StatusIcon = status ? statusIcons[status] : null;

  // Get documents count
  const documentsCount = event.document_ids?.length || 0;

  // Highlight text helper
  const highlightText = (text: string) => {
    if (!searchHighlight || !text) return text;
    const regex = new RegExp(`(${searchHighlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Format date based on event type
  const eventDate = new Date(event.created_at);
  const dateDisplay = format(eventDate, 'dd MMM yyyy', { locale: fr });
  const timeDisplay = format(eventDate, 'HH:mm');

  // For appointments, use start_time from metadata
  const appointmentTime = event.metadata?.start_time
    ? format(new Date(event.metadata.start_time as string), 'HH:mm')
    : timeDisplay;

  return (
    <div className="flex gap-4 p-4 hover:bg-muted/30 transition-colors group rounded-lg">
      {/* Icon */}
      <div
        className={cn(
          'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
          config.bgColor
        )}
      >
        <Icon className={cn('h-5 w-5', config.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title row */}
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-foreground truncate">
            {highlightText(event.title)}
          </h4>
          <Badge variant="outline" className="text-xs flex-shrink-0">
            {config.label}
          </Badge>
          {/* Status badge for appointments */}
          {statusConfig && StatusIcon && (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] px-1.5 py-0 h-4 gap-1 flex-shrink-0',
                statusConfig.bgColor,
                statusConfig.color,
                statusConfig.borderColor
              )}
            >
              <StatusIcon className="h-2.5 w-2.5" />
              {statusConfig.label}
            </Badge>
          )}
        </div>

        {/* Subtitle row */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {event.subtitle && (
            <>
              <span>{highlightText(event.subtitle)}</span>
              <span>•</span>
            </>
          )}
          <span>{dateDisplay}</span>
          {event.event_type === 'appointment' && (
            <>
              <span>•</span>
              <span>{appointmentTime}</span>
            </>
          )}
          {event.metadata?.duration && (
            <>
              <span>•</span>
              <span>{event.metadata.duration} min</span>
            </>
          )}
        </div>

        {/* Description if present */}
        {event.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {highlightText(event.description)}
          </p>
        )}

        {/* Documents indicator */}
        {documentsCount > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {documentsCount} document{documentsCount > 1 ? 's' : ''} associé{documentsCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* View details */}
        {onViewDetails && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onViewDetails}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Voir les détails</TooltipContent>
          </Tooltip>
        )}

        {/* Document actions */}
        {documentsCount > 0 && event.document_ids && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onViewDocument?.(event.document_ids![0])}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aperçu</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onDownloadDocument?.(event.document_ids![0])}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Télécharger</TooltipContent>
            </Tooltip>
          </>
        )}

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewDetails}>
              Voir les détails
            </DropdownMenuItem>
            {documentsCount > 0 && (
              <DropdownMenuItem onClick={() => onViewDocument?.(event.document_ids![0])}>
                Voir le document
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default TimelineEventCard;
