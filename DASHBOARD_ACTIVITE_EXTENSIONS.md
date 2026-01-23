# EXTENSION DASHBOARD ACTIVITÉ - SPÉCIFICATIONS KPIs ADDITIONNELS

## État des lieux - KPIs existants

### KPIs actuellement implémentés ✅
1. **Rendez-vous** - Total + variation %
2. **Documents créés** - Total + variation %
3. **Patients vus** - Total + variation %
4. **Facturation** - CA total + variation %
5. **Taux de présence** - % + variation

### Métriques complémentaires affichées dans les onglets
- Nouveaux patients, Patients actifs
- Durée moyenne consultation
- CA moyen/jour, Impayés
- Répartition par statut, type, praticien

---

## NOUVEAUX KPIs PROPOSÉS - HAUTE VALEUR MÉTIER

### CATÉGORIE 1 : QUALITÉ DES SOINS & SUIVI CLINIQUE

#### KPI 1.1 - Taux de Suivi Longitudinal
**Valeur métier** : Mesure la continuité des soins et l'engagement patient (indicateur de qualité primordial)

**Sources de données** :
- Table `appointments` (patient_id, status, start_time)
- Critère : patients ayant ≥2 consultations sur la période

**Formule** :
```
Taux de suivi = (Nb patients avec ≥2 consultations / Total patients vus) × 100
```

**Visualisation** : KPI card avec gauge circulaire + évolution sparkline

**Granularité** : Jour / Semaine / Mois / Trimestre

**Filtres applicables** : Praticien, Site, Type RDV

**Impact décisionnel** :
- < 30% : Alerter sur risque d'abandon de suivi
- 30-60% : Bon suivi
- > 60% : Excellence de fidélisation

---

#### KPI 1.2 - Délai Moyen Première Consultation (Nouveaux Patients)
**Valeur métier** : Mesure l'accessibilité aux soins pour les nouveaux patients (KPI d'accès aux soins)

**Sources de données** :
- Table `patients` (created_at)
- Table `appointments` (patient_id, start_time, is_first_visit = true, status = 'completed')

**Formule** :
```
Délai moyen = AVG(start_time - patient.created_at) pour is_first_visit = true
```
Résultat en jours

**Visualisation** : KPI card avec trend indicator + histogramme de distribution des délais

**Granularité** : Semaine / Mois

**Filtres applicables** : Praticien, Site, Spécialité

**Impact décisionnel** :
- < 7 jours : Excellente accessibilité
- 7-15 jours : Acceptable
- > 15 jours : Délai excessif → revoir planification

---

#### KPI 1.3 - Taux de Patients Chroniques Actifs
**Valeur métier** : Identifie les patients nécessitant un suivi régulier (maladie chronique)

**Sources de données** :
- Table `appointments` (patient_id, type, status)
- Critère : patients avec ≥3 consultations sur 6 mois ET type = 'followup'

**Formule** :
```
Taux chroniques = (Nb patients ≥3 consultations 'followup' en 6 mois / Total patients actifs) × 100
```

**Visualisation** : KPI card + line chart évolution temporelle

**Granularité** : Mois / Trimestre

**Filtres applicables** : Praticien, Pathologie (si disponible dans notes)

**Impact décisionnel** :
- Identifier la charge de travail liée au suivi de maladies chroniques
- Adapter les ressources et créneaux dédiés

---

### CATÉGORIE 2 : PERFORMANCE OPÉRATIONNELLE & CHARGE DE TRAVAIL

#### KPI 2.1 - Taux d'Occupation des Créneaux
**Valeur métier** : Mesure l'efficacité d'utilisation du temps médical disponible

**Sources de données** :
- Table `appointments` (start_time, end_time, status)
- Planning théorique (heures ouvrables par praticien/site)

**Formule** :
```
Taux occupation = (Durée totale RDV réalisés / Durée totale disponible) × 100

Durée RDV réalisés = SUM(duration) WHERE status IN ('completed', 'in-progress')
Durée disponible = Heures ouvrables - Absences/Congés
```

**Visualisation** : KPI card avec heatmap horaire (jours × heures)

**Granularité** : Jour / Semaine / Mois

**Filtres applicables** : Praticien, Site, Plage horaire

