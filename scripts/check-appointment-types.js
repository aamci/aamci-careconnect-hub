#!/usr/bin/env node
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

async function checkTypes() {
  // Check appointment types
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('type')
    .limit(10);

  console.log('Existing appointment types:', appointments);
  if (error) console.error('Error:', error);

  // Check motifs types
  const { data: motifs } = await supabase
    .from('appointment_motifs')
    .select('type, name')
    .limit(10);

  console.log('\nExisting motif types:', motifs);
}

checkTypes();
