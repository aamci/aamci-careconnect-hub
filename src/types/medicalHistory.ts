/**
 * Medical History Types - Canonical Data Model
 * Enterprise-grade e-health platform types for antecedents and lifestyle
 *
 * Coding systems supported:
 * - CIM-10: International Classification of Diseases (French version)
 * - CISP-2: International Classification of Primary Care
 * - CCAM: Classification commune des actes medicaux
 * - ATC: Anatomical Therapeutic Chemical Classification
 */

// ============================================================================
// TERMINOLOGY & CODING SYSTEMS
// ============================================================================

export type TerminologySystem =
  | 'CIM10'      // Diagnostic codes
  | 'CISP2'      // Primary care classification
  | 'CCAM'       // Medical procedures
  | 'ATC'        // Drug classification
  | 'LOINC'      // Lab observations
  | 'SNOMED'     // Clinical terms
  | 'FREE_TEXT'; // Uncoded free text

export interface TerminologyConcept {
  id: string;
  system: TerminologySystem;
  code: string;
  display: string;
  synonyms: string[];
  abbreviations: string[];
  normalizedForms: string[];
  parentCode?: string;
  isActive: boolean;
}

export interface CodedValue {
  system: TerminologySystem;
  code: string;
  display: string;
  version?: string;
  userSelected?: boolean;
}

export interface TerminologySuggestion {
  concept: TerminologyConcept;
  score: number;
  matchType: 'exact' | 'prefix' | 'abbreviation' | 'synonym' | 'fuzzy';
  highlightRanges: Array<{ start: number; end: number }>;
}

// ============================================================================
// SEVERITY & STATUS
// ============================================================================

export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type ClinicalStatus =
  | 'active'
  | 'resolved'
  | 'inactive'
  | 'recurrence'
  | 'remission';

export type VerificationStatus =
  | 'confirmed'
  | 'suspected'
  | 'refuted'
  | 'entered_in_error';

export type DataSource =
  | 'manual'
  | 'import'
  | 'lab'
  | 'migrated'
  | 'api'
  | 'patient_portal';

// ============================================================================
// BASE CLINICAL ENTITY
// ============================================================================

