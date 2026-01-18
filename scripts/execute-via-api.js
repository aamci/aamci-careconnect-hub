#!/usr/bin/env node
/**
 * Execute SQL Migration via Supabase Management API
 * Uses the access_token for authentication
 *
 * SECURITY:
 * - Reads credentials from secret file (gitignored)
 * - Never logs sensitive tokens
 * - Uses HTTPS for all API calls
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Read secrets from file
const secretsPath = path.join(projectRoot, 'secret', 'token-acces-lmops-plateform.json');
const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

const PROJECT_REF = secrets.supabase.project_id;
const ACCESS_TOKEN = secrets.supabase.access_token;
const SERVICE_ROLE_KEY = secrets.supabase.service_role_key;
const SUPABASE_URL = secrets.supabase.url;

// Migrations to execute
const MIGRATIONS = [
  '20260118_medical_history_tables.sql',
  '20260118_rls_security_hardening.sql',
];

async function executeSQL(sql, description) {
  console.log(`\nExecuting: ${description}`);
  console.log('-'.repeat(60));

  // Use the Supabase REST API with service_role_key to execute SQL via RPC
  // We'll use the postgres extension's query function if available
  // Or we can use the Management API

  try {
    // Try Management API first
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log(`SUCCESS: ${description}`);
    return result;
  } catch (err) {
    console.error(`FAILED: ${description}`);
    console.error(`Error: ${err.message}`);
    throw err;
  }
}

async function executeMigration() {
  console.log('');
  console.log('='.repeat(60));
  console.log('SUPABASE MIGRATION VIA MANAGEMENT API');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Project: ${PROJECT_REF}`);
  console.log(`URL: ${SUPABASE_URL}`);
  console.log('Token: ********** (hidden)');
  console.log('');

  for (const migrationFile of MIGRATIONS) {
    const migrationPath = path.join(projectRoot, 'supabase', 'migrations', migrationFile);

    if (!fs.existsSync(migrationPath)) {
      console.log(`WARNING: Migration file not found: ${migrationFile}`);
      continue;
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');

    try {
      await executeSQL(sql, migrationFile);
    } catch (err) {
      console.error(`\nMIGRATION FAILED: ${migrationFile}`);
      process.exit(1);
    }
  }

  console.log('');
  console.log('='.repeat(60));
  console.log('ALL MIGRATIONS COMPLETED!');
  console.log('='.repeat(60));
}

// Alternative: Use Supabase SQL endpoint with service_role_key
async function executeSQLViaRest(sql, description) {
  console.log(`\nExecuting via REST: ${description}`);

  // Split SQL into individual statements and execute them
  // This is a workaround since the REST API doesn't support raw SQL
  // We'll use the pg_execute RPC function if available

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/pg_execute`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.log(`REST API returned: ${response.status}`);
    // This is expected to fail as pg_execute doesn't exist by default
    return false;
  }

  return true;
}

// Run
executeMigration().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
