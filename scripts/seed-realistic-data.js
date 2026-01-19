#!/usr/bin/env node
/**
 * Seed realistic patient data
 * - Creates appointments over 3+ months with varied statuses
 * - Creates documents (lab results, imaging, prescriptions)
 * - Completes patient profiles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Read secrets
const secretsPath = path.join(projectRoot, 'secret', 'token-acces-lmops-plateform.json');
const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));

const supabase = createClient(
  secrets.supabase.url,
  secrets.supabase.service_role_key
);

// Helper: Random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper: Random item from array
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: Add minutes to date
function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

// Appointment statuses with realistic distribution
const APPOINTMENT_STATUSES = [
  { status: 'completed', weight: 60 },
  { status: 'cancelled', weight: 10 },
  { status: 'absent-excused', weight: 10 },
  { status: 'absent-unexcused', weight: 5 },
  { status: 'scheduled', weight: 15 },
];

function getWeightedStatus(isPast) {
  if (!isPast) return 'scheduled';

  const totalWeight = APPOINTMENT_STATUSES.filter(s => s.status !== 'scheduled')
    .reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of APPOINTMENT_STATUSES) {
    if (item.status === 'scheduled') continue;
    random -= item.weight;
    if (random <= 0) return item.status;
  }
  return 'completed';
}

// Document categories
const DOCUMENT_CATEGORIES = [
  { category: 'lab', names: ['Bilan sanguin', 'Analyse urinaire', 'Bilan lipidique', 'Glycémie à jeun', 'NFS complète', 'Bilan hépatique', 'Bilan rénal', 'TSH'] },
  { category: 'imaging', names: ['Radiographie thoracique', 'IRM lombaire', 'Scanner abdominal', 'Échographie abdominale', 'Mammographie', 'Radiographie colonne', 'IRM cérébrale'] },
  { category: 'prescription', names: ['Ordonnance médicaments', 'Renouvellement traitement', 'Ordonnance kinésithérapie', 'Ordonnance analyses', 'Prescription lunettes'] },
  { category: 'letter', names: ['Courrier confrère', 'Compte-rendu consultation', 'Certificat médical', 'Attestation de soins', 'Courrier spécialiste'] },
  { category: 'report', names: ['Compte-rendu opératoire', 'Compte-rendu hospitalisation', 'Synthèse médicale', 'Rapport consultation spécialisée'] },
];

// Patient profile data
const ADDRESSES = [
  { address: '12 rue de la Paix', city: 'Paris', postal_code: '75002' },
  { address: '45 avenue des Champs-Élysées', city: 'Paris', postal_code: '75008' },
  { address: '8 place Bellecour', city: 'Lyon', postal_code: '69002' },
  { address: '23 rue de la République', city: 'Marseille', postal_code: '13001' },
  { address: '156 boulevard Haussmann', city: 'Paris', postal_code: '75009' },
  { address: '3 rue du Vieux Port', city: 'Marseille', postal_code: '13002' },
  { address: '78 avenue Jean Jaurès', city: 'Lyon', postal_code: '69007' },
  { address: '42 rue Nationale', city: 'Lille', postal_code: '59000' },
  { address: '15 cours Mirabeau', city: 'Aix-en-Provence', postal_code: '13100' },
  { address: '67 rue de la Liberté', city: 'Dijon', postal_code: '21000' },
];

const REFERRING_DOCTORS = [
  'Dr. Martin Dubois',
  'Dr. Claire Lefebvre',
  'Dr. Philippe Moreau',
  'Dr. Isabelle Petit',
  'Dr. François Bernard',
  'Dr. Marie-Claire Simon',
  'Dr. Jean-Pierre Laurent',
  null, // Some patients don't have referring doctor
];

const INSURANCE_PROVIDERS = [
  'Harmonie Mutuelle',
  'MGEN',
  'Malakoff Humanis',
  'AG2R La Mondiale',
  'Axa Santé',
  'MAAF Santé',
  'Groupama',
  'Swiss Life',
  'Allianz',
  'Generali',
];

async function seedData() {
  console.log('🚀 Starting data seeding...\n');

  // 1. Fetch existing data
  console.log('📥 Fetching existing data...');

  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .eq('is_active', true);

  if (patientsError) {
    console.error('Error fetching patients:', patientsError);
    return;
  }
  console.log(`  Found ${patients.length} patients`);

  const { data: practitioners, error: practitionersError } = await supabase
    .from('practitioners')
    .select('*')
    .eq('is_active', true);

  if (practitionersError) {
    console.error('Error fetching practitioners:', practitionersError);
    return;
  }
  console.log(`  Found ${practitioners.length} practitioners`);

  const { data: motifs, error: motifsError } = await supabase
    .from('appointment_motifs')
    .select('*')
    .eq('is_active', true);

  if (motifsError) {
    console.error('Error fetching motifs:', motifsError);
    return;
  }
  console.log(`  Found ${motifs.length} appointment motifs`);

  if (patients.length === 0 || practitioners.length === 0 || motifs.length === 0) {
    console.error('❌ Missing base data (patients, practitioners, or motifs)');
    return;
  }

  // 2. Update patient profiles
  console.log('\n📝 Updating patient profiles...');

  for (const patient of patients) {
    const addressData = randomItem(ADDRESSES);
    const updateData = {
      address: patient.address || addressData.address,
      city: patient.city || addressData.city,
      postal_code: patient.postal_code || addressData.postal_code,
      referring_doctor: patient.referring_doctor || randomItem(REFERRING_DOCTORS),
      insurance_provider: patient.insurance_provider || randomItem(INSURANCE_PROVIDERS),
      insurance_number: patient.insurance_number || `${Math.floor(Math.random() * 9) + 1} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')} ${String(Math.floor(Math.random() * 1000)).padStart(3, '0')} ${String(Math.floor(Math.random() * 1000)).padStart(3, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
    };

    const { error } = await supabase
      .from('patients')
      .update(updateData)
      .eq('id', patient.id);

    if (error) {
      console.error(`  Error updating patient ${patient.first_name} ${patient.last_name}:`, error.message);
    } else {
      console.log(`  ✓ Updated ${patient.first_name} ${patient.last_name}`);
    }
  }

  // 3. Create appointments for each patient
  console.log('\n📅 Creating appointments...');

  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(now.getMonth() - 3);
  const oneMonthAhead = new Date(now);
  oneMonthAhead.setMonth(now.getMonth() + 1);

  let totalAppointments = 0;
  const appointmentsToInsert = [];

  for (const patient of patients) {
    // Random number of appointments per patient (3-10)
    const numAppointments = Math.floor(Math.random() * 8) + 3;

    for (let i = 0; i < numAppointments; i++) {
      const isPast = i < numAppointments - 2; // Last 2 appointments might be future
      const appointmentDate = isPast
        ? randomDate(threeMonthsAgo, new Date(now.getTime() - 24 * 60 * 60 * 1000))
        : randomDate(now, oneMonthAhead);

      // Set time between 8:00 and 18:00
      appointmentDate.setHours(8 + Math.floor(Math.random() * 10));
      appointmentDate.setMinutes(Math.random() > 0.5 ? 0 : 30);
      appointmentDate.setSeconds(0);
      appointmentDate.setMilliseconds(0);

      const motif = randomItem(motifs);
      const practitioner = randomItem(practitioners);
      const status = getWeightedStatus(isPast);

      appointmentsToInsert.push({
        patient_id: patient.id,
        practitioner_id: practitioner.id,
        motif_id: motif.id,
        start_time: appointmentDate.toISOString(),
        end_time: addMinutes(appointmentDate, motif.duration).toISOString(),
        duration: motif.duration,
        status: status,
        type: motif.type, // Use the motif's type (consultation, followup, checkup, etc.)
        is_first_visit: i === 0 && Math.random() > 0.7,
        notes: Math.random() > 0.7 ? `Notes pour le rendez-vous du ${appointmentDate.toLocaleDateString('fr-FR')}` : null,
      });
      totalAppointments++;
    }
  }

  // Insert appointments in batches
  const batchSize = 50;
  for (let i = 0; i < appointmentsToInsert.length; i += batchSize) {
    const batch = appointmentsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('appointments').insert(batch);
    if (error) {
      console.error(`  Error inserting appointments batch ${i / batchSize + 1}:`, error.message);
    }
  }
  console.log(`  ✓ Created ${totalAppointments} appointments`);

  // 4. Create documents for each patient
  console.log('\n📄 Creating documents...');

  let totalDocuments = 0;
  const documentsToInsert = [];

  for (const patient of patients) {
    // Random number of documents per patient (2-8)
    const numDocuments = Math.floor(Math.random() * 7) + 2;

    for (let i = 0; i < numDocuments; i++) {
      const categoryData = randomItem(DOCUMENT_CATEGORIES);
      const documentName = randomItem(categoryData.names);
      const documentDate = randomDate(threeMonthsAgo, now);

      documentsToInsert.push({
        patient_id: patient.id,
        name: `${documentName} - ${documentDate.toLocaleDateString('fr-FR')}`,
        type: categoryData.category,
        category: categoryData.category,
        mime_type: Math.random() > 0.3 ? 'application/pdf' : 'image/jpeg',
        file_size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
        storage_bucket: 'patient-documents',
        file_path: `patients/${patient.id}/${categoryData.category}/${Date.now()}-${i}.pdf`,
        created_at: documentDate.toISOString(),
      });
      totalDocuments++;
    }
  }

  // Insert documents in batches
  for (let i = 0; i < documentsToInsert.length; i += batchSize) {
    const batch = documentsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('documents').insert(batch);
    if (error) {
      console.error(`  Error inserting documents batch ${i / batchSize + 1}:`, error.message);
    }
  }
  console.log(`  ✓ Created ${totalDocuments} documents`);

  // 5. Summary
  console.log('\n✅ Data seeding completed!');
  console.log('Summary:');
  console.log(`  - ${patients.length} patient profiles updated`);
  console.log(`  - ${totalAppointments} appointments created`);
  console.log(`  - ${totalDocuments} documents created`);
}

seedData().catch(console.error);
