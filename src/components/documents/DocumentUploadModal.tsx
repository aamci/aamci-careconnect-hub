/**
 * Modal d'upload de documents avec workflow complet
 * Garantie ZÉRO PERTE - Tous les champs sont persistés
 */

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Upload, X, FileText, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFileToStorage } from '@/lib/fileUtils';
import { createDocument } from '@/services/supabase/documentsService';
import { DocumentCategory } from '@/types/document';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  consultationId?: string;
  onSuccess?: () => void;
}

// Configuration des catégories et sous-catégories
const CATEGORIES_CONFIG: Record<DocumentCategory, { label: string; subcategories: string[] }> = {
  ordonnance: {
    label: 'Ordonnance',
    subcategories: [
      'Ordonnance médicamenteuse',
      'Ordonnance d\'examens',
      'Ordonnance de biologie',
      'Ordonnance d\'imagerie',
      'Ordonnance de kinésithérapie',
      'Ordonnance d\'orthophonie',
      'Ordonnance d\'orthoptie',
      'Autre ordonnance'
    ]
  },
  'compte-rendu': {
    label: 'Compte-rendu',
    subcategories: [
      'Compte-rendu de consultation',
      'Compte-rendu d\'hospitalisation',
      'Compte-rendu opératoire',
      'Compte-rendu d\'urgence',
      'Compte-rendu de spécialiste',
      'Autre compte-rendu'
    ]
  },
  imagerie: {
    label: 'Imagerie',
    subcategories: [
      'Radiographie',
      'Scanner (CT)',
      'IRM',
      'Échographie',
      'Mammographie',
      'PET-Scan',
      'Scintigraphie',
      'Autre imagerie'
    ]
  },
  biologie: {
    label: 'Biologie',
    subcategories: [
      'Bilan sanguin complet',
      'Bilan lipidique',
      'Bilan hépatique',
      'Bilan rénal',
      'Bilan thyroïdien',
      'Bilan inflammatoire',
      'Sérologie',
      'Analyse d\'urine',
      'Autre analyse biologique'
    ]
  },
  certificat: {
    label: 'Certificat',
    subcategories: [
      'Certificat médical',
      'Certificat d\'aptitude',
      'Certificat d\'inaptitude',
      'Certificat de sport',
      'Certificat de décès',
      'Certificat d\'arrêt de travail',
      'Autre certificat'
    ]
  },
  courrier: {
    label: 'Courrier',
    subcategories: [
      'Courrier au médecin traitant',
      'Courrier au spécialiste',
      'Courrier à l\'assurance',
      'Courrier administratif',
      'Autre courrier'
    ]
  },
  administratif: {
    label: 'Administratif',
    subcategories: [
      'Carte Vitale',
      'Carte de mutuelle',
      'Justificatif de domicile',
      'Pièce d\'identité',
      'Consentement',
      'Directive anticipée',
      'Autre document administratif'
    ]
  },
  autre: {
    label: 'Autre',
    subcategories: ['Document non classé']
  }
};

