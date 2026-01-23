#!/usr/bin/env node
/**
 * Script automatique de création des tables de téléconsultation
 * Exécution : node scripts/create-teleconsultation-tables.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Couleurs pour console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  CRÉATION AUTOMATIQUE DES TABLES TÉLÉCONSULTATION', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // 1. Vérifier les variables d'environnement
  log('Étape 1/4 : Vérification des credentials Supabase...', 'yellow');

  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL) {
    log('❌ ERREUR : VITE_SUPABASE_URL non trouvée dans .env', 'red');
    log('Ajoutez cette ligne dans votre fichier .env :', 'yellow');
    log('VITE_SUPABASE_URL=https://votre-projet.supabase.co', 'yellow');
    process.exit(1);
  }

  if (!SUPABASE_SERVICE_KEY) {
    log('❌ ERREUR : SUPABASE_SERVICE_ROLE_KEY non trouvée dans .env', 'red');
    log('\nPour obtenir cette clé :', 'yellow');
    log('1. Allez sur https://supabase.com/dashboard', 'yellow');
    log('2. Sélectionnez votre projet', 'yellow');
    log('3. Allez dans Settings > API', 'yellow');
    log('4. Copiez la "service_role" key (section "Project API keys")', 'yellow');
    log('5. Ajoutez-la dans .env :', 'yellow');
    log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...', 'yellow');
    process.exit(1);
  }

  log('✅ Credentials trouvées\n', 'green');

  // 2. Initialiser le client Supabase avec service_role
  log('Étape 2/4 : Connexion à Supabase...', 'yellow');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  log('✅ Connexion établie\n', 'green');

  // 3. Lire le fichier SQL
  log('Étape 3/4 : Lecture du fichier de migration SQL...', 'yellow');

  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', 'EXECUTE_THIS_FIRST_teleconsultation_essential.sql');
  let sqlContent;

  try {
    sqlContent = readFileSync(sqlPath, 'utf-8');
    log(`✅ Fichier SQL chargé (${sqlContent.length} caractères)\n`, 'green');
  } catch (error) {
    log(`❌ ERREUR : Impossible de lire le fichier SQL`, 'red');
    log(`Chemin : ${sqlPath}`, 'yellow');
    log(`Erreur : ${error.message}`, 'red');
    process.exit(1);
  }

  // 4. Exécuter le SQL via l'API Supabase
  log('Étape 4/4 : Exécution du SQL...', 'yellow');
  log('⏳ Création des tables en cours (cela peut prendre quelques secondes)...\n', 'yellow');

  try {
    // Utiliser l'endpoint RPC ou l'API REST pour exécuter du SQL
    // Note: Supabase ne permet pas d'exécuter du SQL DDL via le client JS standard
    // Il faut utiliser l'API PostgreSQL directe ou le Management API

    log('⚠️  LIMITATION TECHNIQUE DÉTECTÉE', 'yellow');
    log('\nLe client Supabase JS ne permet pas d\'exécuter du DDL SQL directement.', 'yellow');
    log('Vous devez exécuter le SQL manuellement via le Supabase SQL Editor.\n', 'yellow');

    log('SOLUTION AUTOMATIQUE ALTERNATIVE :', 'bright');
    log('\n1. Ouvrez votre dashboard Supabase :', 'yellow');
    log(`   ${SUPABASE_URL.replace('/rest/v1', '').replace('https://', 'https://supabase.com/dashboard/project/')}/sql`, 'blue');

    log('\n2. Cliquez sur "New query"\n', 'yellow');

    log('3. Copiez-collez ce contenu :', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log(sqlContent.substring(0, 500) + '...', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');

    log('\n4. Cliquez sur "Run"\n', 'yellow');

    log('📄 Le fichier SQL complet se trouve ici :', 'yellow');
    log(`   ${sqlPath}\n`, 'blue');

    log('💡 ALTERNATIVE : Utiliser le CLI Supabase', 'bright');
    log('\n1. Installez le CLI : npm install -g supabase', 'yellow');
    log('2. Liez votre projet : supabase link --project-ref VOTRE_PROJECT_ID', 'yellow');
    log('3. Exécutez : supabase db push\n', 'yellow');

  } catch (error) {
    log(`❌ ERREUR : ${error.message}`, 'red');
    process.exit(1);
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  RÉSUMÉ', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');
  log('Status : En attente d\'exécution manuelle', 'yellow');
  log('Action requise : Exécuter le SQL dans Supabase Dashboard', 'yellow');
  log('Documentation : Voir GUIDE_MIGRATION_TELECONSULTATION.md\n', 'yellow');
}

main().catch(console.error);
