import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface MemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
  initialContent: string;
  isLoading?: boolean;
}

const MemoModal: React.FC<MemoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialContent,
  isLoading = false,
}) => {
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = async () => {
    await onSave(content);
  };

  const handleClose = () => {
    setContent(initialContent);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Mémo patient
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Notez ici les informations importantes à retenir concernant ce patient.
            Ce mémo sera visible par tous les praticiens.
          </p>
          
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Saisissez vos notes importantes ici..."
            className="min-h-[200px] resize-none"
            maxLength={2000}
          />
          
          <p className="text-xs text-muted-foreground text-right">
            {content.length} / 2000 caractères
          </p>
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MemoModal;
