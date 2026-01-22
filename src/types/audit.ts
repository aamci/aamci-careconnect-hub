/**
 * Types pour le système d'audit et traçabilité
 * Conformité réglementaire e-santé
 */

export type AuditAction =
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_VIEWED'
  | 'DOCUMENT_DOWNLOADED'
  | 'DOCUMENT_PRINTED'
  | 'DOCUMENT_METADATA_UPDATED'
  | 'DOCUMENT_SIGNED'
  | 'DOCUMENT_SENT_TO_PATIENT'
  | 'DOCUMENT_DELETED'
  | 'CONSULTATION_STARTED'
  | 'CONSULTATION_COMPLETED'
  | 'PATIENT_RECORD_ACCESSED';

export type AuditEntityType = 'document' | 'consultation' | 'patient' | 'appointment';

export interface AuditLog {
  id: string;

  userId: string;
  userRole: string;
  userName: string;

  timestamp: Date;

  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;

  metadata: {
    filename?: string;
    fileSize?: number;
    category?: string;
    recipientPatientId?: string;
    documentIds?: string[];
    reason?: string;
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export interface AuditLogCreate {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: AuditLog['metadata'];
}
