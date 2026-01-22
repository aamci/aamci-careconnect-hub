/**
 * Client Supabase pour le frontend
 * Configuration centralisée avec authentification
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL manquante dans les variables d\'environnement');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY manquante dans les variables d\'environnement');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

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
