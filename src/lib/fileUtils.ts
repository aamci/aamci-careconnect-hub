/**
 * Utilitaires pour gestion de fichiers
 * Upload vers Supabase Storage, calcul checksum, génération thumbnails
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Calcule le checksum SHA-256 d'un fichier
 */
export async function calculateFileChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Upload un fichier vers Supabase Storage
 */
export interface UploadFileOptions {
  bucket?: string;
  folder?: string;
  onProgress?: (progress: number) => void;
}

export interface UploadFileResult {
  storageUrl: string;
  filename: string;
  checksum: string;
  thumbnailUrl?: string;
}

export async function uploadFileToStorage(
  file: File,
  options: UploadFileOptions = {}
): Promise<UploadFileResult> {
  const {
    bucket = 'documents',
    folder = 'uploads',
    onProgress
  } = options;

  // Calcul du checksum
  onProgress?.(10);
  const checksum = await calculateFileChecksum(file);

  // Génération nom de fichier unique avec timestamp
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedName}`;
  const filePath = `${folder}/${filename}`;

  onProgress?.(30);

  // Upload vers Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Erreur upload fichier: ${error.message}`);
  }

  onProgress?.(70);

  // Récupération de l'URL publique
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  onProgress?.(90);

  // Génération thumbnail pour les images
  let thumbnailUrl: string | undefined;
  if (file.type.startsWith('image/')) {
    thumbnailUrl = await generateImageThumbnail(file, bucket, folder);
  }

  onProgress?.(100);

  return {
    storageUrl: publicUrl,
    filename: file.name,
    checksum,
    thumbnailUrl
  };
}

/**
 * Génère une miniature pour une image
 */
async function generateImageThumbnail(
  file: File,
  bucket: string,
  folder: string
): Promise<string | undefined> {
  try {
    // Créer une miniature via canvas
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return undefined;

    // Dimensions thumbnail (max 200x200)
    const maxSize = 200;
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // Conversion en blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Erreur génération thumbnail'))),
        'image/jpeg',
        0.8
      );
    });

    // Upload thumbnail
    const timestamp = Date.now();
    const thumbPath = `${folder}/thumbnails/${timestamp}_thumb.jpg`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(thumbPath, blob, {
        cacheControl: '3600',
        upsert: false,
        contentType: 'image/jpeg'
      });

    if (error) {
      console.warn('Erreur upload thumbnail:', error);
      return undefined;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.warn('Erreur génération thumbnail:', error);
    return undefined;
  }
}

/**
 * Supprime un fichier de Supabase Storage
 */
export async function deleteFileFromStorage(
  storageUrl: string,
  bucket: string = 'documents'
): Promise<boolean> {
  try {
    // Extraire le path depuis l'URL
    const url = new URL(storageUrl);
    const pathParts = url.pathname.split(`/storage/v1/object/public/${bucket}/`);
    if (pathParts.length < 2) {
      throw new Error('URL storage invalide');
    }

    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Erreur suppression fichier:', error);
    return false;
  }
}

/**
 * Télécharge un fichier depuis Supabase Storage
 */
export async function downloadFileFromStorage(
  storageUrl: string,
  filename: string
): Promise<void> {
  try {
    const response = await fetch(storageUrl);
    if (!response.ok) {
      throw new Error('Erreur téléchargement fichier');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur téléchargement:', error);
    throw error;
  }
}
