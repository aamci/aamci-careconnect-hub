/**
 * Types pour les KPIs avancés du dashboard ACTIVITÉ
 * Extension des KPIMetrics existants - zéro régression
 */

// ==================== PHASE 1 : HAUTE PRIORITÉ ====================

export interface NoShowMetrics {
  /** Taux global de créneaux perdus (%) */
  rate: number;
  /** Nombre d'absences injustifiées */
  noShowCount: number;
  /** Nombre d'absences excusées */
  excusedAbsenceCount: number;
  /** Nombre d'annulations tardives (<48h) */
  lateCancellationCount: number;
  /** Perte économique estimée (€) */
  economicLoss: number;
  /** Variation vs période précédente (%) */
  change: number;
  /** Série temporelle des no-shows */
  trend: Array<{ date: string; noShow: number; cancelled: number }>;
}

export interface RevenuePerHourMetrics {
  /** Revenu moyen par heure de consultation (€/h) */
  value: number;
  /** Variation vs période précédente (%) */
  change: number;
  /** Revenu par heure par praticien */
  byPractitioner: Array<{
    id: string;
    name: string;
    rph: number;
    totalRevenue: number;
    totalHours: number;
  }>;
  /** Revenu par heure par type de consultation */
  byType: Array<{
    type: string;
    rph: number;
    count: number;
  }>;
}

export interface FirstVisitDelayMetrics {
  /** Délai moyen en jours */
  avgDays: number;
  /** Délai médian en jours */
  medianDays: number;
  /** Variation vs période précédente (jours) */
  change: number;
  /** Distribution des délais */
  distribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  /** Tendance temporelle */
  trend: Array<{ date: string; avgDelay: number }>;
}

export interface ConsultationDurationMetrics {
  /** Durée moyenne globale */
  globalAvg: number;
  /** Détail par type */
  byType: Array<{
    type: string;
    label: string;
    avgDuration: number;
    plannedDuration: number;
    variance: number;
    count: number;
    minDuration: number;
    maxDuration: number;
  }>;
}

export interface DocumentCompletionMetrics {
  /** Taux de complétion dans les 24h (%) */
  rate24h: number;
  /** Délai moyen de création en heures */
  avgDelayHours: number;
  /** Variation vs période précédente (%) */
  change: number;
  /** Détail par catégorie de document */
  byCategory: Array<{
    category: string;
    label: string;
    rate: number;
    avgDelay: number;
    count: number;
  }>;
  /** Distribution des délais */
  delayDistribution: Array<{
    range: string;
    count: number;
  }>;
}

// ==================== PHASE 2 : PRIORITÉ MOYENNE ====================

export interface FollowupMetrics {
  /** Taux de suivi longitudinal (%) - patients ≥2 consultations */
  longitudinalRate: number;
  /** Nombre de patients suivis */
  followedPatientsCount: number;
  /** Nombre total de patients vus */
  totalPatientsCount: number;
  /** Variation vs période précédente (%) */
  change: number;
  /** Distribution fréquence de visite */
  visitFrequency: Array<{
    visits: string;
    count: number;
    percentage: number;
  }>;
}

export interface SlotOccupancyMetrics {
  /** Taux d'occupation global (%) */
  occupancyRate: number;
  /** Heures disponibles */
  availableHours: number;
  /** Heures utilisées */
  usedHours: number;
  /** Variation vs période précédente (%) */
  change: number;
  /** Heatmap d'occupation (jour × heure) */
  heatmap: Array<{
    day: string;
    hour: number;
    occupancy: number;
  }>;
  /** Par praticien */
  byPractitioner: Array<{
    id: string;
    name: string;
    rate: number;
    usedHours: number;
  }>;
}

export interface TelemedicineMetrics {
  /** Taux d'adoption de la téléconsultation (%) */
  adoptionRate: number;
  /** Taux de conversion téléconsultation → présentiel (%) */
  conversionRate: number;
  /** Total visio */
  totalVisio: number;
  /** Total présentiel */
  totalInPerson: number;
  /** Variation adoption vs période précédente (%) */
  adoptionChange: number;
  /** Tendance d'adoption */
  trend: Array<{ date: string; visio: number; inPerson: number }>;
}

