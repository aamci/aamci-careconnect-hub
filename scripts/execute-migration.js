#!/usr/bin/env node
/**
 * Secure Migration Executor
 * Executes SQL migrations against Supabase PostgreSQL
 *
 * SECURITY:
 * - Reads credentials from .env.local (gitignored)
 * - Never logs or exposes database password
 * - Uses SSL/TLS connection
 *
 * Usage: node scripts/execute-migration.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Load environment variables from .env.local
dotenv.config({ path: path.join(projectRoot, '.env.local') });
dotenv.config({ path: path.join(projectRoot, '.env') });

// Configuration
const PROJECT_REF = 'pjtbjeqyrbtsygemwcmg';
const DB_HOST = `db.${PROJECT_REF}.supabase.co`;
const DB_PORT = 5432;
const DB_NAME = 'postgres';
const DB_USER = 'postgres';

// Get password from environment (NEVER log this)
const DB_PASSWORD = process.env.SUPABASE_DB_PASSWORD;

if (!DB_PASSWORD || DB_PASSWORD === 'REMPLACEZ_PAR_VOTRE_MOT_DE_PASSE_ICI') {
  console.error('');
  console.error('ERROR: Database password not configured!');
  console.error('');
  console.error('Please edit .env.local and set SUPABASE_DB_PASSWORD');
  console.error('');
  console.error('You can find your password at:');
  console.error('Supabase Dashboard > Project Settings > Database > Connection string');
  console.error('');
  process.exit(1);
}

// Migrations to execute
const MIGRATIONS = [
  '20260118_medical_history_tables.sql',
  '20260118_rls_security_hardening.sql',
];

async function executeMigration() {
  console.log('');
  console.log('='.repeat(60));
  console.log('SUPABASE MIGRATION EXECUTOR');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Host: ${DB_HOST}`);
  console.log(`Database: ${DB_NAME}`);
  console.log(`User: ${DB_USER}`);
  console.log('Password: ********** (hidden)');
  console.log('');

  // Create PostgreSQL client with SSL
  const client = new pg.Client({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false, // Supabase uses self-signed certs
    },
  });

  try {
    console.log('Connecting to Supabase PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!');
    console.log('');

    // Execute each migration
    for (const migrationFile of MIGRATIONS) {
      const migrationPath = path.join(projectRoot, 'supabase', 'migrations', migrationFile);

      if (!fs.existsSync(migrationPath)) {
        console.log(`WARNING: Migration file not found: ${migrationFile}`);
        continue;
      }

      console.log(`Executing: ${migrationFile}`);
      console.log('-'.repeat(60));

      const sql = fs.readFileSync(migrationPath, 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`SUCCESS: ${migrationFile}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`FAILED: ${migrationFile}`);
        console.error(`Error: ${err.message}`);
        throw err;
      }

      console.log('');
    }

    console.log('='.repeat(60));
    console.log('ALL MIGRATIONS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('');

    // Verify tables were created
    console.log('Verifying created tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'patient_%'
      ORDER BY table_name;
    `);

    console.log('');
    console.log('Patient-related tables in database:');
    for (const row of result.rows) {
      console.log(`  - ${row.table_name}`);
    }
    console.log('');

  } catch (err) {
    console.error('');
    console.error('MIGRATION FAILED!');
    console.error(err.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run
executeMigration().catch(console.error);