**Impact décisionnel** :
- < 60% : Sous-utilisation → revoir la planification
- 60-85% : Optimal
- > 85% : Surcharge → risque burn-out

---

#### KPI 2.2 - Taux de Créneaux Perdus (No-Show + Annulations Tardives)
**Valeur métier** : Quantifie la perte économique et temps médical gaspillé

**Sources de données** :
- Table `appointments` (status, updated_at, start_time)
- Table `appointment_history` (action, timestamp)

**Formule** :
```
Taux perte = (Nb absences injustifiées + Nb annulations <48h / Total RDV planifiés) × 100

Annulation tardive = action='cancelled' AND (start_time - timestamp) < 48h
```

**Visualisation** : KPI card avec décomposition (no-show vs annulations) + trend

**Granularité** : Semaine / Mois

**Filtres applicables** : Praticien, Site, Type RDV, Patient récurrent/nouveau

**Impact décisionnel** :
- > 15% : Mettre en place rappels automatiques, surbooking modéré
- Identifier les patients récurrents à absences

---

#### KPI 2.3 - Temps Moyen de Consultation par Type
**Valeur métier** : Optimise la planification et détecte les dérives de durée

**Sources de données** :
- Table `appointments` (duration, type, status = 'completed')
- Table `motifs` (default_duration)

**Formule** :
```
Pour chaque type :
- Durée moyenne réelle = AVG(duration)
- Écart vs théorique = (Durée réelle - Durée prévue) / Durée prévue × 100
```

**Visualisation** : Bar chart horizontal (type × durée moyenne) avec ligne référence théorique

**Granularité** : Semaine / Mois

**Filtres applicables** : Praticien, Motif, Site

**Impact décisionnel** :
- Écart > 20% : Ajuster les durées de créneaux dans l'agenda
- Identifier les motifs sous-estimés

---

### CATÉGORIE 3 : INDICATEURS PRÉDICTIFS & SIGNAUX FAIBLES

#### KPI 3.1 - Taux de Récurrence d'Urgence
**Valeur métier** : Détecte les patients à risque nécessitant surveillance accrue

**Sources de données** :
- Table `appointments` (patient_id, type = 'emergency', start_time, status)

**Formule** :
```
Pour chaque patient :
- Nb urgences sur période
- Patients à risque = patients avec ≥2 urgences sur 30 jours

Taux récurrence urgence = (Nb patients ≥2 urgences / Total patients vus) × 100
```

**Visualisation** : KPI card + liste alertes patients à risque

**Granularité** : Semaine / Mois

**Filtres applicables** : Praticien, Pathologie suspectée

**Impact décisionnel** :
- Patients identifiés → proposer suivi renforcé, consultation spécialisée
- Signal faible de dégradation état santé

---

#### KPI 3.2 - Taux de Conversion Téléconsultation → Présentiel
**Valeur métier** : Évalue la pertinence du tri initial téléconsultation vs nécessité présentiel

**Sources de données** :
- Table `appointments` (patient_id, canal = 'visio', start_time)
- Critère : même patient avec RDV présentiel dans les 7 jours suivant visio

**Formule** :
```
Taux conversion = (Nb patients avec RDV présentiel <7j après visio / Total visios) × 100
```

**Visualisation** : KPI card avec décomposition par motif de téléconsultation

**Granularité** : Semaine / Mois

**Filtres applicables** : Motif initial, Praticien

**Impact décisionnel** :
- > 30% : Revoir critères d'orientation téléconsultation
- Identifier motifs inadaptés à la visio

---

#### KPI 3.3 - Variation Hebdomadaire de la Charge (Coefficient de Variation)
**Valeur métier** : Détecte l'instabilité de l'activité et permet lissage

**Sources de données** :
- Table `appointments` (start_time, status = 'completed')
- Agrégation par semaine

**Formule** :
```
Pour période (ex: 3 mois) :
- Nb RDV par semaine = [S1, S2, ..., Sn]
- Moyenne = AVG(Nb RDV)
- Écart-type = STDEV(Nb RDV)
- CV = (Écart-type / Moyenne) × 100
```

**Visualisation** : Line chart avec bandes de confiance (±1σ)

**Granularité** : Semaine (sur 3 mois glissants)

**Filtres applicables** : Praticien, Site