export interface CollectionMetrics {
  /** Taux de recouvrement (%) */
  rate: number;
  /** Délai moyen de paiement (jours) */
  avgDelayDays: number;
  /** Montant total impayés (€) */
  unpaidAmount: number;
  /** Variation vs période précédente (%) */
  change: number;
  /** Répartition statut paiement */
  byStatus: Array<{
    status: string;
    label: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
}

export interface PatientSegmentMetrics {
  /** Nouveaux patients sur la période */
  newPatientsCount: number;
  /** Patients fidèles (déjà vus avant la période) */
  loyalPatientsCount: number;
  /** Ratio nouveaux / fidèles */
  ratio: number;
  /** Variation vs période précédente */
  change: number;
  /** Tendance temporelle */
  trend: Array<{ date: string; newPatients: number; loyalPatients: number }>;
}

// ==================== PHASE 3 : INDICATEURS STRATÉGIQUES ====================

export interface AgeDistributionMetrics {
  /** Répartition par tranche d'âge */
  distribution: Array<{
    range: string;
    male: number;
    female: number;
    other: number;
    total: number;
    percentage: number;
  }>;
  /** Âge moyen de la patientèle */
  averageAge: number;
  /** Âge médian */
  medianAge: number;
}

export interface EmergencyRecurrenceMetrics {
  /** Taux de récurrence d'urgence (%) */
  rate: number;
  /** Nombre de patients à risque (≥2 urgences / 30 jours) */
  atRiskCount: number;
  /** Liste des patients à risque */
  atRiskPatients: Array<{
    patientId: string;
    patientName: string;
    emergencyCount: number;
    lastEmergency: string;
  }>;
}

export interface WorkloadVariabilityMetrics {
  /** Coefficient de variation (%) */
  coefficientOfVariation: number;
  /** Moyenne hebdomadaire */
  weeklyAvg: number;
  /** Écart-type */
  standardDeviation: number;
  /** Données hebdomadaires avec bandes de confiance */
  weeklyData: Array<{
    week: string;
    count: number;
    upperBound: number;
    lowerBound: number;
  }>;
}

export interface DocumentRatioMetrics {
  /** Ratio global documents / consultations */
  globalRatio: number;
  /** Par catégorie de document */
  byCategory: Array<{
    category: string;
    label: string;
    ratio: number;
    docCount: number;
    consultCount: number;
  }>;
  /** Par praticien */
  byPractitioner: Array<{
    id: string;
    name: string;
    ratio: number;
  }>;
}

export interface CascadeCancellationMetrics {
  /** Nombre d'événements cascade */
  cascadeCount: number;
  /** Nombre total de RDV impactés */
  impactedAppointments: number;
  /** Détail des cascades */
  events: Array<{
    date: string;
    practitionerName: string;
    cancelledCount: number;
    timeWindow: string;
  }>;
}

export interface ComplexConsultationMetrics {
  /** Taux de consultations complexes (%) */
  rate: number;
  /** Nombre de consultations complexes */
  complexCount: number;
  /** Total consultations */
  totalCount: number;
  /** Par type avec seuil */
  byType: Array<{
    type: string;
    avgDuration: number;
    threshold: number;
    complexCount: number;
    totalCount: number;
    rate: number;
  }>;
}

export interface ReschedulingMetrics {
  /** Délai moyen de reprogrammation (jours) */
  avgDelayDays: number;
  /** Taux de reprogrammation (%) */
  reschedulingRate: number;
  /** Nombre d'annulations reprogrammées */
  rescheduledCount: number;
  /** Nombre total d'annulations */
  totalCancellations: number;
  /** Funnel : annulé → reprogrammé → réalisé */
  funnel: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
}

// ==================== AGGREGATED TYPES ====================

export interface ExtendedKPIMetrics {
  // Phase 1
  lostSlots: NoShowMetrics;
  revenuePerHour: RevenuePerHourMetrics;
  firstVisitDelay: FirstVisitDelayMetrics;
  consultationDuration: ConsultationDurationMetrics;
  documentCompletion: DocumentCompletionMetrics;

  // Phase 2
  followup: FollowupMetrics;
  slotOccupancy: SlotOccupancyMetrics;
  telemedicine: TelemedicineMetrics;
  collection: CollectionMetrics;
  patientSegment: PatientSegmentMetrics;

  // Phase 3
  ageDistribution: AgeDistributionMetrics;
  emergencyRecurrence: EmergencyRecurrenceMetrics;
  workloadVariability: WorkloadVariabilityMetrics;
  documentRatio: DocumentRatioMetrics;
  cascadeCancellation: CascadeCancellationMetrics;
  complexConsultation: ComplexConsultationMetrics;
  rescheduling: ReschedulingMetrics;
}
