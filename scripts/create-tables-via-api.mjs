#!/usr/bin/env node
/**
 * Création des tables via l'API Management de Supabase
 * Utilise l'access token pour exécuter le SQL
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  CRÉATION DES TABLES VIA API SUPABASE', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

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
  log('Étape 2/3 : Lecture du fichier SQL...', 'yellow');
  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', 'EXECUTE_THIS_FIRST_teleconsultation_essential.sql');
  let sqlContent;

  try {
    sqlContent = readFileSync(sqlPath, 'utf-8');
    log(`✅ SQL chargé (${sqlContent.length} caractères)\n`, 'green');
  } catch (error) {
    log('❌ ERREUR : Impossible de lire le fichier SQL', 'red');
    process.exit(1);
  }

  // 3. Exécuter via l'API SQL de Supabase (edge function alternative)
  log('Étape 3/3 : Exécution du SQL via service_role_key...', 'yellow');

  try {
    // Utiliser l'endpoint RPC pour exécuter du SQL brut
    // On va essayer d'utiliser l'API REST directement avec le service_role_key
    const response = await fetch(`${credentials.url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': credentials.service_role_key,
        'Authorization': `Bearer ${credentials.service_role_key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        sql: sqlContent
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      // Si la fonction n'existe pas, essayons une approche différente
      if (errorText.includes('Could not find') || errorText.includes('PGRST202')) {
        log('⚠️  La fonction RPC exec_sql n\'existe pas.', 'yellow');
        log('\n📌 SOLUTION ALTERNATIVE : Utilisation de SQL Editor manuel', 'bright');
        log('\n1. Ouvrez : https://supabase.com/dashboard/project/' + credentials.project_id + '/sql/new', 'yellow');
        log('2. Copiez le fichier : supabase/migrations/EXECUTE_THIS_FIRST_teleconsultation_essential.sql', 'yellow');
        log('3. Collez et exécutez dans le SQL Editor', 'yellow');
        log('\nAlternative : Utiliser psql avec le mot de passe DB :', 'yellow');
        log('psql -h db.' + credentials.project_id + '.supabase.co -U postgres -d postgres', 'green');

        // Essayons quand même l'API Management
        log('\n🔄 Tentative via Management API...', 'blue');
        await tryManagementAPI(credentials, sqlContent);
      } else {
        log(`❌ ERREUR API : ${errorText}`, 'red');
      }
    } else {
      const result = await response.json();
      log('✅ SQL exécuté avec succès!', 'green');
      console.log(result);
    }
  } catch (error) {
    log(`❌ ERREUR : ${error.message}`, 'red');

    // Essayer l'API Management en fallback
    log('\n🔄 Tentative alternative via Management API...', 'blue');
    await tryManagementAPI(credentials, sqlContent);
  }
}

async function tryManagementAPI(credentials, sqlContent) {
  try {
    const managementUrl = `https://api.supabase.com/v1/projects/${credentials.project_id}/database/query`;

    const response = await fetch(managementUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });

    const responseText = await response.text();

    if (!response.ok) {
      log(`❌ Management API erreur (${response.status}): ${responseText}`, 'red');
      log('\n📋 SOLUTION FINALE : Exécution manuelle requise', 'bright');
      log('\nLe SQL doit être exécuté manuellement car:', 'yellow');
      log('- L\'API Management n\'exécute pas de DDL pour des raisons de sécurité', 'yellow');
      log('- La connexion PostgreSQL directe nécessite le mot de passe DB', 'yellow');
      log('- Aucune fonction RPC n\'existe pour exécuter du SQL brut', 'yellow');
      return;
    }

    log('✅ Management API : Requête acceptée', 'green');
    console.log('Réponse:', responseText);

    // Vérifier si les tables existent maintenant
    log('\n🔍 Vérification des tables créées...', 'blue');
    await verifyTables(credentials);

  } catch (error) {
    log(`❌ Management API erreur : ${error.message}`, 'red');
  }
}

async function verifyTables(credentials) {
  const tables = [
    'teleconsultations',
    'teleconsultation_sessions',
    'teleconsultation_events',
    'teleconsultation_documents',
    'teleconsultation_notes',
    'teleconsultation_recordings'
  ];

  for (const table of tables) {
    try {
      const response = await fetch(`${credentials.url}/rest/v1/${table}?limit=1`, {
        headers: {
          'apikey': credentials.service_role_key,
          'Authorization': `Bearer ${credentials.service_role_key}`
        }
      });

      if (response.ok) {
        log(`  ✅ ${table} (existe)`, 'green');
      } else {
        const error = await response.json();
        if (error.code === 'PGRST205') {
          log(`  ❌ ${table} (manquante)`, 'red');
        } else {
          log(`  ⚠️  ${table} (${error.code})`, 'yellow');
        }
      }
    } catch (err) {
      log(`  ❌ ${table} (erreur: ${err.message})`, 'red');
    }
  }
}

main().catch(console.error);
