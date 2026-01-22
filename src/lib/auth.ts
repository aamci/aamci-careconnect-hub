/**
 * Utilitaires d'authentification
 * Wrappers autour du client Supabase pour la gestion de l'utilisateur courant
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Récupère l'utilisateur actuellement connecté
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Erreur récupération utilisateur:', error);
    return null;
  }

  return user;
}

/**
 * Vérifie si l'utilisateur est authentifié
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Récupère l'ID de l'utilisateur courant
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}
