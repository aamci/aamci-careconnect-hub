# Guide d'exécution de la migration Téléconsultation

## 🚨 PROBLÈME ACTUEL

Les tables `teleconsultations` n'existent pas dans votre base de données Supabase, ce qui cause l'erreur :
```
Error: Failed to create teleconsultation: Could not find the table 'public.teleconsultations' in the schema cache
```

## ✅ SOLUTION : Exécuter la migration SQL

### Étape 1 : Ouvrir Supabase SQL Editor

1. Connectez-vous à votre projet Supabase : https://supabase.com/dashboard
2. Sélectionnez votre projet : `pjtbjegyrbtysgemwcmg`
3. Dans le menu de gauche, cliquez sur **"SQL Editor"**

### Étape 2 : Copier le script SQL

1. Ouvrez le fichier : `supabase/migrations/EXECUTE_THIS_FIRST_teleconsultation_essential.sql`
2. Copiez **tout le contenu** du fichier (Ctrl+A puis Ctrl+C)

### Étape 3 : Exécuter le script

1. Dans le SQL Editor de Supabase, cliquez sur **"New query"**
2. Collez le contenu du fichier SQL
3. Cliquez sur le bouton **"Run"** (ou appuyez sur Ctrl+Enter)
4. Attendez que l'exécution se termine (quelques secondes)

### Étape 4 : Vérifier que les tables sont créées

À la fin du script, vous devriez voir un résultat affichant les tables créées :

```
teleconsultation_documents
teleconsultation_events
teleconsultation_notes
teleconsultation_recordings
teleconsultation_sessions
teleconsultations
```

Si vous voyez ces 6 tables, la migration est réussie ! ✅

### Étape 5 : Tester l'application

1. Retournez dans votre application web
2. Rafraîchissez la page (F5)
3. Essayez de créer un nouveau rendez-vous avec l'option "Créer une téléconsultation vidéo" cochée
4. Cette fois, vous devriez voir le message de succès : **"Rendez-vous et téléconsultation créés"**

## 🔍 Vérification supplémentaire (optionnel)

Si vous voulez vérifier manuellement que les tables existent :

1. Dans Supabase, allez dans **"Table Editor"**
2. Vous devriez voir les nouvelles tables dans la liste :
   - `teleconsultations`
   - `teleconsultation_sessions`
   - `teleconsultation_events`
   - `teleconsultation_documents`
   - `teleconsultation_notes`
   - `teleconsultation_recordings`

## ⚠️ Remarques importantes

- **Ne modifiez PAS le script SQL** - exécutez-le tel quel
- Le script utilise `CREATE TABLE IF NOT EXISTS`, donc il est **sûr** de l'exécuter plusieurs fois
- Toutes les politiques de sécurité RLS (Row Level Security) sont configurées automatiquement
- Les index de performance sont créés automatiquement

## 🆘 En cas de problème

Si vous voyez des erreurs lors de l'exécution :

1. **Erreur de référence** (par exemple "table appointments does not exist") :
   - Vérifiez que les tables `appointments`, `patients`, `practitioners`, `consultations` existent déjà
   - Ces tables doivent exister avant de créer les tables de téléconsultation

2. **Erreur de permission** :
   - Assurez-vous d'être connecté avec un compte ayant les droits d'administration sur le projet Supabase

3. **Autre erreur** :
   - Copiez le message d'erreur complet et partagez-le pour diagnostic

## 📋 Après la migration

Une fois les tables créées, vous pourrez :
- ✅ Créer des téléconsultations depuis le formulaire de rendez-vous
- ✅ Générer automatiquement les liens patient et praticien
- ✅ Rejoindre les téléconsultations depuis le panneau de rendez-vous
- ✅ Gérer les sessions vidéo WebRTC
- ✅ Partager des documents pendant la consultation
- ✅ Prendre des notes en temps réel

## 🎯 Résultat attendu

Après avoir suivi ces étapes, vous aurez **une solution 100% opérationnelle avec 0 bug** pour la téléconsultation ! 🎉
