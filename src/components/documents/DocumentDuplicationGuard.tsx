/**
 * DocumentDuplication Guard - Prévient la création de documents en double
 * Affiche un warning si des documents similaires existent déjà
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, Edit, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Document } from '@/types';
import { cn } from '@/lib/utils';

interface DocumentDuplicationGuardProps {
  /** Type de document qu'on souhaite créer */
  documentType: Document['type'];
  /** ID de la consultation en cours */
  consultationId: string;
  /** Documents existants pour cette consultation */
  existingDocuments: Document[];
  /** Callback quand l'utilisateur choisit de voir un document existant */
  onViewExisting?: (document: Document) => void;
  /** Callback quand l'utilisateur choisit de modifier un document existant */
  onEditExisting?: (document: Document) => void;
  /** Callback quand l'utilisateur choisit de créer un nouveau document */
  onCreateNew?: () => void;
  /** Si vrai, affiche le guard en mode modal */
  modal?: boolean;
}

const DOCUMENT_TYPE_LABELS: Record<Document['type'], string> = {
  prescription: 'Ordonnance',
  certificate: 'Certificat',
  report: 'Compte-rendu',
  letter: 'Courrier',
  exam_request: 'Demande d\'examen',
  lab_result: 'Résultat de laboratoire',
  other: 'Autre'
};

export function DocumentDuplicationGuard({
  documentType,
  consultationId,
  existingDocuments,
  onViewExisting,
  onEditExisting,
  onCreateNew,
  modal = false
}: DocumentDuplicationGuardProps) {
  // Filter documents of the same type
  const similarDocuments = existingDocuments.filter(
    (doc) => doc.type === documentType
  );

  // If no similar documents, don't show the guard
  if (similarDocuments.length === 0) {
    return null;
  }

  const documentLabel = DOCUMENT_TYPE_LABELS[documentType];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Alert variant="default" className="border-amber-500 bg-amber-50/50">
          <AlertCircle className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-900 font-semibold">
            Document(s) similaire(s) détecté(s)
          </AlertTitle>
          <AlertDescription className="text-amber-800 mt-2">
            <p className="mb-3">
              {similarDocuments.length} {documentLabel.toLowerCase()}
              {similarDocuments.length > 1 ? 's' : ''} {similarDocuments.length > 1 ? 'existent' : 'existe'} déjà
              pour cette consultation. Souhaitez-vous :
            </p>

            <div className="space-y-3">
              {/* Existing documents list */}
              <div className="space-y-2">
                {similarDocuments.map((doc) => (
                  <Card key={doc.id} className="border-amber-200 bg-white">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {doc.title || `${documentLabel} sans titre`}
                            </h4>
                            <Badge variant="secondary" className="text-xs">
                              {DOCUMENT_TYPE_LABELS[doc.type]}
                            </Badge>
                          </div>
                          {doc.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {doc.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Créé le{' '}
                              {format(doc.createdAt, "d MMM yyyy 'à' HH:mm", { locale: fr })}
                            </span>
                            {doc.createdBy && (
                              <span>Par: {doc.createdBy}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          {onViewExisting && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewExisting(doc)}
                              className="h-8 px-2"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEditExisting && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditExisting(doc)}
                              className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateNew}
                  className="gap-2 border-amber-500 text-amber-900 hover:bg-amber-100"
                >
                  <Plus className="h-4 w-4" />
                  Créer quand même un nouveau {documentLabel.toLowerCase()}
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}

// Alternative: Simpler inline version for compact UIs
interface DocumentDuplicationWarningProps {
  documentType: Document['type'];
  count: number;
  compact?: boolean;
}

export function DocumentDuplicationWarning({
  documentType,
  count,
  compact = false
}: DocumentDuplicationWarningProps) {
  if (count === 0) return null;

  const documentLabel = DOCUMENT_TYPE_LABELS[documentType];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
        <AlertCircle className="h-3 w-3" />
        <span>
          {count} {documentLabel.toLowerCase()}{count > 1 ? 's' : ''} déjà créé{count > 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  return (
    <Alert variant="default" className="border-amber-500 bg-amber-50">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-sm">Attention</AlertTitle>
      <AlertDescription className="text-xs">
        {count} {documentLabel.toLowerCase()}{count > 1 ? 's' : ''} {count > 1 ? 'existent' : 'existe'} déjà
        pour cette consultation
      </AlertDescription>
    </Alert>
  );
}