export interface ClinicalEntityBase {
  id: string;
  patientId: string;
  coding?: CodedValue;
  freeText?: string;
  clinicalStatus: ClinicalStatus;
  verificationStatus: VerificationStatus;
  severity?: Severity;
  onsetDate?: Date;
  abatementDate?: Date;
  recordedDate: Date;
  source: DataSource;
  recordedBy: string;
  notes?: string;
  isPinned: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// PERINATAL INFORMATION (0-3 years visibility)
// ============================================================================

export interface PerinatalInfo {
  id: string;
  patientId: string;
  gestationalAgeWeeks?: number;
  isPremature: boolean;
  birthWeightGrams?: number;
  apgarScore1Min?: number;
  apgarScore5Min?: number;
  apgarScore10Min?: number;
  deliveryMode?: 'vaginal' | 'cesarean' | 'instrumental';
  complications?: string[];
  neonatalContext?: string;
  breastfed?: boolean;
  breastfeedingDurationWeeks?: number;
  notes?: string;
  recordedBy: string;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MEDICAL ANTECEDENTS (Conditions)
// ============================================================================

export interface MedicalCondition extends ClinicalEntityBase {
  type: 'medical';
  isALD: boolean;
  aldStartDate?: Date;
  aldEndDate?: Date;
  aldNumber?: string;
  isChronicDisease: boolean;
  relatedConditions?: string[];
}

// ============================================================================
// SURGICAL ANTECEDENTS (Procedures)
// ============================================================================

export interface SurgicalProcedure extends ClinicalEntityBase {
  type: 'surgical';
  procedureDate: Date;
  procedureCoding?: CodedValue; // CCAM code
  hospital?: string;
  surgeon?: string;
  anesthesiaType?: 'general' | 'local' | 'regional' | 'sedation';
  complications?: string;
  outcome?: 'success' | 'partial' | 'complications' | 'failure';
}

// ============================================================================
// FAMILY HISTORY
// ============================================================================

export type FamilyRelative =
  | 'mother'
  | 'father'
  | 'sibling'
  | 'child'
  | 'maternal_grandmother'
  | 'maternal_grandfather'
  | 'paternal_grandmother'
  | 'paternal_grandfather'
  | 'maternal_aunt'
  | 'maternal_uncle'
  | 'paternal_aunt'
  | 'paternal_uncle'
  | 'cousin'
  | 'other';

export interface FamilyHistoryEntry {
  id: string;
  patientId: string;
  relative: FamilyRelative;
  relativeName?: string;
  condition: CodedValue | string;
  conditionFreeText?: string;
  ageAtOnset?: number;
  yearOfOnset?: number;
  isDeceased?: boolean;
  ageAtDeath?: number;
  causeOfDeath?: string;
  notes?: string;
  isPinned: boolean;
  displayOrder: number;
  recordedBy: string;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// GYNECOLOGICAL & OBSTETRICAL (Gender/Age/Specialty dependent)
// ============================================================================

export interface GynecologicalHistory {
  id: string;
  patientId: string;
  menarche?: number; // Age of first menstruation
  menopauseAge?: number;
  isPregnant: boolean;
  currentPregnancyWeeks?: number;
  gravidity: number; // Total pregnancies
  parity: number;    // Live births
  abortions: number; // Spontaneous + induced
  ivgCount: number;  // Induced abortions
  imgCount: number;  // Medical terminations
  cesareanCount: number;
  lastPapSmear?: Date;
  lastMammogram?: Date;
  contraceptionMethod?: string;
  hormoneTreatment?: string;
  complications?: string[];
  notes?: string;
  recordedBy: string;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface Pregnancy {
  id: string;
  gynecologicalHistoryId: string;
  year: number;
  outcome: 'live_birth' | 'stillbirth' | 'miscarriage' | 'ivg' | 'img' | 'ectopic';
  gestationalWeeks?: number;
  deliveryMode?: 'vaginal' | 'cesarean' | 'instrumental';
  birthWeight?: number;
  complications?: string;
  notes?: string;
}

// ============================================================================
// MEDICAL DEVICES
// ============================================================================

export type DeviceType =
  | 'pacemaker'
  | 'defibrillator'
  | 'stent'
  | 'prosthesis_hip'
  | 'prosthesis_knee'
  | 'prosthesis_other'
  | 'cochlear_implant'
  | 'insulin_pump'
  | 'port_catheter'
  | 'dialysis_access'
  | 'other';

export interface MedicalDevice {
  id: string;
  patientId: string;
  deviceType: DeviceType;
  deviceTypeFreeText?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  implantDate?: Date;
  expirationDate?: Date;
  hospital?: string;
  physician?: string;
  followUpRequired: boolean;
  nextFollowUp?: Date;
  mriCompatible?: boolean;
  notes?: string;
  isPinned: boolean;
  displayOrder: number;
  recordedBy: string;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// CARDIOVASCULAR RISK FACTORS (Auto-populated from coded conditions)
// ============================================================================

export type CardiovascularRiskFactorType =
  | 'smoking'
  | 'hypertension'
  | 'diabetes'
  | 'dyslipidemia'
  | 'obesity'
  | 'family_history_cvd'
  | 'sedentary'
  | 'alcohol'
  | 'age_risk'
  | 'other';

export interface CardiovascularRiskFactor {
  id: string;
  patientId: string;
  factorType: CardiovascularRiskFactorType;
  derivedFromConditionId?: string;
  derivedFromFamilyHistoryId?: string;
  derivedFromLifestyleId?: string;
  value?: string;
  severity?: Severity;
  isControlled: boolean;
  controlledBy?: string;
  notes?: string;
  recordedBy: string;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ALLERGIES & INTOLERANCES
// ============================================================================

export type AllergyCategory =
  | 'medication'
  | 'food'
  | 'environmental'
  | 'material'
  | 'insect'
  | 'other';

export type AllergyType =
  | 'allergy'
  | 'intolerance';

export type ReactionSeverity =
  | 'mild'
  | 'moderate'
  | 'severe'
  | 'life_threatening';

export interface AllergyReaction {
  manifestation: string;
  severity: ReactionSeverity;
  onset?: 'immediate' | 'delayed';
}

export interface PatientAllergy {
  id: string;
  patientId: string;
  allergyType: AllergyType;
  category: AllergyCategory;
  allergenCoding?: CodedValue;
  allergenFreeText?: string;
  clinicalStatus: 'active' | 'inactive' | 'resolved';
  verificationStatus: VerificationStatus;
  criticality: 'low' | 'high' | 'unable_to_assess';
  reactions: AllergyReaction[];
  onsetDate?: Date;
  lastOccurrence?: Date;
  testPerformed?: boolean;
  testDate?: Date;
  testResult?: string;
  desensitizationPerformed?: boolean;
  desensitizationNotes?: string;
  ordonnanceSecurisee: boolean;
  notes?: string;
  isPinned: boolean;
  displayOrder: number;
  recordedBy: string;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// LIFESTYLE OBSERVATIONS
// ============================================================================

export type LifestyleCategory =
  | 'tobacco'
  | 'alcohol'
  | 'drugs'
  | 'physical_activity'
  | 'nutrition'
  | 'sleep'
  | 'stress'
  | 'occupation';

export type TobaccoStatus =
  | 'never'
  | 'former'
  | 'current'
  | 'passive_exposure';

export type AlcoholConsumption =
  | 'none'
  | 'occasional'
  | 'moderate'
  | 'heavy'
  | 'former';

export type PhysicalActivityLevel =
  | 'sedentary'
  | 'low'
  | 'moderate'
  | 'high'
  | 'athlete';

export interface LifestyleObservation {
  id: string;
  patientId: string;
  category: LifestyleCategory;

