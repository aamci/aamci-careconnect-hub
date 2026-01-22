/**
 * Adaptateur pour compatibilité entre ancien et nouveau système documents
 * Permet transition progressive des composants
 */

import { Document } from '@/types/document';

/**
 * Type de l'ancien système (pour compatibilité)
 */
export interface LegacyPatientDocument {
  id: string;
  patient_id: string;
  name: string;
  type: string | null;
  category: string | null;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  storage_bucket: string | null;
  appointment_id: string | null;
  uploaded_by: string | null;
  workflow_status: 'draft' | 'pending_validation' | 'validated' | 'rejected' | 'archived';
  validated_by: string | null;
  validated_at: string | null;
  rejected_reason: string | null;
  is_confidential: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Convertit un Document moderne vers le format legacy
 */
export function toLegacyDocument(doc: Document): LegacyPatientDocument {
  return {
    id: doc.id,
    patient_id: doc.patientId,
    name: doc.title || doc.filename,
    type: doc.mimeType,
    category: doc.category,
    file_path: doc.storageUrl,
    file_size: doc.fileSize,
    mime_type: doc.mimeType,
    storage_bucket: 'documents',
    appointment_id: doc.consultationId || null,
    uploaded_by: doc.createdBy,
    workflow_status: mapStatusToWorkflow(doc.status),
    validated_by: doc.status === 'validated' ? doc.updatedBy || null : null,
    validated_at: doc.status === 'validated' ? doc.updatedAt?.toISOString() || null : null,
    rejected_reason: null,
    is_confidential: doc.visibility === 'private',
    created_at: doc.createdAt.toISOString(),
    updated_at: doc.updatedAt?.toISOString() || doc.createdAt.toISOString()
  };
}

/**
 * Mappe le status moderne vers workflow legacy
 */
function mapStatusToWorkflow(
  status: 'draft' | 'validated' | 'signed' | 'archived'
): LegacyPatientDocument['workflow_status'] {
  const mapping: Record<string, LegacyPatientDocument['workflow_status']> = {
    draft: 'draft',
    validated: 'validated',
    signed: 'validated', // signed est considéré comme validated
    archived: 'archived'
  };

  return mapping[status] || 'draft';
}

/**
 * Convertit un tableau de Documents modernes vers legacy
 */
export function toLegacyDocuments(docs: Document[]): LegacyPatientDocument[] {
  return docs.map(toLegacyDocument);
}
