#!/usr/bin/env node
/**
 * Vérification de l'existence des tables de téléconsultation
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
  log('  VÉRIFICATION DES TABLES TÉLÉCONSULTATION', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // Lire les credentials
  const secretPath = join(__dirname, '..', 'secret', 'token-acces-lmops-plateform.json');
  let credentials;

  try {
    const secretContent = readFileSync(secretPath, 'utf-8');
    credentials = JSON.parse(secretContent).supabase;
  } catch (error) {
    log('❌ ERREUR : Impossible de lire le fichier de credentials', 'red');
    process.exit(1);
  }

  const tables = [
    'teleconsultations',
    'teleconsultation_sessions',
    'teleconsultation_events',
    'teleconsultation_documents',
    'teleconsultation_notes',
    'teleconsultation_recordings'
  ];

  log('Vérification avec service_role_key (admin):\n', 'yellow');

  let allExist = true;

  for (const table of tables) {
    try {
      const response = await fetch(`${credentials.url}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
          'apikey': credentials.service_role_key,
          'Authorization': `Bearer ${credentials.service_role_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        log(`  ✅ ${table.padEnd(35)} → EXISTE`, 'green');
      } else {
        const error = await response.json();
        log(`  ❌ ${table.padEnd(35)} → ${error.code || 'ERREUR'}: ${error.message || 'inconnu'}`, 'red');
        allExist = false;
      }
    } catch (err) {
      log(`  ❌ ${table.padEnd(35)} → ERREUR: ${err.message}`, 'red');
      allExist = false;
    }
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  if (allExist) {
    log('✅ TOUTES LES TABLES EXISTENT!', 'green');
    log('\nLe problème PGRST205 peut être dû à:', 'yellow');
    log('  1. Un cache qui doit être rafraîchi', 'yellow');
    log('  2. Un problème de permissions RLS', 'yellow');
    log('  3. Un problème avec l\'anon_key vs service_role_key', 'yellow');
    log('\nSolution: Redémarrer l\'application et vider le cache navigateur', 'green');
  } else {
    log('❌ Certaines tables sont manquantes', 'red');
  }
}

main().catch(console.error);
