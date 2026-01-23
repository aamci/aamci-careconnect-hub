#!/usr/bin/env node
/**
 * Script automatique d'exécution de la migration SQL
 * Utilise l'API Supabase Management pour créer les tables directement
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
  log('  CRÉATION AUTOMATIQUE DES TABLES TÉLÉCONSULTATION', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // 1. Lire les credentials
  log('Étape 1/5 : Lecture des credentials...', 'yellow');
  const secretPath = join(__dirname, '..', 'secret', 'token-acces-lmops-plateform.json');
  let credentials;

  try {
    const secretContent = readFileSync(secretPath, 'utf-8');
    credentials = JSON.parse(secretContent).supabase;
    log('✅ Credentials chargées\n', 'green');
  } catch (error) {
    log('❌ ERREUR : Impossible de lire le fichier de credentials', 'red');
    log(`Chemin : ${secretPath}`, 'yellow');
    process.exit(1);
  }

  // 2. Lire le fichier SQL
  log('Étape 2/5 : Lecture du fichier de migration SQL...', 'yellow');
  const sqlPath = join(__dirname, '..', 'supabase', 'migrations', 'EXECUTE_THIS_FIRST_teleconsultation_essential.sql');
  let sqlContent;

  try {
    sqlContent = readFileSync(sqlPath, 'utf-8');
    log(`✅ Fichier SQL chargé (${sqlContent.length} caractères)\n`, 'green');
  } catch (error) {
    log('❌ ERREUR : Impossible de lire le fichier SQL', 'red');
    log(`Chemin : ${sqlPath}`, 'yellow');
    process.exit(1);
  }

  // 3. Exécuter le SQL via l'API Supabase Management
  log('Étape 3/5 : Connexion à l\'API Supabase Management...', 'yellow');

  const managementApiUrl = `https://api.supabase.com/v1/projects/${credentials.project_id}/database/query`;

  try {
    log('⏳ Envoi de la requête SQL à Supabase...', 'yellow');

    const response = await fetch(managementApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${credentials.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });

    log('Étape 4/5 : Traitement de la réponse...', 'yellow');

    if (!response.ok) {
      const errorText = await response.text();
      log(`❌ ERREUR HTTP ${response.status}`, 'red');
      log(`Réponse : ${errorText}`, 'yellow');

      // Si l'API Management ne fonctionne pas, utiliser le service_role directement
      log('\n⚠️  API Management non disponible, tentative avec service_role...', 'yellow');
      await executeSqlWithServiceRole(credentials, sqlContent);
      return;
    }

    const result = await response.json();
    log('✅ SQL exécuté avec succès!\n', 'green');

    // 4. Vérifier que les tables existent
    log('Étape 5/5 : Vérification des tables créées...', 'yellow');
    await verifyTables(credentials);

  } catch (error) {
    log(`❌ ERREUR : ${error.message}`, 'red');
    log('\n⚠️  Tentative alternative avec service_role...', 'yellow');
    await executeSqlWithServiceRole(credentials, sqlContent);
  }
}

async function executeSqlWithServiceRole(credentials, sqlContent) {
  log('\n🔄 Exécution via service_role directement...', 'blue');

  // Utiliser l'API REST Supabase avec service_role pour exécuter des requêtes
  // Note: Nous devons exécuter le SQL en plusieurs parties car l'API REST ne supporte pas DDL directement

  log('⚠️  L\'API REST Supabase ne supporte pas l\'exécution directe de DDL SQL', 'yellow');
  log('📋 Création d\'un fichier SQL temporaire pour exécution manuelle...', 'yellow');

  // Créer un fichier SQL dans le répertoire de migration avec timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const outputPath = join(__dirname, '..', 'supabase', 'migrations', `_READY_TO_EXECUTE_${timestamp}.sql`);

  try {
    const { writeFileSync } = await import('fs');
    writeFileSync(outputPath, sqlContent, 'utf-8');
    log(`✅ Fichier SQL préparé : ${outputPath}`, 'green');
    log('\n📌 ACTIONS REQUISES :', 'bright');
    log('1. Ouvrez Supabase Dashboard : https://supabase.com/dashboard/project/' + credentials.project_id, 'yellow');
    log('2. Allez dans SQL Editor', 'yellow');
    log('3. Cliquez sur "New query"', 'yellow');
    log(`4. Copiez le contenu du fichier : ${outputPath}`, 'yellow');
    log('5. Collez et exécutez le SQL', 'yellow');
  } catch (error) {
    log(`❌ ERREUR : ${error.message}`, 'red');
  }
}

async function verifyTables(credentials) {
  const requiredTables = [
    'teleconsultations',
    'teleconsultation_sessions',
    'teleconsultation_events',
    'teleconsultation_documents',
    'teleconsultation_notes',
    'teleconsultation_recordings',
  ];

  log('\nVérification des tables créées:', 'blue');

  for (const tableName of requiredTables) {
    try {
      const response = await fetch(
        `${credentials.url}/rest/v1/${tableName}?select=id&limit=1`,
        {
          headers: {
            'apikey': credentials.service_role_key,
            'Authorization': `Bearer ${credentials.service_role_key}`,
          }
        }
      );

      if (response.ok || response.status === 406) { // 406 = Not Acceptable (table exists but no data)
        log(`  ✅ ${tableName}`, 'green');
      } else {
        const error = await response.json();
        if (error.code === 'PGRST205') {
          log(`  ❌ ${tableName} (manquante)`, 'red');
        } else {
          log(`  ⚠️  ${tableName} (statut: ${response.status})`, 'yellow');
        }
      }
    } catch (error) {
      log(`  ❌ ${tableName} (erreur: ${error.message})`, 'red');
    }
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  RÉSUMÉ', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');
}

main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