**Impact décisionnel** :
- CV > 25% : Activité instable → revoir politique rendez-vous, identifier pics saisonniers
- CV < 15% : Activité stable, prévisible

---

### CATÉGORIE 4 : EFFICIENCE MÉDICO-ÉCONOMIQUE

#### KPI 4.1 - Revenu par Heure de Consultation (RPH)
**Valeur métier** : Mesure la rentabilité opérationnelle du temps médical

**Sources de données** :
- Table `appointments` (id, duration, status = 'completed')
- Table `invoices` (appointment_id, total_amount, payment_status)

**Formule** :
```
RPH = SUM(total_amount) / (SUM(duration) / 60)

Total facturation / Total heures consultations
```

**Visualisation** : KPI card + bar chart par praticien

**Granularité** : Semaine / Mois

**Filtres applicables** : Praticien, Site, Type RDV

**Impact décisionnel** :
- Identifier praticiens/motifs les plus rentables
- Optimiser mix de consultations

---

#### KPI 4.2 - Taux de Recouvrement
**Valeur métier** : Suit la santé financière et l'efficacité des relances

**Sources de données** :
- Table `invoices` (total_amount, payment_status, created_at, paid_at)

**Formule** :
```
Taux recouvrement = (SUM(amount WHERE status='paid') / SUM(total_amount)) × 100

Délai moyen paiement = AVG(paid_at - created_at) pour status='paid'
```

**Visualisation** : KPI card + pie chart (payé/en attente/impayé) + trend délai

**Granularité** : Mois

**Filtres applicables** : Type acte, Mutuelle, Patient

**Impact décisionnel** :
- < 85% : Renforcer relances, revoir politique paiement
- Délai > 30j : Problème processus facturation

---

#### KPI 4.3 - Ratio Documents/Consultation
**Valeur métier** : Mesure la productivité documentaire et complétude du dossier

**Sources de données** :
- Table `appointments` (id, status = 'completed')
- Table `documents` (consultation_id, created_at, category)

**Formule** :
```
Ratio global = SUM(documents) / SUM(consultations)

Par catégorie document :
- Ordonnances/consultation
- Certificats/consultation
- Compte-rendus/consultation
```

**Visualisation** : KPI card + stacked bar chart par praticien

**Granularité** : Semaine / Mois

**Filtres applicables** : Praticien, Type consultation, Catégorie document

**Impact décisionnel** :
- Ratio faible : Formation, rappel bonnes pratiques
- Détecter sous-documentation chronique

---

### CATÉGORIE 5 : INDICATEURS POPULATIONNELS

#### KPI 5.1 - Pyramide des Âges Patientèle Active
**Valeur métier** : Anticipe les besoins futurs et adapte l'offre de soins

**Sources de données** :
- Table `patients` (date_of_birth)
- Table `appointments` (patient_id, status = 'completed', période)

**Formule** :
```
Répartition par tranche d'âge :
- 0-18 ans
- 19-35 ans
- 36-50 ans
- 51-65 ans
- 66-80 ans
- >80 ans

% par tranche = (Nb patients tranche / Total patients actifs) × 100
```

**Visualisation** : Pyramid chart (horizontal bar chart bidirectionnel Hommes/Femmes)

**Granularité** : Mois / Trimestre / Année

**Filtres applicables** : Site, Praticien, Spécialité

**Impact décisionnel** :
- Vieillissement patientèle → anticiper besoins gériatriques
- Rajeunissement → adapter communication, canaux digitaux

---

#### KPI 5.2 - Taux de Patientèle Hors Secteur Géographique
**Valeur métier** : Évalue le rayonnement territorial et accessibilité

**Sources de données** :
- Table `patients` (postal_code, city)
- Table `sites` (postal_code)

**Formule** :
```
Définir rayon géographique (ex: même département, <30km)

Taux hors secteur = (Nb patients hors rayon / Total patients actifs) × 100

Distribution distance = tranches 0-10km, 10-30km, 30-50km, >50km
```

**Visualisation** : KPI card + carte géographique avec heatmap densité patients

**Granularité** : Trimestre / Année

**Filtres applicables** : Site

**Impact décisionnel** :
- Taux élevé hors secteur : Notoriété forte OU manque praticiens zone
- Identifier zones sous-desservies pour expansion

