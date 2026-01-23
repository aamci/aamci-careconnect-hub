#!/usr/bin/env node
/**
 * Tentative d'exécution automatique du fix RLS via Management API
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
  log('  EXÉCUTION AUTOMATIQUE DU FIX RLS', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  // Lire les credentials
  const secretPath = join(__dirname, '..', 'secret', 'token-acces-lmops-plateform.json');
  const secretContent = readFileSync(secretPath, 'utf-8');
  const credentials = JSON.parse(secretContent).supabase;

  // Lire le SQL
  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', 'FIX_RLS_POLICIES.sql');
  const sqlContent = readFileSync(sqlPath, 'utf-8');

  log('🔄 Tentative d\'exécution via Management API...', 'yellow');

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
      log('✅ SQL exécuté avec succès via Management API!', 'green');
      console.log('Réponse:', responseText);

      log('\n🔍 Vérification des nouvelles politiques...', 'blue');
      await verifyPolicies(credentials);

      log('\n✅ FIX TERMINÉ!', 'green');
      log('Vous pouvez maintenant créer des téléconsultations sans erreur RLS.', 'green');

    } else {
      log(`⚠️  Management API réponse: ${response.status}`, 'yellow');
      log(`Message: ${responseText}`, 'yellow');

      // Si erreur, afficher les instructions manuelles
      log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      log('  📋 EXÉCUTION MANUELLE NÉCESSAIRE', 'bright');
      log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
      log(`1. Ouvrez: https://supabase.com/dashboard/project/${credentials.project_id}/sql/new`, 'yellow');
      log('2. Copiez le fichier: supabase/migrations/FIX_RLS_POLICIES.sql', 'yellow');
      log('3. Collez et exécutez dans SQL Editor', 'yellow');
      log('4. Testez la création de téléconsultation\n', 'yellow');
    }
  } catch (error) {
    log(`❌ Erreur: ${error.message}`, 'red');
    log('\nExécution manuelle requise (voir instructions ci-dessus)', 'yellow');
  }
}

async function verifyPolicies(credentials) {
  const checkQuery = `
    SELECT
      schemaname,
      tablename,
      policyname,
      cmd as command,
      qual as using_expression
    FROM pg_policies
    WHERE tablename = 'teleconsultations'
    ORDER BY policyname;
  `;

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${credentials.project_id}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: checkQuery })
      }
    );

    if (response.ok) {
      const result = await response.json();
      log('Politiques actuelles sur teleconsultations:', 'green');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    log('Impossible de vérifier les politiques automatiquement', 'yellow');
  }
}

main().catch(console.error);
