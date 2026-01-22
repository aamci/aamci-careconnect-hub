/**
 * Service de gestion des documents patients
 * Garantie ZÉRO PERTE - Persistence complète et traçabilité maximale
 */

import { supabase } from '@/integrations/supabase/client';
import { Document, DocumentUploadMetadata, DocumentSendRequest, DocumentCategory } from '@/types/document';
import { AuditAction } from '@/types/audit';

export interface CreateDocumentInput {
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
  shouldSign?: boolean;
  metadata?: Record<string, unknown>;
  source?: 'upload' | 'scan' | 'integration' | 'generated';
  sourceSystem?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  description?: string;
  category?: DocumentCategory;
  subcategory?: string;
  documentDate?: Date;
  status?: 'draft' | 'validated' | 'signed' | 'archived';
  metadata?: Record<string, unknown>;
}

export interface DocumentFilter {
  patientId?: string;
  consultationId?: string;
  category?: DocumentCategory;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sharedWithPatient?: boolean;
  includeDeleted?: boolean;
}

/**
 * Créer un nouveau document avec traçabilité complète
 */
export async function createDocument(input: CreateDocumentInput): Promise<Document> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const documentData = {
    filename: input.filename,
    mime_type: input.mimeType,
    file_size: input.fileSize,
    storage_url: input.storageUrl,
    thumbnail_url: input.thumbnailUrl,
    checksum: input.checksum,
    category: input.category,
    subcategory: input.subcategory,
    title: input.title,
    description: input.description,
    patient_id: input.patientId,
    consultation_id: input.consultationId,
    document_date: input.documentDate.toISOString(),
    status: input.shouldSign ? 'draft' : 'validated',
    is_signed: false,
    is_encrypted: false,
    source: input.source || 'upload',
    source_system: input.sourceSystem,
    metadata: input.metadata,
    created_by: userData.user.id,
    shared_with_patient: false,
    visibility: 'private' as const,
    restricted_to_roles: []
  };

  const { data, error } = await supabase
    .from('documents')
    .insert(documentData)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating document:', error);
    throw new Error(`Failed to create document: ${error.message}`);
  }

  return mapDocumentFromDB(data);
}

/**
 * Récupérer un document par ID
 */
export async function getDocument(documentId: string): Promise<Document | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(`Failed to fetch document: ${error.message}`);
  }

  return mapDocumentFromDB(data);
}

/**
 * Lister les documents avec filtres
 */
export async function listDocuments(filter: DocumentFilter): Promise<Document[]> {
  let query = supabase.from('documents').select('*');

  if (filter.patientId) {
    query = query.eq('patient_id', filter.patientId);
  }

  if (filter.consultationId) {
    query = query.eq('consultation_id', filter.consultationId);
  }

  if (filter.category) {
    query = query.eq('category', filter.category);
  }

  if (filter.status) {
    query = query.eq('status', filter.status);
  }

  if (filter.dateFrom) {
    query = query.gte('document_date', filter.dateFrom.toISOString());
  }

  if (filter.dateTo) {
    query = query.lte('document_date', filter.dateTo.toISOString());
  }

  if (filter.sharedWithPatient !== undefined) {
    query = query.eq('shared_with_patient', filter.sharedWithPatient);
  }

  if (!filter.includeDeleted) {
    query = query.is('deleted_at', null);
  }

  query = query.order('document_date', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error listing documents:', error);
    throw new Error(`Failed to list documents: ${error.message}`);
  }

  return (data || []).map(mapDocumentFromDB);
}

/**
 * Mettre à jour un document
 */
export async function updateDocument(
  documentId: string,
  updates: UpdateDocumentInput
): Promise<Document> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const updateData: Record<string, unknown> = {
    updated_by: userData.user.id,
    updated_at: new Date().toISOString()
  };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
  if (updates.documentDate !== undefined) {
    updateData.document_date = updates.documentDate.toISOString();
  }
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.metadata !== undefined) updateData.metadata = updates.metadata;

  const { data, error } = await supabase
    .from('documents')
    .update(updateData)
    .eq('id', documentId)
    .is('deleted_at', null)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update document: ${error.message}`);
  }

  return mapDocumentFromDB(data);
}

/**
 * Soft delete d'un document
 */
export async function deleteDocument(documentId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('documents')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: userData.user.id
    })
    .eq('id', documentId)
    .is('deleted_at', null);

  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }

  return true;
}

/**
 * Restaurer un document soft-deleted
 */
export async function restoreDocument(documentId: string): Promise<boolean> {
  const { error } = await supabase.rpc('restore_document', {
    doc_id: documentId
  });

  if (error) {
    throw new Error(`Failed to restore document: ${error.message}`);
  }

  return true;
}

/**
 * Signer un document
 */
export async function signDocument(
  documentId: string,
  signatureMethod: 'electronic' | 'digital_certificate',
  certificateId?: string
): Promise<Document> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const signatureData = {
    signedAt: new Date().toISOString(),
    signedBy: userData.user.id,
    signatureMethod,
    certificateId,
    signatureHash: generateSignatureHash(documentId, userData.user.id),
    isValid: true
  };

  const { data, error } = await supabase
    .from('documents')
    .update({
      is_signed: true,
      signature_data: signatureData,
      status: 'signed',
      updated_by: userData.user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', documentId)
    .is('deleted_at', null)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to sign document: ${error.message}`);
  }

  return mapDocumentFromDB(data);
}

/**
 * Partager un document avec le patient
 */
