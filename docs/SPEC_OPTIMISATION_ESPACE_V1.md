# SPÉCIFICATION OPTIMISATION ESPACE - CARECONNECT HUB
## Version 1.0 | Date: 2026-01-18

---

# A. MATRICE D'INVARIANTS (NON-NÉGOCIABLES)

| Catégorie | Invariant | Critère Mesurable | Veto si violé |
|-----------|-----------|-------------------|---------------|
| **CLINIQUE-01** | Allergies toujours visibles | Badge rouge visible < 2s après chargement patient | OUI |
| **CLINIQUE-02** | Alertes critiques non masquables | Zone alertes fixe, jamais dans zone scrollable | OUI |
| **CLINIQUE-03** | Identité patient vérifiable | Nom + DOB + N°SS visible en permanence header | OUI |
| **CLINIQUE-04** | Interactions médicamenteuses | Alerte si prescription incompatible (temps réel) | OUI |
| **PRODUIT-01** | Zero scroll Home dossier | 100% contenu visible 1366x768 sans scroll vertical | OUI |
| **PRODUIT-02** | Densité ajustable | 3 modes (Compact/Standard/Confort) switchable | NON |
| **PRODUIT-03** | Actions accessibles < 2 clics | Toute action principale accessible depuis contexte | OUI |
| **PRODUIT-04** | Cohérence cross-pages | Mêmes patterns UI partout (cards, spacing, typo) | OUI |
| **DATA-01** | SSOT strict | 1 entité = 1 table owner, 0 duplication logique | OUI |
| **DATA-02** | Références par ID | Multi-affichage = même objet (FK), jamais copie | OUI |
| **DATA-03** | Versionning prescriptions | Toute modif prescription = nouvelle version tracée | OUI |
| **TRACE-01** | Audit exhaustif | Toute action CRUD = AuditEvent horodaté signé | OUI |
| **TRACE-02** | Historique patient complet | Timeline consultable filtrée par type/période | OUI |
| **TRACE-03** | Non-répudiation | Auteur + timestamp + hash action | OUI |
| **PERF-01** | 60fps interactions | Aucun jank scroll/resize/zoom | OUI |
| **PERF-02** | LCP < 2s | Largest Contentful Paint pages principales | OUI |
| **PERF-03** | CLS < 0.1 | Cumulative Layout Shift | OUI |
| **A11Y-01** | Contraste WCAG AA | Ratio 4.5:1 texte, 3:1 UI | OUI |
| **A11Y-02** | Navigation clavier | Tab order logique, focus visible | OUI |

---

# B. REGISTRE SSOT (SINGLE SOURCE OF TRUTH)

## B.1 Entités Principales

