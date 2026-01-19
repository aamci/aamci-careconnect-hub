#!/usr/bin/env node
/**
 * COMPLETE Patient Data Seeding Script
 *
 * Populates ALL patient-related tables with coherent, linked data:
 * - allergen_reference (common allergens)
 * - patient_allergies (linked to allergen_reference)
 * - patient_antecedents (medical history)
 * - consultations (linked to appointments)
 * - prescriptions (linked to consultations)
 * - vaccinations (carnet de vaccination)
 * - vital_signs (biometrics)
 * - invoices (linked to appointments/consultations)
 * - documents (already seeded, will add more variety)
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

// ============================================================================
// HELPERS
// ============================================================================

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================================================
// DATA CONSTANTS
// ============================================================================

// Common allergens - USING EXISTING CODES FROM DATABASE
const ALLERGENS = [
  { code: 'PENICILLIN', name: 'Pénicilline' },
  { code: 'AMOXICILLIN', name: 'Amoxicilline' },
  { code: 'ASPIRIN', name: 'Aspirine' },
  { code: 'IBUPROFEN', name: 'Ibuprofène' },
  { code: 'SULFONAMIDES', name: 'Sulfamides' },
  { code: 'CEPHALOSPORINS', name: 'Céphalosporines' },
  { code: 'CODEINE', name: 'Codéine' },
  { code: 'MORPHINE', name: 'Morphine' },
  { code: 'NSAIDS', name: 'Anti-inflammatoires non stéroïdiens' },
  { code: 'LATEX', name: 'Latex' },
  { code: 'IODINE', name: 'Iode / Produits de contraste' },
  { code: 'PEANUTS', name: 'Arachides' },
  { code: 'TREE_NUTS', name: 'Fruits à coque' },
  { code: 'SHELLFISH', name: 'Crustacés' },
  { code: 'EGGS', name: 'Œufs' },
  { code: 'MILK', name: 'Lait' },
  { code: 'GLUTEN', name: 'Gluten' },
  { code: 'SOY', name: 'Soja' },
  { code: 'FISH', name: 'Poissons' },
  { code: 'POLLEN', name: 'Pollens' },
];

const ALLERGY_REACTIONS = [
  'Urticaire généralisée',
  'Œdème de Quincke',
  'Difficultés respiratoires',
  'Éruption cutanée',
  'Démangeaisons',
  'Nausées et vomissements',
  'Choc anaphylactique',
  'Rhinite allergique',
  'Conjonctivite',
  'Eczéma de contact',
];

const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'];

// Antecedents by category
const ANTECEDENTS_DATA = {
  medical: [
    { title: 'Diabète de type 2', description: 'Diagnostiqué et traité par metformine' },
    { title: 'Hypertension artérielle', description: 'Sous traitement antihypertenseur' },
    { title: 'Asthme', description: 'Asthme allergique modéré' },
    { title: 'Hypothyroïdie', description: 'Substitution par lévothyroxine' },
    { title: 'Migraine chronique', description: 'Crises fréquentes, traitement de fond' },
    { title: 'Reflux gastro-œsophagien', description: 'Sous IPP au long cours' },
    { title: 'Arthrose', description: 'Gonarthrose bilatérale' },
    { title: 'Dépression', description: 'Épisode dépressif majeur traité' },
    { title: 'Insuffisance rénale chronique', description: 'Stade 3, suivi néphrologique' },
    { title: 'BPCO', description: 'Stade II, ancien fumeur' },
  ],
  cardiovascular: [
    { title: 'Infarctus du myocarde', description: 'IDM antérieur en 2019, stent posé' },
    { title: 'Fibrillation auriculaire', description: 'FA permanente, anticoagulé' },
    { title: 'Insuffisance cardiaque', description: 'FEVG 40%, sous traitement optimal' },
    { title: 'AVC ischémique', description: 'AVC sylvien droit, séquelles minimes' },
    { title: 'Artériopathie des membres inférieurs', description: 'Stade 2 de Leriche et Fontaine' },
    { title: 'Anévrisme aortique', description: 'AAA 4cm, surveillance échographique' },
    { title: 'Thrombose veineuse profonde', description: 'TVP membre inférieur gauche' },
    { title: 'Embolie pulmonaire', description: 'EP subsegmentaire, anticoagulation 6 mois' },
  ],
  surgical: [
    { title: 'Appendicectomie', description: 'Chirurgie en 2010, sans complication' },
    { title: 'Cholécystectomie', description: 'Ablation vésicule biliaire par cœlioscopie' },
    { title: 'Prothèse totale de hanche', description: 'PTH droite en 2018' },
    { title: 'Prothèse totale de genou', description: 'PTG gauche en 2020' },
    { title: 'Césarienne', description: 'Césarienne programmée' },
    { title: 'Hystérectomie', description: 'Hystérectomie totale pour fibrome' },
    { title: 'Hernie inguinale', description: 'Cure de hernie inguinale droite' },
    { title: 'Thyroïdectomie', description: 'Thyroïdectomie totale pour nodule' },
    { title: 'Bypass gastrique', description: 'Chirurgie bariatrique en 2017' },
  ],
  family: [
    { title: 'Cancer du sein (mère)', description: 'Mère diagnostiquée à 55 ans' },
    { title: 'Cancer du côlon (père)', description: 'Père décédé à 70 ans' },
    { title: 'Diabète familial', description: 'Parents et grand-parents diabétiques' },
    { title: 'Maladies cardiovasculaires', description: 'Antécédents familiaux d\'IDM précoce' },
    { title: 'Hypertension familiale', description: 'Plusieurs membres de la famille hypertendus' },
    { title: 'Maladie d\'Alzheimer', description: 'Grand-mère maternelle atteinte' },
    { title: 'Polyarthrite rhumatoïde', description: 'Tante maternelle atteinte' },
    { title: 'Glaucome familial', description: 'Père et oncle atteints' },
  ],
  lifestyle: [
    { title: 'Tabagisme actif', description: '20 paquets-années, sevrage en cours' },
    { title: 'Ancien fumeur', description: 'Sevré depuis 5 ans, 30 PA' },
    { title: 'Consommation d\'alcool régulière', description: '2-3 verres de vin par jour' },
    { title: 'Sédentarité', description: 'Activité physique insuffisante' },
    { title: 'Alimentation déséquilibrée', description: 'Excès de graisses et sucres' },
    { title: 'Stress professionnel chronique', description: 'Cadre supérieur, charge de travail élevée' },
    { title: 'Troubles du sommeil', description: 'Insomnie chronique, apnées du sommeil' },
    { title: 'Activité physique régulière', description: '3 séances de sport par semaine' },
  ],
};

// Diagnosis templates (ICD-10 style)
const DIAGNOSES = [
  { code: 'J06.9', label: 'Infection aiguë des voies respiratoires supérieures' },
  { code: 'M54.5', label: 'Lombalgie' },
  { code: 'I10', label: 'Hypertension artérielle essentielle' },
  { code: 'E11', label: 'Diabète de type 2' },
  { code: 'J45', label: 'Asthme' },
  { code: 'K21', label: 'Reflux gastro-œsophagien' },
  { code: 'F32', label: 'Épisode dépressif' },
  { code: 'M17', label: 'Gonarthrose' },
  { code: 'R51', label: 'Céphalée' },
  { code: 'J20', label: 'Bronchite aiguë' },
  { code: 'N39.0', label: 'Infection urinaire' },
  { code: 'L30.9', label: 'Dermatite non spécifiée' },
  { code: 'H10', label: 'Conjonctivite' },
  { code: 'K59.0', label: 'Constipation' },
  { code: 'R10.4', label: 'Douleur abdominale' },
];

// Physical examination templates
const PHYSICAL_EXAMS = [
  { region: 'general', finding: 'Patient en bon état général, conscient et orienté' },
  { region: 'cardiovascular', finding: 'Auscultation cardiaque normale, pas de souffle' },
  { region: 'respiratory', finding: 'Murmure vésiculaire bilatéral, pas de râles' },
  { region: 'abdominal', finding: 'Abdomen souple, dépressible, indolore à la palpation' },
  { region: 'neurological', finding: 'Examen neurologique sans particularité' },
  { region: 'musculoskeletal', finding: 'Pas de déformation articulaire visible' },
  { region: 'skin', finding: 'Pas de lésion cutanée suspecte' },
  { region: 'ent', finding: 'ORL sans particularité, gorge non érythémateuse' },
];

// Medications for prescriptions
const MEDICATIONS = [
  { name: 'Doliprane 1000mg', dosage: '1 comprimé', frequency: '3 fois par jour', duration: '5 jours', indication: 'Douleur et fièvre' },
  { name: 'Amoxicilline 1g', dosage: '1 comprimé', frequency: '3 fois par jour', duration: '7 jours', indication: 'Infection bactérienne' },
  { name: 'Oméprazole 20mg', dosage: '1 gélule', frequency: '1 fois par jour le matin', duration: '30 jours', indication: 'RGO' },
  { name: 'Metformine 500mg', dosage: '1 comprimé', frequency: '2 fois par jour', duration: '90 jours', indication: 'Diabète type 2' },
  { name: 'Amlodipine 5mg', dosage: '1 comprimé', frequency: '1 fois par jour', duration: '90 jours', indication: 'Hypertension' },
  { name: 'Lévothyrox 50μg', dosage: '1 comprimé', frequency: '1 fois par jour à jeun', duration: '90 jours', indication: 'Hypothyroïdie' },
  { name: 'Ventoline spray', dosage: '2 bouffées', frequency: 'si besoin', duration: '30 jours', indication: 'Asthme' },
  { name: 'Xanax 0.25mg', dosage: '1 comprimé', frequency: 'si besoin', duration: '14 jours', indication: 'Anxiété' },
  { name: 'Kardégic 75mg', dosage: '1 sachet', frequency: '1 fois par jour', duration: '90 jours', indication: 'Prévention cardiovasculaire' },
  { name: 'Atorvastatine 10mg', dosage: '1 comprimé', frequency: '1 fois par jour le soir', duration: '90 jours', indication: 'Hypercholestérolémie' },
  { name: 'Bisoprolol 5mg', dosage: '1 comprimé', frequency: '1 fois par jour', duration: '90 jours', indication: 'Hypertension/Insuffisance cardiaque' },
  { name: 'Ibuprofène 400mg', dosage: '1 comprimé', frequency: '3 fois par jour pendant les repas', duration: '5 jours', indication: 'Inflammation' },
  { name: 'Tramadol 50mg', dosage: '1 gélule', frequency: 'si douleur intense', duration: '7 jours', indication: 'Douleur modérée à sévère' },
  { name: 'Aerius 5mg', dosage: '1 comprimé', frequency: '1 fois par jour', duration: '15 jours', indication: 'Allergie' },
  { name: 'Sérum physiologique', dosage: 'Lavages nasaux', frequency: '3 fois par jour', duration: '7 jours', indication: 'Rhinite' },
];

// Vaccines (French vaccination schedule)
const VACCINES = [
  { name: 'Vaccin anti-grippal', code: 'GRIPPE', manufacturers: ['Sanofi Pasteur', 'GSK', 'Mylan'] },
  { name: 'Vaccin COVID-19 (Pfizer)', code: 'COVID19-PFIZER', manufacturers: ['Pfizer-BioNTech'] },
  { name: 'Vaccin COVID-19 (Moderna)', code: 'COVID19-MODERNA', manufacturers: ['Moderna'] },
  { name: 'DTP (Diphtérie-Tétanos-Polio)', code: 'DTP', manufacturers: ['Sanofi Pasteur'] },
  { name: 'Vaccin Hépatite B', code: 'HEPB', manufacturers: ['GSK', 'MSD'] },
  { name: 'Vaccin Pneumocoque (Prevenar 13)', code: 'PNEUMO13', manufacturers: ['Pfizer'] },
  { name: 'Vaccin Pneumocoque (Pneumovax 23)', code: 'PNEUMO23', manufacturers: ['MSD'] },
  { name: 'Vaccin Zona (Shingrix)', code: 'ZONA', manufacturers: ['GSK'] },
  { name: 'ROR (Rougeole-Oreillons-Rubéole)', code: 'ROR', manufacturers: ['Sanofi Pasteur', 'MSD'] },
  { name: 'Vaccin Hépatite A', code: 'HEPA', manufacturers: ['Sanofi Pasteur', 'GSK'] },
  { name: 'Vaccin Fièvre Jaune', code: 'FJ', manufacturers: ['Sanofi Pasteur'] },
  { name: 'Vaccin Méningocoque C', code: 'MENC', manufacturers: ['Pfizer', 'GSK'] },
];

const ADMIN_SITES = ['Bras gauche', 'Bras droit', 'Cuisse gauche', 'Cuisse droite', 'Fesse'];

// Invoice items
const INVOICE_ITEMS = [
  { description: 'Consultation générale', unit_price: 26.50 },
  { description: 'Consultation longue', unit_price: 50.00 },
  { description: 'Consultation complexe', unit_price: 60.00 },
  { description: 'Visite à domicile', unit_price: 35.00 },
  { description: 'Vaccination', unit_price: 25.00 },
  { description: 'Acte technique (ECG)', unit_price: 14.26 },
  { description: 'Acte technique (spirométrie)', unit_price: 40.00 },
  { description: 'Certificat médical', unit_price: 25.00 },
  { description: 'Renouvellement ordonnance', unit_price: 26.50 },
  { description: 'Téléconsultation', unit_price: 26.50 },
];

// ============================================================================
// SEEDING FUNCTIONS
// ============================================================================

async function seedAllergenReference() {
  console.log('\n📋 Checking allergen_reference...');
  // Allergens already exist in database, just verify
  const { data: existing, error } = await supabase
    .from('allergen_reference')
    .select('code')
    .limit(1);

  if (error) {
    console.error('  ❌ Error checking allergens:', error.message);
  } else if (existing && existing.length > 0) {
    console.log('  ✅ Allergen reference table already populated');
  }
}

async function seedPatientAllergies(patients, practitioners) {
  console.log('\n🤧 Seeding patient_allergies...');

  const allergiesToInsert = [];

  for (const patient of patients) {
    // 40% of patients have allergies, between 1-3 allergies
    if (Math.random() > 0.4) continue;

    const numAllergies = randomInt(1, 3);
    const selectedAllergens = [...ALLERGENS]
      .sort(() => Math.random() - 0.5)
      .slice(0, numAllergies);

    for (const allergen of selectedAllergens) {
      const confirmedDate = randomDate(
        new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), // 5 years ago
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 1 month ago
      );

      allergiesToInsert.push({
        patient_id: patient.id,
        allergen_code: allergen.code,
        severity: randomItem(SEVERITY_LEVELS),
        reaction_description: randomItem(ALLERGY_REACTIONS),
        source: randomItem(['patient_reported', 'medical_record', 'test_result']),
        notes: Math.random() > 0.7 ? `Allergie confirmée par test cutané` : null,
        confirmed_date: confirmedDate.toISOString().split('T')[0],
        confirmed_by: randomItem(practitioners).id,
        is_active: true,
      });
    }
  }

  if (allergiesToInsert.length > 0) {
    const { error } = await supabase.from('patient_allergies').insert(allergiesToInsert);
    if (error) {
      console.error('  ❌ Error seeding allergies:', error.message);
    } else {
      console.log(`  ✅ Created ${allergiesToInsert.length} patient allergies`);
    }
  } else {
    console.log('  ⏭️  No allergies to insert');
  }
}

async function seedPatientAntecedents(patients) {
  console.log('\n📜 Seeding patient_antecedents...');

  const antecedentsToInsert = [];
  const categories = Object.keys(ANTECEDENTS_DATA);

  for (const patient of patients) {
    // Each patient gets 2-6 antecedents from various categories
    const numAntecedents = randomInt(2, 6);
    const selectedCategories = [...categories]
      .sort(() => Math.random() - 0.5)
      .slice(0, numAntecedents);

    for (const category of selectedCategories) {
      const antecedent = randomItem(ANTECEDENTS_DATA[category]);
      const occurrenceDate = randomDate(
        new Date(Date.now() - 10 * 365 * 24 * 60 * 60 * 1000), // 10 years ago
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 1 month ago
      );

      antecedentsToInsert.push({
        patient_id: patient.id,
        category: category,
        title: antecedent.title,
        description: antecedent.description,
        severity: category === 'lifestyle' ? null : randomItem(SEVERITY_LEVELS),
        occurrence_date: occurrenceDate.toISOString().split('T')[0],
        is_active: true,
        notes: Math.random() > 0.8 ? 'Suivi régulier recommandé' : null,
      });
    }
  }

  const { error } = await supabase.from('patient_antecedents').insert(antecedentsToInsert);
  if (error) {
    console.error('  ❌ Error seeding antecedents:', error.message);
  } else {
    console.log(`  ✅ Created ${antecedentsToInsert.length} patient antecedents`);
  }
}

async function seedConsultations(patients, practitioners, appointments) {
  console.log('\n🩺 Seeding consultations...');

  // Get completed appointments for consultations
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const consultationsToInsert = [];
  const consultationIds = [];

  for (const appointment of completedAppointments) {
    const startTime = new Date(appointment.start_time);
    const endTime = new Date(startTime.getTime() + randomInt(15, 45) * 60000);

    const diagnosis = randomItem(DIAGNOSES);
    const physicalExam = {};
    // Add 2-4 physical exam findings
    const numExams = randomInt(2, 4);
    const selectedExams = [...PHYSICAL_EXAMS].sort(() => Math.random() - 0.5).slice(0, numExams);
    for (const exam of selectedExams) {
      physicalExam[exam.region] = exam.finding;
    }

    const consultationId = crypto.randomUUID();
    consultationIds.push({
      id: consultationId,
      appointment_id: appointment.id,
      patient_id: appointment.patient_id,
      practitioner_id: appointment.practitioner_id,
      start_time: startTime.toISOString(),
    });

    consultationsToInsert.push({
      id: consultationId,
      patient_id: appointment.patient_id,
      practitioner_id: appointment.practitioner_id,
      appointment_id: appointment.id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'completed',
      chief_complaint: `Motif: ${randomItem(['Douleur', 'Fièvre', 'Fatigue', 'Contrôle', 'Renouvellement', 'Suivi'])}`,
      history_of_present_illness: `Patient se présente pour ${diagnosis.label.toLowerCase()}. Symptômes évoluant depuis ${randomInt(1, 14)} jours.`,
      physical_examination: physicalExam,
      diagnosis: { primary: diagnosis, secondary: Math.random() > 0.7 ? randomItem(DIAGNOSES) : null },
      treatment_plan: `Traitement symptomatique. Repos conseillé. Reconsulter si aggravation.`,
      follow_up_instructions: Math.random() > 0.5 ? `Contrôle dans ${randomInt(1, 4)} semaines` : null,
      notes: Math.random() > 0.7 ? 'Patient bien informé sur sa pathologie' : null,
    });
  }

  // Insert in batches
  const batchSize = 50;
  for (let i = 0; i < consultationsToInsert.length; i += batchSize) {
    const batch = consultationsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('consultations').insert(batch);
    if (error) {
      console.error(`  ❌ Error seeding consultations batch ${i / batchSize + 1}:`, error.message);
    }
  }

  console.log(`  ✅ Created ${consultationsToInsert.length} consultations`);
  return consultationIds;
}

async function seedPrescriptions(consultations, practitioners) {
  console.log('\n💊 Seeding prescriptions...');

  const prescriptionsToInsert = [];

  // 70% of consultations result in a prescription
  const consultationsWithPrescription = consultations.filter(() => Math.random() < 0.7);

  for (const consultation of consultationsWithPrescription) {
    const numMedications = randomInt(1, 4);
    const selectedMeds = [...MEDICATIONS].sort(() => Math.random() - 0.5).slice(0, numMedications);

    const prescriptionContent = selectedMeds.map((med, idx) => ({
      line_number: idx + 1,
      medication_name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      indication: med.indication,
      instructions: `À prendre ${med.frequency}`,
    }));

    const startDate = new Date(consultation.start_time);
    const durationDays = randomInt(7, 90);

    prescriptionsToInsert.push({
      patient_id: consultation.patient_id,
      practitioner_id: consultation.practitioner_id,
      consultation_id: consultation.id,
      appointment_id: consultation.appointment_id,
      type: randomItem(['standard', 'renewal', 'hospital']),
      status: 'signed',
      content: prescriptionContent,
      start_date: startDate.toISOString().split('T')[0],
      end_date: addDays(startDate, durationDays).toISOString().split('T')[0],
      duration_days: durationDays,
      renewable: Math.random() > 0.5,
      max_renewals: Math.random() > 0.5 ? randomInt(1, 3) : null,
      signed_at: startDate.toISOString(),
      // signed_by references auth.users, so we leave it null
    });
  }

  const batchSize = 50;
  for (let i = 0; i < prescriptionsToInsert.length; i += batchSize) {
    const batch = prescriptionsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('prescriptions').insert(batch);
    if (error) {
      console.error(`  ❌ Error seeding prescriptions batch ${i / batchSize + 1}:`, error.message);
    }
  }

  console.log(`  ✅ Created ${prescriptionsToInsert.length} prescriptions`);
}

async function seedVaccinations(patients, practitioners) {
  console.log('\n💉 Seeding vaccinations...');

  const vaccinationsToInsert = [];
  const now = new Date();

  for (const patient of patients) {
    // Each patient has 2-5 vaccinations
    const numVaccines = randomInt(2, 5);
    const selectedVaccines = [...VACCINES].sort(() => Math.random() - 0.5).slice(0, numVaccines);

    for (const vaccine of selectedVaccines) {
      const adminDate = randomDate(
        new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000), // 5 years ago
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
      );

      const doseNumber = vaccine.code.includes('COVID') ? randomInt(1, 4) : randomInt(1, 2);
      const nextDoseDate = Math.random() > 0.6 ? addDays(adminDate, randomInt(180, 365)) : null;

      vaccinationsToInsert.push({
        patient_id: patient.id,
        practitioner_id: randomItem(practitioners).id,
        vaccine_name: vaccine.name,
        vaccine_code: vaccine.code,
        administration_date: adminDate.toISOString().split('T')[0],
        administration_site: randomItem(ADMIN_SITES),
        dose_number: doseNumber,
        batch_number: `LOT${randomInt(10000, 99999)}`,
        manufacturer: randomItem(vaccine.manufacturers),
        next_dose_date: nextDoseDate ? nextDoseDate.toISOString().split('T')[0] : null,
        notes: Math.random() > 0.8 ? 'Vaccination bien tolérée' : null,
      });
    }
  }

  const batchSize = 50;
  for (let i = 0; i < vaccinationsToInsert.length; i += batchSize) {
    const batch = vaccinationsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('vaccinations').insert(batch);
    if (error) {
      console.error(`  ❌ Error seeding vaccinations batch ${i / batchSize + 1}:`, error.message);
    }
  }

  console.log(`  ✅ Created ${vaccinationsToInsert.length} vaccinations`);
}

async function seedVitalSigns(consultations) {
  console.log('\n📊 Seeding vital_signs (biometrics)...');

  const vitalSignsToInsert = [];

  for (const consultation of consultations) {
    const recordedAt = new Date(consultation.start_time);

    // Base values with some randomness
    const isMale = Math.random() > 0.5;
    const age = randomInt(25, 75);
    const baseWeight = isMale ? randomInt(65, 95) : randomInt(50, 80);
    const baseHeight = isMale ? randomInt(165, 190) : randomInt(155, 175);

    const weight = baseWeight + randomInt(-3, 3);
    const height = baseHeight;
    const bmi = Math.round((weight / ((height / 100) ** 2)) * 10) / 10;

    vitalSignsToInsert.push({
      patient_id: consultation.patient_id,
      consultation_id: consultation.id,
      recorded_at: recordedAt.toISOString(),
      weight_kg: weight,
      height_cm: height,
      bmi: bmi,
      systolic_bp: randomInt(110, 150),
      diastolic_bp: randomInt(65, 95),
      heart_rate: randomInt(55, 100),
      respiratory_rate: randomInt(12, 20),
      temperature_c: Math.round((36.2 + Math.random() * 1.5) * 10) / 10,
      oxygen_saturation: randomInt(95, 100),
      blood_glucose: Math.random() > 0.7 ? randomInt(70, 140) : null,
      notes: Math.random() > 0.9 ? 'Tension artérielle à surveiller' : null,
    });
  }

  const batchSize = 50;
  for (let i = 0; i < vitalSignsToInsert.length; i += batchSize) {
    const batch = vitalSignsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('vital_signs').insert(batch);
    if (error) {
      console.error(`  ❌ Error seeding vital_signs batch ${i / batchSize + 1}:`, error.message);
    }
  }

  console.log(`  ✅ Created ${vitalSignsToInsert.length} vital sign records`);
}

async function seedInvoices(patients, practitioners, consultations, appointments) {
  console.log('\n💰 Seeding invoices...');

  const invoicesToInsert = [];
  let invoiceNumber = 1000;

  // Create invoices for completed consultations
  for (const consultation of consultations) {
    const appointment = appointments.find(a => a.id === consultation.appointment_id);
    if (!appointment) continue;

    const issueDate = new Date(consultation.start_time);
    const dueDate = addDays(issueDate, 30);

    // Select 1-3 invoice items
    const numItems = randomInt(1, 3);
    const selectedItems = [...INVOICE_ITEMS].sort(() => Math.random() - 0.5).slice(0, numItems);

    const subtotal = selectedItems.reduce((sum, item) => sum + item.unit_price, 0);
    const taxAmount = Math.round(subtotal * 0.055 * 100) / 100; // 5.5% TVA santé
    const totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;

    // 80% paid, 10% pending, 10% overdue
    const statusRandom = Math.random();
    let status, paidAmount, paidAt;
    if (statusRandom < 0.8) {
      status = 'paid';
      paidAmount = totalAmount;
      paidAt = addDays(issueDate, randomInt(0, 14)).toISOString();
    } else if (statusRandom < 0.9) {
      status = 'pending';
      paidAmount = 0;
      paidAt = null;
    } else {
      status = 'overdue';
      paidAmount = 0;
      paidAt = null;
    }

    invoiceNumber++;

    invoicesToInsert.push({
      patient_id: consultation.patient_id,
      practitioner_id: consultation.practitioner_id,
      appointment_id: consultation.appointment_id,
      consultation_id: consultation.id,
      invoice_number: `FAC-${new Date(issueDate).getFullYear()}-${String(invoiceNumber).padStart(5, '0')}`,
      issue_date: issueDate.toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      status: status,
      subtotal: subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      paid_at: paidAt,
      currency: 'EUR',
      payment_terms: 'Paiement sous 30 jours',
      metadata: {
        items: selectedItems,
        payment_method: status === 'paid' ? randomItem(['carte_bancaire', 'especes', 'cheque', 'virement']) : null,
      },
      notes: Math.random() > 0.9 ? 'Tiers-payant appliqué' : null,
    });
  }

  const batchSize = 50;
  for (let i = 0; i < invoicesToInsert.length; i += batchSize) {
    const batch = invoicesToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('invoices').insert(batch);
    if (error) {
      console.error(`  ❌ Error seeding invoices batch ${i / batchSize + 1}:`, error.message);
    }
  }

  console.log(`  ✅ Created ${invoicesToInsert.length} invoices`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('🚀 Starting COMPLETE patient data seeding...\n');
  console.log('=' .repeat(60));

  // 1. Fetch existing base data
  console.log('\n📥 Fetching existing base data...');

  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('*')
    .eq('is_active', true);

  if (patientsError || !patients?.length) {
    console.error('❌ No patients found:', patientsError?.message);
    return;
  }
  console.log(`  Found ${patients.length} patients`);

  const { data: practitioners, error: practitionersError } = await supabase
    .from('practitioners')
    .select('*')
    .eq('is_active', true);

  if (practitionersError || !practitioners?.length) {
    console.error('❌ No practitioners found:', practitionersError?.message);
    return;
  }
  console.log(`  Found ${practitioners.length} practitioners`);

  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select('*')
    .order('start_time', { ascending: false });

  if (appointmentsError) {
    console.error('❌ Error fetching appointments:', appointmentsError.message);
    return;
  }
  console.log(`  Found ${appointments?.length || 0} appointments`);

  // 2. Seed all tables
  console.log('\n' + '=' .repeat(60));
  console.log('SEEDING ALL PATIENT-RELATED TABLES');
  console.log('=' .repeat(60));

  // Allergen reference (must be first)
  await seedAllergenReference();

  // Patient allergies
  await seedPatientAllergies(patients, practitioners);

  // Patient antecedents (medical history)
  await seedPatientAntecedents(patients);

  // Consultations (linked to appointments)
  const consultations = await seedConsultations(patients, practitioners, appointments || []);

  // Prescriptions (linked to consultations)
  await seedPrescriptions(consultations, practitioners);

  // Vaccinations
  await seedVaccinations(patients, practitioners);

  // Vital signs / biometrics
  await seedVitalSigns(consultations);

  // Invoices
  await seedInvoices(patients, practitioners, consultations, appointments || []);

  // 3. Summary
  console.log('\n' + '=' .repeat(60));
  console.log('✅ COMPLETE DATA SEEDING FINISHED!');
  console.log('=' .repeat(60));
  console.log('\nAll patient tabs should now have data:');
  console.log('  - HOME: Patient summary with appointments');
  console.log('  - CONSULTATION EN COURS: Active consultations');
  console.log('  - INFOS ADMINISTRATIVES: Patient profile (already done)');
  console.log('  - HISTORIQUE: Appointments history');
  console.log('  - ANTÉCÉDENTS ET MODE DE VIE: Medical history');
  console.log('  - DOCUMENTS: Files and reports');
  console.log('  - OBSERVATIONS: Consultation notes');
  console.log('  - TRAITEMENT EN COURS: Prescriptions');
  console.log('  - BIOLOGIE ET BIOMÉTRIE: Vital signs');
  console.log('  - CARNET DE VACCINATION: Vaccination records');
  console.log('  - FACTURES: Invoices');
}

main().catch(console.error);