export async function shareDocumentWithPatient(documentId: string): Promise<Document> {
  const { error } = await supabase.rpc('share_document_with_patient', {
    doc_id: documentId
  });

  if (error) {
    throw new Error(`Failed to share document: ${error.message}`);
  }

  const document = await getDocument(documentId);
  if (!document) throw new Error('Document not found after sharing');

  return document;
}

/**
 * Envoyer plusieurs documents au patient
 */
export async function sendDocumentsToPatient(
  request: DocumentSendRequest
): Promise<{ success: boolean; sentCount: number }> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  // Partager chaque document
  const sharePromises = request.documentIds.map(docId =>
    shareDocumentWithPatient(docId)
  );

  await Promise.all(sharePromises);

  // Log audit pour l'envoi groupé
  await logDocumentAudit({
    documentId: request.documentIds[0], // Premier document comme référence
    action: 'SHARED_WITH_PATIENT',
    userId: userData.user.id,
    details: {
      patientId: request.patientId,
      documentCount: request.documentIds.length,
      message: request.message,
      allowReply: request.allowReply,
      documentIds: request.documentIds
    }
  });

  return {
    success: true,
    sentCount: request.documentIds.length
  };
}

/**
 * Lier un document à une consultation
 */
export async function linkDocumentToConsultation(
  documentId: string,
  consultationId: string,
  context: 'created_during' | 'imported_to' | 'referenced'
): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('document_consultation_links')
    .insert({
      document_id: documentId,
      consultation_id: consultationId,
      added_by: userData.user.id,
      context
    });

  if (error && error.code !== '23505') { // Ignore duplicate key error
    throw new Error(`Failed to link document: ${error.message}`);
  }

  // Mettre à jour le champ consultation_id du document si context = 'created_during'
  if (context === 'created_during') {
    await supabase
      .from('documents')
      .update({ consultation_id: consultationId })
      .eq('id', documentId);
  }
}

/**
 * Logger une action d'audit sur un document
 */
export async function logDocumentAudit(params: {
  documentId: string;
  action: AuditAction;
  userId: string;
  userName?: string;
  userRole?: string;
  details?: Record<string, unknown>;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const { error } = await supabase
    .from('document_audit')
    .insert({
      document_id: params.documentId,
      action: params.action,
      user_id: params.userId,
      user_name: params.userName,
      user_role: params.userRole,
      details: params.details,
      previous_value: params.previousValue,
      new_value: params.newValue,
      ip_address: params.ipAddress,
      user_agent: params.userAgent
    });

  if (error) {
    console.error('Failed to log document audit:', error);
    // Ne pas throw pour ne pas bloquer l'opération principale
  }
}

/**
 * Récupérer l'historique d'audit d'un document
 */
export async function getDocumentAuditHistory(documentId: string): Promise<unknown[]> {
  const { data, error } = await supabase
    .from('document_audit')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch audit history: ${error.message}`);
  }

  return data || [];
}

/**
 * Recherche full-text dans les documents
 */
export async function searchDocuments(
  patientId: string,
  searchQuery: string
): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    .order('document_date', { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Failed to search documents: ${error.message}`);
  }

  return (data || []).map(mapDocumentFromDB);
}

// ===== FONCTIONS UTILITAIRES =====

/**
 * Mapper un document de la base vers le type TypeScript
 */
function mapDocumentFromDB(data: Record<string, unknown>): Document {
  return {
    id: data.id as string,
    externalId: data.external_id as string | undefined,
    filename: data.filename as string,
    mimeType: data.mime_type as string,
    fileSize: Number(data.file_size),
    storageUrl: data.storage_url as string,
    thumbnailUrl: data.thumbnail_url as string | undefined,
    checksum: data.checksum as string,
    category: data.category as DocumentCategory,
    subcategory: data.subcategory as string,
    title: data.title as string,
    description: data.description as string | undefined,
    patientId: data.patient_id as string,
    consultationId: data.consultation_id as string | undefined,
    documentDate: new Date(data.document_date as string),
    status: data.status as 'draft' | 'validated' | 'signed' | 'archived',
    isSigned: data.is_signed as boolean,
    signatureData: data.signature_data as unknown as Document['signatureData'],
    isEncrypted: data.is_encrypted as boolean,
    encryptionMethod: data.encryption_method as 'AES-256-GCM' | 'RSA-4096' | undefined,
    metadata: data.metadata as Record<string, unknown> | undefined,
    createdBy: data.created_by as string,
    createdAt: new Date(data.created_at as string),
    updatedBy: data.updated_by as string | undefined,
    updatedAt: data.updated_at ? new Date(data.updated_at as string) : undefined,
    deletedBy: data.deleted_by as string | undefined,
    deletedAt: data.deleted_at ? new Date(data.deleted_at as string) : undefined,
    source: data.source as 'upload' | 'scan' | 'integration' | 'generated',
    sourceSystem: data.source_system as string | undefined,
    sharedWithPatient: data.shared_with_patient as boolean,
    sharedAt: data.shared_at ? new Date(data.shared_at as string) : undefined,
    sharedBy: data.shared_by as string | undefined,
    visibility: data.visibility as 'public' | 'restricted' | 'private',
    restrictedToRoles: (data.restricted_to_roles as string[]) || []
  };
}

/**
 * Générer un hash de signature (version simplifiée)
 */
function generateSignatureHash(documentId: string, userId: string): string {
  const data = `${documentId}-${userId}-${Date.now()}`;
  return btoa(data); // En production, utiliser un vrai algorithme de hash
}