| Domaine | Table Owner | PK | Champs Canoniques | Unicité | Versionning | Dénorm. Autorisée |
|---------|-------------|----|--------------------|---------|-------------|-------------------|
| **PatientIdentity** | `patients` | `id` (uuid) | firstName, lastName, gender, dateOfBirth, ssn | ssn UNIQUE | Non | Cache nom complet |
| **PatientContact** | `patients` | `id` | phone, email, address, city, postalCode | email UNIQUE nullable | Non | Non |
| **PatientAlerts** | `patient_alerts` | `id` | patientId (FK), type, severity, message, isResolved | - | Non | Count dans patients |
| **Appointments** | `appointments` | `id` | patientId, practitionerId, motifId, startTime, endTime, status | (practitionerId, startTime) UNIQUE | history[] JSONB | Non |
| **AppointmentMotifs** | `motifs` | `id` | name, shortName, duration, color, type | name UNIQUE | Non | Non |
| **Practitioners** | `practitioners` | `id` | firstName, lastName, title, specialty, color | - | Non | Non |
| **Sites** | `sites` | `id` | name, address, city | - | Non | Non |
| **Openings** | `practitioner_openings` | `id` | practitionerId, dayOfWeek, startTime, endTime, motifIds[], recurrence | - | Non | Non |
| **Allergies** | `patient_allergies` | `id` | patientId, allergen, severity, reaction, confirmedAt | (patientId, allergen) UNIQUE | Non | Count dans sidebar |
| **Antecedents** | `patient_antecedents` | `id` | patientId, category, description, date, icd10Code | - | Non | Non |
| **Prescriptions** | `prescriptions` | `id` | patientId, consultationId, medications[], status, version | - | OUI (version++) | Non |
| **VitalSigns** | `vital_signs` | `id` | patientId, type, value, unit, measuredAt | - | Non | Latest cached |
| **LabResults** | `lab_results` | `id` | patientId, testType, value, unit, referenceRange, resultAt | - | Non | Non |
| **Documents** | `patient_documents` | `id` | patientId, type, title, filePath, uploadedAt | - | Non | Count par type |
| **Vaccinations** | `vaccinations` | `id` | patientId, vaccine, doseNumber, administeredAt, nextDueAt | - | Non | Non |
| **Observations** | `patient_observations` | `id` | patientId, consultationId, content, authorId, createdAt | - | Non | Non |
| **Consultations** | `consultations` | `id` | patientId, appointmentId, practitionerId, notes, diagnosis | appointmentId UNIQUE | Non | Non |
| **Invoices** | `invoices` | `id` | patientId, consultationId, amount, status, paidAt | - | Non | Non |
| **Notes** | `notes` | `id` | content, patientId, appointmentId, authorId, isUrgent | - | Non | Non |
| **Tasks** | `tasks` | `id` | title, type, priority, status, assigneeId, dueDate | - | Non | Non |
| **Messages** | `messages` | `id` | senderId, recipientId, patientId, subject, body, readAt | - | Non | Unread count |
| **AuditEvents** | `audit_logs` | `id` | userId, action, entityType, entityId, before, after, timestamp | - | Non (immuable) | Non |

## B.2 Relations Inter-Sections

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           PATIENT (SSOT Root)                               │
│  patients.id ←────────────────────────────────────────────────────────────┐ │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ├──→ patient_alerts.patientId (1:N)
         ├──→ patient_allergies.patientId (1:N)
         ├──→ patient_antecedents.patientId (1:N)
         ├──→ appointments.patientId (1:N)
         │         └──→ consultations.appointmentId (1:1)
         │                   ├──→ prescriptions.consultationId (1:N)
         │                   ├──→ patient_observations.consultationId (1:N)
         │                   └──→ invoices.consultationId (1:1)
         ├──→ vital_signs.patientId (1:N)
         ├──→ lab_results.patientId (1:N)
         ├──→ patient_documents.patientId (1:N)
         ├──→ vaccinations.patientId (1:N)
         ├──→ notes.patientId (1:N)
         └──→ messages.patientId (1:N)
