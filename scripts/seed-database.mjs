/**
 * Database seeding script - Uses PostgREST API with service_role_key
 * Reads credentials from secret/token-acces-lmops-plateform.json
 * Usage: node scripts/seed-database.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// Load secrets (never hardcoded)
const secrets = JSON.parse(readFileSync(resolve(ROOT, 'secret/token-acces-lmops-plateform.json'), 'utf8'));
const { url, service_role_key } = secrets.supabase;

const ADMIN_HEADERS = {
  'apikey': service_role_key,
  'Authorization': `Bearer ${service_role_key}`,
  'Content-Type': 'application/json',
};

const REST_HEADERS = {
  ...ADMIN_HEADERS,
  'Prefer': 'return=minimal,resolution=merge-duplicates',
};

// =====================================================================
// UUIDs - generated once, reused across FK references
// =====================================================================
const UUID = {
  // TC appointments (13 total: 3 morning completed + 1 in_progress + 1 waiting + 2 afternoon + 3 past + 1 cancelled + 2 future)
  aptMorning1: randomUUID(), aptMorning2: randomUUID(), aptMorning3: randomUUID(),
  aptNow: randomUUID(), aptNext: randomUUID(),
  aptAfternoon1: randomUUID(), aptAfternoon2: randomUUID(),
  aptPast1: randomUUID(), aptPast2: randomUUID(), aptPast3: randomUUID(),
  aptCancelled: randomUUID(),
  aptTomorrow: randomUUID(), aptFuture: randomUUID(),
  // Teleconsultations (same 13)
  tcMorning1: randomUUID(), tcMorning2: randomUUID(), tcMorning3: randomUUID(),
  tcNow: randomUUID(), tcNext: randomUUID(),
  tcAfternoon1: randomUUID(), tcAfternoon2: randomUUID(),
  tcPast1: randomUUID(), tcPast2: randomUUID(), tcPast3: randomUUID(),
  tcCancelled: randomUUID(),
  tcTomorrow: randomUUID(), tcFuture: randomUUID(),
  // Consultations for completed TCs (6: 3 morning + 3 past)
  consultMorning1: randomUUID(), consultMorning2: randomUUID(), consultMorning3: randomUUID(),
  consultPast1: randomUUID(), consultPast2: randomUUID(), consultPast3: randomUUID(),
  // TC notes (for active + completed)
  noteNow1: randomUUID(), noteNow2: randomUUID(),
  noteMorning1_1: randomUUID(), noteMorning2_1: randomUUID(), noteMorning3_1: randomUUID(),
  notePast1_1: randomUUID(), notePast1_2: randomUUID(),
  notePast2_1: randomUUID(), notePast3_1: randomUUID(),
  // Documents
  docEcg: randomUUID(), docOrdo: randomUUID(), docCr: randomUUID(),
  docArret: randomUUID(), docKine: randomUUID(), docPhoto: randomUUID(),
  docOrdoDerm: randomUUID(),
  // TC document shares
  tcdsMorning1_1: randomUUID(), tcdsMorning1_2: randomUUID(),
  tcdsPast1_1: randomUUID(), tcdsPast1_2: randomUUID(), tcdsPast1_3: randomUUID(),
  tcdsPast2_1: randomUUID(), tcdsPast2_2: randomUUID(),
};

// Existing entity IDs from the database
const PAT = {
  maud: 'b4c5d6e7-f8a9-0123-7890-234567890123',
  david: 'c5d6e7f8-a9b0-1234-8901-345678901234',
  pablo: 'd6e7f8a9-b0c1-2345-9012-456789012345',
  marc: 'e7f8a9b0-c1d2-3456-0123-567890123456',
  camille: 'f8a9b0c1-d2e3-4567-1234-678901234567',
};
const PRACT = 'f6a7b8c9-d0e1-2345-f012-456789012345';
const MOTIF = {
  consult: 'c9d0e1f2-a3b4-5678-2345-789012345678',
  suivi: 'd0e1f2a3-b4c5-6789-3456-890123456789',
  premiere: 'e1f2a3b4-c5d6-7890-4567-901234567890',
  bilan: 'f2a3b4c5-d6e7-8901-5678-012345678901',
};

// Helper: date at specific hour on a day offset from today
function isoDate(offsetDays, hours, minutes) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

// Helper: offset from NOW in minutes (for active teleconsultations)
function nowPlus(minutesOffset) {
  return new Date(Date.now() + minutesOffset * 60000).toISOString();
}

// Helper: PostgREST upsert
async function upsert(table, rows, label) {
  const res = await fetch(`${url}/rest/v1/${table}`, {
    method: 'POST', headers: REST_HEADERS, body: JSON.stringify(rows),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`  [ERROR] ${label || table}: ${res.status} ${txt.slice(0, 500)}`);
    return false;
  }
  console.log(`  [OK] ${label || table}: ${rows.length} rows`);
  return true;
}

// Helper: PostgREST delete
async function deleteRows(table, filter, label) {
  const res = await fetch(`${url}/rest/v1/${table}?${filter}`, {
    method: 'DELETE', headers: ADMIN_HEADERS,
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`  [DEL ERROR] ${label || table}: ${res.status} ${txt.slice(0, 300)}`);
    return false;
  }
  console.log(`  [DEL OK] ${label || table}`);
  return true;
}

// Helper: PostgREST update
async function updateRows(table, filter, data, label) {
  const res = await fetch(`${url}/rest/v1/${table}?${filter}`, {
    method: 'PATCH',
    headers: { ...ADMIN_HEADERS, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error(`  [UPD ERROR] ${label}: ${res.status} ${txt.slice(0, 300)}`);
    return false;
  }
  console.log(`  [UPD OK] ${label}`);
  return true;
}

// =====================================================================
// Step 1: Create and confirm auth users
// =====================================================================
const USERS = [
  { email: 'dr.martin@medisync.fr', password: 'CareConnect2026', meta: { full_name: 'Dr Sophie Martin', role: 'practitioner' } },
  { email: 'dr.dubois@medisync.fr', password: 'CareConnect2026', meta: { full_name: 'Dr Pierre Dubois', role: 'practitioner' } },
  { email: 'dr.laurent@medisync.fr', password: 'CareConnect2026', meta: { full_name: 'Dr Marie Laurent', role: 'practitioner' } },
  { email: 'secretariat@medisync.fr', password: 'CareConnect2026', meta: { full_name: 'Marie Dupont', role: 'secretary' } },
  { email: 'admin@medisync.fr', password: 'CareConnect2026', meta: { full_name: 'Administrateur', role: 'admin' } },
];

async function createUsers() {
  console.log('--- Step 1: Auth users ---');
  const userIds = {};

  const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=50`, { headers: ADMIN_HEADERS });
  const listData = await listRes.json();
  const existingUsers = listData.users || [];

  for (const u of USERS) {
    const existing = existingUsers.find(usr => usr.email === u.email);
    if (existing) {
      console.log(`  [exists] ${u.email} -> ${existing.id}`);
      if (!existing.email_confirmed_at) {
        await fetch(`${url}/auth/v1/admin/users/${existing.id}`, {
          method: 'PUT', headers: ADMIN_HEADERS, body: JSON.stringify({ email_confirm: true }),
        });
      }
      userIds[u.email] = existing.id;
    } else {
      const res = await fetch(`${url}/auth/v1/admin/users`, {
        method: 'POST', headers: ADMIN_HEADERS,
        body: JSON.stringify({ email: u.email, password: u.password, email_confirm: true, user_metadata: u.meta }),
      });
      const data = await res.json();
      if (data.id) {
        console.log(`  [created] ${u.email} -> ${data.id}`);
        userIds[u.email] = data.id;
      } else {
        console.error(`  [ERROR] ${u.email}:`, data);
      }
    }
  }

  return {
    martin: userIds['dr.martin@medisync.fr'],
    dubois: userIds['dr.dubois@medisync.fr'],
    laurent: userIds['dr.laurent@medisync.fr'],
    secretariat: userIds['secretariat@medisync.fr'],
    admin: userIds['admin@medisync.fr'],
  };
}

// =====================================================================
// Step 2: Link practitioners + update patients
// =====================================================================
async function updateExistingData(uid) {
  console.log('\n--- Step 2: Link practitioners to auth users ---');
  await updateRows('practitioners', `id=eq.${PRACT}`, { user_id: uid.martin }, 'Martin->auth');
  await updateRows('practitioners', 'id=eq.a7b8c9d0-e1f2-3456-0123-567890123456', { user_id: uid.dubois }, 'Dubois->auth');
  await updateRows('practitioners', 'id=eq.b8c9d0e1-f2a3-4567-1234-678901234567', { user_id: uid.laurent }, 'Laurent->auth');

  console.log('\n--- Step 3: Update patient registration dates ---');
  const patientUpdates = [
    { id: PAT.maud, data: { first_name: 'Maud', last_name: 'Pennaneach', email: 'maud.p@email.fr', phone: '06 12 34 56 78', created_at: '2022-04-15T09:30:00Z' } },
    { id: PAT.david, data: { first_name: 'David', last_name: 'Chicheportiche', email: 'dchichepo@gmail.com', phone: '06 60 08 45 00', created_at: '2020-02-10T11:15:00Z' } },
    { id: PAT.pablo, data: { first_name: 'Pablo', last_name: 'Moreno', email: 'pablo.moreno@email.fr', phone: '06 34 89 67 26', created_at: '2023-01-05T14:00:00Z' } },
    { id: PAT.marc, data: { first_name: 'Marc', last_name: 'Lefebvre', email: 'marc.lefebvre@email.fr', phone: '06 55 44 33 22', created_at: '2021-06-20T10:00:00Z' } },
    { id: PAT.camille, data: { first_name: 'Camille', last_name: 'Beaumont', email: 'camille.beaumont@email.fr', phone: '06 77 88 99 00', created_at: '2022-09-01T08:45:00Z' } },
  ];
  for (const p of patientUpdates) {
    await updateRows('patients', `id=eq.${p.id}`, p.data, `patient ${p.data.first_name}`);
  }
}

// =====================================================================
// Step 4: Insert teleconsultation appointments
// Logical schedule relative to NOW:
//   Morning (completed): 09:30, 10:00, 10:30
//   NOW: in_progress (started ~5 min ago), next patient waiting (in ~15 min)
//   Afternoon: 2 scheduled later today
//   Past days: 3 completed + 1 cancelled
//   Future: tomorrow + in 3 days
// =====================================================================
async function insertTCAppointments(uid) {
  console.log('\n--- Step 4: Teleconsultation appointments ---');

  // Delete all TC appointments (identified by notes field)
  await deleteRows('appointments', 'notes=eq.Teleconsultation', 'cleanup tc-appointments');

  const rows = [
    // --- MORNING COMPLETED (today, fixed hours, already done) ---
    { id: UUID.aptMorning1, patient_id: PAT.maud, practitioner_id: PRACT, motif_id: MOTIF.suivi, start_time: isoDate(0, 9, 0), end_time: isoDate(0, 9, 18), duration: 18, status: 'completed', type: 'consultation', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-5, 8, 0), created_by: uid.secretariat },
    { id: UUID.aptMorning2, patient_id: PAT.david, practitioner_id: PRACT, motif_id: MOTIF.consult, start_time: isoDate(0, 9, 30), end_time: isoDate(0, 9, 46), duration: 16, status: 'completed', type: 'consultation', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-4, 10, 0), created_by: uid.secretariat },
    { id: UUID.aptMorning3, patient_id: PAT.camille, practitioner_id: PRACT, motif_id: MOTIF.suivi, start_time: isoDate(0, 10, 0), end_time: isoDate(0, 10, 15), duration: 15, status: 'completed', type: 'followup', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-3, 14, 0), created_by: uid.secretariat },

    // --- NOW: in_progress (started 5 min ago) ---
    { id: UUID.aptNow, patient_id: PAT.pablo, practitioner_id: PRACT, motif_id: MOTIF.consult, start_time: nowPlus(-5), end_time: nowPlus(15), duration: 20, status: 'scheduled', type: 'consultation', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-6, 9, 0), created_by: uid.secretariat },

    // --- NEXT: patient connected, waiting (scheduled in 15 min) ---
    { id: UUID.aptNext, patient_id: PAT.marc, practitioner_id: PRACT, motif_id: MOTIF.suivi, start_time: nowPlus(15), end_time: nowPlus(35), duration: 20, status: 'scheduled', type: 'followup', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-5, 11, 0), created_by: uid.secretariat },

    // --- AFTERNOON: scheduled later today ---
    { id: UUID.aptAfternoon1, patient_id: PAT.maud, practitioner_id: PRACT, motif_id: MOTIF.premiere, start_time: nowPlus(120), end_time: nowPlus(150), duration: 30, status: 'scheduled', type: 'checkup', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-7, 9, 0), created_by: uid.secretariat },
    { id: UUID.aptAfternoon2, patient_id: PAT.david, practitioner_id: PRACT, motif_id: MOTIF.suivi, start_time: nowPlus(210), end_time: nowPlus(230), duration: 20, status: 'scheduled', type: 'followup', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-4, 15, 0), created_by: uid.martin },

    // --- PAST DAYS: completed ---
    { id: UUID.aptPast1, patient_id: PAT.pablo, practitioner_id: PRACT, motif_id: MOTIF.consult, start_time: isoDate(-1, 15, 0), end_time: isoDate(-1, 15, 22), duration: 22, status: 'completed', type: 'consultation', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-8, 10, 0), created_by: uid.martin },
    { id: UUID.aptPast2, patient_id: PAT.camille, practitioner_id: PRACT, motif_id: MOTIF.suivi, start_time: isoDate(-3, 10, 30), end_time: isoDate(-3, 10, 47), duration: 17, status: 'completed', type: 'followup', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-10, 9, 0), created_by: uid.secretariat },
    { id: UUID.aptPast3, patient_id: PAT.marc, practitioner_id: PRACT, motif_id: MOTIF.premiere, start_time: isoDate(-7, 14, 0), end_time: isoDate(-7, 14, 30), duration: 30, status: 'completed', type: 'checkup', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-14, 8, 0), created_by: uid.martin },

    // --- CANCELLED ---
    { id: UUID.aptCancelled, patient_id: PAT.maud, practitioner_id: PRACT, motif_id: MOTIF.suivi, start_time: isoDate(-5, 11, 0), end_time: isoDate(-5, 11, 15), duration: 15, status: 'cancelled', type: 'followup', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-12, 10, 0), created_by: uid.secretariat },

    // --- FUTURE ---
    { id: UUID.aptTomorrow, patient_id: PAT.camille, practitioner_id: PRACT, motif_id: MOTIF.suivi, start_time: isoDate(1, 11, 0), end_time: isoDate(1, 11, 15), duration: 15, status: 'scheduled', type: 'followup', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-4, 15, 0), created_by: uid.martin },
    { id: UUID.aptFuture, patient_id: PAT.david, practitioner_id: PRACT, motif_id: MOTIF.bilan, start_time: isoDate(3, 9, 0), end_time: isoDate(3, 9, 30), duration: 30, status: 'scheduled', type: 'checkup', is_first_visit: false, notes: 'Teleconsultation', created_at: isoDate(-5, 16, 0), created_by: uid.secretariat },
  ];

  await upsert('appointments', rows, 'tc-appointments');
}

// =====================================================================
// Step 5: Insert consultations for completed TCs
// 6 completed: 3 from this morning + 3 from past days
// =====================================================================
async function insertConsultations(uid) {
  console.log('\n--- Step 5: Consultations for completed TCs ---');

  const rows = [
    // Morning completed
    { id: UUID.consultMorning1, patient_id: PAT.maud, practitioner_id: PRACT, appointment_id: UUID.aptMorning1, status: 'completed', start_time: isoDate(0, 9, 1), end_time: isoDate(0, 9, 18), chief_complaint: 'Suivi douleurs lombaires chroniques', history_of_present_illness: 'Douleurs persistantes depuis 3 semaines malgre anti-inflammatoires.', diagnosis: { text: 'Lombalgie commune - amelioration partielle', code: 'M54.5' }, physical_examination: { text: 'Mobilite lombaire amelioree. Lasegue negatif bilateral.' }, treatment_plan: 'Poursuite kinesitherapie. Paracetamol si besoin.', follow_up_instructions: 'Controle dans 3 semaines.', notes: 'Teleconsultation matin - bonne evolution.', created_at: isoDate(0, 9, 1), created_by: uid.martin },
    { id: UUID.consultMorning2, patient_id: PAT.david, practitioner_id: PRACT, appointment_id: UUID.aptMorning2, status: 'completed', start_time: isoDate(0, 9, 31), end_time: isoDate(0, 9, 46), chief_complaint: 'Controle tension arterielle', history_of_present_illness: 'HTA traitee par Amlodipine 5mg. Automesure satisfaisante.', diagnosis: { text: 'HTA essentielle equilibree', code: 'I10' }, physical_examination: { text: 'TA rapportee: 13.5/8.5 - bien equilibree.' }, treatment_plan: 'Poursuite traitement actuel. Renouvellement ordonnance 3 mois.', follow_up_instructions: 'Prochain controle dans 3 mois.', notes: 'Teleconsultation - patient stable.', created_at: isoDate(0, 9, 31), created_by: uid.martin },
    { id: UUID.consultMorning3, patient_id: PAT.camille, practitioner_id: PRACT, appointment_id: UUID.aptMorning3, status: 'completed', start_time: isoDate(0, 10, 1), end_time: isoDate(0, 10, 14), chief_complaint: 'Renouvellement ordonnance contraception', history_of_present_illness: 'Contraception orale depuis 2 ans. Aucun effet indesirable.', diagnosis: { text: 'Contraception orale - renouvellement', code: 'Z30.4' }, physical_examination: { text: 'RAS. Bilan sanguin recent normal.' }, treatment_plan: 'Renouvellement pilule Leeloo Ge 6 mois.', follow_up_instructions: 'Bilan sanguin de controle dans 6 mois.', notes: 'Teleconsultation rapide - renouvellement simple.', created_at: isoDate(0, 10, 1), created_by: uid.martin },

    // Past days completed
    { id: UUID.consultPast1, patient_id: PAT.pablo, practitioner_id: PRACT, appointment_id: UUID.aptPast1, status: 'completed', start_time: isoDate(-1, 15, 2), end_time: isoDate(-1, 15, 24), chief_complaint: 'Eruption cutanee bras gauche', history_of_present_illness: 'Plaques rouges prurigineuses apparues il y a 5 jours. Pas de fievre.', diagnosis: { text: 'Dermatite de contact probable', code: 'L25.9' }, physical_examination: { text: 'Plaques erythemateuses bien delimitees sur face anterieure bras gauche.' }, treatment_plan: 'Dermocorticoide classe II - application 1x/j pendant 7 jours.', follow_up_instructions: 'Controle dans 10 jours si pas amelioration.', notes: 'Teleconsultation - bonne qualite video.', created_at: isoDate(-1, 15, 2), created_by: uid.martin },
    { id: UUID.consultPast2, patient_id: PAT.camille, practitioner_id: PRACT, appointment_id: UUID.aptPast2, status: 'completed', start_time: isoDate(-3, 10, 31), end_time: isoDate(-3, 10, 48), chief_complaint: 'Suivi anxiete generalisee', history_of_present_illness: "Crises d'angoisse nocturnes frequentes depuis 1 mois. Sertraline 50mg/j.", diagnosis: { text: 'Trouble anxieux generalise - aggravation', code: 'F41.1' }, physical_examination: { text: 'Patiente tendue, legere tachycardie (92 bpm).' }, treatment_plan: 'Augmentation Sertraline a 75mg/j. Hydroxyzine 25mg au coucher si besoin.', follow_up_instructions: 'Suivi dans 3 semaines. Appeler si aggravation.', notes: "Teleconsultation - patiente a l'aise avec le format video.", created_at: isoDate(-3, 10, 31), created_by: uid.martin },
    { id: UUID.consultPast3, patient_id: PAT.marc, practitioner_id: PRACT, appointment_id: UUID.aptPast3, status: 'completed', start_time: isoDate(-7, 14, 5), end_time: isoDate(-7, 14, 35), chief_complaint: 'Consultation pre-operatoire genou droit', history_of_present_illness: 'Preparation arthroscopie genou droit. Bilan pre-operatoire complet realise.', diagnosis: { text: 'Gonarthrose interne genou droit - bilan pre-op', code: 'M17.1' }, physical_examination: { text: 'Genou droit: epanchement modere. Flexion limitee a 110 degres. ECG normal.' }, treatment_plan: 'Arret AINS 7 jours avant intervention. Jeune 6h avant bloc.', follow_up_instructions: 'Rappeler consignes 48h avant intervention.', notes: 'Teleconsultation pre-operatoire - consignes transmises.', created_at: isoDate(-7, 14, 5), created_by: uid.martin },
  ];

  await upsert('consultations', rows, 'tc-consultations');
}

// =====================================================================
// Step 6: Insert teleconsultations
// Temporal logic aligned with appointments from Step 4:
//   Morning (completed): 09:00, 09:30, 10:00 - linked to consultations
//   NOW: in_progress (started ~5 min ago) + waiting (next patient in ~15 min)
//   Afternoon: 2 scheduled later today
//   Past: 3 completed (yesterday, -3d, -7d) + 1 cancelled (-5d)
//   Future: tomorrow + in 3 days
// =====================================================================
async function insertTeleconsultations(uid) {
  console.log('\n--- Step 6: Teleconsultations ---');

  // Clean up existing teleconsultation data (child tables first)
  await deleteRows('teleconsultation_notes', 'teleconsultation_id=neq.00000000-0000-0000-0000-000000000000', 'cleanup tc-notes');
  await deleteRows('teleconsultation_documents', 'teleconsultation_id=neq.00000000-0000-0000-0000-000000000000', 'cleanup tc-docs');
  await deleteRows('teleconsultations', 'id=neq.00000000-0000-0000-0000-000000000000', 'cleanup teleconsultations');

  const S = { video_enabled: true, audio_enabled: true, screen_share_enabled: true, recording_enabled: false, quality: 'auto' };

  function tcLink(tcId, tokenSuffix, type) {
    return `/visio/waiting/${tcId}?token=${tokenSuffix}&type=${type}`;
  }

  const rows = [
    // --- MORNING COMPLETED (today 09:00, 09:30, 10:00) ---
    { id: UUID.tcMorning1, appointment_id: UUID.aptMorning1, consultation_id: UUID.consultMorning1, patient_id: PAT.maud, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcMorning1.substring(0, 12), patient_link: tcLink(UUID.tcMorning1, 'ptm1', 'patient'), practitioner_link: tcLink(UUID.tcMorning1, 'prm1', 'practitioner'), room_expires_at: isoDate(0, 12, 0), status: 'completed', scheduled_start: isoDate(0, 9, 0), actual_start: isoDate(0, 9, 1), actual_end: isoDate(0, 9, 18), duration_minutes: 17, consultation_reason: 'Suivi douleurs lombaires chroniques', chief_complaint: 'Douleurs persistantes depuis 3 semaines malgre anti-inflammatoires', technical_check_done: true, settings: S, metadata: {}, created_at: isoDate(-5, 8, 0), created_by: uid.secretariat },
    { id: UUID.tcMorning2, appointment_id: UUID.aptMorning2, consultation_id: UUID.consultMorning2, patient_id: PAT.david, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcMorning2.substring(0, 12), patient_link: tcLink(UUID.tcMorning2, 'ptm2', 'patient'), practitioner_link: tcLink(UUID.tcMorning2, 'prm2', 'practitioner'), room_expires_at: isoDate(0, 12, 0), status: 'completed', scheduled_start: isoDate(0, 9, 30), actual_start: isoDate(0, 9, 31), actual_end: isoDate(0, 9, 46), duration_minutes: 15, consultation_reason: 'Controle tension arterielle', chief_complaint: 'HTA traitee, automesure satisfaisante', technical_check_done: true, settings: S, metadata: {}, created_at: isoDate(-4, 10, 0), created_by: uid.secretariat },
    { id: UUID.tcMorning3, appointment_id: UUID.aptMorning3, consultation_id: UUID.consultMorning3, patient_id: PAT.camille, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcMorning3.substring(0, 12), patient_link: tcLink(UUID.tcMorning3, 'ptm3', 'patient'), practitioner_link: tcLink(UUID.tcMorning3, 'prm3', 'practitioner'), room_expires_at: isoDate(0, 12, 0), status: 'completed', scheduled_start: isoDate(0, 10, 0), actual_start: isoDate(0, 10, 1), actual_end: isoDate(0, 10, 14), duration_minutes: 13, consultation_reason: 'Renouvellement ordonnance contraception', chief_complaint: null, technical_check_done: true, settings: S, metadata: {}, created_at: isoDate(-3, 14, 0), created_by: uid.secretariat },

    // --- NOW: in_progress (started ~5 min ago) ---
    { id: UUID.tcNow, appointment_id: UUID.aptNow, consultation_id: null, patient_id: PAT.pablo, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcNow.substring(0, 12), patient_link: tcLink(UUID.tcNow, 'ptn1', 'patient'), practitioner_link: tcLink(UUID.tcNow, 'prn1', 'practitioner'), room_expires_at: nowPlus(120), status: 'in_progress', scheduled_start: nowPlus(-5), actual_start: nowPlus(-5), actual_end: null, duration_minutes: null, consultation_reason: 'Eruption cutanee persistante - controle', chief_complaint: 'Plaques rouges bras gauche non ameliorees malgre dermocorticoide', technical_check_done: true, settings: S, metadata: {}, created_at: isoDate(-6, 9, 0), created_by: uid.secretariat },

    // --- NEXT: patient connected, waiting (scheduled in ~15 min) ---
    { id: UUID.tcNext, appointment_id: UUID.aptNext, consultation_id: null, patient_id: PAT.marc, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcNext.substring(0, 12), patient_link: tcLink(UUID.tcNext, 'ptn2', 'patient'), practitioner_link: tcLink(UUID.tcNext, 'prn2', 'practitioner'), room_expires_at: nowPlus(120), status: 'waiting', scheduled_start: nowPlus(15), actual_start: null, actual_end: null, duration_minutes: null, consultation_reason: 'Suivi post-operatoire genou droit', chief_complaint: null, technical_check_done: true, settings: S, metadata: {}, created_at: isoDate(-5, 11, 0), created_by: uid.martin },

    // --- AFTERNOON: scheduled later today ---
    { id: UUID.tcAfternoon1, appointment_id: UUID.aptAfternoon1, consultation_id: null, patient_id: PAT.maud, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcAfternoon1.substring(0, 12), patient_link: tcLink(UUID.tcAfternoon1, 'pta1', 'patient'), practitioner_link: tcLink(UUID.tcAfternoon1, 'pra1', 'practitioner'), room_expires_at: nowPlus(240), status: 'scheduled', scheduled_start: nowPlus(120), actual_start: null, actual_end: null, duration_minutes: null, consultation_reason: 'Resultats analyses sanguines', chief_complaint: null, technical_check_done: false, settings: S, metadata: {}, created_at: isoDate(-7, 9, 0), created_by: uid.secretariat },
    { id: UUID.tcAfternoon2, appointment_id: UUID.aptAfternoon2, consultation_id: null, patient_id: PAT.david, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcAfternoon2.substring(0, 12), patient_link: tcLink(UUID.tcAfternoon2, 'pta2', 'patient'), practitioner_link: tcLink(UUID.tcAfternoon2, 'pra2', 'practitioner'), room_expires_at: nowPlus(300), status: 'scheduled', scheduled_start: nowPlus(210), actual_start: null, actual_end: null, duration_minutes: null, consultation_reason: 'Bilan cardiologique annuel', chief_complaint: null, technical_check_done: false, settings: S, metadata: {}, created_at: isoDate(-4, 15, 0), created_by: uid.martin },

    // --- PAST DAYS: completed (yesterday, -3d, -7d) ---
    { id: UUID.tcPast1, appointment_id: UUID.aptPast1, consultation_id: UUID.consultPast1, patient_id: PAT.pablo, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcPast1.substring(0, 12), patient_link: tcLink(UUID.tcPast1, 'ptp1', 'patient'), practitioner_link: tcLink(UUID.tcPast1, 'prp1', 'practitioner'), room_expires_at: isoDate(-1, 23, 59), status: 'completed', scheduled_start: isoDate(-1, 15, 0), actual_start: isoDate(-1, 15, 2), actual_end: isoDate(-1, 15, 24), duration_minutes: 22, consultation_reason: 'Eruption cutanee bras gauche', chief_complaint: 'Plaques rouges prurigineuses apparues il y a 5 jours', technical_check_done: true, settings: S, metadata: {}, created_at: isoDate(-8, 10, 0), created_by: uid.martin },
    { id: UUID.tcPast2, appointment_id: UUID.aptPast2, consultation_id: UUID.consultPast2, patient_id: PAT.camille, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcPast2.substring(0, 12), patient_link: tcLink(UUID.tcPast2, 'ptp2', 'patient'), practitioner_link: tcLink(UUID.tcPast2, 'prp2', 'practitioner'), room_expires_at: isoDate(-3, 23, 59), status: 'completed', scheduled_start: isoDate(-3, 10, 30), actual_start: isoDate(-3, 10, 31), actual_end: isoDate(-3, 10, 48), duration_minutes: 17, consultation_reason: 'Suivi anxiete generalisee', chief_complaint: "Crises d'angoisse nocturnes frequentes", technical_check_done: true, settings: S, metadata: {}, created_at: isoDate(-10, 9, 0), created_by: uid.secretariat },
    { id: UUID.tcPast3, appointment_id: UUID.aptPast3, consultation_id: UUID.consultPast3, patient_id: PAT.marc, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcPast3.substring(0, 12), patient_link: tcLink(UUID.tcPast3, 'ptp3', 'patient'), practitioner_link: tcLink(UUID.tcPast3, 'prp3', 'practitioner'), room_expires_at: isoDate(-7, 23, 59), status: 'completed', scheduled_start: isoDate(-7, 14, 0), actual_start: isoDate(-7, 14, 5), actual_end: isoDate(-7, 14, 35), duration_minutes: 30, consultation_reason: 'Consultation pre-operatoire genou droit', chief_complaint: 'Preparation arthroscopie genou droit', technical_check_done: true, settings: S, metadata: {}, created_at: isoDate(-14, 8, 0), created_by: uid.martin },

    // --- CANCELLED (-5 days) ---
    { id: UUID.tcCancelled, appointment_id: UUID.aptCancelled, consultation_id: null, patient_id: PAT.maud, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcCancelled.substring(0, 12), patient_link: tcLink(UUID.tcCancelled, 'ptc1', 'patient'), practitioner_link: tcLink(UUID.tcCancelled, 'prc1', 'practitioner'), room_expires_at: isoDate(-5, 23, 59), status: 'cancelled', scheduled_start: isoDate(-5, 11, 0), actual_start: null, actual_end: null, duration_minutes: null, consultation_reason: 'Suivi traitement lombaire', chief_complaint: null, technical_check_done: false, settings: S, metadata: {}, created_at: isoDate(-12, 10, 0), created_by: uid.secretariat },

    // --- FUTURE: tomorrow + in 3 days ---
    { id: UUID.tcTomorrow, appointment_id: UUID.aptTomorrow, consultation_id: null, patient_id: PAT.camille, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcTomorrow.substring(0, 12), patient_link: tcLink(UUID.tcTomorrow, 'ptf1', 'patient'), practitioner_link: tcLink(UUID.tcTomorrow, 'prf1', 'practitioner'), room_expires_at: isoDate(2, 0, 0), status: 'scheduled', scheduled_start: isoDate(1, 11, 0), actual_start: null, actual_end: null, duration_minutes: null, consultation_reason: 'Suivi anxiete - ajustement traitement', chief_complaint: null, technical_check_done: false, settings: S, metadata: {}, created_at: isoDate(-4, 15, 0), created_by: uid.martin },
    { id: UUID.tcFuture, appointment_id: UUID.aptFuture, consultation_id: null, patient_id: PAT.david, practitioner_id: PRACT, room_token: 'tok-' + UUID.tcFuture.substring(0, 12), patient_link: tcLink(UUID.tcFuture, 'ptf2', 'patient'), practitioner_link: tcLink(UUID.tcFuture, 'prf2', 'practitioner'), room_expires_at: isoDate(4, 0, 0), status: 'scheduled', scheduled_start: isoDate(3, 9, 0), actual_start: null, actual_end: null, duration_minutes: null, consultation_reason: 'Bilan cardiologique annuel', chief_complaint: null, technical_check_done: false, settings: S, metadata: {}, created_at: isoDate(-5, 16, 0), created_by: uid.secretariat },
  ];

  await upsert('teleconsultations', rows, 'teleconsultations');
}

// =====================================================================
// Step 7: Insert TC notes
// Notes for: in_progress TC (now), completed morning TCs, completed past TCs
// =====================================================================
async function insertTCNotes() {
  console.log('\n--- Step 7: TC notes ---');

  const rows = [
    // Notes for the in_progress TC (Pablo - right now)
    { id: UUID.noteNow1, teleconsultation_id: UUID.tcNow, practitioner_id: PRACT, content: 'Patient signale que les plaques rouges ne se sont pas ameliorees malgre 7 jours de dermocorticoide. Prurit toujours present.', note_type: 'clinical', is_private: true, created_at: nowPlus(-3) },
    { id: UUID.noteNow2, teleconsultation_id: UUID.tcNow, practitioner_id: PRACT, content: 'Examen video : lesions toujours erythemateuses, bords nets. Envisager patch-tests pour identifier allergene.', note_type: 'clinical', is_private: false, created_at: nowPlus(-1) },

    // Notes for completed morning TCs
    { id: UUID.noteMorning1_1, teleconsultation_id: UUID.tcMorning1, practitioner_id: PRACT, content: 'Douleurs lombaires en amelioration partielle. Mobilite retrouvee. Poursuite kinesitherapie recommandee.', note_type: 'clinical', is_private: false, created_at: isoDate(0, 9, 10) },
    { id: UUID.noteMorning2_1, teleconsultation_id: UUID.tcMorning2, practitioner_id: PRACT, content: 'TA auto-mesuree : 13.5/8.5 en moyenne. Bien equilibree sous Amlodipine 5mg. Renouvellement 3 mois.', note_type: 'clinical', is_private: false, created_at: isoDate(0, 9, 38) },
    { id: UUID.noteMorning3_1, teleconsultation_id: UUID.tcMorning3, practitioner_id: PRACT, content: 'Renouvellement Leeloo Ge 6 mois. Bilan sanguin recent normal. Aucun effet indesirable signale.', note_type: 'prescription_note', is_private: false, created_at: isoDate(0, 10, 8) },

    // Notes for completed past TCs
    { id: UUID.notePast1_1, teleconsultation_id: UUID.tcPast1, practitioner_id: PRACT, content: 'Eruption cutanee localisee bras gauche. Aspect compatible avec dermatite de contact.', note_type: 'clinical', is_private: false, created_at: isoDate(-1, 15, 5) },
    { id: UUID.notePast1_2, teleconsultation_id: UUID.tcPast1, practitioner_id: PRACT, content: 'Prescription dermocorticoide classe II. Application 1x/j pendant 7 jours. Controle 10 jours.', note_type: 'treatment_plan', is_private: false, created_at: isoDate(-1, 15, 15) },
    { id: UUID.notePast2_1, teleconsultation_id: UUID.tcPast2, practitioner_id: PRACT, content: 'Crises anxieuses nocturnes persistantes. Sertraline 50mg insuffisant. Augmentation a 75mg/j proposee.', note_type: 'clinical', is_private: false, created_at: isoDate(-3, 10, 35) },
    { id: UUID.notePast3_1, teleconsultation_id: UUID.tcPast3, practitioner_id: PRACT, content: 'Bilan pre-operatoire satisfaisant. ECG normal. Bilan sanguin RAS. Consignes pre-op transmises au patient.', note_type: 'clinical', is_private: false, created_at: isoDate(-7, 14, 15) },
  ];

  await upsert('teleconsultation_notes', rows, 'tc-notes');
}

// =====================================================================
// Step 8: Insert documents + TC document shares
// =====================================================================
async function insertDocumentsAndShares(uid) {
  console.log('\n--- Step 8: Documents & TC shares ---');

  // Documents matching the actual table schema
  const docs = [
    { id: UUID.docEcg, filename: 'ecg-reference-2026.pdf', mime_type: 'application/pdf', file_size: 245000, storage_url: '/documents/ecg-reference-2026.pdf', storage_bucket: 'documents', category: 'imagerie', subcategory: 'ecg', title: 'ECG de reference - 15/01/2026', patient_id: PAT.maud, document_date: '2026-01-15T10:00:00Z', status: 'validated', source: 'upload', checksum: 'ecg01ref2026', created_by: uid.martin, created_at: '2026-01-15T10:00:00Z' },
    { id: UUID.docOrdo, filename: 'ordonnance-paracetamol.pdf', mime_type: 'application/pdf', file_size: 52000, storage_url: '/documents/ordonnance-paracetamol.pdf', storage_bucket: 'documents', category: 'ordonnance', subcategory: 'ordonnance_medicament', title: 'Ordonnance - Paracetamol 1g', patient_id: PAT.maud, document_date: isoDate(0, 9, 47), status: 'validated', source: 'generated', checksum: 'ordo01para', created_by: uid.martin, created_at: isoDate(0, 9, 47) },
    { id: UUID.docCr, filename: 'cr-post-op.pdf', mime_type: 'application/pdf', file_size: 180000, storage_url: '/documents/cr-post-op.pdf', storage_bucket: 'documents', category: 'courrier', subcategory: 'compte_rendu_operatoire', title: 'Compte-rendu post-operatoire', patient_id: PAT.pablo, document_date: isoDate(-1, 15, 20), status: 'validated', source: 'upload', checksum: 'crpostop01', created_by: uid.martin, created_at: isoDate(-1, 15, 20) },
    { id: UUID.docArret, filename: 'arret-travail.pdf', mime_type: 'application/pdf', file_size: 68000, storage_url: '/documents/arret-travail.pdf', storage_bucket: 'documents', category: 'administratif', subcategory: 'certificat', title: 'Certificat arret de travail', patient_id: PAT.pablo, document_date: isoDate(-1, 15, 15), status: 'validated', source: 'generated', checksum: 'arrettravail01', created_by: uid.martin, created_at: isoDate(-1, 15, 15) },
    { id: UUID.docKine, filename: 'prescription-kine.pdf', mime_type: 'application/pdf', file_size: 45000, storage_url: '/documents/prescription-kine.pdf', storage_bucket: 'documents', category: 'ordonnance', subcategory: 'ordonnance_paramedicale', title: 'Prescription kinesitherapie 10 seances', patient_id: PAT.pablo, document_date: isoDate(-1, 15, 18), status: 'validated', source: 'generated', checksum: 'prescrkine01', created_by: uid.martin, created_at: isoDate(-1, 15, 18) },
    { id: UUID.docPhoto, filename: 'photos-dermato.jpg', mime_type: 'image/jpeg', file_size: 1250000, storage_url: '/documents/photos-dermato.jpg', storage_bucket: 'documents', category: 'imagerie', subcategory: 'photographie', title: 'Photos lesions cutanees', patient_id: PAT.camille, document_date: isoDate(-3, 10, 0), status: 'validated', source: 'upload', checksum: 'photodermato01', created_by: uid.martin, created_at: isoDate(-3, 10, 0) },
    { id: UUID.docOrdoDerm, filename: 'ordonnance-dermato.pdf', mime_type: 'application/pdf', file_size: 55000, storage_url: '/documents/ordonnance-dermato.pdf', storage_bucket: 'documents', category: 'ordonnance', subcategory: 'ordonnance_medicament', title: 'Ordonnance dermocorticoide', patient_id: PAT.camille, document_date: isoDate(-3, 10, 50), status: 'validated', source: 'generated', checksum: 'ordodermato01', created_by: uid.martin, created_at: isoDate(-3, 10, 50) },
  ];

  await upsert('documents', docs, 'documents');

  // TC document shares - linked to correct teleconsultation UUIDs
  const shares = [
    // Morning TC 1 (Maud) - ECG reference + ordonnance paracetamol shared during TC
    { id: UUID.tcdsMorning1_1, teleconsultation_id: UUID.tcMorning1, document_id: UUID.docEcg, shared_by: 'practitioner', shared_by_id: PRACT, shared_at: isoDate(0, 9, 10), visible_to_patient: true, visible_to_practitioner: true, share_type: 'during_consultation', viewed_by_patient: true, viewed_by_practitioner: true, created_at: isoDate(0, 9, 10) },
    { id: UUID.tcdsMorning1_2, teleconsultation_id: UUID.tcMorning1, document_id: UUID.docOrdo, shared_by: 'practitioner', shared_by_id: PRACT, shared_at: isoDate(0, 9, 16), visible_to_patient: true, visible_to_practitioner: true, share_type: 'during_consultation', viewed_by_patient: true, viewed_by_practitioner: true, created_at: isoDate(0, 9, 16) },
    // Past TC 1 (Pablo, yesterday) - CR post-op + arret travail + prescription kine
    { id: UUID.tcdsPast1_1, teleconsultation_id: UUID.tcPast1, document_id: UUID.docCr, shared_by: 'practitioner', shared_by_id: PRACT, shared_at: isoDate(-1, 15, 20), visible_to_patient: true, visible_to_practitioner: true, share_type: 'post_consultation', viewed_by_patient: true, viewed_by_practitioner: true, created_at: isoDate(-1, 15, 20) },
    { id: UUID.tcdsPast1_2, teleconsultation_id: UUID.tcPast1, document_id: UUID.docArret, shared_by: 'practitioner', shared_by_id: PRACT, shared_at: isoDate(-1, 15, 15), visible_to_patient: true, visible_to_practitioner: true, share_type: 'post_consultation', viewed_by_patient: true, viewed_by_practitioner: true, created_at: isoDate(-1, 15, 15) },
    { id: UUID.tcdsPast1_3, teleconsultation_id: UUID.tcPast1, document_id: UUID.docKine, shared_by: 'practitioner', shared_by_id: PRACT, shared_at: isoDate(-1, 15, 18), visible_to_patient: true, visible_to_practitioner: true, share_type: 'post_consultation', viewed_by_patient: false, viewed_by_practitioner: true, created_at: isoDate(-1, 15, 18) },
    // Past TC 2 (Camille, -3d) - photos dermato shared by patient + ordonnance by practitioner
    { id: UUID.tcdsPast2_1, teleconsultation_id: UUID.tcPast2, document_id: UUID.docPhoto, shared_by: 'patient', shared_by_id: PAT.camille, shared_at: isoDate(-3, 10, 0), visible_to_patient: true, visible_to_practitioner: true, share_type: 'pre_consultation', viewed_by_patient: true, viewed_by_practitioner: true, created_at: isoDate(-3, 10, 0) },
    { id: UUID.tcdsPast2_2, teleconsultation_id: UUID.tcPast2, document_id: UUID.docOrdoDerm, shared_by: 'practitioner', shared_by_id: PRACT, shared_at: isoDate(-3, 10, 45), visible_to_patient: true, visible_to_practitioner: true, share_type: 'during_consultation', viewed_by_patient: true, viewed_by_practitioner: true, created_at: isoDate(-3, 10, 45) },
  ];

  await upsert('teleconsultation_documents', shares, 'tc-shares');
}

// =====================================================================
// Step 9: Log UUID summary
// =====================================================================
function logUUIDSummary() {
  console.log('\n--- UUID Summary ---');
  console.log(`  tcNow (in_progress):   ${UUID.tcNow}`);
  console.log(`  tcNext (waiting):      ${UUID.tcNext}`);
  console.log(`  tcMorning1 (completed): ${UUID.tcMorning1}`);
  console.log(`  tcMorning2 (completed): ${UUID.tcMorning2}`);
  console.log(`  tcMorning3 (completed): ${UUID.tcMorning3}`);
  console.log(`  tcAfternoon1 (scheduled): ${UUID.tcAfternoon1}`);
  console.log(`  tcAfternoon2 (scheduled): ${UUID.tcAfternoon2}`);
  console.log(`  tcPast1 (completed):   ${UUID.tcPast1}`);
  console.log(`  tcPast2 (completed):   ${UUID.tcPast2}`);
  console.log(`  tcPast3 (completed):   ${UUID.tcPast3}`);
  console.log(`  tcCancelled:           ${UUID.tcCancelled}`);
  console.log(`  tcTomorrow (scheduled): ${UUID.tcTomorrow}`);
  console.log(`  tcFuture (scheduled):  ${UUID.tcFuture}`);
}

// =====================================================================
// Step 10: Verify
// =====================================================================
async function verify() {
  console.log('\n--- Verification ---');

  const tables = ['patients', 'practitioners', 'appointments', 'consultations', 'teleconsultations', 'teleconsultation_notes', 'teleconsultation_documents', 'documents', 'user_roles'];

  for (const t of tables) {
    const r = await fetch(`${url}/rest/v1/${t}?select=id`, { headers: ADMIN_HEADERS, method: 'HEAD' });
    const range = r.headers.get('content-range');
    console.log(`  ${t}: ${range}`);
  }

  // Verify practitioner links
  const r = await fetch(`${url}/rest/v1/practitioners?select=first_name,last_name,user_id`, { headers: ADMIN_HEADERS });
  const practs = await r.json();
  console.log('\n  Practitioner links:');
  practs.forEach(p => console.log(`    ${p.first_name} ${p.last_name}: ${p.user_id ? 'LINKED' : 'NULL'}`));

  // Verify patient dates
  const r2 = await fetch(`${url}/rest/v1/patients?select=first_name,last_name,created_at&order=created_at`, { headers: ADMIN_HEADERS });
  const pats = await r2.json();
  console.log('\n  Patient registration dates:');
  pats.forEach(p => console.log(`    ${p.first_name} ${p.last_name}: ${p.created_at?.substring(0, 10)}`));

  // Verify TC statuses with temporal coherence
  const r3 = await fetch(`${url}/rest/v1/teleconsultations?select=id,status,scheduled_start,actual_start,actual_end,duration_minutes,consultation_reason,patient_id&order=scheduled_start`, { headers: ADMIN_HEADERS });
  const tcs = await r3.json();
  const now = new Date();
  console.log(`\n  Teleconsultations (now = ${now.toLocaleTimeString('fr-FR')}):`);
  tcs.forEach(tc => {
    const scheduled = new Date(tc.scheduled_start);
    const timeStr = scheduled.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' + scheduled.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const dur = tc.duration_minutes ? ` (${tc.duration_minutes}min)` : '';
    console.log(`    [${tc.status.padEnd(11)}] ${timeStr} - ${tc.consultation_reason}${dur}`);
  });

  // Coherence check
  console.log('\n  Coherence checks:');
  const activeTC = tcs.filter(tc => tc.status === 'in_progress');
  activeTC.forEach(tc => {
    const start = new Date(tc.actual_start || tc.scheduled_start);
    const minsSinceStart = Math.round((now - start) / 60000);
    console.log(`    in_progress: started ${minsSinceStart} min ago (${minsSinceStart < 30 ? 'OK' : 'WARNING: > 30 min'})`);
  });
  const waitingTC = tcs.filter(tc => tc.status === 'waiting');
  waitingTC.forEach(tc => {
    const scheduled = new Date(tc.scheduled_start);
    const minsUntil = Math.round((scheduled - now) / 60000);
    console.log(`    waiting: scheduled in ${minsUntil} min (${minsUntil > -10 ? 'OK' : 'WARNING: overdue'})`);
  });
}

// =====================================================================
// Main
// =====================================================================
async function main() {
  console.log('=== CareConnect Hub - Database Seeding (PostgREST) ===\n');

  const uid = await createUsers();
  console.log(`  IDs: martin=${uid.martin?.substring(0, 8)}, dubois=${uid.dubois?.substring(0, 8)}, laurent=${uid.laurent?.substring(0, 8)}\n`);

  await updateExistingData(uid);
  await insertTCAppointments(uid);
  await insertConsultations(uid);
  await insertTeleconsultations(uid);
  await insertTCNotes();
  await insertDocumentsAndShares(uid);
  logUUIDSummary();
  await verify();

  console.log('\n=== Seeding complete! ===');
  console.log('Login: dr.martin@medisync.fr / CareConnect2026');
}

main().catch(console.error);