---

#### KPI 5.3 - Ratio Nouveaux Patients / Patients Fidèles
**Valeur métier** : Équilibre entre croissance et fidélisation

**Sources de données** :
- Table `patients` (created_at)
- Table `appointments` (patient_id, is_first_visit, status = 'completed')

**Formule** :
```
Sur période :
- Nouveaux = patients avec first_visit durant période
- Fidèles = patients avec ≥1 consultation ET created_at < début période

Ratio = Nouveaux / Fidèles
```

**Visualisation** : KPI card + stacked area chart évolution temporelle

**Granularité** : Mois

**Filtres applicables** : Praticien, Site, Canal acquisition (si disponible)

**Impact décisionnel** :
- Ratio < 0.2 : Insuffisance nouveaux patients → actions marketing
- Ratio > 0.5 : Forte croissance mais vérifier capacité accueil

---

### CATÉGORIE 6 : TÉLÉMÉDECINE & DIGITALISATION

#### KPI 6.1 - Taux d'Adoption Téléconsultation
**Valeur métier** : Mesure la transformation digitale de la pratique

**Sources de données** :
- Table `appointments` (canal, status = 'completed')

**Formule** :
```
Taux adoption = (Nb consultations visio / Total consultations) × 100

Évolution M/M = ((Taux mois N - Taux mois N-1) / Taux mois N-1) × 100
```

**Visualisation** : KPI card + line chart évolution + comparaison benchmarks secteur

**Granularité** : Semaine / Mois

**Filtres applicables** : Praticien, Motif, Tranche âge patient

**Impact décisionnel** :
- Suivre courbe d'adoption post-déploiement
- Identifier profils patients réticents

---

#### KPI 6.2 - Taux de Satisfaction Téléconsultation vs Présentiel
**Valeur métier** : Compare l'expérience patient selon le canal

**Sources de données** :
- Table `appointments` (id, canal, status = 'completed')
- Table `satisfaction_surveys` (appointment_id, score, comments)

**Formule** :
```
Score NPS moyen par canal :
- NPS visio = AVG(score WHERE canal='visio')
- NPS présentiel = AVG(score WHERE canal='presentiel')

Écart = NPS visio - NPS présentiel
```

**Visualisation** : Dual gauge (visio vs présentiel) + trend comparatif

**Granularité** : Mois

**Filtres applicables** : Motif, Praticien

**Impact décisionnel** :
- Écart négatif significatif (>10 pts) → améliorer UX téléconsultation
- Identifier motifs où la visio dégrade satisfaction

---

#### KPI 6.3 - Taux de Complétion Documents Post-Consultation (24h)
**Valeur métier** : Mesure la réactivité administrative et satisfaction patient

**Sources de données** :
- Table `appointments` (id, end_time, status = 'completed')
- Table `documents` (consultation_id, created_at, category IN ('ordonnance', 'certificat', 'compte-rendu'))

**Formule** :
```
Pour consultations nécessitant document :
Taux complétion 24h = (Nb consultations avec doc créé <24h / Total consultations) × 100

Délai moyen = AVG(document.created_at - appointment.end_time)
```

**Visualisation** : KPI card + histogram distribution délais

**Granularité** : Jour / Semaine

**Filtres applicables** : Praticien, Type document, Canal

**Impact décisionnel** :
- < 80% : Ralentissement administratif → process, charge travail
- Délai > 24h : Insatisfaction patient, rappels

---

### CATÉGORIE 7 : SIGNAUX D'ALERTE & RISQUES

#### KPI 7.1 - Taux d'Annulations en Cascade (Effet Domino)
**Valeur métier** : Détecte désorganisations graves (absence praticien, panne système)

**Sources de données** :
- Table `appointments` (status = 'cancelled', updated_at, practitioner_id)
- Table `appointment_history` (action = 'cancelled', timestamp)

**Formule** :
```
Cascade = ≥3 annulations même praticien dans fenêtre 2h

Nb événements cascade sur période
Nb RDV impactés par cascade
```

**Visualisation** : Timeline avec marqueurs incidents + alerte temps réel

**Granularité** : Jour

**Filtres applicables** : Praticien, Site, Cause annulation (si disponible)