```

## B.3 Règles Anti-Doublons

| Règle | Description | Violation = |
|-------|-------------|-------------|
| **R-01** | Jamais stocker `patientName` dans `appointments` | Toujours JOIN patients | Erreur review |
| **R-02** | Jamais dupliquer `allergyList` dans patient | Toujours query patient_allergies | Erreur review |
| **R-03** | `prescriptions` référence `consultationId` pas `appointmentId` | Relation via consultation | Erreur review |
| **R-04** | Compteurs (alertCount, docCount) = computed, jamais stockés | Recalcul à l'affichage ou view matérialisée | Warning |
| **R-05** | Timeline historique = agrégation multi-tables, pas table dédiée | Query UNION ordonnée | Erreur review |

---

# C. DESIGN SYSTEM DENSITÉ

## C.1 Tokens Spacing (px)

| Token | Compact | Standard | Confort |
|-------|---------|----------|---------|
| `--spacing-xs` | 2 | 4 | 6 |
| `--spacing-sm` | 4 | 8 | 12 |
| `--spacing-md` | 8 | 12 | 16 |
| `--spacing-lg` | 12 | 16 | 24 |
| `--spacing-xl` | 16 | 24 | 32 |
| `--spacing-2xl` | 24 | 32 | 48 |

## C.2 Tokens Typography

| Token | Compact | Standard | Confort |
|-------|---------|----------|---------|
| `--font-size-xs` | 10px | 11px | 12px |
| `--font-size-sm` | 11px | 12px | 13px |
| `--font-size-base` | 12px | 14px | 15px |
| `--font-size-lg` | 14px | 16px | 18px |
| `--font-size-xl` | 16px | 18px | 20px |
| `--line-height-tight` | 1.2 | 1.3 | 1.4 |
| `--line-height-normal` | 1.3 | 1.5 | 1.6 |

## C.3 Tokens Components

| Token | Compact | Standard | Confort |
|-------|---------|----------|---------|
| `--card-padding` | 8px | 12px | 16px |
| `--card-gap` | 8px | 12px | 16px |
| `--card-header-height` | 32px | 40px | 48px |
| `--button-height-sm` | 24px | 28px | 32px |
| `--button-height-md` | 28px | 32px | 36px |
| `--input-height` | 28px | 32px | 36px |
| `--table-row-height` | 32px | 40px | 48px |
| `--list-item-height` | 36px | 44px | 52px |
| `--icon-size-sm` | 14px | 16px | 18px |
| `--icon-size-md` | 16px | 18px | 20px |
| `--avatar-size-sm` | 24px | 28px | 32px |
| `--badge-height` | 18px | 20px | 24px |

## C.4 Tokens Agenda

| Token | Compact | Standard | Confort |
|-------|---------|----------|---------|
| `--slot-height-15min` | 15px | 20px | 30px |
| `--slot-height-30min` | 30px | 40px | 60px |
| `--slot-height-60min` | 60px | 80px | 120px |
| `--event-font-size` | 10px | 11px | 12px |
| `--event-padding` | 2px 4px | 4px 6px | 6px 8px |
| `--event-line-clamp` | 1 | 2 | 3 |
| `--time-axis-width` | 44px | 52px | 60px |
| `--day-header-height` | 40px | 48px | 56px |

## C.5 Règles d'Application Densité

| Contexte | Mode Par Défaut | Switchable |
|----------|-----------------|------------|
| Dossier Patient Home | Standard | Oui (user pref) |
| Dossier Patient Tabs | Standard | Oui |
| Agenda Vue Semaine | Standard (zoom=10) | Oui (slider 0-20) |
| Agenda Vue Jour | Standard | Oui |
| Liste Patients | Standard | Oui |
| Messagerie | Standard | Non |
| Écran < 1366px largeur | Compact (auto) | Non |
| Écran < 768px hauteur | Compact (auto) | Non |

## C.6 Composants Compact Obligatoires

### CardCompact
```tsx
// Spec: header 32px, padding 8px, gap 8px
<CardCompact
  title="Notes récentes"
  action={{ label: "Voir tout", onClick }}
  maxItems={2}
  emptyState="Aucune note"
>
  {items.slice(0, 2).map(item => <CompactListItem />)}
</CardCompact>
```

### CompactListItem
```tsx
// Spec: height 36px, icon 14px, truncate 1 line
<CompactListItem
  icon={<FileText />}
  primary="Consultation 15/01"
  secondary="Dr Martin"
  action={<IconButton icon={<ExternalLink />} />}
/>
```

### InlineActions
```tsx
// Spec: max 3 visible, reste dans menu "..."
<InlineActions
  primary={{ label: "Nouveau RDV", onClick }}
  secondary={[
    { label: "Ajouter note", onClick },
    { label: "Message", onClick },
  ]}
  overflow={[
    { label: "Multi-RDV", onClick },
    { label: "Imprimer", onClick },
  ]}
/>
```

### KPITile
```tsx
// Spec: height 64px compact, icon + value + label inline
<KPITile
  icon={<Calendar />}
  value="3"
  label="RDV aujourd'hui"
  trend="+1"
  onClick={goToAgenda}
