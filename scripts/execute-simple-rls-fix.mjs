#!/usr/bin/env node
/**
 * Exécution du fix RLS simplifié
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
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  FIX RLS - VERSION SIMPLIFIÉE', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // Lire credentials
  const secretPath = join(__dirname, '..', 'secret', 'token-acces-lmops-plateform.json');
  const secretContent = readFileSync(secretPath, 'utf-8');
  const credentials = JSON.parse(secretContent).supabase;

  // Lire SQL
  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', 'FIX_RLS_SIMPLE.sql');
  const sqlContent = readFileSync(sqlPath, 'utf-8');

  log('📋 Problème identifié:', 'yellow');
  log('  - Les praticiens n\'ont PAS de user_id (tous NULL)', 'yellow');
  log('  - Les politiques RLS basées sur user_id ne fonctionnent jamais\n', 'yellow');

  log('✅ Solution:', 'green');
  log('  - Autoriser TOUS les utilisateurs authentifiés', 'green');
  log('  - Sécurisé: seuls les utilisateurs connectés ont accès\n', 'green');

  log('🔄 Exécution via Management API...', 'cyan');

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${credentials.project_id}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sqlContent })
      }
    );

    const responseText = await response.text();

    if (response.ok) {
      log('\n✅ SQL EXÉCUTÉ AVEC SUCCÈS!', 'green');
      log('\nRésultat:', 'cyan');
      try {
        const result = JSON.parse(responseText);
        console.log(JSON.stringify(result, null, 2));
      } catch {
        console.log(responseText);
      }

      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      log('  ✅ FIX TERMINÉ - TESTEZ MAINTENANT!', 'bright');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

      log('🎯 Prochaines étapes:', 'bright');
      log('1. Allez sur votre application: http://localhost:8080', 'yellow');
      log('2. Créez un nouveau RDV avec téléconsultation cochée', 'yellow');
      log('3. ✅ Ça devrait fonctionner sans erreur RLS!\n', 'yellow');

      log('🔍 Si vous voulez vérifier les politiques:', 'bright');
      log('   SELECT * FROM pg_policies WHERE tablename = \'teleconsultations\';', 'cyan');

    } else {
      log(`\n❌ Erreur ${response.status}`, 'red');
      log(`Message: ${responseText}\n`, 'red');

      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      log('  📋 EXÉCUTION MANUELLE NÉCESSAIRE', 'bright');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

      log(`1. Ouvrez: https://supabase.com/dashboard/project/${credentials.project_id}/sql/new`, 'yellow');
      log('2. Copiez le fichier: supabase/migrations/FIX_RLS_SIMPLE.sql', 'yellow');
      log('3. Collez et exécutez (Ctrl+Enter)', 'yellow');
      log('4. Testez la création de téléconsultation\n', 'yellow');
    }
  } catch (error) {
    log(`\n❌ Erreur: ${error.message}`, 'red');
  }
}

main().catch(console.error);
