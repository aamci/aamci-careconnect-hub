#!/usr/bin/env node
/**
 * Check existing tables in Supabase
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

async function checkTables() {
  console.log('Checking existing tables...\n');

  const sql = `
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE 'patient_%'
    ORDER BY table_name;
  `;

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
    console.error(`API Error: ${errorText}`);
    return;
  }

  const result = await response.json();
  console.log('Patient-related tables found:');
  result.forEach(row => {
    console.log(`  - ${row.table_name}`);
  });
  console.log(`\nTotal: ${result.length} tables`);
}

checkTables().catch(console.error);