/>
```

---

# D. RÈGLES RESPONSIVE

## D.1 Breakpoints

| Nom | Min Width | Max Width | Comportement |
|-----|-----------|-----------|--------------|
| `xs` | 0 | 639px | Mobile - scroll autorisé, 1 colonne |
| `sm` | 640px | 767px | Mobile large - scroll autorisé |
| `md` | 768px | 1023px | Tablet - scroll autorisé, sidebar collapsée |
| `lg` | 1024px | 1279px | Desktop small - densité Compact auto si hauteur < 700 |
| `xl` | 1280px | 1439px | Desktop - densité Standard |
| `2xl` | 1440px | ∞ | Desktop large - densité Standard/Confort |

## D.2 Comportements Hauteur

| Hauteur Viewport | Action |
|------------------|--------|
| ≥ 900px | Densité selon préférence user |
| 768-899px | Densité Standard max, pas Confort |
| 700-767px | Densité Compact auto |
| < 700px | Densité Compact + collapse sections secondaires |

## D.3 Layout Dossier Patient

```
Desktop (≥1280px):
┌──────────────────────────────────────────────────────────────────┐
│ Header (56px fixed)                                              │
├────────────┬─────────────────────────────────────┬───────────────┤
│ Sidebar    │ Colonne 2 (Main Content)            │ Colonne 3     │
│ Patient    │ - Cards grille 2x2 ou 3 colonnes    │ Actions       │
│ (280px)    │ - NO SCROLL objectif                │ (240px)       │
│            │                                     │               │
│ - Identity │                                     │ - Quick       │
│ - Nav tabs │                                     │   Actions     │
│ - Mémo     │                                     │ - Coordonnées │
│            │                                     │               │
└────────────┴─────────────────────────────────────┴───────────────┘

Tablet (768-1279px):
┌──────────────────────────────────────────────────────────────────┐
│ Header (56px fixed)                                              │
├────────────┬─────────────────────────────────────────────────────┤
│ Sidebar    │ Colonne 2 (Main Content)                            │
│ Collapsed  │ - Cards stack vertical                              │
│ (72px)     │ - Scroll autorisé                                   │
│            │ - Actions en drawer                                 │
└────────────┴─────────────────────────────────────────────────────┘
```

## D.4 Stratégie No-Scroll Desktop

Ordre de priorité si contenu dépasse:

1. **Passer en densité Compact** (tokens C.1-C.4)
2. **Réduire maxItems** dans cards (3→2→1)
3. **Collapse sections tertiaires** (Prévention, Documents)
4. **Activer "Voir tout" drawer** pour listes
5. **JAMAIS** : scroll global sur Home dossier patient desktop

---

# E. PLAN OPTIMISATION DOSSIER PATIENT - COLONNE 2

## E.1 Audit État Actuel (Home)

| Composant | Hauteur Actuelle | Problème | Hauteur Cible |
|-----------|------------------|----------|---------------|
| Prochains RDV | ~180px | Empty state trop haut, padding excessif | 120px |
| Coordonnées | ~140px | 4 lignes, pourrait être 3 | 100px |
| Actions rapides | ~160px | 4 boutons verticaux | 80px (horizontal) |
| Notes récentes | ~160px | Empty state + header | 100px |
| Résumé clinique | ~200px | Sections dépliées | 140px |
| Documents récents | ~140px | Empty state | 100px |
| Prévention | ~100px | OK | 80px |
| **TOTAL** | ~1080px | Dépasse 768px viewport | **720px max** |

## E.2 Nouvelle Grille Home

```
Desktop ≥1280px (hauteur dispo ~650px après header):
┌─────────────────────────────────────────────────────────────────┐
│  KPI Bar (64px) - 4 tuiles inline                               │
│  [📅 3 RDV] [📋 2 Alertes] [💊 5 Traitements] [📄 12 Docs]      │
├─────────────────────────────────────────────────────────────────┤
│ Row 1 (180px)                                                   │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│ │ Prochains RDV    │ │ Résumé Clinique  │ │ Actions Rapides  │  │
│ │ 2 items max      │ │ Diagnostics+Rx   │ │ 4 boutons 2x2    │  │
│ │ [+ Planifier]    │ │ [Ouvrir]         │ │                  │  │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ Row 2 (160px)                                                   │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│ │ Notes récentes   │ │ Documents récents│ │ Prévention       │  │
│ │ 2 items max      │ │ 2 items max      │ │ 2 alertes max    │  │
│ │ [Voir tout]      │ │ [Voir tout]      │ │ [Voir tout]      │  │
│ └──────────────────┘ └──────────────────┘ └──────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ Row 3 - Coordonnées inline (60px)                               │
│ 📞 06 33 44 55 66  |  ✉️ email@test.fr  |  📍 5 bd Haussmann    │
└─────────────────────────────────────────────────────────────────┘
TOTAL: 64 + 180 + 160 + 60 + gaps(48px) = 512px ✓
```

## E.3 Specs Composants Home

### KPIBar
```typescript
interface KPIBarProps {
  items: Array<{
    icon: LucideIcon;
    value: number;
    label: string;
    onClick?: () => void;
    alert?: boolean; // rouge si true
  }>;
}
// Height: 64px fixe
// Layout: flex justify-between
// Max items: 4
```

### CardProchainRDV (Compact)
```typescript
// Height max: 180px
// Content: 2 RDV max affichés
// Empty state: 1 ligne + bouton
// Actions: [+ Planifier RDV] primary
interface ProchainRDVItem {
  date: string; // "Lun 20 Jan - 14:30"
  motif: string; // truncate 20 chars
  practitioner: string;
}
```

### CardResumeClinique (Compact)
```typescript
// Height max: 180px
// Sections visibles: Diagnostics (badges), Allergies (badges), Traitements (1 ligne)
// Collapsé par défaut si > 3 items par section
// Action: [Ouvrir] → drawer détail
```

### CardActionsRapides (Grid 2x2)
```typescript
// Height: 80px
// Layout: grid 2x2
// Buttons: icon + label, même taille
const actions = [
  { icon: CalendarPlus, label: "Nouveau RDV", primary: true },
  { icon: FileText, label: "Ajouter note" },
  { icon: MessageSquare, label: "Message" },
  { icon: Calendar, label: "Multi-RDV" },
];
```

### CardNotesRecentes / CardDocumentsRecents / CardPrevention
```typescript
// Height max: 160px chacune
// Items visibles: 2 max
// Empty state: icône 24px + texte 1 ligne
// Action header: [Voir tout >]
```

### CoordonneesBanner (Inline)
```typescript
// Height: 60px
// Layout: flex avec séparateurs
// Items: phone (copyable), email (mailto), address (maps link)
// Actions: icônes edit inline
```

## E.4 Specs Autres Onglets

### Antécédents & Mode de Vie
```
Layout: 2 colonnes
├─ Col 1: Antécédents médicaux (accordion)
│   ├─ Médicaux (collapsed si > 3)
│   ├─ Chirurgicaux
│   ├─ Familiaux
│   └─ [+ Ajouter]
└─ Col 2: Mode de vie + Allergies
    ├─ Tabac/Alcool/Activité (inline badges)
    ├─ Allergies (list compact)
    └─ [+ Ajouter allergie]

