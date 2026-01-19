# Spécification Fonctionnelle - Section HISTORIQUE du Dossier Patient

**Version**: 1.0.0
**Date**: 2026-01-18
**Statut**: Draft - Prêt pour revue
**Projet**: CareConnect-Hub (MediSync Pro)
**Module**: Dossier Patient > Historique

---

## Table des Matières

1. [A. Navigation & Points d'Accès](#a-navigation--points-daccès)
2. [B. Structure de l'Écran HISTORIQUE](#b-structure-de-lécran-historique)
3. [C. Statuts RDV & Règles Métier](#c-statuts-rdv--règles-métier)
4. [D. Événements & Documents Associés](#d-événements--documents-associés)
5. [E. Filtrage, Tri & Recherche](#e-filtrage-tri--recherche)
6. [F. Responsive & Anti-Superposition](#f-responsive--anti-superposition)
7. [G. Modèle de Données & API Minimale](#g-modèle-de-données--api-minimale)
8. [H. Tests, Acceptation & Non-Régression](#h-tests-acceptation--non-régression)
9. [I. Checklist des Éléments Manquants](#i-checklist-des-éléments-manquants)

---

## A. Navigation & Points d'Accès

### A.1 User Stories

| ID | User Story | Priorité | Points |
|----|------------|----------|--------|
| US-NAV-001 | En tant que praticien, je veux accéder à l'historique d'un patient depuis le dossier patient via l'onglet "Historique" afin de consulter son parcours de soins | P0 | 3 |
| US-NAV-002 | En tant que secrétaire, je veux accéder à l'historique depuis la fiche patient de l'agenda afin de vérifier rapidement les RDV passés | P0 | 2 |
| US-NAV-003 | En tant que praticien, je veux que l'URL soit bookmarkable (/patients/:id/historique) afin de retrouver facilement cette vue | P1 | 1 |
| US-NAV-004 | En tant qu'utilisateur, je veux conserver mes filtres actifs lors de la navigation aller-retour afin de ne pas perdre mon contexte | P1 | 2 |

### A.2 Points d'Entrée

```
┌─────────────────────────────────────────────────────────────────────┐
│                        POINTS D'ACCÈS                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. Dossier Patient > Onglet "Historique"                          │
│     Route: /patients/:patientId/historique                          │
│     ┌─────────────────────────────────────────────────┐            │
│     │ [Infos] [Historique] [Documents] [Ordonnances]  │            │
│     │            ▲ ACTIF                              │            │
│     └─────────────────────────────────────────────────┘            │
│                                                                     │
│  2. Agenda > Clic sur RDV > Menu contextuel > "Voir historique"    │
│     Action: navigate(`/patients/${patientId}/historique`)          │
│                                                                     │
│  3. Recherche globale > Résultat patient > Bouton "Historique"     │
│     Action: navigate(`/patients/${patientId}/historique`)          │
│                                                                     │
│  4. Liste patients > Actions > "Historique"                        │
│     Action: navigate(`/patients/${patientId}/historique`)          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### A.3 Breadcrumb & Navigation

```
Patients > [Nom Prénom Patient] > Historique
    │              │                   │
    │              │                   └── Page courante (non cliquable)
    │              └── Lien vers fiche patient (/patients/:id)
    └── Lien vers liste patients (/patients)
```

### A.4 Règles de Navigation

| Règle | Description | Comportement |
|-------|-------------|--------------|
| NAV-R01 | Persistance des filtres | Les filtres sont stockés en sessionStorage (clé: `historique_filters_${patientId}`) |
| NAV-R02 | Scroll position | Position de scroll restaurée au retour (via React Router state) |
| NAV-R03 | Deep linking | URL supporte query params: `?type=rdv&status=completed&from=2024-01-01` |
| NAV-R04 | Permissions | Accès conditionné par RBAC: rôles `practitioner`, `secretary`, `admin` |

---

## B. Structure de l'Écran HISTORIQUE

### B.1 Layout Principal

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER PATIENT (sticky)                                                         │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Avatar] Marie DUPONT • 45 ans • ♀ • N° Sécu: 2 78 05 75 108 123 45        │ │
│ │ Alertes: [⚠️ Allergie pénicilline] [💳 Impayé]                              │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────────┤
│ TABS NAVIGATION                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐ │
│ │ [Infos Admin] [Historique ●] [Documents] [Ordonnances] [Courriers] [Notes] │ │
│ └─────────────────────────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────┬─────────────────────────────┤
│ ZONE PRINCIPALE (scrollable)                      │ SIDEBAR DROITE (sticky)     │
│ ┌───────────────────────────────────────────────┐ │ ┌─────────────────────────┐ │
│ │ BARRE DE FILTRES                              │ │ │ STATISTIQUES            │ │
│ │ ┌───────────────────────────────────────────┐ │ │ │ ┌─────────────────────┐ │ │
│ │ │ 🔍 Rechercher...    [Tous ▼] [+ Filtres]  │ │ │ │ │ Présences           │ │ │
│ │ └───────────────────────────────────────────┘ │ │ │ │ ────────────────    │ │ │
│ │ ┌───────────────────────────────────────────┐ │ │ │ │ RDV honorés: 23     │ │ │
│ │ │ [Courrier ×] [Imagerie ×] [Analyse ×]     │ │ │ │ │ Absences exc.: 2    │ │ │
│ │ └───────────────────────────────────────────┘ │ │ │ │ Absences non: 1     │ │ │
│ └───────────────────────────────────────────────┘ │ │ │ │ Taux présence: 88% │ │ │
│ ┌───────────────────────────────────────────────┐ │ │ └─────────────────────┘ │ │
│ │ TIMELINE DES ÉVÉNEMENTS                       │ │ │                         │ │
│ │                                               │ │ │ ┌─────────────────────┐ │ │
│ │ ═══ Janvier 2026 ═══════════════════════════ │ │ │ │ À FAIRE             │ │ │
│ │                                               │ │ │ │ ────────────────    │ │ │
│ │ ┌─ 15 Jan ─────────────────────────────────┐ │ │ │ │ □ Rappel vaccin    │ │ │
│ │ │ 🏥 Consultation générale                 │ │ │ │ │ □ Contrôle tension │ │ │
│ │ │    Dr. Martin • 09:30 • ✓ Honoré         │ │ │ │ │ □ Renouvellement   │ │ │
│ │ │    [📄 CR] [💊 Ordo] [📋 Détails]        │ │ │ │ └─────────────────────┘ │ │
│ │ └──────────────────────────────────────────┘ │ │ │                         │ │
│ │                                               │ │ │ ┌─────────────────────┐ │ │
│ │ ┌─ 10 Jan ─────────────────────────────────┐ │ │ │ │ RAPPELS             │ │ │
│ │ │ 📄 Document reçu: Analyse sanguine       │ │ │ │ │ ────────────────    │ │ │
│ │ │    Labo Central • Biologie               │ │ │ │ │ 🔔 Mammographie     │ │ │
│ │ │    [👁️ Voir] [📥 Télécharger]            │ │ │ │ │    dans 2 mois      │ │ │
│ │ └──────────────────────────────────────────┘ │ │ │ │ 🔔 Vaccination      │ │ │
│ │                                               │ │ │ │    dans 6 mois      │ │ │
│ │ ═══ Décembre 2025 ══════════════════════════ │ │ │ └─────────────────────┘ │ │
│ │                                               │ │ │                         │ │
│ │ ┌─ 20 Déc ─────────────────────────────────┐ │ │ │ ┌─────────────────────┐ │ │
│ │ │ 🏥 Suivi post-opératoire                 │ │ │ │ │ ACTIONS RAPIDES     │ │ │
│ │ │    Dr. Martin • 14:00 • ✓ Honoré         │ │ │ │ │ ────────────────    │ │ │
│ │ │    [📄 CR]                                │ │ │ │ │ [+ Nouveau RDV]     │ │ │
│ │ └──────────────────────────────────────────┘ │ │ │ │ [+ Document]        │ │ │
│ │                                               │ │ │ │ [+ Note]            │ │ │
│ │ [Charger plus...]                            │ │ │ │ [📨 Envoyer SMS]    │ │ │
│ └───────────────────────────────────────────────┘ │ │ └─────────────────────┘ │ │
│                                                   │ └─────────────────────────┘ │
└───────────────────────────────────────────────────┴─────────────────────────────┘
```

### B.2 Composants Principaux

#### B.2.1 Barre de Filtres (FilterBar)

| Élément | Type | Description |
|---------|------|-------------|
| Recherche | Input text | Recherche full-text sur événements (debounce 300ms) |
| Sélecteur type | Dropdown | Tous / RDV / Documents / Notes / Rappels |
| Chips actifs | Badge[] | Affiche filtres actifs, cliquable pour retirer |
| Bouton "+ Filtres" | Button | Ouvre panneau filtres avancés |
| Reset | Button (icon) | Réinitialise tous les filtres |

#### B.2.2 Timeline des Événements (EventTimeline)

| Élément | Type | Description |
|---------|------|-------------|
| Séparateur mois | Divider | Format: "Janvier 2026" |
| Carte événement | Card | Contient icône type, titre, détails, actions |
| Indicateur date | Badge | Jour du mois (sticky dans le groupe) |
| Ligne timeline | Div | Ligne verticale connectant les événements |
| Pagination | InfiniteScroll | Charge 20 événements, puis "Charger plus" |

#### B.2.3 Sidebar Droite (HistorySidebar)

| Section | Contenu | Comportement |
|---------|---------|--------------|
| Statistiques | Compteurs présence/absence | Calculé dynamiquement |
| À faire | Liste tâches patient | Cochable, lié à TaskService |
| Rappels | Alertes programmées | Triées par date croissante |
| Actions rapides | Boutons action | Raccourcis vers création |

### B.3 États des Composants

```typescript
// États de la Timeline
type TimelineState =
  | 'loading'      // Chargement initial
  | 'loaded'       // Données affichées
  | 'loadingMore'  // Chargement pagination
  | 'error'        // Erreur réseau
  | 'empty'        // Aucun événement
  | 'filtered'     // Résultats filtrés (peut être vide)
```

### B.4 User Stories Structure

| ID | User Story | Priorité |
|----|------------|----------|
| US-STR-001 | En tant que praticien, je veux voir une timeline chronologique inversée (récent en haut) des événements du patient | P0 |
| US-STR-002 | En tant que praticien, je veux voir les événements regroupés par mois avec un séparateur visuel clair | P0 |
| US-STR-003 | En tant que secrétaire, je veux voir les statistiques de présence dans la sidebar | P1 |
| US-STR-004 | En tant que praticien, je veux accéder aux actions rapides (nouveau RDV, document, note) depuis la sidebar | P0 |
| US-STR-005 | En tant qu'utilisateur, je veux que la sidebar reste visible lors du scroll de la timeline | P1 |

---

## C. Statuts RDV & Règles Métier

### C.1 Machine à États des RDV

```
                                    ┌─────────────┐
                                    │   CRÉÉ      │
                                    │  (draft)    │
                                    └──────┬──────┘
                                           │ confirmer()
                                           ▼
┌──────────────┐                   ┌─────────────┐
│   ANNULÉ     │◄──── annuler() ───│  PLANIFIÉ   │
│  (cancelled) │                   │ (scheduled) │
└──────────────┘                   └──────┬──────┘
       ▲                                  │
       │                                  │ arriveePatient()
       │                                  ▼
       │                           ┌─────────────┐
       │                           │ EN ATTENTE  │
       ├──── annuler() ────────────│  (waiting)  │
       │                           └──────┬──────┘
       │                                  │
       │                                  │ démarrerConsult()
       │                                  ▼
       │                           ┌─────────────┐
       │                           │ EN COURS    │
       ├──── annuler() ────────────│(in_progress)│
       │                           └──────┬──────┘
       │                                  │
       │        terminerConsult()         │
       │     ┌────────────────────────────┼────────────────────────────┐
       │     ▼                            ▼                            ▼
┌──────────────┐                   ┌─────────────┐              ┌─────────────┐
│ NON HONORÉ   │                   │   HONORÉ    │              │ ABSENCE     │
│(no_show)     │                   │ (completed) │              │ EXCUSÉE     │
│              │                   │             │              │(absent_exc) │
└──────────────┘                   └─────────────┘              └─────────────┘
```

### C.2 Définition des Statuts

| Statut | Code | Couleur | Icône | Description |
|--------|------|---------|-------|-------------|
| Planifié | `scheduled` | `blue-500` | `Calendar` | RDV confirmé, à venir |
| En attente | `waiting` | `amber-500` | `Clock` | Patient arrivé, attend |
| En cours | `in-progress` | `green-500` | `Activity` | Consultation en cours |
| Honoré | `completed` | `emerald-600` | `CheckCircle` | RDV terminé normalement |
| Annulé | `cancelled` | `slate-400` | `XCircle` | RDV annulé (par patient ou cabinet) |
| Non honoré | `absent-unexcused` | `red-500` | `UserX` | Patient absent sans prévenir |
| Absence excusée | `absent-excused` | `orange-400` | `AlertCircle` | Absence signalée à l'avance |

### C.3 Règles Métier des Transitions

| Règle ID | De | Vers | Condition | Action système |
|----------|-----|------|-----------|----------------|
| TR-001 | scheduled | waiting | Patient signalé arrivé | Log audit, notif praticien |
| TR-002 | waiting | in-progress | Praticien démarre | Log audit, chrono démarré |
| TR-003 | in-progress | completed | Praticien termine | Log audit, durée calculée |
| TR-004 | scheduled | cancelled | Annulation > 24h avant | Remboursement si paiement |
| TR-005 | scheduled | cancelled | Annulation < 24h | Pas de remboursement |
| TR-006 | scheduled | absent-unexcused | Heure + 30min dépassée sans arrivée | Log audit, alerte secrétariat |
| TR-007 | scheduled | absent-excused | Signalement anticipé | Log audit |
| TR-008 | * | cancelled | Rôle admin uniquement après completed | Log audit + raison obligatoire |

### C.4 Affichage dans la Timeline

```typescript
interface AppointmentTimelineCard {
  // Données affichées
  status: AppointmentStatus;
  statusLabel: string;        // "Honoré", "Annulé", etc.
  statusColor: string;        // Couleur du badge
  statusIcon: LucideIcon;     // Icône du statut

  // Informations principales
  type: string;               // "Consultation générale"
  practitioner: string;       // "Dr. Martin"
  time: string;               // "09:30"
  duration?: string;          // "30 min" (si completed)

  // Documents liés
  hasCompteRendu: boolean;
  hasOrdonnance: boolean;
  hasCourrier: boolean;
  documentsCount: number;

  // Actions disponibles
  actions: TimelineAction[];
}

type TimelineAction =
  | { type: 'view_details'; label: 'Détails' }
  | { type: 'view_cr'; label: 'Compte-rendu' }
  | { type: 'view_ordo'; label: 'Ordonnance' }
  | { type: 'reschedule'; label: 'Reprogrammer' }
  | { type: 'cancel'; label: 'Annuler' }
  | { type: 'mark_no_show'; label: 'Marquer absent' };
```

### C.5 Calcul des Statistiques

```typescript
interface PresenceStatistics {
  // Compteurs
  totalAppointments: number;
  completed: number;          // Honorés
  absentExcused: number;      // Absences excusées
  absentUnexcused: number;    // Non honorés
  cancelled: number;          // Annulés

  // Taux calculés
  attendanceRate: number;     // (completed / (total - cancelled)) * 100
  cancellationRate: number;   // (cancelled / total) * 100
  noShowRate: number;         // (absentUnexcused / (total - cancelled)) * 100
}

// Règles de calcul
// - Seuls les RDV avec date < now() sont comptés
// - Les RDV "scheduled" ne sont pas inclus
// - Le taux de présence exclut les annulés du dénominateur
```

### C.6 User Stories Statuts

| ID | User Story | Priorité |
|----|------------|----------|
| US-STA-001 | En tant que secrétaire, je veux voir clairement le statut de chaque RDV dans l'historique avec un code couleur distinctif | P0 |
| US-STA-002 | En tant que praticien, je veux voir le taux de présence du patient pour anticiper les risques de no-show | P1 |
| US-STA-003 | En tant que secrétaire, je veux pouvoir marquer un RDV comme "non honoré" si le patient ne s'est pas présenté | P0 |
| US-STA-004 | En tant qu'admin, je veux voir l'historique complet des changements de statut d'un RDV (audit trail) | P1 |

---

## D. Événements & Documents Associés

### D.1 Types d'Événements

| Type | Code | Icône | Couleur | Description |
|------|------|-------|---------|-------------|
| Rendez-vous | `appointment` | `Calendar` | `blue` | Consultation, suivi, etc. |
| Document reçu | `document_received` | `FileText` | `purple` | Document externe reçu |
| Document créé | `document_created` | `FilePlus` | `green` | Document créé par le cabinet |
| Note clinique | `clinical_note` | `StickyNote` | `yellow` | Note du praticien |
| Ordonnance | `prescription` | `Pill` | `emerald` | Prescription médicale |
| Courrier | `letter` | `Mail` | `slate` | Correspondance médicale |
| Analyse | `lab_result` | `TestTube` | `cyan` | Résultats laboratoire |
| Imagerie | `imaging` | `Image` | `indigo` | Radio, scanner, IRM, etc. |
| Rappel | `reminder` | `Bell` | `orange` | Rappel programmé |
| Tâche | `task` | `CheckSquare` | `rose` | Tâche à effectuer |

### D.2 Structure d'un Événement Timeline

```typescript
interface TimelineEvent {
  id: string;
  type: EventType;

  // Métadonnées temporelles
  date: Date;
  createdAt: Date;

  // Contenu principal
  title: string;
  subtitle?: string;
  description?: string;

  // Références
  patientId: string;
  appointmentId?: string;
  documentIds?: string[];

  // Métadonnées
  createdBy: {
    id: string;
    name: string;
    role: string;
  };

  // Spécifique au type
  metadata: EventMetadata;
}

type EventMetadata =
  | AppointmentMetadata
  | DocumentMetadata
  | NoteMetadata
  | ReminderMetadata;

interface AppointmentMetadata {
  status: AppointmentStatus;
  practitioner: { id: string; name: string; };
  motif: { id: string; name: string; };
  duration?: number;
  documents?: DocumentReference[];
}

interface DocumentMetadata {
  category: DocumentCategory;
  source: 'internal' | 'external';
  fileType: string;
  fileSize: number;
  canShare: boolean;
  expiresAt?: Date;
}
```

### D.3 Catégories de Documents

| Catégorie | Code | Sous-types |
|-----------|------|------------|
| Courrier | `letter` | Courrier médecin, Courrier patient, Courrier assurance |
| Imagerie | `imaging` | Radiographie, Scanner, IRM, Échographie |
| Analyse | `lab` | Biologie, Anatomopathologie, Génétique |
| Ordonnance | `prescription` | Médicaments, Examens, Kinésithérapie |
| Compte-rendu | `report` | Consultation, Hospitalisation, Opératoire |
| Administratif | `administrative` | Attestation, Certificat, Facture |

### D.4 Actions sur Documents

```typescript
interface DocumentActions {
  // Actions toujours disponibles
  view: () => void;           // Ouvre prévisualisation
  download: () => void;       // Télécharge le fichier

  // Actions conditionnelles
  share?: () => void;         // Partager (si canShare = true)
  edit?: () => void;          // Modifier (si source = internal && user = creator)
  delete?: () => void;        // Supprimer (si rôle admin ou creator < 24h)
  print?: () => void;         // Imprimer (si printable = true)

  // Métadonnées actions
  addToFolder: (folderId: string) => void;
  addTag: (tag: string) => void;
  linkToAppointment: (appointmentId: string) => void;
}
```

### D.5 Prévisualisation Documents

```
┌─────────────────────────────────────────────────────────────────────┐
│ PRÉVISUALISATION DOCUMENT                                     [×]  │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │                                                                 │ │
│ │                                                                 │ │
│ │                    [Contenu du document]                        │ │
│ │                    (PDF viewer / Image)                         │ │
│ │                                                                 │ │
│ │                                                                 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────┤
│ Analyse sanguine complète                                           │
│ ─────────────────────────────────────────────────────────────────── │
│ 📁 Catégorie: Analyse > Biologie                                    │
│ 📅 Date: 10 janvier 2026                                            │
│ 🏥 Source: Laboratoire Central                                      │
│ 👤 Ajouté par: Marie Secrétaire                                     │
│ 📎 Taille: 245 Ko • PDF                                             │
│ ─────────────────────────────────────────────────────────────────── │
│ [📥 Télécharger] [🖨️ Imprimer] [📤 Partager] [🔗 Lier à RDV]       │
└─────────────────────────────────────────────────────────────────────┘
```

### D.6 Règles Métier Documents

| Règle ID | Description | Comportement |
|----------|-------------|--------------|
| DOC-R01 | Partage externe | Interdit pour documents marqués "confidentiel" |
| DOC-R02 | Suppression | Soft delete uniquement, archivage 10 ans |
| DOC-R03 | Modification | Crée nouvelle version, historique conservé |
| DOC-R04 | Accès | Filtré par rôle (certains docs = praticien only) |
| DOC-R05 | Expiration | Documents temporaires supprimés après date |
| DOC-R06 | Taille max | 25 Mo par fichier, formats: PDF, JPG, PNG, DICOM |

### D.7 User Stories Documents

| ID | User Story | Priorité |
|----|------------|----------|
| US-DOC-001 | En tant que praticien, je veux voir tous les documents liés à un RDV directement dans la carte timeline | P0 |
| US-DOC-002 | En tant que secrétaire, je veux prévisualiser un document sans le télécharger | P0 |
| US-DOC-003 | En tant que praticien, je veux filtrer l'historique par type de document (Imagerie, Analyse, etc.) | P0 |
| US-DOC-004 | En tant qu'admin, je veux voir qui a accédé à un document sensible (audit) | P1 |
| US-DOC-005 | En tant que praticien, je veux lier un document reçu à un RDV existant | P1 |

---

## E. Filtrage, Tri & Recherche

### E.1 Filtres Disponibles

#### E.1.1 Filtres Rapides (Chips)

| Filtre | Type | Valeurs | Comportement |
|--------|------|---------|--------------|
| Type événement | Multi-select | RDV, Documents, Notes, Rappels | Filtre inclusif (OR) |
| Catégorie document | Multi-select | Courrier, Imagerie, Analyse, Ordo | Visible si "Documents" actif |
| Statut RDV | Multi-select | Honoré, Annulé, Non honoré | Visible si "RDV" actif |
| Praticien | Multi-select | Liste praticiens | Filtre sur créateur/responsable |

#### E.1.2 Filtres Avancés (Panneau)

| Filtre | Type | Description |
|--------|------|-------------|
| Période | DateRange | Du [date] au [date] |
| Motif RDV | Multi-select | Liste des motifs |
| Créé par | Multi-select | Utilisateurs |
| Contient | Text | Recherche dans contenu |
| Avec documents | Toggle | Uniquement événements avec pièces jointes |
| Urgents uniquement | Toggle | Filtre sur flag urgent |

### E.2 Barre de Recherche

```typescript
interface SearchConfig {
  // Configuration
  placeholder: "Rechercher dans l'historique...";
  debounceMs: 300;
  minLength: 2;

  // Champs recherchés
  searchFields: [
    'event.title',
    'event.description',
    'document.name',
    'note.content',
    'appointment.motif.name',
    'practitioner.name'
  ];

  // Options
  highlightMatches: true;
  fuzzySearch: false;  // Recherche exacte
}
```

### E.3 Tri

| Option | Code | Description | Défaut |
|--------|------|-------------|--------|
| Plus récent | `date_desc` | Date décroissante | ✓ |
| Plus ancien | `date_asc` | Date croissante | |
| Type | `type_asc` | Groupé par type | |
| Praticien | `practitioner_asc` | Groupé par praticien | |

### E.4 Groupement

| Option | Description |
|--------|-------------|
| Par mois | Défaut - séparateurs mensuels |
| Par année | Pour historiques longs |
| Par type | Regroupe RDV, Documents, Notes |
| Sans groupement | Liste plate chronologique |

### E.5 Interface Filtres

```
┌─────────────────────────────────────────────────────────────────────┐
│ BARRE DE FILTRES                                                    │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ 🔍 Rechercher dans l'historique │ │ Tous types ▼│ │ + Filtres   │ │
│ └─────────────────────────────────┘ └─────────────┘ └─────────────┘ │
│                                                                     │
│ Filtres actifs:                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│ │ Imagerie  × │ │ Analyse   × │ │ 2025      × │ │ Effacer tout  │  │
│ └─────────────┘ └─────────────┘ └─────────────┘ └───────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ PANNEAU FILTRES AVANCÉS                                       [×]  │
├─────────────────────────────────────────────────────────────────────┤
│ Période                                                             │
│ ┌────────────────┐    ┌────────────────┐                           │
│ │ 📅 01/01/2025  │ au │ 📅 31/12/2025  │  [Ce mois] [Cette année] │
│ └────────────────┘    └────────────────┘                           │
│                                                                     │
│ Type d'événement                                                    │
│ ☑ Rendez-vous  ☑ Documents  ☐ Notes  ☐ Rappels                     │
│                                                                     │
│ Catégorie (si Documents)                                            │
│ ☑ Courrier  ☑ Imagerie  ☑ Analyse  ☐ Ordonnance  ☐ Autre          │
│                                                                     │
│ Statut RDV (si Rendez-vous)                                         │
│ ☑ Honoré  ☐ Annulé  ☐ Non honoré  ☐ À venir                        │
│                                                                     │
│ Praticien                                                           │
│ ┌─────────────────────────────────────┐                            │
│ │ Tous les praticiens            ▼   │                            │
│ └─────────────────────────────────────┘                            │
│                                                                     │
│ Options                                                             │
│ ☐ Avec pièces jointes uniquement                                   │
│ ☐ Événements urgents uniquement                                    │
│                                                                     │
│ ┌─────────────────┐ ┌─────────────────┐                            │
│ │ Réinitialiser   │ │ Appliquer (23)  │                            │
│ └─────────────────┘ └─────────────────┘                            │
└─────────────────────────────────────────────────────────────────────┘
```

### E.6 User Stories Filtrage

| ID | User Story | Priorité |
|----|------------|----------|
| US-FIL-001 | En tant que praticien, je veux filtrer l'historique par type (RDV, Documents, Notes) via des chips cliquables | P0 |
| US-FIL-002 | En tant que secrétaire, je veux rechercher dans l'historique par mot-clé avec mise en surbrillance des résultats | P0 |
| US-FIL-003 | En tant que praticien, je veux filtrer par période (du/au) pour voir une tranche temporelle spécifique | P0 |
| US-FIL-004 | En tant qu'utilisateur, je veux voir le nombre de résultats correspondant aux filtres actifs | P1 |
| US-FIL-005 | En tant qu'utilisateur, je veux pouvoir réinitialiser tous les filtres en un clic | P0 |
| US-FIL-006 | En tant que praticien, je veux combiner plusieurs filtres (ET logique entre catégories) | P1 |

---

## F. Responsive & Anti-Superposition

### F.1 Breakpoints

| Breakpoint | Largeur | Layout | Sidebar |
|------------|---------|--------|---------|
| Desktop XL | ≥ 1440px | Timeline + Sidebar complète | Visible, 320px |
| Desktop | ≥ 1200px | Timeline + Sidebar réduite | Visible, 280px |
| Tablet | ≥ 992px | Timeline full width | Drawer (swipe) |
| Mobile | ≥ 768px | Timeline adaptée | Bottom sheet |
| Mobile S | < 768px | Timeline compacte | Bottom sheet |

### F.2 Layouts par Breakpoint

#### F.2.1 Desktop XL (≥ 1440px)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ HEADER PATIENT                                                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│ TABS                                                                            │
├─────────────────────────────────────────────────────────────┬───────────────────┤
│ FILTRES                                                     │ SIDEBAR           │
│ TIMELINE (flex: 1)                                          │ width: 320px      │
│ - Cartes événements: 100% width                             │ - Stats           │
│ - Détails inline                                            │ - À faire         │
│ - Actions visibles                                          │ - Rappels         │
│                                                             │ - Actions         │
└─────────────────────────────────────────────────────────────┴───────────────────┘
```

#### F.2.2 Desktop (≥ 1200px)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ HEADER PATIENT                                                            │
├───────────────────────────────────────────────────────────────────────────┤
│ TABS                                                                      │
├─────────────────────────────────────────────────────────┬─────────────────┤
│ FILTRES                                                 │ SIDEBAR         │
│ TIMELINE (flex: 1)                                      │ width: 280px    │
│ - Cartes événements: 100% width                         │ - Stats         │
│ - Détails en tooltip/popover                            │ - À faire       │
│ - Actions en menu                                       │ - Rappels       │
│                                                         │ (Actions: FAB)  │
└─────────────────────────────────────────────────────────┴─────────────────┘
```

#### F.2.3 Tablet (≥ 992px)

```
┌───────────────────────────────────────────────────────────────────────┐
│ HEADER PATIENT (compact)                                              │
├───────────────────────────────────────────────────────────────────────┤
│ TABS (scrollable horizontal)                                          │
├───────────────────────────────────────────────────────────────────────┤
│ FILTRES (chips scrollable)                                            │
├───────────────────────────────────────────────────────────────────────┤
│ TIMELINE (100% width)                                                 │
│ - Cartes événements: padding réduit                                   │
│ - FAB bottom-right: [☰ Plus]                                         │
│   └─ Ouvre sidebar en drawer depuis la droite                        │
└───────────────────────────────────────────────────────────────────────┘
```

#### F.2.4 Mobile (< 992px)

```
┌─────────────────────────────────────────────────────────┐
│ HEADER (nom + avatar uniquement)              [☰ Menu] │
├─────────────────────────────────────────────────────────┤
│ TABS (icons only, scrollable)                           │
├─────────────────────────────────────────────────────────┤
│ SEARCH BAR                                    [Filtrer] │
├─────────────────────────────────────────────────────────┤
│ TIMELINE (cards compactes)                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 15 Jan • Consultation • Dr Martin                   │ │
│ │ ✓ Honoré          [📄 2 docs] [⋯]                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [───────────── Stats & Actions (bottom sheet) ────────] │
└─────────────────────────────────────────────────────────┘
```

### F.3 Règles Anti-Superposition

| Règle ID | Élément | Comportement | Z-index |
|----------|---------|--------------|---------|
| RESP-001 | Header patient | Sticky top, truncate text si débordement | 100 |
| RESP-002 | Tabs | Scroll horizontal, indicateur actif visible | 90 |
| RESP-003 | Barre filtres | Sticky sous header, collapse sur mobile | 80 |
| RESP-004 | Chips filtres | Wrap ou scroll horizontal selon espace | - |
| RESP-005 | Timeline cards | Padding adaptatif, texte truncate avec ... | - |
| RESP-006 | Sidebar | Fixed position sur desktop, drawer sur tablet+ | 200 (drawer) |
| RESP-007 | Modals/Dialogs | Centered, backdrop blur | 300 |
| RESP-008 | Tooltips | Auto-position évitant bords écran | 400 |
| RESP-009 | Toasts | Fixed bottom-right, stack vertical | 500 |

### F.4 Tests Responsive Requis

```typescript
interface ResponsiveTestCase {
  id: string;
  breakpoint: string;
  scenario: string;
  expected: string;
}

const responsiveTests: ResponsiveTestCase[] = [
  {
    id: 'RT-001',
    breakpoint: '1440px',
    scenario: 'Affichage initial avec sidebar',
    expected: 'Timeline et sidebar visibles côte à côte, pas de superposition'
  },
  {
    id: 'RT-002',
    breakpoint: '1200px',
    scenario: 'Resize de 1440 à 1200',
    expected: 'Sidebar réduite à 280px, timeline s\'ajuste, pas de scroll horizontal'
  },
  {
    id: 'RT-003',
    breakpoint: '992px',
    scenario: 'Resize de 1200 à 992',
    expected: 'Sidebar disparaît, FAB apparaît, timeline full width'
  },
  {
    id: 'RT-004',
    breakpoint: '768px',
    scenario: 'Header patient avec alertes longues',
    expected: 'Alertes truncate avec tooltip, pas de débordement'
  },
  {
    id: 'RT-005',
    breakpoint: '375px',
    scenario: 'Timeline avec filres actifs',
    expected: 'Chips en scroll horizontal, pas de wrap cassant le layout'
  },
  {
    id: 'RT-006',
    breakpoint: 'All',
    scenario: 'Ouverture modale sur timeline scrollée',
    expected: 'Modale centrée viewport, pas de scroll lock visible'
  },
  {
    id: 'RT-007',
    breakpoint: '992px',
    scenario: 'Ouverture drawer sidebar',
    expected: 'Drawer slide-in depuis droite, overlay sur timeline'
  },
  {
    id: 'RT-008',
    breakpoint: '768px',
    scenario: 'Bottom sheet actions',
    expected: 'Sheet monte de 40vh max, swipe-down pour fermer'
  }
];
```

### F.5 Règles CSS Critiques

```css
/* Anti-superposition générale */
.historique-container {
  display: flex;
  overflow: hidden;
  height: calc(100vh - var(--header-height) - var(--tabs-height));
}

.timeline-zone {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-width: 0; /* Permet flex-shrink correct */
}

.sidebar-zone {
  flex-shrink: 0;
  overflow-y: auto;
}

/* Header sticky sans superposition */
.patient-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background);
}

/* Cards timeline - éviter débordement */
.timeline-card {
  overflow: hidden;
}

.timeline-card-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Breakpoint tablet: drawer sidebar */
@media (max-width: 991px) {
  .sidebar-zone {
    position: fixed;
    right: 0;
    top: 0;
    bottom: 0;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 200;
  }

  .sidebar-zone.open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 199;
  }
}
```

### F.6 User Stories Responsive

| ID | User Story | Priorité |
|----|------------|----------|
| US-RES-001 | En tant qu'utilisateur mobile, je veux accéder à l'historique avec une interface adaptée à mon écran | P0 |
| US-RES-002 | En tant qu'utilisateur tablette, je veux accéder à la sidebar via un geste de swipe | P1 |
| US-RES-003 | En tant qu'utilisateur, je ne veux jamais voir d'éléments superposés ou de scroll horizontal non intentionnel | P0 |
| US-RES-004 | En tant qu'utilisateur desktop, je veux voir la timeline et la sidebar simultanément | P0 |

---

## G. Modèle de Données & API Minimale

### G.1 Schéma de Données

```sql
-- Table principale des événements timeline
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  -- Type et catégorie
  event_type VARCHAR(50) NOT NULL, -- 'appointment', 'document', 'note', etc.
  event_subtype VARCHAR(50),        -- Sous-catégorie optionnelle

  -- Contenu
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,

  -- Références
  appointment_id UUID REFERENCES appointments(id),
  document_ids UUID[],              -- Array de références documents

  -- Métadonnées
  metadata JSONB DEFAULT '{}',

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Soft delete
  deleted_at TIMESTAMPTZ,

  -- Index
  CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Index pour requêtes fréquentes
CREATE INDEX idx_timeline_patient_date ON timeline_events(patient_id, created_at DESC);
CREATE INDEX idx_timeline_type ON timeline_events(event_type);
CREATE INDEX idx_timeline_patient_type ON timeline_events(patient_id, event_type);

-- Table des rappels patient
CREATE TABLE patient_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,

  -- Statut
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),

  -- Notification
  notify_days_before INTEGER DEFAULT 7,
  notification_sent BOOLEAN DEFAULT FALSE,

  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_patient FOREIGN KEY (patient_id) REFERENCES patients(id)
);

-- Vue pour statistiques de présence
CREATE VIEW patient_attendance_stats AS
SELECT
  patient_id,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'absent-excused') as absent_excused_count,
  COUNT(*) FILTER (WHERE status = 'absent-unexcused') as no_show_count,
  COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
  COUNT(*) as total_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC /
    NULLIF(COUNT(*) FILTER (WHERE status NOT IN ('cancelled', 'scheduled')), 0) * 100,
    1
  ) as attendance_rate
FROM appointments
WHERE start_time < NOW()
GROUP BY patient_id;
```

### G.2 Types TypeScript

```typescript
// types/timeline.ts

export type TimelineEventType =
  | 'appointment'
  | 'document_received'
  | 'document_created'
  | 'clinical_note'
  | 'prescription'
  | 'letter'
  | 'lab_result'
  | 'imaging'
  | 'reminder'
  | 'task';

export interface TimelineEvent {
  id: string;
  patientId: string;
  eventType: TimelineEventType;
  eventSubtype?: string;

  title: string;
  subtitle?: string;
  description?: string;

  appointmentId?: string;
  documentIds?: string[];

  metadata: Record<string, unknown>;

  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TimelineFilters {
  types?: TimelineEventType[];
  subtypes?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  practitionerId?: string;
  searchQuery?: string;
  hasDocuments?: boolean;
  isUrgent?: boolean;
}

export interface TimelinePagination {
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface PatientAttendanceStats {
  patientId: string;
  completedCount: number;
  absentExcusedCount: number;
  noShowCount: number;
  cancelledCount: number;
  totalCount: number;
  attendanceRate: number;
}

export interface PatientReminder {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  dueDate: Date;
  status: 'pending' | 'completed' | 'cancelled';
  completedAt?: Date;
  completedBy?: string;
  notifyDaysBefore: number;
  createdBy: string;
  createdAt: Date;
}
```

### G.3 Contrats API

#### G.3.1 GET /api/patients/:patientId/timeline

**Description**: Récupère les événements de la timeline d'un patient avec pagination et filtres.

**Request**:
```typescript
interface GetTimelineRequest {
  // Path
  patientId: string;

  // Query params
  offset?: number;          // default: 0
  limit?: number;           // default: 20, max: 100
  types?: string;           // comma-separated: "appointment,document"
  subtypes?: string;        // comma-separated
  dateFrom?: string;        // ISO 8601
  dateTo?: string;          // ISO 8601
  practitionerId?: string;
  search?: string;          // full-text search
  hasDocuments?: boolean;
  isUrgent?: boolean;
  sortBy?: 'date_desc' | 'date_asc' | 'type';
}
```

**Response** (200 OK):
```typescript
interface GetTimelineResponse {
  data: TimelineEvent[];
  pagination: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  filters: {
    applied: TimelineFilters;
    available: {
      types: { value: string; count: number }[];
      practitioners: { id: string; name: string; count: number }[];
      dateRange: { min: string; max: string };
    };
  };
}
```

**Errors**:
| Code | Description |
|------|-------------|
| 400 | Paramètres invalides |
| 401 | Non authentifié |
| 403 | Accès non autorisé au patient |
| 404 | Patient non trouvé |

#### G.3.2 GET /api/patients/:patientId/attendance-stats

**Description**: Récupère les statistiques de présence d'un patient.

**Response** (200 OK):
```typescript
interface GetAttendanceStatsResponse {
  data: PatientAttendanceStats;
}
```

#### G.3.3 GET /api/patients/:patientId/reminders

**Description**: Récupère les rappels d'un patient.

**Request**:
```typescript
interface GetRemindersRequest {
  patientId: string;
  status?: 'pending' | 'completed' | 'all';
  limit?: number;
}
```

**Response** (200 OK):
```typescript
interface GetRemindersResponse {
  data: PatientReminder[];
}
```

#### G.3.4 POST /api/patients/:patientId/reminders

**Description**: Crée un nouveau rappel pour un patient.

**Request Body**:
```typescript
interface CreateReminderRequest {
  title: string;
  description?: string;
  dueDate: string;         // ISO 8601
  notifyDaysBefore?: number;
}
```

**Response** (201 Created):
```typescript
interface CreateReminderResponse {
  data: PatientReminder;
}
```

#### G.3.5 PATCH /api/reminders/:reminderId

**Description**: Met à jour un rappel (marquer comme complété, modifier, etc.).

**Request Body**:
```typescript
interface UpdateReminderRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  status?: 'pending' | 'completed' | 'cancelled';
}
```

### G.4 Services Supabase

```typescript
// services/supabase/timelineService.ts

import { supabase } from '@/integrations/supabase/client';
import { TimelineEvent, TimelineFilters, TimelinePagination } from '@/types/timeline';

export async function fetchPatientTimeline(
  patientId: string,
  filters: TimelineFilters = {},
  pagination: { offset: number; limit: number } = { offset: 0, limit: 20 }
): Promise<{ data: TimelineEvent[]; pagination: TimelinePagination; error: Error | null }> {
  let query = supabase
    .from('timeline_events')
    .select('*, created_by_user:users!created_by(id, first_name, last_name, role)', { count: 'exact' })
    .eq('patient_id', patientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Appliquer filtres
  if (filters.types?.length) {
    query = query.in('event_type', filters.types);
  }
  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom.toISOString());
  }
  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo.toISOString());
  }
  if (filters.searchQuery) {
    query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
  }

  // Pagination
  query = query.range(pagination.offset, pagination.offset + pagination.limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return { data: [], pagination: { ...pagination, total: 0, hasMore: false }, error };
  }

  return {
    data: data as TimelineEvent[],
    pagination: {
      ...pagination,
      total: count || 0,
      hasMore: (count || 0) > pagination.offset + pagination.limit
    },
    error: null
  };
}

export async function fetchPatientAttendanceStats(
  patientId: string
): Promise<{ data: PatientAttendanceStats | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('patient_attendance_stats')
    .select('*')
    .eq('patient_id', patientId)
    .single();

  if (error && error.code !== 'PGRST116') {
    return { data: null, error };
  }

  return { data, error: null };
}

export async function fetchPatientReminders(
  patientId: string,
  status: 'pending' | 'completed' | 'all' = 'pending'
): Promise<{ data: PatientReminder[]; error: Error | null }> {
  let query = supabase
    .from('patient_reminders')
    .select('*')
    .eq('patient_id', patientId)
    .order('due_date', { ascending: true });

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  return { data: data || [], error };
}
```

### G.5 React Query Hooks

```typescript
// hooks/data/useTimeline.ts

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import * as timelineService from '@/services/supabase/timelineService';
import { TimelineFilters } from '@/types/timeline';

export const timelineKeys = {
  all: ['timeline'] as const,
  patient: (patientId: string) => [...timelineKeys.all, patientId] as const,
  patientFiltered: (patientId: string, filters: TimelineFilters) =>
    [...timelineKeys.patient(patientId), filters] as const,
  stats: (patientId: string) => [...timelineKeys.patient(patientId), 'stats'] as const,
  reminders: (patientId: string) => [...timelineKeys.patient(patientId), 'reminders'] as const,
};

export function usePatientTimeline(patientId: string, filters: TimelineFilters = {}) {
  return useInfiniteQuery({
    queryKey: timelineKeys.patientFiltered(patientId, filters),
    queryFn: async ({ pageParam = 0 }) => {
      return timelineService.fetchPatientTimeline(patientId, filters, {
        offset: pageParam,
        limit: 20
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
    enabled: !!patientId,
  });
}

export function usePatientAttendanceStats(patientId: string) {
  return useQuery({
    queryKey: timelineKeys.stats(patientId),
    queryFn: () => timelineService.fetchPatientAttendanceStats(patientId),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePatientReminders(patientId: string, status: 'pending' | 'completed' | 'all' = 'pending') {
  return useQuery({
    queryKey: [...timelineKeys.reminders(patientId), status],
    queryFn: () => timelineService.fetchPatientReminders(patientId, status),
    enabled: !!patientId,
  });
}
```

---

## H. Tests, Acceptation & Non-Régression

### H.1 Plan de Tests

#### H.1.1 Tests Unitaires

| ID | Composant | Cas de test | Attendu |
|----|-----------|-------------|---------|
| UT-001 | TimelineEvent | Rendu avec données minimales | Affiche titre, date, type |
| UT-002 | TimelineEvent | Rendu avec tous les champs | Affiche tous les détails |
| UT-003 | FilterBar | Ajout d'un filtre | Chip ajouté, callback appelé |
| UT-004 | FilterBar | Suppression d'un filtre | Chip retiré, callback appelé |
| UT-005 | FilterBar | Reset tous filtres | Tous chips supprimés |
| UT-006 | SearchInput | Debounce 300ms | Callback après délai |
| UT-007 | AttendanceStats | Calcul taux présence | Pourcentage correct |
| UT-008 | ReminderItem | Toggle completed | Statut mis à jour |
| UT-009 | TimelineDateSeparator | Format mois/année | "Janvier 2026" |
| UT-010 | StatusBadge | Couleur par statut | Correspondance couleur |

#### H.1.2 Tests d'Intégration

| ID | Scénario | Étapes | Attendu |
|----|----------|--------|---------|
| IT-001 | Chargement timeline | 1. Naviguer vers /patients/:id/historique | Timeline chargée avec événements |
| IT-002 | Pagination | 1. Scroll jusqu'en bas | "Charger plus" apparaît, nouveaux événements |
| IT-003 | Filtrage par type | 1. Cliquer sur chip "Documents" | Seuls documents affichés |
| IT-004 | Recherche | 1. Taper "consultation" | Événements filtrés, highlight |
| IT-005 | Ouverture document | 1. Cliquer sur icône document | Prévisualisation ouverte |
| IT-006 | Marquer rappel complété | 1. Cocher rappel | Statut updated, toast succès |
| IT-007 | Persistance filtres | 1. Appliquer filtres 2. Naviguer ailleurs 3. Revenir | Filtres restaurés |
| IT-008 | Combinaison filtres | 1. Type=RDV + Période=2025 | Intersection correcte |

#### H.1.3 Tests E2E (Cypress/Playwright)

```typescript
// cypress/e2e/historique.cy.ts

describe('Patient History Timeline', () => {
  beforeEach(() => {
    cy.login('practitioner@test.com', 'password');
    cy.visit('/patients/test-patient-id/historique');
  });

  it('should display timeline with events', () => {
    cy.get('[data-testid="timeline-container"]').should('be.visible');
    cy.get('[data-testid="timeline-event"]').should('have.length.gte', 1);
  });

  it('should filter by event type', () => {
    cy.get('[data-testid="filter-chip-documents"]').click();
    cy.get('[data-testid="timeline-event"]').each(($el) => {
      cy.wrap($el).should('have.attr', 'data-event-type', 'document');
    });
  });

  it('should search events', () => {
    cy.get('[data-testid="search-input"]').type('consultation');
    cy.wait(500); // debounce
    cy.get('[data-testid="timeline-event"]').should('contain.text', 'consultation');
  });

  it('should load more events on scroll', () => {
    cy.get('[data-testid="timeline-event"]').should('have.length', 20);
    cy.get('[data-testid="timeline-container"]').scrollTo('bottom');
    cy.get('[data-testid="load-more-button"]').click();
    cy.get('[data-testid="timeline-event"]').should('have.length.gte', 21);
  });

  it('should show attendance stats in sidebar', () => {
    cy.get('[data-testid="attendance-stats"]').should('be.visible');
    cy.get('[data-testid="attendance-rate"]').should('contain.text', '%');
  });

  it('should persist filters after navigation', () => {
    cy.get('[data-testid="filter-chip-documents"]').click();
    cy.visit('/patients');
    cy.visit('/patients/test-patient-id/historique');
    cy.get('[data-testid="filter-chip-documents"]').should('have.class', 'active');
  });
});
```

### H.2 Critères d'Acceptation

#### H.2.1 Critères Fonctionnels

| ID | Critère | Validation |
|----|---------|------------|
| AC-001 | La timeline affiche au moins les 20 derniers événements | Manuel + Automatisé |
| AC-002 | Chaque événement affiche: type, date, titre, statut | Automatisé |
| AC-003 | Les filtres réduisent la liste aux éléments correspondants | Automatisé |
| AC-004 | La recherche trouve des événements par titre/description | Automatisé |
| AC-005 | Le scroll infini charge les événements suivants | Automatisé |
| AC-006 | Les documents sont prévisualisables sans téléchargement | Manuel |
| AC-007 | Les statistiques de présence sont calculées correctement | Automatisé |
| AC-008 | Les rappels peuvent être marqués comme complétés | Automatisé |

#### H.2.2 Critères de Performance

| ID | Critère | Seuil | Mesure |
|----|---------|-------|--------|
| PERF-001 | Temps de chargement initial | < 2s | Lighthouse |
| PERF-002 | Temps de réponse filtrage | < 500ms | DevTools |
| PERF-003 | Temps de chargement pagination | < 1s | DevTools |
| PERF-004 | Taille bundle JS ajouté | < 50KB gzip | Webpack analyzer |
| PERF-005 | Memory usage avec 500 events | < 100MB | DevTools Memory |

#### H.2.3 Critères d'Accessibilité

| ID | Critère | Norme |
|----|---------|-------|
| A11Y-001 | Navigation clavier complète | WCAG 2.1 AA |
| A11Y-002 | Labels ARIA sur éléments interactifs | WCAG 2.1 AA |
| A11Y-003 | Contraste couleurs suffisant | WCAG 2.1 AA (4.5:1) |
| A11Y-004 | Screen reader compatible | NVDA/VoiceOver |
| A11Y-005 | Focus visible sur éléments | WCAG 2.1 AA |

### H.3 Tests de Non-Régression

#### H.3.1 Fonctionnalités Existantes à Vérifier

| ID | Fonctionnalité | Test |
|----|----------------|------|
| NR-001 | Navigation entre onglets dossier patient | Les autres onglets fonctionnent toujours |
| NR-002 | Header patient avec alertes | Alertes toujours visibles et fonctionnelles |
| NR-003 | Création de RDV depuis dossier | Bouton "+ RDV" fonctionne toujours |
| NR-004 | Recherche globale patients | Résultats toujours corrects |
| NR-005 | Liste des patients | Pagination et tri fonctionnels |
| NR-006 | Agenda praticien | Non impacté par changements |

#### H.3.2 Checklist Non-Régression

```markdown
## Checklist Non-Régression - Historique Patient

### Navigation
- [ ] Onglet "Historique" accessible depuis dossier patient
- [ ] Retour arrière navigateur fonctionne
- [ ] URL bookmarkable et partageable
- [ ] Breadcrumb navigation correcte

### Dossier Patient Existant
- [ ] Onglet "Infos Administratives" non impacté
- [ ] Onglet "Documents" non impacté
- [ ] Onglet "Ordonnances" non impacté
- [ ] Onglet "Notes" non impacté
- [ ] Header patient affiche correctement alertes

### Intégrations
- [ ] Création RDV depuis historique fonctionne
- [ ] Ajout document depuis historique fonctionne
- [ ] Lien vers RDV dans agenda fonctionne
- [ ] Notifications rappels fonctionnent

### Performance
- [ ] Pas de régression temps chargement dossier patient
- [ ] Pas de memory leak sur navigation répétée
- [ ] Pas d'erreurs console nouvelles
```

### H.4 Scénarios de Test Responsive Anti-Superposition

```typescript
// tests/responsive/historique.spec.ts

import { test, expect } from '@playwright/test';

const breakpoints = [
  { name: 'desktop-xl', width: 1440, height: 900 },
  { name: 'desktop', width: 1200, height: 800 },
  { name: 'tablet', width: 992, height: 768 },
  { name: 'mobile', width: 768, height: 1024 },
  { name: 'mobile-s', width: 375, height: 667 },
];

for (const bp of breakpoints) {
  test.describe(`Responsive ${bp.name} (${bp.width}px)`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: bp.width, height: bp.height });
      await page.goto('/patients/test-patient/historique');
    });

    test('no horizontal scroll', async ({ page }) => {
      const body = await page.locator('body');
      const scrollWidth = await body.evaluate(el => el.scrollWidth);
      const clientWidth = await body.evaluate(el => el.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });

    test('no element overflow', async ({ page }) => {
      const overflowElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const overflowing: string[] = [];
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth || rect.left < 0) {
            overflowing.push(el.className);
          }
        });
        return overflowing;
      });
      expect(overflowElements).toHaveLength(0);
    });

    test('header stays visible on scroll', async ({ page }) => {
      await page.evaluate(() => window.scrollTo(0, 500));
      const header = await page.locator('[data-testid="patient-header"]');
      await expect(header).toBeVisible();
    });

    test('text does not overlap', async ({ page }) => {
      // Capture screenshot for visual regression
      await expect(page).toHaveScreenshot(`historique-${bp.name}.png`, {
        maxDiffPixels: 100
      });
    });

    if (bp.width < 992) {
      test('sidebar opens as drawer', async ({ page }) => {
        const fab = await page.locator('[data-testid="sidebar-fab"]');
        await fab.click();
        const sidebar = await page.locator('[data-testid="sidebar-drawer"]');
        await expect(sidebar).toBeVisible();
      });
    }
  });
}
```

---

## I. Checklist des Éléments Manquants

### I.1 Éléments à Implémenter

| Catégorie | Élément | Priorité | Statut | Notes |
|-----------|---------|----------|--------|-------|
| **Structure** | | | | |
| | Composant `HistoriqueTab` | P0 | 🔴 À faire | Point d'entrée principal |
| | Composant `EventTimeline` | P0 | 🔴 À faire | Timeline virtualisée |
| | Composant `TimelineEventCard` | P0 | 🔴 À faire | Carte événement générique |
| | Composant `FilterBar` | P0 | 🔴 À faire | Barre de filtres |
| | Composant `HistorySidebar` | P0 | 🔴 À faire | Sidebar droite |
| | Composant `AttendanceStats` | P1 | 🔴 À faire | Statistiques présence |
| | Composant `RemindersList` | P1 | 🔴 À faire | Liste rappels |
| | Composant `DocumentPreview` | P0 | 🔴 À faire | Modal prévisualisation |
| **Services** | | | | |
| | `timelineService.ts` | P0 | 🔴 À faire | API Supabase timeline |
| | `reminderService.ts` | P1 | 🔴 À faire | API Supabase rappels |
| **Hooks** | | | | |
| | `usePatientTimeline` | P0 | 🔴 À faire | React Query infinite |
| | `usePatientAttendanceStats` | P1 | 🔴 À faire | React Query stats |
| | `usePatientReminders` | P1 | 🔴 À faire | React Query rappels |
| | `useTimelineFilters` | P0 | 🔴 À faire | État filtres local |
| **Base de données** | | | | |
| | Table `timeline_events` | P0 | 🔴 À faire | Migration SQL |
| | Table `patient_reminders` | P1 | 🔴 À faire | Migration SQL |
| | Vue `patient_attendance_stats` | P1 | 🔴 À faire | Migration SQL |
| | Index performances | P0 | 🔴 À faire | Migration SQL |
| **Types** | | | | |
| | `types/timeline.ts` | P0 | 🔴 À faire | Types TypeScript |
| **Tests** | | | | |
| | Tests unitaires composants | P0 | 🔴 À faire | Jest/Vitest |
| | Tests intégration | P0 | 🔴 À faire | React Testing Library |
| | Tests E2E | P1 | 🔴 À faire | Playwright |
| | Tests responsive | P0 | 🔴 À faire | Playwright viewports |

### I.2 Fonctionnalités Existantes à Conserver

| Élément | Fichier | Action | Vérifié |
|---------|---------|--------|---------|
| Header patient | `PatientHeader.tsx` | Conserver | ⬜ |
| Navigation onglets | `PatientDossierTabs.tsx` | Ajouter onglet | ⬜ |
| Service patients | `patientsService.ts` | Conserver | ⬜ |
| Service audit | `auditService.ts` | Utiliser | ⬜ |
| Hook `usePatient` | `usePatients.ts` | Conserver | ⬜ |
| Types Patient | `types/index.ts` | Étendre | ⬜ |

### I.3 Dépendances à Vérifier

| Dépendance | Version actuelle | Requise pour | Statut |
|------------|------------------|--------------|--------|
| `@tanstack/react-query` | ✓ Installé | Hooks data | ✅ OK |
| `react-virtual` | ❓ À vérifier | Timeline virtualisée | ⬜ À vérifier |
| `date-fns` | ✓ Installé | Formatage dates | ✅ OK |
| `lucide-react` | ✓ Installé | Icônes | ✅ OK |

### I.4 Points d'Attention Techniques

| Point | Description | Risque | Mitigation |
|-------|-------------|--------|------------|
| Performance timeline | Timeline avec 500+ événements | Moyen | Virtualisation obligatoire |
| Migration DB | Nouvelles tables à créer | Faible | Migration versionnée |
| Rétro-compatibilité | URLs existantes | Faible | Pas de breaking change routes |
| Permissions | Accès données patients | Élevé | RLS Supabase strict |
| Cache invalidation | Mise à jour temps réel | Moyen | React Query staleTime ajusté |

### I.5 Planning Suggéré

```
Phase 1 - Foundation (Sprint 1)
├── Migration DB (tables, index, vue)
├── Types TypeScript
├── Services Supabase (timeline, reminders)
└── Hooks React Query

Phase 2 - UI Core (Sprint 1-2)
├── Composant EventTimeline (virtualisé)
├── Composant TimelineEventCard
├── Composant FilterBar
└── Intégration dans dossier patient

Phase 3 - Features (Sprint 2)
├── Sidebar avec stats et rappels
├── Prévisualisation documents
├── Recherche full-text
└── Filtres avancés

Phase 4 - Polish (Sprint 3)
├── Tests unitaires et intégration
├── Tests responsive
├── Tests E2E
└── Documentation utilisateur
```

---

## Annexes

### Annexe A - Mapping Couleurs Statuts

```typescript
export const statusColors = {
  scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  waiting: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'in-progress': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
  'absent-unexcused': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'absent-excused': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
} as const;
```

### Annexe B - Icônes par Type d'Événement

```typescript
import {
  Calendar, FileText, FilePlus, StickyNote, Pill,
  Mail, TestTube, Image, Bell, CheckSquare
} from 'lucide-react';

export const eventTypeIcons = {
  appointment: Calendar,
  document_received: FileText,
  document_created: FilePlus,
  clinical_note: StickyNote,
  prescription: Pill,
  letter: Mail,
  lab_result: TestTube,
  imaging: Image,
  reminder: Bell,
  task: CheckSquare,
} as const;
```

### Annexe C - Traductions FR

```typescript
export const translations = {
  eventTypes: {
    appointment: 'Rendez-vous',
    document_received: 'Document reçu',
    document_created: 'Document créé',
    clinical_note: 'Note clinique',
    prescription: 'Ordonnance',
    letter: 'Courrier',
    lab_result: 'Résultat analyse',
    imaging: 'Imagerie',
    reminder: 'Rappel',
    task: 'Tâche',
  },
  statuses: {
    scheduled: 'Planifié',
    waiting: 'En attente',
    'in-progress': 'En cours',
    completed: 'Honoré',
    cancelled: 'Annulé',
    'absent-unexcused': 'Non honoré',
    'absent-excused': 'Absence excusée',
  },
  actions: {
    view: 'Voir',
    download: 'Télécharger',
    share: 'Partager',
    print: 'Imprimer',
    edit: 'Modifier',
    delete: 'Supprimer',
  },
} as const;
```

---

**Fin du document de spécification**

*Document généré le 2026-01-18*
*Version 1.0.0*
