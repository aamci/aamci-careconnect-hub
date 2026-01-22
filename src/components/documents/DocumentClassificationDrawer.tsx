/**
 * Drawer de classification de document
 * Workflow complet : aperçu, métadonnées, validation
 */

import { useState, useEffect } from 'react';
import { X, Info, AlertCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { DocumentCategoryPicker } from './DocumentCategoryPicker';
import { DocumentPreview } from './DocumentPreview';
import { PatientCombobox } from './PatientCombobox';
import { useDocumentUpload } from '@/hooks/useDocumentUpload';
import { isPDFFile } from '@/constants/documentCategories';
import { Patient, Document } from '@/types';
import { DocumentCategory } from '@/types/document';

interface DocumentClassificationDrawerProps {
  open: boolean;
  onClose: () => void;
  file: File | null;
  defaultPatient?: Patient;
  patients?: Patient[];
  consultationId?: string;
  onSuccess?: (document: Document) => void;
}

export function DocumentClassificationDrawer({
  open,
  onClose,
  file,
  defaultPatient,
  patients = [],
  consultationId,
  onSuccess
}: DocumentClassificationDrawerProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>(
    defaultPatient
  );
  const [category, setCategory] = useState<{
    category: DocumentCategory | '';
    subcategory: string;
  }>({ category: '', subcategory: '' });
  const [documentDate, setDocumentDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [shouldSign, setShouldSign] = useState(false);

  const { upload, uploadProgress, isUploading, isError, retry } = useDocumentUpload({
    consultationId,
    onSuccess: (document) => {
      onSuccess?.(document);
      handleClose();
    }
  });

  useEffect(() => {
    if (defaultPatient) {
      setSelectedPatient(defaultPatient);
    }
  }, [defaultPatient]);

  useEffect(() => {
    if (open) {
      setCategory({ category: '', subcategory: '' });
      setDescription('');
      setShouldSign(false);
      setDocumentDate(new Date());
    }
  }, [open]);

  const handleClose = () => {
    if (!isUploading) {
      onClose();
    }
  };

  const handleValidate = async () => {
    if (!file || !selectedPatient || !category.category || !category.subcategory) {
      return;
    }

    await upload(file, {
      patientId: selectedPatient.id,
      category: category.category as DocumentCategory,
      subcategory: category.subcategory,
      documentDate,
      description: description.trim() || undefined,
      shouldSign
    });
  };

  const isValid =
    selectedPatient &&
    category.category &&
    category.subcategory &&
    !isUploading;

  const showPDFSignatureWarning = file && !isPDFFile(file) && shouldSign;
  const canSign = file && isPDFFile(file);

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className="w-full sm:w-[600px] sm:max-w-[600px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Classer le document - Enregistrer</SheetTitle>
          <SheetDescription>
            Renseignez les informations du document avant de l'enregistrer.
          </SheetDescription>
          <SheetClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Fermer</span>
          </SheetClose>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Aperçu du document */}
          {file && (
            <div>
              <Label className="text-sm font-medium">Aperçu</Label>
              <div className="mt-2">
                <DocumentPreview file={file} maxHeight={200} />
              </div>
            </div>
          )}

          {/* Message d'info signature PDF */}
          {showPDFSignatureWarning && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                La signature ne fonctionne que pour les documents au format PDF.
                Votre document peut être partagé avec votre patient, mais vous ne
                pouvez pas le signer ici.
              </AlertDescription>
            </Alert>
          )}

          {/* Erreur upload */}
          {isError && uploadProgress.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{uploadProgress.error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={retry}
                  className="ml-2"
                >
                  Réessayer
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Progression upload */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {uploadProgress.state === 'uploading'
                    ? 'Envoi en cours...'
                    : 'Traitement du document...'}
                </span>
                <span className="font-medium">{uploadProgress.progress}%</span>
              </div>
              <Progress value={uploadProgress.progress} />
            </div>
          )}

          {/* Patient concerné */}
          <div className="space-y-2">
            <Label htmlFor="patient" className="required">
              Patient concerné
            </Label>
            <PatientCombobox
              value={selectedPatient}
              onChange={setSelectedPatient}
              patients={patients}
              disabled={isUploading}
              required
            />
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label htmlFor="category" className="required">
              Catégorie du document
            </Label>
            <DocumentCategoryPicker
              value={category}
              onChange={setCategory}
              disabled={isUploading}
              required
            />
          </div>

          {/* Date du document */}
          <div className="space-y-2">
            <Label htmlFor="document-date">Date du document</Label>
            <input
              id="document-date"
              type="date"
              value={documentDate.toISOString().split('T')[0]}
              onChange={(e) => setDocumentDate(new Date(e.target.value))}
              disabled={isUploading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Commentaire */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Commentaire <span className="text-muted-foreground">(optionnel)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Saisir un commentaire..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {description.length}/500
            </p>
          </div>

          {/* Signature (PDF uniquement) */}
          {canSign && (
            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="signature" className="font-medium">
                  Signature électronique
                </Label>
                <p className="text-sm text-muted-foreground">
                  Signer ce document après validation
                </p>
              </div>
              <Switch
                id="signature"
                checked={shouldSign}
                onCheckedChange={setShouldSign}
                disabled={isUploading}
              />
            </div>
          )}
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isUploading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleValidate}
            disabled={!isValid}
            className="min-w-[150px]"
          >
            {isUploading ? 'Envoi en cours...' : 'Valider ce document'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