Height cible: 600px max (no scroll 768px viewport)
```

### Documents
```
Layout: Table compacte + Preview panel
├─ Table (flex-1)
│   ├─ Filters: [Type ▼] [Date ▼] [Recherche...]
│   ├─ Rows: 32px height, hover preview
│   └─ Pagination: 20 items/page
└─ Preview (drawer right, 400px)
    └─ PDF viewer / Image / Metadata

Actions toolbar: [+ Importer] [Scanner] [Générer]
```

### Traitement en Cours
```
Layout: List grouped by status
├─ En cours (expanded)
│   └─ PrescriptionRow compact (36px)
│       └─ Médicament | Posologie | Depuis | [Renouveler] [Arrêter]
├─ À renouveler (badge count)
└─ Historique (collapsed)

Actions: [+ Nouvelle ordonnance]
```

### Biologie & Biométrie
```
Layout: Tabs + Content
├─ Tabs: [Mesures] [Résultats labo] [Courbes]
├─ Mesures: Grid 3 cols (Tension, Poids, Temp, etc.)
│   └─ MeasureCard: value + date + trend
├─ Résultats: Table triable par date
└─ Courbes: Graphique temporel (lazy load)
```

### Vaccinations
```
Layout: Timeline compact
├─ Header: [+ Ajouter vaccin] [Imprimer carnet]
├─ List grouped by year
│   └─ VaccinRow (36px): Vaccin | Dose | Date | Prochain
└─ Alertes: Rappels échus (banner top)
```

### Factures
```
Layout: Table + Stats
├─ Stats bar: Total dû | Payé ce mois | En attente
├─ Table: Date | Acte | Montant | Statut | Actions
│   └─ Row height: 40px
└─ Actions: [+ Créer facture] [Exporter]
```

---

# F. PLAN OPTIMISATION AGENDA

## F.1 Mapping Zoom → Rendu

| Zoom Level | Slot Height (1h) | Font Size | Line Clamp | Padding | Label |
|------------|------------------|-----------|------------|---------|-------|
| 0-3 | 20-32px | 10px | 1 | 2px | Minimum |
| 4-6 | 32-48px | 10px | 1 | 3px | - |
| 7-9 | 48-72px | 11px | 2 | 4px | - |
| 10 | 80px | 11px | 2 | 4px | Standard |
| 11-13 | 80-100px | 12px | 2 | 5px | - |
| 14-16 | 100-140px | 12px | 3 | 6px | - |
| 17-20 | 140-200px | 13px | 4 | 8px | Maximum |

## F.2 Plage Horaire → Grille

```typescript
// Comportement attendu:
// Si plage = 08:00-19:00 (11h), grille = 11 * slotHeight
// La grille DOIT remplir l'espace disponible

