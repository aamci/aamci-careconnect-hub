#!/usr/bin/env node
/**
 * Clean old seed data and reseed with correct data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const secretsPath = path.join(projectRoot, 'secret', 'token-acces-lmops-plateform.json');
const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

const supabase = createClient(secrets.supabase.url, secrets.supabase.service_role_key);

async function cleanAndReseed() {
  console.log('🧹 Cleaning old data...\n');

  // Delete documents created by seed script (those with specific storage_bucket pattern)
  const { error: docError, count: docCount } = await supabase
    .from('documents')
    .delete()
    .eq('storage_bucket', 'patient-documents');

  console.log(`Deleted ${docCount || 0} documents`);
  if (docError) console.error('Doc error:', docError.message);

  // Note: We won't delete appointments as they might have real data mixed in
  // Instead, we'll just run the seed script which will add new appointments

  console.log('\n✅ Cleanup completed. Now run: node scripts/seed-realistic-data.js');
}

cleanAndReseed().catch(console.error);
