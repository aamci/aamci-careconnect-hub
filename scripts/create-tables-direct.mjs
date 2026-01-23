#!/usr/bin/env node
/**
 * Création directe des tables via connexion PostgreSQL
 * Utilise pg (PostgreSQL client) pour exécuter le DDL SQL
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pg from 'pg';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Couleurs console
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
  log('  CRÉATION DIRECTE DES TABLES VIA POSTGRESQL', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // 1. Lire les credentials
  log('Étape 1/4 : Lecture des credentials...', 'yellow');
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

  // 2. Construire la connection string PostgreSQL
  // Format: postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
  const projectRef = credentials.project_id;

  // La connection string avec service_role en tant que password ne fonctionne pas
  // On doit utiliser le mot de passe de la base de données

  log('⚠️  Pour une connexion PostgreSQL directe, le mot de passe DB est requis', 'yellow');
  log('\n📋 Alternatives :', 'bright');
  log('1. Obtenir le mot de passe DB depuis Supabase Dashboard > Settings > Database', 'yellow');
  log('2. Utiliser l\'API Supabase pour créer une fonction RPC qui exécute le SQL', 'yellow');
  log('3. Exécuter le SQL manuellement dans le SQL Editor\n', 'yellow');

  // Option alternative : créer les tables via l'API REST en utilisant des fonctions RPC
  log('🔄 Tentative de création via fonction RPC...', 'blue');
  await createTablesViaRPC(credentials);
}

async function createTablesViaRPC(credentials) {
  // Lire le SQL
  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', 'EXECUTE_THIS_FIRST_teleconsultation_essential.sql');
  const sqlContent = readFileSync(sqlPath, 'utf-8');

  log('\n📝 Création d\'une fonction RPC temporaire pour exécuter le SQL...', 'yellow');

  // Créer une fonction SQL qui exécute notre migration
  const createFunctionSQL = `
-- Fonction temporaire pour exécuter la migration
CREATE OR REPLACE FUNCTION execute_teleconsultation_migration()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  ${sqlContent}
  RETURN 'Migration exécutée avec succès';
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'ERREUR: ' || SQLERRM;
END;
$$;
`;

  try {
    // 1. Créer la fonction RPC
    const createResponse = await fetch(`${credentials.url}/rest/v1/rpc/execute_teleconsultation_migration`, {
      method: 'POST',
      headers: {
        'apikey': credentials.service_role_key,
        'Authorization': `Bearer ${credentials.service_role_key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({})
    });

    if (!createResponse.ok) {
      log('❌ La fonction RPC n\'existe pas encore. Création nécessaire...', 'red');
      log('\n📌 SOLUTION FINALE :', 'bright');
      log('\n1. Ouvrez : https://supabase.com/dashboard/project/' + credentials.project_id + '/sql/new', 'yellow');
      log('2. Copiez le fichier : supabase/migrations/EXECUTE_THIS_FIRST_teleconsultation_essential.sql', 'yellow');
      log('3. Collez et exécutez dans le SQL Editor', 'yellow');
      log('\nOU utilisez la commande CLI:', 'yellow');
      log('supabase db push', 'green');
    } else {
      const result = await createResponse.json();
      log('✅ ' + result, 'green');
    }

  } catch (error) {
    log(`❌ ERREUR : ${error.message}`, 'red');
  }
}

main().catch(console.error);