type UploadStage = 'select' | 'uploading' | 'success' | 'error';

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  patientId,
  consultationId,
  onSuccess
}) => {
  const { toast } = useToast();
  const [stage, setStage] = useState<UploadStage>('select');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Métadonnées du document
  const [category, setCategory] = useState<DocumentCategory>('autre');
  const [subcategory, setSubcategory] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [documentDate, setDocumentDate] = useState<Date>(new Date());
  const [shouldSign, setShouldSign] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, '')); // Remove extension
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    }
  });

  const handleUpload = async () => {
    if (!selectedFile) return;

    if (!category || !subcategory || !title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Champs requis manquants',
        description: 'Veuillez remplir la catégorie, sous-catégorie et le titre.'
      });
      return;
    }

    setStage('uploading');
    setUploadProgress(0);
    setErrorMessage('');

    try {
      // Upload vers Supabase Storage
      const uploadResult = await uploadFileToStorage(selectedFile, {
        bucket: 'documents',
        folder: 'patient-documents',
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      });

      // Créer le document en DB avec TOUS les champs
      await createDocument({
        filename: uploadResult.filename,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
        storageUrl: uploadResult.storageUrl,
        thumbnailUrl: uploadResult.thumbnailUrl,
        checksum: uploadResult.checksum,
        category,
        subcategory,
        title: title.trim(),
        description: description.trim() || undefined,
        patientId,
        consultationId,
        documentDate,
        shouldSign,
        source: 'upload',
        metadata: {
          originalFilename: selectedFile.name,
          uploadedAt: new Date().toISOString()
        }
      });

      setStage('success');

      toast({
        title: 'Document ajouté',
        description: `"${title}" a été uploadé avec succès.`
      });

      // Attendre 1.5s puis fermer et callback
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);

    } catch (error) {
      console.error('Upload error:', error);
      setStage('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de l\'upload');

      toast({
        variant: 'destructive',
        title: 'Erreur d\'upload',
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
    }
  };

  const handleClose = () => {
    setStage('select');
    setUploadProgress(0);
    setSelectedFile(null);
    setCategory('autre');
    setSubcategory('');
    setTitle('');
    setDescription('');
    setDocumentDate(new Date());
    setShouldSign(false);
    setErrorMessage('');
    onClose();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setTitle('');
  };

  // Update subcategory when category changes
  React.useEffect(() => {
    if (category && CATEGORIES_CONFIG[category].subcategories.length > 0) {
      setSubcategory(CATEGORIES_CONFIG[category].subcategories[0]);
    }
  }, [category]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter un document</DialogTitle>
          <DialogDescription>
            Uploadez un document médical avec ses métadonnées complètes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {stage === 'select' && (
            <>
              {/* File Selection */}
              {!selectedFile ? (
                <div
                  {...getRootProps()}
                  className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  {isDragActive ? (
                    <p className="text-sm text-foreground">Déposez le fichier ici...</p>
                  ) : (
                    <>
                      <p className="text-sm text-foreground mb-1">
                        Glissez-déposez un fichier ici, ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF, Images, Word, TXT (max 50 MB)
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4 flex items-center gap-3">
                  <FileText className="h-10 w-10 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {selectedFile && (
                <>
                  {/* Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Catégorie *</Label>
                      <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
                        <SelectTrigger id="category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORIES_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Sous-catégorie *</Label>
                      <Select value={subcategory} onValueChange={setSubcategory}>
                        <SelectTrigger id="subcategory">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES_CONFIG[category].subcategories.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                              {sub}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre du document *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Ordonnance du 15/01/2024"
                    />
                  </div>

                  {/* Document Date */}
                  <div className="space-y-2">
                    <Label>Date du document *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !documentDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {documentDate ? (
                            format(documentDate, 'PPP', { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={documentDate}
                          onSelect={(date) => date && setDocumentDate(date)}
                          initialFocus
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optionnel)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ajoutez des notes ou commentaires..."
                      rows={3}
                    />
                  </div>

                  {/* Should Sign */}
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="space-y-0.5">
                      <Label htmlFor="shouldSign" className="text-sm font-medium">
                        Requiert une signature
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Ce document devra être signé électroniquement
                      </p>
                    </div>
                    <Switch
                      id="shouldSign"
                      checked={shouldSign}
                      onCheckedChange={setShouldSign}
                    />
                  </div>
                </>
              )}
            </>
          )}

          {stage === 'uploading' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload en cours...</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
              </div>
            </div>
          )}

          {stage === 'success' && (
            <div className="py-8 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-600" />
              <div>
                <p className="text-sm font-medium text-foreground">Document uploadé avec succès</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Le document a été enregistré dans le dossier patient
                </p>
              </div>
            </div>
          )}

          {stage === 'error' && (
            <div className="py-8 text-center space-y-4">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">Erreur lors de l'upload</p>
                <p className="text-xs text-muted-foreground mt-1">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {stage === 'select' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile || !title.trim()}>
                <Upload className="h-4 w-4 mr-2" />
                Uploader
              </Button>
            </>
          )}
          {stage === 'error' && (
            <Button onClick={() => setStage('select')}>
              Réessayer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