interface GridBehavior {
  // Hauteur disponible après header (56px) et toolbar (48px)
  availableHeight: viewportHeight - 56 - 48 - 16; // 16px margin

  // Nombre d'heures affichées
  hoursCount: endHour - startHour;

  // Calcul slot height dynamique pour zoom=0 (fit-to-screen)
  dynamicSlotHeight: availableHeight / hoursCount;

  // Pour zoom > 0, utiliser mapping fixe (F.1)
  // Si contenu dépasse, scroll interne UNIQUEMENT dans grille
}
```

## F.3 Gestion RDV Hors Plage

```typescript
// Si RDV existe hors plage affichée:
// 1. Indicateur discret en haut/bas de grille: "2 RDV avant 08:00"
// 2. Clic → extend temporaire de la plage
// 3. Option settings: "Toujours afficher RDV hors plage"

interface OutOfRangeIndicator {
  position: 'top' | 'bottom';
  count: number;
  appointments: Appointment[];
  onExpand: () => void; // étend plage temporairement
}
```

## F.4 Performance Grille

```typescript
// Virtualisation verticale si heures > 12
// Virtualisation horizontale si jours > 7 (vue mois)

interface VirtualizationConfig {
  rowHeight: slotHeight;
  overscan: 2; // render 2 rows extra
  containerHeight: availableHeight;

  // React-window ou @tanstack/virtual
  virtualizer: useVirtualizer({
    count: hoursCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => slotHeight,
  });
}
```

## F.5 Overlap Events

```typescript
// Algorithme actuel (useOverlapLayout) OK
// Amélioration: tooltip au hover si > 3 events même slot
// Clic event → drawer détail (pas modal bloquante)

interface OverlapBehavior {
  maxVisibleStacked: 3;
  showOverflowBadge: true; // "+2 autres"
  hoverShowsTooltip: true;
  clickOpensDrawer: true;
}
```

---

# G. CATALOGUE AUDIT EVENTS

## G.1 Schema AuditEvent

```typescript
interface AuditEvent {
  id: string; // uuid
  timestamp: Date; // ISO 8601
  userId: string; // FK users
  userRole: UserRole;
  sessionId: string; // correlation

  action: AuditAction;
  entityType: EntityType;
  entityId: string;

  before: Record<string, unknown> | null; // état avant (si update/delete)
  after: Record<string, unknown> | null; // état après (si create/update)

  context: {
    page: string; // route
    patientId?: string;
    appointmentId?: string;
    consultationId?: string;
    ipAddress?: string;
    userAgent?: string;
  };

  metadata?: Record<string, unknown>;
}

type AuditAction =
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW'
  | 'SIGN' | 'SEND' | 'PRINT' | 'EXPORT'
  | 'LOGIN' | 'LOGOUT' | 'SHARE';

type EntityType =
  | 'PATIENT' | 'APPOINTMENT' | 'CONSULTATION'
  | 'PRESCRIPTION' | 'DOCUMENT' | 'OBSERVATION'
  | 'ALLERGY' | 'ANTECEDENT' | 'VITAL_SIGN'
  | 'LAB_RESULT' | 'VACCINATION' | 'INVOICE'
  | 'MESSAGE' | 'NOTE' | 'TASK' | 'OPENING';
