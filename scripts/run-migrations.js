#!/usr/bin/env node
/**
 * Migration Runner Script
 * Outputs combined SQL for Supabase Dashboard execution
 *
 * Usage: node scripts/run-migrations.js > combined-migration.sql
 * Then paste the output in Supabase Dashboard > SQL Editor
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');

// Migrations to run (in order)
const MIGRATIONS = [
  '20260118_medical_history_tables.sql',
  '20260118_rls_security_hardening.sql',
];

console.log('-- ============================================');
console.log('-- COMBINED MIGRATION SCRIPT');
console.log('-- Generated: ' + new Date().toISOString());
console.log('-- ============================================');
console.log('-- Run this in Supabase Dashboard > SQL Editor');
console.log('-- ============================================');
console.log('');
console.log('BEGIN;');
console.log('');

for (const migration of MIGRATIONS) {
  const filePath = path.join(MIGRATIONS_DIR, migration);

  if (!fs.existsSync(filePath)) {
    console.log(`-- WARNING: Migration file not found: ${migration}`);
    continue;
  }

  console.log(`-- ============================================`);
  console.log(`-- MIGRATION: ${migration}`);
  console.log(`-- ============================================`);
  console.log('');

  const sql = fs.readFileSync(filePath, 'utf8');
  console.log(sql);
  console.log('');
}

console.log('COMMIT;');
console.log('');
console.log('-- ============================================');
console.log('-- END OF COMBINED MIGRATION');
console.log('-- ============================================');