  // Tobacco specific
  tobaccoStatus?: TobaccoStatus;
  tobaccoPackYears?: number;
  tobaccoStartAge?: number;
  tobaccoStopDate?: Date;
  tobaccoType?: 'cigarettes' | 'cigars' | 'pipe' | 'electronic' | 'other';

  // Alcohol specific
  alcoholConsumption?: AlcoholConsumption;
  alcoholUnitsPerWeek?: number;
  alcoholType?: string;

  // Drugs specific
  drugUse?: boolean;
  drugTypes?: string[];

  // Physical activity specific
  physicalActivityLevel?: PhysicalActivityLevel;
  physicalActivityHoursPerWeek?: number;
  physicalActivityTypes?: string[];

  // Nutrition specific
  dietType?: string;
  dietaryRestrictions?: string[];

  // Common fields
  detailedValue?: string;
  comments?: string;
  recordedDate: Date;
  hasAdvancedEditing: boolean;
  advancedSource?: string;
  advancedPrecision?: string;
  notes?: string;
  isPinned: boolean;
  displayOrder: number;
  recordedBy: string;
  source: DataSource;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// AUDIT EVENTS
// ============================================================================

export type AuditActionType =
  | 'create'
  | 'update'
  | 'delete'
  | 'reorder'
  | 'pin'
  | 'unpin'
  | 'coding_change'
  | 'ald_change'
  | 'status_change'
  | 'import'
  | 'export'
  | 'view';

export type AuditEntityType =
  | 'condition'
  | 'procedure'
  | 'family_history'
  | 'allergy'
  | 'device'
  | 'lifestyle'
  | 'cvd_risk'
  | 'perinatal'
  | 'gynecological';

export interface AuditEvent {
  id: string;
  patientId: string;
  actorId: string;
  actorRole: string;
  actionType: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  timestamp: Date;
  sourceChannel: 'ui' | 'import' | 'api' | 'patient_portal';
  diffBefore?: Record<string, any>;
  diffAfter?: Record<string, any>;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// API CONTRACTS
// ============================================================================

export interface CreateConditionInput {
  coding?: CodedValue;
  freeText?: string;
  clinicalStatus?: ClinicalStatus;
  verificationStatus?: VerificationStatus;
  severity?: Severity;
  onsetDate?: Date;
  isALD?: boolean;
  aldStartDate?: Date;
  notes?: string;
}

export interface UpdateConditionInput extends Partial<CreateConditionInput> {
  isPinned?: boolean;
  displayOrder?: number;
}

export interface ReorderInput {
  entityType: AuditEntityType;
  orderedIds: string[];
}

export interface MedicalHistoryFilters {
  section?: AuditEntityType[];
  clinicalStatus?: ClinicalStatus[];
  verificationStatus?: VerificationStatus[];
  dateRange?: { start: Date; end: Date };
  isPinned?: boolean;
  search?: string;
}

// ============================================================================
// VISIBILITY RULES
// ============================================================================

export interface VisibilityRule {
  section: AuditEntityType;
  requiredGender?: 'male' | 'female';
  minAge?: number;
  maxAge?: number;
  requiredSpecialties?: string[];
  requiredRoles?: string[];
}

export const VISIBILITY_RULES: VisibilityRule[] = [
  {
    section: 'perinatal',
    maxAge: 3, // Visible until 3 years, or if data exists
  },
  {
    section: 'gynecological',
    requiredGender: 'female',
    minAge: 10,
    requiredSpecialties: ['gynecology', 'general_medicine', 'endocrinology'],
  },
];
