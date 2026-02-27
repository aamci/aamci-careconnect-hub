import React, { useState } from 'react';
import {
  X,
  Paperclip,
  AlertCircle,
  ChevronDown,
  Bold,
  Italic,
  List,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { allParticipants, currentUser } from '@/data/messagingMockData';
import { EmailPriority, MessageAttachment } from '@/types/messaging';
import { useToast } from '@/hooks/use-toast';

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  replyTo?: {
    to: string;
    subject: string;
    body: string;
  };
  forwardFrom?: {
    subject: string;
    body: string;
    attachments: MessageAttachment[];
  };
}

const ComposeDialog: React.FC<ComposeDialogProps> = ({
  open,
  onOpenChange,
  replyTo,
  forwardFrom,
}) => {
  const { toast } = useToast();
  const [showCc, setShowCc] = useState(false);
  const [to, setTo] = useState(replyTo?.to || '');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(
    replyTo ? `Re: ${replyTo.subject}` : forwardFrom ? `Fwd: ${forwardFrom.subject}` : ''
  );
  const [body, setBody] = useState(
    replyTo
      ? `\n\n---\nLe ${new Date().toLocaleDateString('fr-FR')}, ${replyTo.to} a ecrit :\n> ${replyTo.body.split('\n').join('\n> ')}`
      : forwardFrom
      ? `\n\n--- Message transfere ---\n${forwardFrom.body}`
      : ''
  );
  const [priority, setPriority] = useState<EmailPriority>('normal');
  const [readReceipt, setReadReceipt] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>(
    forwardFrom?.attachments || []
  );

  const contacts = allParticipants.filter((p) => p.id !== currentUser.id);

  const handleSend = () => {
    if (!to || !subject || !body.trim()) {
      toast({ title: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }
    toast({ title: 'Message envoye', description: `A : ${to}` });
    resetForm();
    onOpenChange(false);
  };

  const handleSaveDraft = () => {
    toast({ title: 'Brouillon enregistre' });
    resetForm();
    onOpenChange(false);
  };

  const handleAttach = () => {
    const fakeAttachment: MessageAttachment = {
      id: `att-new-${Date.now()}`,
      name: `Document_${Date.now().toString(36)}.pdf`,
      size: Math.floor(Math.random() * 500000) + 50000,
      type: 'application/pdf',
    };
    setAttachments((prev) => [...prev, fakeAttachment]);
    toast({ title: 'Piece jointe ajoutee' });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const resetForm = () => {
    setTo('');
    setCc('');
    setSubject('');
    setBody('');
    setPriority('normal');
    setReadReceipt(false);
    setAttachments([]);
    setShowCc(false);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{replyTo ? 'Repondre' : forwardFrom ? 'Transferer' : 'Nouveau message'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* To */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm">A</Label>
              {!showCc && (
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => setShowCc(true)}
                >
                  Cc
                </button>
              )}
            </div>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger>
                <SelectValue placeholder="Selectionner un destinataire" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((c) => (
                  <SelectItem key={c.id} value={c.email}>
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground text-xs">({c.email})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CC */}
          {showCc && (
            <div className="space-y-1.5">
              <Label className="text-sm">Cc</Label>
              <Input
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="Destinataires en copie"
              />
            </div>
          )}

          {/* Subject */}
          <div className="space-y-1.5">
            <Label className="text-sm">Objet</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Objet du message"
            />
          </div>

          {/* Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Priorite</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as EmailPriority)}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="normal">Normale</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={readReceipt} onCheckedChange={setReadReceipt} id="read-receipt" />
              <Label htmlFor="read-receipt" className="text-sm cursor-pointer">
                Accuse de reception
              </Label>
            </div>
          </div>

          {priority === 'high' && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs">Ce message sera marque comme prioritaire pour le destinataire.</span>
            </div>
          )}

          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 border border-border rounded-t-lg px-2 py-1.5 bg-muted/30">
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <Link2 className="h-3.5 w-3.5" />
            </Button>
            <div className="h-4 w-px bg-border mx-1" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleAttach}>
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Body */}
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Redigez votre message..."
            rows={10}
            className="rounded-t-none -mt-4 min-h-[200px] resize-y"
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Pieces jointes ({attachments.length})</Label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-1.5"
                  >
                    <Paperclip className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs font-medium truncate max-w-[150px]">{att.name}</span>
                    <span className="text-xs text-muted-foreground">({formatSize(att.size)})</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature */}
          <div className="border-t border-border pt-3">
            <p className="text-xs text-muted-foreground italic">
              Dr Martin Dupont{'\n'}
              Medecine Generale{'\n'}
              CareConnect Hub - Centre Medical{'\n'}
              Tel: 01 23 45 67 89
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="ghost" size="sm" onClick={handleSaveDraft} className="text-muted-foreground">
            Enregistrer comme brouillon
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSend} disabled={!to || !subject}>
              Envoyer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeDialog;
