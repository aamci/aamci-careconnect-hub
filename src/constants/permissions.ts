/**
 * Système de contrôle d'accès basé sur les rôles (RBAC)
 * Définition des permissions par rôle utilisateur
 */

export interface DocumentPermissions {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  sign: boolean;
  share: boolean;
  print: boolean;
  download: boolean;
}

export type UserRole = 'doctor' | 'nurse' | 'secretary' | 'patient' | 'admin';

export const ROLE_PERMISSIONS: Record<UserRole, DocumentPermissions> = {
  doctor: {
    view: true,
    create: true,
    update: true,
    delete: true,
    sign: true,
    share: true,
    print: true,
    download: true
  },

  nurse: {
    view: true,
    create: true,
    update: true,
    delete: false,
    sign: false,
    share: false,
    print: true,
    download: false
  },

  secretary: {
    view: true,
    create: true,
    update: true,
    delete: false,
    sign: false,
    share: false,
    print: true,
    download: false
  },

  patient: {
    view: true,
    create: false,
    update: false,
    delete: false,
    sign: false,
    share: false,
    print: true,
    download: true
  },

  admin: {
    view: true,
    create: true,
    update: true,
    delete: true,
    sign: true,
    share: true,
    print: true,
    download: true
  }
};

export interface User {
  id: string;
  role: UserRole;
  permissions: string[];
}

export interface Consultation {
  id: string;
  status: 'in_progress' | 'completed' | 'canceled';
  patientId: string;
  practitionerId: string;
}

export function canDeleteDocument(
  user: User,
  document: { createdBy: string; consultationId?: string },
  consultation?: Consultation
): boolean {
  if (!ROLE_PERMISSIONS[user.role].delete) {
    return false;
  }

  if (
    consultation &&
    consultation.status === 'in_progress' &&
    document.consultationId === consultation.id &&
    document.createdBy === user.id
  ) {
    return true;
  }

  if (user.permissions.includes('delete_any_document')) {
    return true;
  }

  return false;
}

export function canSignDocument(user: User): boolean {
  return ROLE_PERMISSIONS[user.role].sign;
}

export function canShareDocument(user: User): boolean {
  return ROLE_PERMISSIONS[user.role].share;
}

export function canViewDocument(
  user: User,
  document: { patientId: string; visibility: string; restrictedToRoles?: string[] }
): boolean {
  if (!ROLE_PERMISSIONS[user.role].view) {
    return false;
  }

  if (document.visibility === 'public') {
    return true;
  }

  if (document.visibility === 'restricted' && document.restrictedToRoles) {
    return document.restrictedToRoles.includes(user.role);
  }

  return user.permissions.includes('view_any_document');
}
