/**
 * Taxonomie complète des catégories de documents médicaux
 * Basé sur l'analyse des écrans de classification
 */

import { DocumentCategoryConfig } from '@/types/document';

export const DOCUMENT_CATEGORIES: Record<string, DocumentCategoryConfig> = {
  COURRIER: {
    id: 'courrier',
    label: 'Courrier',
    icon: '📄',
    subcategories: [
      { id: 'compte_rendu_consultation', label: 'Compte-rendu de Consultation' },
      { id: 'compte_rendu_hospitalisation', label: 'Compte-rendu d\'Hospitalisation' },
      { id: 'compte_rendu_operatoire', label: 'Compte-rendu Opératoire' },
      { id: 'courrier_adressage', label: 'Courrier d\'adressage' },
      { id: 'compte_rendu_teleexpertise', label: 'Compte-rendu de Télé-expertise' },
      { id: 'lettre_liaison', label: 'Lettre de Liaison' }
    ]
  },

  IMAGERIE: {
    id: 'imagerie',
    label: 'Imagerie',
    icon: '🖼️',
    subcategories: [
      { id: 'radiographie', label: 'Radiographie' },
      { id: 'echographie', label: 'Échographie' },
      { id: 'echo_doppler', label: 'Écho Doppler' },
      { id: 'irm', label: 'IRM' },
      { id: 'scanner', label: 'Scanner' },
      { id: 'scintigraphie', label: 'Scintigraphie' },
      { id: 'pet_scan', label: 'PET scan' },
      { id: 'osteodensitometrie', label: 'Ostéodensitométrie' },
      { id: 'mammographie', label: 'Mammographie' }
    ]
  },

  ANALYSE: {
    id: 'analyse',
    label: 'Analyse',
    icon: '🧪',
    subcategories: [
      { id: 'biologie', label: 'Biologie' },
      { id: 'ecbu', label: 'ECBU' },
      { id: 'frottis', label: 'Frottis' },
      { id: 'hemocoult', label: 'Hémocoult' },
      { id: 'coproculture', label: 'Coproculture' },
      { id: 'anapath', label: 'Anapath' },
      { id: 'serologie', label: 'Sérologie' }
    ]
  },

  EXPLORATION: {
    id: 'exploration',
    label: 'Exploration',
    icon: '📊',
    subcategories: [
      { id: 'ecg', label: 'ECG' },
      { id: 'holter_ecg', label: 'Holter ECG' },
      { id: 'test_effort', label: 'Test d\'effort' },
      { id: 'mapa', label: 'MAPA' },
      { id: 'polygraphie', label: 'Polygraphie' },
      { id: 'polysomnographie', label: 'Polysomnographie' },
      { id: 'gaz_sang', label: 'Gaz du sang' },
      { id: 'emg', label: 'EMG' },
      { id: 'eeg', label: 'EEG' },
      { id: 'audiogramme', label: 'Audiogramme' },
      { id: 'tympanogramme', label: 'Tympanogramme' },
      { id: 'videonystagmographie', label: 'Vidéonystagmographie' },
      { id: 'potentiel_evoque', label: 'Potentiel Évoqué' }
    ]
  },

  ORDONNANCE: {
    id: 'ordonnance',
    label: 'Ordonnance',
    icon: '💊',
    subcategories: [
      { id: 'ordonnance_pharmacie', label: 'Ordonnance de Pharmacie' },
      { id: 'ordonnance_analyse', label: 'Ordonnance d\'Analyse' },
      { id: 'ordonnance_imagerie', label: 'Ordonnance d\'imagerie' },
      { id: 'ordonnance_soins_infirmiers', label: 'Ordonnance de soins infirmiers' },
      { id: 'ordonnance_kine', label: 'Ordonnance de kinésithérapie' },
      { id: 'ordonnance_autre', label: 'Ordonnance autre' },
      { id: 'prescription_transport', label: 'Prescription médicale de transport' },
      { id: 'medicaments_exception', label: 'Médicaments d\'exception' }
    ]
  },

  CERTIFICAT: {
    id: 'certificat',
    label: 'Certificat / CERFA',
    icon: '🏅',
    subcategories: [
      { id: 'certificat_medical', label: 'Certificat médical autre' },
      { id: 'cerfa', label: 'Cerfa autre' },
      { id: 'consentement_patient', label: 'Consentement patient' }
    ]
  },

  ADMINISTRATIF: {
    id: 'administratif',
    label: 'Administratif',
    icon: '📋',
    subcategories: [
      { id: 'arret_travail', label: 'Arrêt de travail' },
      { id: 'at_mp', label: 'Accident de Travail & Maladie Professionnelle' },
      { id: 'accord_prealable', label: 'Demande d\'accord préalable' },
      { id: 'mdph', label: 'MDPH' },
      { id: 'ehpad', label: 'EHPAD' }
    ]
  },

  FACTURATION: {
    id: 'facturation',
    label: 'Facturation',
    icon: '💳',
    subcategories: [
      { id: 'feuille_soins', label: 'Feuille de soins' },
      { id: 'quittance', label: 'Quittance' },
      { id: 'note_honoraires', label: 'Note d\'honoraires' },
      { id: 'devis', label: 'Devis' },
      { id: 'carte_tiers_payant', label: 'Carte de Tiers payant' }
    ]
  },

  DIVERS: {
    id: 'divers',
    label: 'Divers',
    icon: '📎',
    subcategories: [
      { id: 'photo', label: 'Photo' },
      { id: 'cartographie', label: 'Cartographie' },
      { id: 'education_therapeutique', label: 'Éducation thérapeutique / Information au patient' },
      { id: 'echelle_test', label: 'Échelle / test / mesure' },
      { id: 'autre', label: 'Autre' }
    ]
  }
} as const;

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.dcm'] as const;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/tiff',
  'application/dicom'
] as const;

export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 Mo

export function getCategoryLabel(categoryId: string): string {
  const category = Object.values(DOCUMENT_CATEGORIES).find(cat => cat.id === categoryId);
  return category?.label || categoryId;
}

export function getSubcategoryLabel(categoryId: string, subcategoryId: string): string {
  const category = Object.values(DOCUMENT_CATEGORIES).find(cat => cat.id === categoryId);
  const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);
  return subcategory?.label || subcategoryId;
}

export function getCategoryIcon(categoryId: string): string {
  const category = Object.values(DOCUMENT_CATEGORIES).find(cat => cat.id === categoryId);
  return category?.icon || '📄';
}

export function isPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || /\.(png|jpg|jpeg|tiff)$/i.test(file.name);
}

export function validateFileSize(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Fichier trop volumineux (max ${MAX_FILE_SIZE / 1024 / 1024} Mo)`
    };
  }
  return { valid: true };
}

export function validateFileType(file: File): { valid: boolean; error?: string } {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!(ALLOWED_FILE_EXTENSIONS as readonly string[]).includes(extension)) {
    return {
      valid: false,
      error: `Format non supporté. Extensions autorisées : ${ALLOWED_FILE_EXTENSIONS.join(', ')}`
    };
  }
  return { valid: true };
}