```

## G.2 Events par Section

### Rendez-vous (APPOINTMENT)
| Action | Trigger | Before/After |
|--------|---------|--------------|
| CREATE | Création RDV | null / {patientId, startTime, motifId, ...} |
| UPDATE | Modif RDV | {old status/time} / {new} |
| UPDATE.STATUS | Changement statut | {status: 'scheduled'} / {status: 'waiting'} |
| DELETE | Annulation | {full RDV} / null |
| VIEW | Ouverture détail | null / null |

### Prescriptions (PRESCRIPTION)
| Action | Trigger | Before/After |
|--------|---------|--------------|
| CREATE | Nouvelle ordo | null / {medications[], ...} |
| UPDATE | Modif ordo | {version: n} / {version: n+1, changes} |
| SIGN | Signature électronique | {signed: false} / {signed: true, signedAt} |
| SEND | Envoi pharmacie/patient | null / {sentTo, sentAt} |
| PRINT | Impression | null / {printedAt} |

### Documents (DOCUMENT)
| Action | Trigger | Before/After |
|--------|---------|--------------|
| CREATE | Import/Génération | null / {type, title, filePath} |
| UPDATE | Renommage/Recatégorisation | {title} / {title} |
| DELETE | Suppression | {full doc} / null |
| SHARE | Partage patient | null / {sharedWith, sharedAt} |
| VIEW | Consultation | null / null |
| PRINT | Impression | null / {printedAt} |
| EXPORT | Export PDF/ZIP | null / {exportedAt, format} |

### Allergies (ALLERGY)
| Action | Trigger | Before/After |
|--------|---------|--------------|
| CREATE | Ajout allergie | null / {allergen, severity} |
| UPDATE | Modif sévérité/réaction | {severity} / {severity} |
| DELETE | Suppression (rare) | {full} / null |

### Factures (INVOICE)
| Action | Trigger | Before/After |
|--------|---------|--------------|
| CREATE | Création facture | null / {amount, items[]} |
| UPDATE | Modif montant/items | {amount} / {amount} |
| UPDATE.STATUS | Paiement/Remboursement | {status: 'pending'} / {status: 'paid', paidAt} |
| EXPORT | Export comptable | null / {exportedAt} |

### Messages (MESSAGE)
| Action | Trigger | Before/After |
|--------|---------|--------------|
| CREATE | Envoi message | null / {recipientId, subject} |
| VIEW | Lecture (mark read) | {readAt: null} / {readAt: Date} |
| DELETE | Suppression | {full} / null |

## G.3 Affichage Historique Patient

```typescript
// Query timeline unifiée (derniers 50 events)
const patientTimeline = await supabase
  .from('audit_logs')
  .select('*')
  .eq('context->>patientId', patientId)
  .order('timestamp', { ascending: false })
  .limit(50);

// Filtres disponibles:
// - Par type: RDV, Documents, Prescriptions, Messages, etc.
// - Par période: Aujourd'hui, 7j, 30j, 1an, Tout
// - Par auteur: Moi, Équipe, Patient
```

---

# H. BACKLOG TECH PRIORISÉ

## H.1 P0 - Critiques (Sprint 1-2)

| ID | Ticket | Critères Acceptation | Risque Régression | Tests |
|----|--------|---------------------|-------------------|-------|
| **P0-01** | Design tokens densité | 3 modes fonctionnels, switch instantané, persist localStorage | Casse layouts existants | Visual snapshot all pages |
| **P0-02** | CardCompact + CompactListItem | Height max respecté, truncate OK, actions visibles | Casse cards existantes | Unit + visual |
| **P0-03** | Home Dossier Patient refactor | No scroll 1366x768, KPI bar, grille 2 rows | Perte fonctionnalités | E2E critical paths |
| **P0-04** | CoordonneesBanner inline | 60px height, copyable, responsive | None | Unit |
| **P0-05** | AuditEvent service + table | Schema créé, CREATE/UPDATE/DELETE tracés | None | Integration tests |

## H.2 P1 - Importants (Sprint 3-4)

| ID | Ticket | Critères Acceptation | Risque Régression | Tests |
|----|--------|---------------------|-------------------|-------|
| **P1-01** | Agenda zoom fit-to-screen | Zoom 0 = grille remplit espace, pas scroll | Casse zoom actuel | Visual + manual |
| **P1-02** | Agenda plage horaire dynamique | Grille s'adapte à plage, indicateurs hors-plage | Casse affichage RDV | E2E agenda |
| **P1-03** | Onglet Antécédents compact | 2 colonnes, accordion, no scroll 768px | Perte données affichées | E2E dossier |
| **P1-04** | Onglet Documents table + preview | Table 32px rows, drawer preview, pagination | Lenteur si > 100 docs | Perf test |
| **P1-05** | Timeline Historique patient | Query unifiée audit_logs, filtres, UI compact | None | Integration |

## H.3 P2 - Améliorations (Sprint 5+)

| ID | Ticket | Critères Acceptation | Risque Régression | Tests |
|----|--------|---------------------|-------------------|-------|
| **P2-01** | Virtualisation grille agenda | react-window, 60fps scroll | None | Perf benchmark |
| **P2-02** | Responsive tablet dossier | Sidebar collapsée, actions drawer | Casse mobile | Manual tablet |
| **P2-03** | Onglet Biologie courbes | Chart lazy load, période sélectionnable | None | Unit |
| **P2-04** | Export audit PDF | Génération rapport traçabilité | None | Integration |
| **P2-05** | Densité auto selon viewport | Détection hauteur, switch auto Compact | Flickering potentiel | Visual |

## H.4 Dépendances

```
P0-01 (tokens) ──→ P0-02 (components) ──→ P0-03 (Home refactor)
                                      ──→ P1-03 (Antécédents)
                                      ──→ P1-04 (Documents)

