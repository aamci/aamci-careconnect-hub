# CareConnect-Hub - Documentation de Securite

## Conformite Reglementaire

Cette application respecte les normes suivantes:
- **HIPAA** (Health Insurance Portability and Accountability Act)
- **RGPD** (Reglement General sur la Protection des Donnees)
- **HDS** (Hebergeur de Donnees de Sante - France)

---

## Architecture de Securite

### 1. Row Level Security (RLS)

Toutes les tables contenant des donnees sensibles sont protegees par RLS.

#### Tables Protegees (26 tables)

| Table | Donnees | Niveau de Sensibilite |
|-------|---------|----------------------|
| `patients` | Donnees demographiques | ELEVE |
| `patient_allergies` | Allergies medicales | CRITIQUE |
| `patient_antecedents` | Historique medical | CRITIQUE |
| `patient_conditions` | Diagnostics | CRITIQUE |
| `patient_lifestyle` | Mode de vie | MOYEN |
| `patient_cvd_risk` | Risque cardiovasculaire | ELEVE |
| `patient_devices` | Dispositifs medicaux | ELEVE |
| `patient_family_history` | Historique familial | ELEVE |
| `patient_procedures` | Interventions chirurgicales | CRITIQUE |
| `patient_gyneco_obstetric` | Donnees gynecologiques | CRITIQUE |
| `patient_perinatal` | Donnees perinatales | CRITIQUE |
| `patient_alerts` | Alertes medicales | CRITIQUE |
| `patient_memos` | Notes patient | MOYEN |
| `consultations` | Consultations | CRITIQUE |
| `lab_results` | Resultats laboratoire | CRITIQUE |
| `notes` | Notes cliniques | ELEVE |
| `prescriptions` | Ordonnances | CRITIQUE |
| `vaccinations` | Vaccinations | ELEVE |
| `vital_signs` | Signes vitaux | ELEVE |
| `appointments` | Rendez-vous | MOYEN |
| `appointment_recurrences` | Recurrences RDV | FAIBLE |
| `waiting_list` | Liste d'attente | FAIBLE |
| `invoices` | Factures | MOYEN |
| `payments` | Paiements | MOYEN |
| `documents` | Documents | ELEVE |
| `practitioners` | Praticiens | FAIBLE |

---

## 2. Systeme de Roles (RBAC)

### Roles Disponibles

| Role | Description | Acces |
|------|-------------|-------|
| `admin` | Administrateur systeme | Acces complet, gestion des utilisateurs |
| `practitioner` | Medecin/Praticien | Donnees medicales patients |
| `secretary` | Secretaire medicale | RDV, documents, facturation |
| `billing` | Comptabilite | Factures, paiements |
| `accountant` | Comptable | Rapports financiers |
| `nurse` | Infirmier(e) | Signes vitaux, soins |
| `intern` | Stagiaire | Acces en lecture seule |

### Table `user_roles`

```sql
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('admin', 'practitioner', 'secretary', 'billing', 'accountant', 'nurse', 'intern')),
  organization_id uuid,
  site_id uuid,
  granted_by uuid,
  granted_at timestamptz,
  expires_at timestamptz,
  is_active boolean DEFAULT true
);
```

---

## 3. Politiques RLS par Operation

### SELECT (Lecture)
- **Utilisateurs authentifies** : Peuvent lire les donnees des patients actifs
- **Admins** : Peuvent voir toutes les donnees, y compris patients inactifs

### INSERT (Creation)
- **Utilisateurs authentifies** : Peuvent creer des enregistrements

### UPDATE (Modification)
- **Utilisateurs authentifies** : Peuvent modifier les donnees
- **Prescriptions** : Non modifiables apres signature
- **Factures** : Non modifiables si status = 'paid' ou 'cancelled'

### DELETE (Suppression)
- **Admins uniquement** : Seuls les administrateurs peuvent supprimer
- **Recommandation** : Utiliser la suppression logique (soft delete)

---

## 4. Fonctions de Securite

```sql
-- Verifie si l'utilisateur est admin
public.is_admin() -> boolean

-- Verifie si l'utilisateur est personnel medical
public.is_medical_staff() -> boolean

-- Verifie si l'utilisateur est personnel comptable
public.is_billing_staff() -> boolean
```

---

## 5. Configuration Initiale

### Creer le Premier Administrateur

Apres creation d'un utilisateur dans Supabase Auth:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('VOTRE-AUTH-USER-UUID', 'admin');
```

### Attribuer un Role

```sql
INSERT INTO public.user_roles (user_id, role, granted_by)
VALUES (
  'UUID-UTILISATEUR',
  'practitioner',
  'UUID-ADMIN-QUI-ATTRIBUE'
);
```

---

## 6. Bonnes Pratiques

### Variables d'Environnement

**NE JAMAIS COMMITER:**
- `.env` - Cle Supabase, secrets
- `*.pem`, `*.key` - Certificats
- `*secret*`, `*credential*` - Fichiers sensibles

**Utiliser `.env.example`** comme template.

### Rotation des Cles

Si les cles ont ete exposees:
1. Aller dans Supabase Dashboard > Settings > API
2. Regenerer les cles `anon` et `service_role`
3. Mettre a jour `.env` localement
4. Redemarrer l'application

### Audit Trail

Toutes les tables ont des colonnes:
- `created_at` - Date de creation
- `updated_at` - Date de modification
- Certaines ont `created_by` / `updated_by`

---

## 7. Application des Migrations

### Via Supabase CLI

```bash
cd careconnect-hub
npx supabase db push
```

### Ordre d'Execution

1. `20260119_user_roles_table.sql` - Table des roles (PREREQUIS)
2. `20260119_comprehensive_rls_security.sql` - Politiques RLS

### Via Dashboard Supabase

1. Aller dans SQL Editor
2. Copier/coller le contenu de chaque fichier
3. Executer dans l'ordre

---

## 8. Verification de Securite

### Verifier RLS Active

```sql
SELECT tablename, rowsecurity
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE schemaname = 'public';
```

### Lister les Politiques

```sql
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Tester l'Acces Anonyme

```sql
-- Devrait retourner 0 lignes
SET ROLE anon;
SELECT * FROM patients LIMIT 1;
RESET ROLE;
```

---

## 9. Contacts

Pour signaler une vulnerabilite de securite, contacter l'equipe de developpement immediatement.

---

*Document genere le 2026-01-19*
*Version: 2.0*
