#!/usr/bin/env node
/**
 * Vérifier la structure des tables practitioners et patients
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  // Lire credentials
  const secretPath = join(__dirname, '..', 'secret', 'token-acces-lmops-plateform.json');
  const secretContent = readFileSync(secretPath, 'utf-8');
  const credentials = JSON.parse(secretContent).supabase;

  log('\nVérification de la structure des tables:', 'cyan');

  // Vérifier la structure de practitioners
  log('\n1. Table PRACTITIONERS:', 'yellow');
  const checkPractitionersQuery = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'practitioners'
    ORDER BY ordinal_position;
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
        body: JSON.stringify({ query: checkPractitionersQuery })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(JSON.stringify(result, null, 2));
    } else {
      log('Erreur lors de la récupération de la structure practitioners', 'red');
    }
  } catch (err) {
    log(`Erreur: ${err.message}`, 'red');
  }

  // Vérifier la structure de patients
  log('\n2. Table PATIENTS:', 'yellow');
  const checkPatientsQuery = `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'patients'
    ORDER BY ordinal_position;
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
        body: JSON.stringify({ query: checkPatientsQuery })
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(JSON.stringify(result, null, 2));
    } else {
      log('Erreur lors de la récupération de la structure patients', 'red');
    }
  } catch (err) {
    log(`Erreur: ${err.message}`, 'red');
  }

  // Vérifier un praticien existant
  log('\n3. Exemple de praticien:', 'yellow');
  try {
    const response = await fetch(
      `${credentials.url}/rest/v1/practitioners?select=*&limit=1`,
      {
        headers: {
          'apikey': credentials.service_role_key,
          'Authorization': `Bearer ${credentials.service_role_key}`
        }
      }
    );

    if (response.ok) {
      const result = await response.json();
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    log(`Erreur: ${err.message}`, 'red');
  }
}

main().catch(console.error);