P0-05 (audit service) ──→ P1-05 (Timeline)
                      ──→ P2-04 (Export)

P1-01 (zoom fit) ──→ P1-02 (plage dynamique) ──→ P2-01 (virtualisation)
```

## H.5 Definition of Done

- [ ] Code review approuvé
- [ ] Tests unitaires > 80% coverage nouveau code
- [ ] Tests E2E paths critiques passent
- [ ] Visual snapshots mis à jour
- [ ] Pas de régression Lighthouse (LCP < 2s, CLS < 0.1)
- [ ] Accessibilité WCAG AA validée (axe-core)
- [ ] Documentation Storybook mise à jour
- [ ] Feature flag activable/désactivable
- [ ] Rollback testé

---

# ANNEXES

## A1. Fichiers à Modifier (P0)

```
src/styles/tokens.css (NOUVEAU)
src/hooks/useDensity.ts (NOUVEAU)
src/components/ui/card-compact.tsx (NOUVEAU)
src/components/ui/compact-list-item.tsx (NOUVEAU)
src/components/ui/kpi-tile.tsx (NOUVEAU)
src/components/ui/inline-actions.tsx (NOUVEAU)
src/components/patients/dossier/PatientHomeTab.tsx (REFACTOR)
src/components/patients/dossier/CoordonneesBanner.tsx (NOUVEAU)
src/services/supabase/auditService.ts (EXTEND)
supabase/migrations/YYYYMMDD_audit_logs_table.sql (NOUVEAU)
```

## A2. Feature Flags

```typescript
// src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  DENSITY_MODES: 'density-modes', // P0-01
  COMPACT_HOME: 'compact-home', // P0-03
  AUDIT_LOGGING: 'audit-logging', // P0-05
  AGENDA_FIT_SCREEN: 'agenda-fit-screen', // P1-01
  PATIENT_TIMELINE: 'patient-timeline', // P1-05
};

// Usage:
if (isFeatureEnabled(FEATURE_FLAGS.COMPACT_HOME)) {
  return <CompactHomeLayout />;
}
return <LegacyHomeLayout />;
```

## A3. Métriques de Succès

| Métrique | Baseline | Target | Mesure |
|----------|----------|--------|--------|
| Scroll Home dossier patient | Oui (1080px) | Non (< 700px) | Manual + Playwright |
| LCP Agenda | 2.4s | < 2s | Lighthouse CI |
| CLS toutes pages | 0.15 | < 0.1 | Lighthouse CI |
| Couverture audit events | 0% | 100% actions CRUD | Query count audit_logs |
| Satisfaction utilisateur densité | N/A | > 80% préfèrent | Survey |

---

**FIN DU DOCUMENT**

*Généré le 2026-01-18 | Version 1.0*