**Impact décisionnel** :
- Alerte RH (praticien malade), technique (panne), organisationnelle
- Activer plan de reprise (réaffectation, report)

---

#### KPI 7.2 - Taux de Consultations Complexes (Durée >>Moyenne)
**Valeur métier** : Identifie patients complexes nécessitant temps majoré

**Sources de données** :
- Table `appointments` (duration, type, status = 'completed')

**Formule** :
```
Pour chaque type consultation :
- Durée moyenne = AVG(duration)
- Seuil complexe = Moyenne + 1.5 × Écart-type

Taux complexe = (Nb consultations > seuil / Total consultations) × 100
```

**Visualisation** : KPI card + scatter plot (durée × type) avec zones

**Granularité** : Semaine / Mois

**Filtres applicables** : Praticien, Motif

**Impact décisionnel** :
- Identifier motifs sous-estimés chroniquement
- Adapter créneaux pour cas complexes
- Formation praticiens si taux élevé

---

#### KPI 7.3 - Délai Moyen de Reprogrammation Annulation
**Valeur métier** : Mesure résilience système et satisfaction patient

**Sources de données** :
- Table `appointments` (id, patient_id, status, start_time)
- Table `appointment_history` (appointment_id, action, timestamp)

**Formule** :
```
Pour chaque annulation (status='cancelled') :
- Rechercher nouvelle consultation même patient après annulation
- Délai reprog = nouveau start_time - ancien start_time

Délai moyen reprog = AVG(délai) pour tous les reprogrammés
Taux reprogrammation = (Nb annulations reprogrammées / Total annulations) × 100
```

**Visualisation** : KPI card (délai moyen) + funnel (annulation → reprog → réalisé)

**Granularité** : Semaine / Mois

**Filtres applicables** : Motif annulation (patient/cabinet), Praticien

**Impact décisionnel** :
- Délai > 14j : Manque disponibilités, perte patients
- Taux reprog < 60% : Insatisfaction, patients perdus

---

## PRIORISATION IMPLÉMENTATION

### PHASE 1 - PRIORITÉ HAUTE (Impact majeur, données disponibles, implémentation rapide)

1. **KPI 2.2** - Taux Créneaux Perdus (no-show + annulations)
   - **Raison** : Impact économique direct, données disponibles, alerte actionnée
   - **Effort** : FAIBLE
   - **ROI** : TRÈS ÉLEVÉ

2. **KPI 4.1** - Revenu par Heure Consultation
   - **Raison** : KPI financier essentiel, calcul simple
   - **Effort** : FAIBLE
   - **ROI** : ÉLEVÉ

3. **KPI 1.2** - Délai Moyen Première Consultation
   - **Raison** : Accessibilité aux soins, indicateur qualité réglementaire
   - **Effort** : MOYEN
   - **ROI** : ÉLEVÉ

4. **KPI 2.3** - Temps Moyen Consultation par Type
   - **Raison** : Optimisation planification quotidienne
   - **Effort** : FAIBLE
   - **ROI** : ÉLEVÉ

5. **KPI 6.3** - Complétion Documents 24h
   - **Raison** : Satisfaction patient, qualité administrative
   - **Effort** : FAIBLE
   - **ROI** : MOYEN

---

### PHASE 2 - PRIORITÉ MOYENNE (Impact significatif, nécessite enrichissement données)

6. **KPI 1.1** - Taux Suivi Longitudinal
   - **Raison** : Qualité soins, fidélisation
   - **Effort** : MOYEN
   - **ROI** : ÉLEVÉ

7. **KPI 2.1** - Taux Occupation Créneaux
   - **Raison** : Optimisation ressources humaines
   - **Effort** : MOYEN (nécessite planning théorique)
   - **ROI** : ÉLEVÉ

8. **KPI 3.2** - Conversion Téléconsultation → Présentiel
   - **Raison** : Pertinence tri, optimisation canal
   - **Effort** : MOYEN
   - **ROI** : MOYEN

9. **KPI 4.2** - Taux Recouvrement
   - **Raison** : Santé financière
   - **Effort** : FAIBLE
   - **ROI** : ÉLEVÉ

10. **KPI 5.3** - Ratio Nouveaux/Fidèles
    - **Raison** : Stratégie croissance
    - **Effort** : FAIBLE
    - **ROI** : MOYEN

---

