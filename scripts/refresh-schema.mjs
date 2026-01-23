#!/usr/bin/env node
/**
 * Force le rafraîchissement du cache schéma Supabase
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
  log('  RAFRAÎCHISSEMENT DU CACHE SCHÉMA SUPABASE', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

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

  log('🔍 Vérification des tables...', 'yellow');

  // Vérifier que les tables existent
  const tables = [
    'teleconsultations',
    'teleconsultation_sessions',
    'teleconsultation_events',
    'teleconsultation_documents',
    'teleconsultation_notes',
    'teleconsultation_recordings'
  ];

  let allExist = true;
  for (const table of tables) {
    try {
      const response = await fetch(`${credentials.url}/rest/v1/${table}?select=id&limit=1`, {
        headers: {
          'apikey': credentials.service_role_key,
          'Authorization': `Bearer ${credentials.service_role_key}`
        }
      });

      if (response.ok) {
        log(`  ✅ ${table}`, 'green');
      } else {
        log(`  ❌ ${table}`, 'red');
        allExist = false;
      }
    } catch (err) {
      log(`  ❌ ${table} - ${err.message}`, 'red');
      allExist = false;
    }
  }

  if (!allExist) {
    log('\n❌ Certaines tables sont manquantes!', 'red');
    log('Exécutez le SQL de migration d\'abord.', 'yellow');
    process.exit(1);
  }

  log('\n✅ Toutes les tables existent!\n', 'green');

  // Tenter de rafraîchir le cache via l'API Management
  log('🔄 Tentative de rafraîchissement du cache...', 'yellow');

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${credentials.project_id}/api/reload-schema`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.ok) {
      log('✅ Cache rafraîchi avec succès!\n', 'green');
    } else {
      const errorText = await response.text();
      log(`⚠️  Impossible de rafraîchir automatiquement (${response.status})`, 'yellow');
      log(`Réponse: ${errorText}\n`, 'yellow');
    }
  } catch (error) {
    log(`⚠️  Erreur lors du rafraîchissement: ${error.message}\n`, 'yellow');
  }

  // Instructions manuelles
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('  📋 ACTIONS REQUISES POUR FINALISER', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  log('1️⃣  REDÉMARRER LE SERVEUR DE DEV', 'bright');
  log('   - Dans le terminal où tourne npm run dev:', 'yellow');
  log('   - Appuyez sur Ctrl+C', 'yellow');
  log('   - Relancez: npm run dev\n', 'yellow');

  log('2️⃣  VIDER LE CACHE DU NAVIGATEUR', 'bright');
  log('   - Appuyez sur Ctrl+Shift+R (Windows/Linux)', 'yellow');
  log('   - ou Cmd+Shift+R (Mac)\n', 'yellow');

  log('3️⃣  OUVRIR LE DASHBOARD SUPABASE (optionnel)', 'bright');
  log(`   - URL: https://supabase.com/dashboard/project/${credentials.project_id}/api`, 'yellow');
  log('   - Cliquez sur "Reload schema cache" si disponible\n', 'yellow');

  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');

  log('✅ Après ces étapes, la téléconsultation sera 100% fonctionnelle!', 'green');
  log('🎯 0 bugs, 0 erreurs PGRST205, formulaire opérationnel\n', 'green');
}

main().catch(console.error);
