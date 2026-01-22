# Instructions d'exécution de la migration documents

## ⚠️ IMPORTANT - GARANTIE ZÉRO PERTE

Cette migration est **CRITIQUE** pour la garantie d'intégrité des données. Elle transforme la table `documents` d'un schéma incomplet (11 champs) vers un schéma complet (35 champs) aligné à 100% avec le type TypeScript.

## 📋 Fichiers concernés

- **Migration SQL**: `supabase/migrations/20260122_documents_complete_schema.sql`
- **Service de persistence**: `src/services/supabase/documentsService.ts`
- **Hook d'upload**: `src/hooks/useDocumentUpload.ts`
- **Utilitaires fichiers**: `src/lib/fileUtils.ts`
- **Client Supabase**: `src/lib/supabaseClient.ts`

## 🎯 Ce que fait la migration

1. **Renomme** la table `documents` existante en `documents_legacy`
2. **Crée** une nouvelle table `documents` avec **35 champs complets**:
   - Métadonnées complètes (external_id, subcategory, description)
   - Dates et statuts (document_date, status)
   - Signature électronique (is_signed, signature_data)
   - Chiffrement (is_encrypted, encryption_method)
   - Partage patient (shared_with_patient, shared_at, shared_by)
   - Visibilité et permissions (visibility, restricted_to_roles)
   - Soft delete (deleted_at, deleted_by)
   - Traçabilité (checksum, metadata JSONB)
   - Source et provenance (source, source_system)
   - Miniatures (thumbnail_url)

3. **Crée** table `document_audit` pour traçabilité complète
4. **Crée** table `document_consultation_links` pour relations many-to-many
5. **Migre** automatiquement les données existantes
6. **Active** RLS (Row Level Security)
7. **Crée** triggers d'audit automatique
8. **Crée** fonctions utilitaires (soft delete, restore, share)
9. **Crée** 12+ index pour performance optimale

## 🚀 Méthode 1: Via l'interface Supabase (RECOMMANDÉ)

1. Ouvrir le dashboard Supabase: https://app.supabase.com
2. Sélectionner votre projet: `pjtbjeqyrbtsygemwcmg`
3. Aller dans **SQL Editor**
4. Créer une nouvelle query
5. Copier tout le contenu du fichier:
   ```
   supabase/migrations/20260122_documents_complete_schema.sql
   ```
6. Coller dans l'éditeur SQL
7. **Exécuter** (bouton Run)
8. Vérifier qu'il n'y a **aucune erreur**

### ✅ Vérifications post-migration

Exécuter ces requêtes pour confirmer le succès:

```sql
-- 1. Vérifier que les 3 tables existent
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('documents', 'document_audit', 'document_consultation_links');

-- 2. Compter les colonnes de documents (devrait être ~35)
SELECT COUNT(*) as nb_colonnes FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'documents';

-- 3. Lister toutes les colonnes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'documents'
ORDER BY ordinal_position;

-- 4. Vérifier les données migrées (si table legacy existait)
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM documents_legacy;

-- 5. Vérifier les triggers
SELECT trigger_name FROM information_schema.triggers
WHERE event_object_table = 'documents';

-- 6. Vérifier les RLS policies
SELECT tablename, policyname FROM pg_policies
WHERE tablename = 'documents';
```

## 🔧 Méthode 2: Via CLI Supabase (si installé)

```bash
cd careconnect-hub
supabase db push
```

## 🔧 Méthode 3: Via psql (ligne de commande)

Si vous avez accès direct à PostgreSQL:

```bash
psql -h [DB_HOST] -U postgres -d postgres -f supabase/migrations/20260122_documents_complete_schema.sql
```

## 📊 Validation ZÉRO PERTE

Après la migration, **TOUS** les champs suivants doivent être présents:

### ✅ Checklist des 35 champs

- [ ] id
- [ ] external_id
- [ ] filename
- [ ] mime_type
- [ ] file_size
- [ ] storage_url
- [ ] thumbnail_url
- [ ] checksum
- [ ] storage_bucket
- [ ] category
- [ ] subcategory
- [ ] title
- [ ] description
- [ ] patient_id
- [ ] consultation_id
- [ ] document_date
- [ ] status
- [ ] is_signed
- [ ] signature_data
- [ ] is_encrypted
- [ ] encryption_method
- [ ] metadata
- [ ] created_by
- [ ] created_at
- [ ] updated_by
- [ ] updated_at
- [ ] deleted_by
- [ ] deleted_at
- [ ] source
- [ ] source_system
- [ ] shared_with_patient
- [ ] shared_at
- [ ] shared_by
- [ ] visibility
- [ ] restricted_to_roles

## 🔐 Variables d'environnement requises

Vérifier que ces variables sont bien configurées dans `.env`:

```env
VITE_SUPABASE_URL=https://pjtbjeqyrbtsygemwcmg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

## ⚠️ En cas d'erreur

Si la migration échoue:

1. **NE PAS** supprimer la table `documents_legacy`
2. Noter l'erreur exacte
3. Vérifier les permissions de l'utilisateur
4. Vérifier qu'aucune contrainte ne bloque
5. Contacter l'administrateur DB si nécessaire

## 🎯 Prochaines étapes après migration

1. ✅ Tester l'upload d'un document via l'interface
2. ✅ Vérifier que toutes les métadonnées sont bien sauvegardées
3. ✅ Tester la lecture/affichage des documents
4. ✅ Tester la signature électronique
5. ✅ Tester le partage avec patient
6. ✅ Vérifier l'audit trail dans `document_audit`

## 📞 Support

En cas de problème, vérifier:
- Les logs Supabase
- La console navigateur (erreurs JS)
- Les permissions RLS
- La connexion réseau

---

**Date de création**: 2026-01-22
**Auteur**: Armand AMOUSSOU
**Objectif**: GARANTIE ZÉRO PERTE - Persistence exhaustive documents