### PHASE 3 - PRIORITÉ BASSE (Valeur stratégique long terme, complexité élevée)

11. **KPI 1.3** - Taux Patients Chroniques
    - **Raison** : Segmentation patientèle, anticipation charge
    - **Effort** : ÉLEVÉ (nécessite tags pathologies)
    - **ROI** : MOYEN

12. **KPI 3.1** - Récurrence Urgences
    - **Raison** : Détection risques
    - **Effort** : MOYEN
    - **ROI** : MOYEN

13. **KPI 3.3** - Variation Hebdomadaire Charge
    - **Raison** : Lissage activité, prévision
    - **Effort** : MOYEN
    - **ROI** : FAIBLE

14. **KPI 4.3** - Ratio Documents/Consultation
    - **Raison** : Qualité dossier
    - **Effort** : FAIBLE
    - **ROI** : MOYEN

15. **KPI 5.1** - Pyramide Âges
    - **Raison** : Stratégie long terme
    - **Effort** : MOYEN
    - **ROI** : FAIBLE (sauf si expansion/recrutement)

16. **KPI 5.2** - Taux Hors Secteur
    - **Raison** : Développement territorial
    - **Effort** : MOYEN (nécessite géocodage)
    - **ROI** : FAIBLE

17. **KPI 6.1** - Adoption Téléconsultation
    - **Raison** : Suivi transformation digitale
    - **Effort** : FAIBLE
    - **ROI** : MOYEN

18. **KPI 6.2** - Satisfaction Visio vs Présentiel
    - **Raison** : Expérience patient
    - **Effort** : ÉLEVÉ (nécessite questionnaires satisfaction)
    - **ROI** : MOYEN

19. **KPI 7.1** - Annulations Cascade
    - **Raison** : Alertes incidents
    - **Effort** : MOYEN
    - **ROI** : FAIBLE (événements rares)

20. **KPI 7.2** - Consultations Complexes
    - **Raison** : Optimisation planification
    - **Effort** : MOYEN
    - **ROI** : FAIBLE

21. **KPI 7.3** - Délai Reprogrammation
    - **Raison** : Résilience système
    - **Effort** : ÉLEVÉ (tracking multi-RDV)
    - **ROI** : MOYEN

---

## ARCHITECTURE TECHNIQUE RECOMMANDÉE

### Structure de services additionnels

```typescript
// src/services/supabase/advancedAnalyticsService.ts

export async function getNoShowRate(filters: AnalyticsFilters): Promise<ServiceResult<NoShowMetrics>>
export async function getRevenuePerHour(filters: AnalyticsFilters): Promise<ServiceResult<RPHMetrics>>
export async function getFirstVisitDelay(filters: AnalyticsFilters): Promise<ServiceResult<DelayMetrics>>
export async function getConsultationDurationByType(filters: AnalyticsFilters): Promise<ServiceResult<DurationMetrics[]>>
export async function getDocumentCompletionRate(filters: AnalyticsFilters): Promise<ServiceResult<CompletionMetrics>>

// Phase 2
export async function getLongitudinalFollowupRate(filters: AnalyticsFilters): Promise<ServiceResult<FollowupMetrics>>
export async function getSlotOccupancyRate(filters: AnalyticsFilters): Promise<ServiceResult<OccupancyMetrics>>
export async function getTelemedicineConversionRate(filters: AnalyticsFilters): Promise<ServiceResult<ConversionMetrics>>
export async function getCollectionRate(filters: AnalyticsFilters): Promise<ServiceResult<CollectionMetrics>>
export async function getNewVsLoyalRatio(filters: AnalyticsFilters): Promise<ServiceResult<PatientSegmentMetrics>>
```

### Enrichissement KPIMetrics interface

