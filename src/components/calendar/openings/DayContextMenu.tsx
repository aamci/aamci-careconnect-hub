import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Eye, Video, UserPlus, UserMinus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';

interface DayContextMenuProps {
  date: Date;
  hasSubstitute?: boolean;
  substituteName?: string;
  onWriteNote: () => void;
  onViewNotes: () => void;
  onConvertToVideo: () => void;
  onApplySubstitute: () => void;
  onCancelSubstitute: () => void;
  children?: React.ReactNode;
}

const DayContextMenu: React.FC<DayContextMenuProps> = ({
  date,
  hasSubstitute = false,
  substituteName,
  onWriteNote,
  onViewNotes,
  onConvertToVideo,
  onApplySubstitute,
  onCancelSubstitute,
  children,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onWriteNote} className="gap-2">
          <FileText className="w-4 h-4" />
          Écrire une note
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={onViewNotes} className="gap-2">
          <Eye className="w-4 h-4" />
          Consulter les notes
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onConvertToVideo} className="gap-2">
          <Video className="w-4 h-4" />
          Convertir les rendez-vous en consultation vidéo
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={onApplySubstitute} className="gap-2">
          <UserPlus className="w-4 h-4" />
          Appliquer un remplaçant
        </DropdownMenuItem>

        {hasSubstitute && (
          <DropdownMenuItem onClick={onCancelSubstitute} className="gap-2">
            <UserMinus className="w-4 h-4" />
            Annuler le remplacement
            {substituteName && (
              <span className="text-muted-foreground text-xs ml-auto">
                ({substituteName})
              </span>
            )}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DayContextMenu;
