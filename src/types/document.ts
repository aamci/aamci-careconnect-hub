/**
 * Types pour la gestion documentaire du dossier patient
 * Système de classification, métadonnées et traçabilité
 */

export type DocumentCategory =
  | 'courrier'
  | 'imagerie'
  | 'analyse'
  | 'exploration'
  | 'ordonnance'
  | 'certificat'
  | 'administratif'
  | 'facturation'
  | 'divers';

export type DocumentStatus = 'draft' | 'validated' | 'signed' | 'archived';

export type DocumentSource = 'upload' | 'scan' | 'integration' | 'generated';

export type DocumentVisibility = 'public' | 'restricted' | 'private';

export type EncryptionMethod = 'AES-256-GCM' | 'RSA-4096';

export type SignatureMethod = 'electronic' | 'digital_certificate';

export interface DocumentSignature {
  signedAt: Date;
  signedBy: string;
  signatureMethod: SignatureMethod;
  certificateId?: string;
  signatureHash: string;
  isValid: boolean;
}

export interface DocumentMetadata {
  dicomStudyInstanceUID?: string;
  dicomSeriesInstanceUID?: string;
  dicomModality?: string;
  laboratoryName?: string;
  laboratoryId?: string;
  loincCodes?: string[];
  customFields?: Record<string, any>;
}

export interface Document {
  id: string;
  externalId?: string;

  filename: string;
  mimeType: string;
  fileSize: number;
  storageUrl: string;
  thumbnailUrl?: string;
  checksum: string;

  category: DocumentCategory;
  subcategory: string;
  title: string;
  description?: string;

  patientId: string;
  consultationId?: string;
  documentDate: Date;

  status: DocumentStatus;
  isSigned: boolean;
  signatureData?: DocumentSignature;
  isEncrypted: boolean;
  encryptionMethod?: EncryptionMethod;

  metadata?: DocumentMetadata;

  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  deletedBy?: string;
  deletedAt?: Date;

  source: DocumentSource;
  sourceSystem?: string;

  sharedWithPatient: boolean;
  sharedAt?: Date;
  sharedBy?: string;

  visibility: DocumentVisibility;
  restrictedToRoles?: string[];
}

export interface DocumentUploadMetadata {
  patientId: string;
  category: DocumentCategory;
  subcategory: string;
  documentDate: Date;
  description?: string;
  shouldSign?: boolean;
}

export type UploadState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

export interface DocumentUploadProgress {
  state: UploadState;
  progress: number;
  error?: string;
  document?: Document;
}

export interface DocumentConsultationLink {
  documentId: string;
  consultationId: string;
  addedAt: Date;
  addedBy: string;
  context: 'created_during' | 'imported_to' | 'referenced';
}

export interface DocumentSendRequest {
  patientId: string;
  documentIds: string[];
  message?: string;
  allowReply: boolean;
  depositInDMP?: boolean;
}

export interface DocumentCategoryConfig {
  id: string;
  label: string;
  icon: string;
  subcategories: Array<{
    id: string;
    label: string;
  }>;
}