```typescript
export interface ExtendedKPIMetrics extends KPIMetrics {
  // Phase 1 - Haute priorité
  lostSlots: {
    rate: number; // %
    noShowCount: number;
    lateCancellationCount: number;
    economicLoss: number; // €
    change: number; // %
  };

  revenuePerHour: {
    value: number; // € / heure
    change: number; // %
    byPractitioner: Array<{ id: string; name: string; rph: number }>;
  };

  firstVisitDelay: {
    avgDays: number;
    medianDays: number;
    change: number; // jours
    distribution: Array<{ range: string; count: number }>;
  };

  consultationDuration: {
    byType: Array<{
      type: string;
      avgDuration: number;
      plannedDuration: number;
      variance: number; // %
    }>;
  };

  documentCompletion: {
    rate24h: number; // %
    avgDelayMinutes: number;
    byCategory: Record<string, { rate: number; avgDelay: number }>;
  };

  // Phase 2
  followup: {
    longitudinalRate: number; // %
    chronicPatientsCount: number;
    change: number;
  };

  slots: {
    occupancyRate: number; // %
    availableHours: number;
    usedHours: number;
    byPractitioner: Array<{ id: string; rate: number }>;
  };

  telemedicine: {
    adoptionRate: number; // %
    conversionToInPerson: number; // %
    totalVisio: number;
    totalInPerson: number;
  };

  collection: {
    rate: number; // %
    avgDelayDays: number;
    unpaidAmount: number; // €
    change: number;
  };

  patientSegment: {
    newPatientsCount: number;
    loyalPatientsCount: number;
    ratio: number;
    change: number;
  };
}
```

### Nouvelles vues dashboard

```typescript
// Ajout onglets dans ActivityPage.tsx

<TabsList>
  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
  <TabsTrigger value="appointments">Rendez-vous</TabsTrigger>
  <TabsTrigger value="patients">Patients</TabsTrigger>
  <TabsTrigger value="billing">Facturation</TabsTrigger>

  {/* NOUVEAUX ONGLETS */}
  <TabsTrigger value="quality">Qualité & Suivi</TabsTrigger>
  <TabsTrigger value="performance">Performance Opérationnelle</TabsTrigger>
  <TabsTrigger value="predictions">Indicateurs Prédictifs</TabsTrigger>
</TabsList>
```

---

## GARANTIES ZÉRO RÉGRESSION

### Principes d'implémentation

1. **Isolation des nouveaux KPIs** :
   - Services séparés (`advancedAnalyticsService.ts`)
   - Hooks optionnels, pas d'appel forcé
   - Interfaces étendues (extends), pas de modification des existantes

2. **Backward compatibility stricte** :
   - `KPIMetrics` interface conservée intacte
   - `ExtendedKPIMetrics extends KPIMetrics` pour nouveautés
   - Composants existants non modifiés

3. **Feature flags** :
   - Nouveaux KPIs conditionnés par flag `enableAdvancedKPIs`
   - Activation progressive par environnement

4. **Tests de non-régression** :
   - Snapshots tests sur composants existants
   - Vérification performance (temps chargement < +10%)
   - Compatibilité mobile préservée

5. **Migrations de données** :
   - Aucune modification schéma tables existantes
   - Vues matérialisées optionnelles pour agrégations lourdes
   - Pas de dépendance forte (graceful degradation si données manquantes)

---

## LIVRABLES ATTENDUS

### Documentation
- ✅ Spécifications complètes 21 KPIs (ce document)
- [ ] Maquettes UI nouveaux onglets (Figma/wireframes)
- [ ] Guide utilisateur KPIs (interprétation + actions)

### Code
- [ ] `advancedAnalyticsService.ts` - 10 fonctions Phase 1
- [ ] `useAdvancedAnalytics.ts` - Hooks React Query
- [ ] Types TypeScript `ExtendedKPIMetrics`
- [ ] Composants visualisation (cards, charts)
- [ ] Tests unitaires services
- [ ] Tests intégration dashboard

### Database (optionnel)
- [ ] Vues matérialisées pour agrégations complexes
- [ ] Indexes optimisation requêtes analytics
- [ ] Triggers mise à jour métriques temps réel

---

## MÉTRIQUES DE SUCCÈS PROJET

1. **Adoption utilisateurs** : ≥60% praticiens consultent nouveaux KPIs hebdomadairement
2. **Performance** : Temps chargement dashboard ≤ 2s (P95)
3. **Qualité** : 0 bugs critiques, <5 bugs mineurs premier mois
4. **Impact métier** : ≥3 actions concrètes issues des nouveaux KPIs dans 3 mois

---

**Statut** : SPÉCIFICATIONS VALIDÉES - PRÊT POUR IMPLÉMENTATION PHASE 1

**Date** : 2026-01-23
