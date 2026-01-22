/**
 * Modal d'envoi de documents au patient
 * Sélection multi-documents, message optionnel, traçabilité
 */

import { useState } from 'react';
import { Lock, Eye, MoreVertical, MessageCircle, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Patient, Document } from '@/types';
import { getCategoryIcon } from '@/constants/documentCategories';

interface SendDocumentsModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
  documents: Document[];
  onSend?: (documentIds: string[], message: string, allowReply: boolean) => Promise<void>;
}

const QUICK_MESSAGE_TAGS = [
  { id: 'absence', label: 'absence' },
  { id: 'biologie_ok', label: 'biologie ok' },
  { id: 'certificat', label: 'certificat' }
];

export function SendDocumentsModal({
  open,
  onClose,
  patient,
  documents,
  onSend
}: SendDocumentsModalProps) {
  const { toast } = useToast();
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>(
    documents.map(d => d.id)
  );
  const [message, setMessage] = useState('');
  const [allowReply, setAllowReply] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleToggleDocument = (documentId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleToggleAll = (checked: boolean) => {
    setSelectedDocuments(checked ? documents.map(d => d.id) : []);
  };

  const handleInsertTag = (tag: string) => {
    setMessage(prev => (prev ? `${prev} ${tag}` : tag));
  };

  const handleSend = async () => {
    if (selectedDocuments.length === 0) return;

    setIsSending(true);

    try {
      if (onSend) {
        await onSend(selectedDocuments, message.trim(), allowReply);
      } else {
        // Appel API par défaut
        const response = await fetch('/api/documents/send-to-patient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            patientId: patient.id,
            documentIds: selectedDocuments,
            message: message.trim() || null,
            allowReply
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de l\'envoi des documents');
        }
      }

      toast({
        title: 'Documents envoyés',
        description: `${selectedDocuments.length} document(s) envoyé(s) à ${patient.firstName} ${patient.lastName}`
      });

      onClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur d\'envoi',
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsSending(false);
    }
  };

  const patientHasDMP = Boolean('hasDMP' in patient && (patient as { hasDMP?: boolean }).hasDMP);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Envoyer les documents au patient</DialogTitle>
          <DialogDescription>
            Sélectionnez les documents à partager et ajoutez un message optionnel.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Informations patient */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Vérifiez les détails ci-dessous :</h4>
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {patient.firstName} {patient.lastName}
                </p>
                {patientHasDMP && (
                  <Badge variant="secondary" className="text-xs">
                    DMP
                  </Badge>
                )}
              </div>
              {patient.email && (
                <p className="text-sm text-muted-foreground mt-1">{patient.email}</p>
              )}
            </div>
          </div>

          {/* Liste documents */}
          <Accordion type="single" collapsible defaultValue="documents">
            <AccordionItem value="documents">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedDocuments.length === documents.length}
                    onCheckedChange={handleToggleAll}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>
                    {selectedDocuments.length} document(s) sélectionné(s)
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                <div className="space-y-2 mt-2">
                  {documents.map(document => (
                    <div
                      key={document.id}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedDocuments.includes(document.id)}
                        onCheckedChange={() => handleToggleDocument(document.id)}
                      />

                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm">{getCategoryIcon(document.category)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{document.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {document.isSigned && (
                              <Badge variant="success" className="text-xs">
                                Signé
                              </Badge>
                            )}
                            {document.isEncrypted && (
                              <Badge variant="secondary" className="text-xs">
                                Chiffré
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Info chiffrement */}
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Documents chiffrés
            </AlertDescription>
          </Alert>

          {/* Message optionnel */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Envoyer un message au patient{' '}
              <span className="text-muted-foreground">(optionnel)</span>
            </Label>

            <Textarea
              id="message"
              placeholder="Saisir votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              disabled={isSending}
            />

            {/* Tags rapides */}
            <div className="flex items-center gap-2 flex-wrap">
              {QUICK_MESSAGE_TAGS.map(tag => (
                <Button
                  key={tag.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleInsertTag(tag.label)}
                  disabled={isSending}
                >
                  {tag.label}
                </Button>
              ))}
            </div>

            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto"
              disabled={isSending}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Tous les modèles
            </Button>
          </div>

          {/* Toggle réponse patient */}
          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <Label htmlFor="allow-reply" className="flex-1 cursor-pointer">
              Permettre au patient de répondre
            </Label>
            <Switch
              id="allow-reply"
              checked={allowReply}
              onCheckedChange={setAllowReply}
              disabled={isSending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={isSending}>
            Ignorer
          </Button>
          <Button
            onClick={handleSend}
            disabled={selectedDocuments.length === 0 || isSending}
          >
            {isSending ? (
              <>Envoi en cours...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
