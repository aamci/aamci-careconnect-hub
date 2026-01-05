// Consultation Types for MediSync Pro

export interface MedicalHistory {
  id: string;
  type: 'appointment' | 'document' | 'lab' | 'imaging' | 'letter';
  title: string;
  date: Date;
  practitionerName: string;
  practitionerStructure?: string;
}

export interface Antecedent {
  id: string;
  category: 'medical' | 'surgical' | 'allergy' | 'family' | 'lifestyle' | 'cardiovascular';
  label: string;
  details?: string;
  icdCode?: string; // CIM-10
  icpcCode?: string; // CISP
  createdAt: Date;
}

export interface BiometricData {
  id: string;
  type: 'height' | 'weight' | 'bmi' | 'blood_pressure' | 'heart_rate' | 'temperature' | 'other';
  label: string;
  value: string | number | null;
  unit: string;
  isAuto?: boolean;
  recordedAt: Date;
}

export interface MedicalObservation {
  id: string;
  patientId: string;
  templateId?: string;
  templateName?: string;
  motif: string;
  interrogatoire: string;
  examen: string;
  biometrics: BiometricData[];
  conclusion?: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  authorName: string;
  isDraft: boolean;
}

export interface CarePlanAction {
  id: string;
  type: 'pharmacy' | 'biology' | 'letter' | 'imaging' | 'other';
  label: string;
  content?: string;
  createdAt: Date;
}

export interface CarePlanTask {
  id: string;
  label: string;
  isCompleted: boolean;
  dueDate?: Date;
}

export interface CarePlan {
  id: string;
  consultationId: string;
  actions: CarePlanAction[];
  nextTimeTasks: CarePlanTask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultationSession {
  id: string;
  patientId: string;
  practitionerId: string;
  appointmentId?: string;
  observation: MedicalObservation;
  carePlan: CarePlan;
  status: 'in_progress' | 'completed' | 'billed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  billedAt?: Date;
}

export interface PatientDossierImport {
  id: string;
  patientId: string;
  sourceSystem: string;
  importedAt: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mappedAntecedents: Antecedent[];
  mappedHistory: MedicalHistory[];
  errors?: string[];
}
