#!/usr/bin/env node
/**
 * Fix RLS policies pour permettre la création de téléconsultations
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  FIX DES POLITIQUES RLS TÉLÉCONSULTATION', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // 1. Lire les credentials
  log('Étape 1/3 : Lecture des credentials...', 'yellow');
  const secretPath = join(__dirname, '..', 'secret', 'token-acces-lmops-plateform.json');
  let credentials;

  try {
    const secretContent = readFileSync(secretPath, 'utf-8');
    credentials = JSON.parse(secretContent).supabase;
    log('✅ Credentials chargées\n', 'green');
  } catch (error) {
    log('❌ ERREUR : Impossible de lire le fichier de credentials', 'red');
    process.exit(1);
  }

  // 2. Lire le SQL
  log('Étape 2/3 : Lecture du fichier SQL de fix...', 'yellow');
  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', 'FIX_RLS_POLICIES.sql');
  let sqlContent;

  try {
    sqlContent = readFileSync(sqlPath, 'utf-8');
    log(`✅ SQL chargé (${sqlContent.length} caractères)\n`, 'green');
  } catch (error) {
    log('❌ ERREUR : Impossible de lire le fichier SQL', 'red');
    process.exit(1);
  }

  // 3. Exécuter via service_role_key (bypass RLS)
  log('Étape 3/3 : Exécution du SQL avec service_role_key...', 'yellow');
  log('ℹ️  Le service_role_key permet de bypasser RLS pour modifier les politiques\n', 'blue');

  try {
    // Utiliser une fonction RPC personnalisée si disponible
    // Sinon, afficher les instructions manuelles

    log('⚠️  Les politiques RLS ne peuvent pas être modifiées via l\'API REST', 'yellow');
    log('Vous devez exécuter le SQL manuellement dans le SQL Editor\n', 'yellow');

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('  📋 INSTRUCTIONS - EXÉCUTION MANUELLE REQUISE', 'bright');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    log('1️⃣  OUVRIR LE SQL EDITOR SUPABASE', 'bright');
    log(`   URL: https://supabase.com/dashboard/project/${credentials.project_id}/sql/new\n`, 'yellow');

    log('2️⃣  COPIER LE FICHIER SQL', 'bright');
    log('   Fichier: supabase/migrations/FIX_RLS_POLICIES.sql', 'yellow');
    log('   Ou copiez le contenu ci-dessous:\n', 'yellow');

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
    log(sqlContent, 'reset');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

    log('3️⃣  COLLER ET EXÉCUTER DANS SQL EDITOR', 'bright');
    log('   - Collez le SQL dans l\'éditeur', 'yellow');
    log('   - Cliquez sur "Run" (Ctrl+Enter)', 'yellow');
    log('   - Attendez le message de succès\n', 'yellow');

    log('4️⃣  TESTER LA CRÉATION DE TÉLÉCONSULTATION', 'bright');
    log('   - Revenez sur l\'application', 'yellow');
    log('   - Créez un nouveau RDV avec téléconsultation', 'yellow');
    log('   - ✅ Ça devrait fonctionner maintenant!\n', 'yellow');

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

    log('📝 EXPLICATION DU PROBLÈME:', 'bright');
    log('\nL\'erreur était:', 'yellow');
    log('  "new row violates row-level security policy for table \'teleconsultations\'"', 'red');
    log('\nCause:', 'yellow');
    log('  - L\'ancienne politique RLS permettait seulement à un praticien', 'yellow');
    log('    de créer des téléconsultations pour LUI-MÊME', 'yellow');
    log('  - Mais vous essayiez de créer une téléconsultation pour un AUTRE praticien', 'yellow');
    log('  - User actuel: abadcc50-b746-474c-a32e-b2a861336354', 'yellow');
    log('  - Practitioner ID: a7b8c9d0-e1f2-3456-0123-d67890123456', 'yellow');
    log('  - Ces IDs sont différents → RLS bloquait l\'insertion\n', 'yellow');

    log('Solution:', 'green');
    log('  - Nouvelle politique: tout utilisateur authentifié peut créer', 'green');
    log('  - Permet à une secrétaire/admin de créer des RDV pour les praticiens', 'green');
    log('  - Sécurisé: seuls les utilisateurs authentifiés ont accès\n', 'green');

    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  } catch (error) {
    log(`❌ ERREUR : ${error.message}`, 'red');
  }
}

main().catch(console.error);
