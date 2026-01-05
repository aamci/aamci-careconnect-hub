import { 
  MedicalHistory, 
  Antecedent, 
  BiometricData, 
  MedicalObservation, 
  CarePlan,
  ConsultationSession 
} from '@/types/consultation';

// Mock patient for consultation view (Damien GUYOT from image)
export const consultationPatient = {
  id: 'pat-consultation',
  civility: 'Monsieur',
  firstName: 'Damien',
  lastName: 'GUYOT',
  dateOfBirth: new Date(1960, 2, 3), // 03/03/1960
  age: 63,
  referringDoctor: 'Inconnu',
  hasImportedDossier: false,
};

// Medical history timeline (from image)
export const mockMedicalHistory: MedicalHistory[] = [
  // Aujourd'hui
  {
    id: 'hist-1',
    type: 'appointment',
    title: 'Consultation de suivi de cardiologie',
    date: new Date(),
    practitionerName: 'JOHNSON NICOLAS',
  },
  // Janvier 2024
  {
    id: 'hist-2',
    type: 'appointment',
    title: 'Consultation de suivi de cardiologie',
    date: new Date(2024, 0, 15),
    practitionerName: 'JOHNSON NICOLAS',
  },
  {
    id: 'hist-3',
    type: 'appointment',
    title: 'Pose de holter ECG',
    date: new Date(2024, 0, 8),
    practitionerName: 'JOHNSON HOLTER',
  },
  // Février 2023
  {
    id: 'hist-4',
    type: 'appointment',
    title: 'Écho cardiaque (échocardiographie)',
    date: new Date(2023, 1, 17),
    practitionerName: 'JOHNSON NICOLAS',
  },
  // Décembre 2021
  {
    id: 'hist-5',
    type: 'appointment',
    title: 'Consultation de suivi de cardiologie',
    date: new Date(2021, 11, 17),
    practitionerName: 'JOHNSON NICOLAS',
  },
  {
    id: 'hist-6',
    type: 'appointment',
    title: 'Pose de holter ECG',
    date: new Date(2021, 11, 13),
    practitionerName: 'JOHNSON HOLTER',
  },
  // Novembre 2020
  {
    id: 'hist-7',
    type: 'appointment',
    title: 'Écho cardiaque (échocardiographie)',
    date: new Date(2020, 10, 17),
    practitionerName: 'JOHNSON NICOLAS',
  },
  // Novembre 2019
  {
    id: 'hist-8',
    type: 'appointment',
    title: 'Consultation de suivi de cardiologie',
    date: new Date(2019, 10, 22),
    practitionerName: 'JOHNSON NICOLAS',
  },
  {
    id: 'hist-9',
    type: 'appointment',
    title: 'Pose de holter ECG',
    date: new Date(2019, 10, 13),
    practitionerName: 'JOHNSON HOLTER',
  },
];

// Antecedents (from image)
export const mockAntecedents: Antecedent[] = [
  // Antécédents médicaux
  {
    id: 'ant-1',
    category: 'medical',
    label: 'Diabète sucré de type 2',
    icdCode: 'E11',
    createdAt: new Date(2019, 0, 1),
  },
  {
    id: 'ant-2',
    category: 'medical',
    label: 'Infarctus aigu du myocarde',
    icdCode: 'I21',
    createdAt: new Date(2018, 5, 15),
  },
  {
    id: 'ant-3',
    category: 'medical',
    label: 'Hypertension essentielle (primitive)',
    icdCode: 'I10',
    createdAt: new Date(2015, 2, 10),
  },
  // Appareil cardiovasculaire
  {
    id: 'ant-4',
    category: 'cardiovascular',
    label: 'PACE MAKER MEDICO Type SSI (ME...)',
    details: 'Implanté en 2020',
    createdAt: new Date(2020, 3, 20),
  },
];

// Biometric data template
export const defaultBiometrics: BiometricData[] = [
  {
    id: 'bio-1',
    type: 'height',
    label: 'Taille du patient',
    value: null,
    unit: 'cm',
    recordedAt: new Date(),
  },
  {
    id: 'bio-2',
    type: 'weight',
    label: 'Poids du patient',
    value: null,
    unit: 'kg',
    recordedAt: new Date(),
  },
  {
    id: 'bio-3',
    type: 'bmi',
    label: 'Indice de Masse Corporelle (IMC)',
    value: null,
    unit: 'kg/m2',
    isAuto: true,
    recordedAt: new Date(),
  },
];

// Current observation template
export const currentObservation: MedicalObservation = {
  id: 'obs-1',
  patientId: 'pat-consultation',
  templateId: undefined,
  templateName: undefined,
  motif: '',
  interrogatoire: '',
  examen: '',
  biometrics: defaultBiometrics,
  createdAt: new Date(),
  updatedAt: new Date(),
  authorId: 'pract-1',
  authorName: 'Dr JOHNSON NICOLAS',
  isDraft: true,
};

// Current care plan
export const currentCarePlan: CarePlan = {
  id: 'cp-1',
  consultationId: 'session-1',
  actions: [],
  nextTimeTasks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Observation templates
export const observationTemplates = [
  { id: 'tpl-1', name: 'Consultation de suivi cardiologie' },
  { id: 'tpl-2', name: 'Première consultation' },
  { id: 'tpl-3', name: 'Bilan annuel' },
  { id: 'tpl-4', name: 'Urgence cardiaque' },
  { id: 'tpl-5', name: 'Pose de holter' },
];
