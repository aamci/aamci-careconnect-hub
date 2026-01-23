# INSTALLATION TÉLÉCONSULTATION - ACTION REQUISE

## 🚨 PROBLÈME ACTUEL

Les erreurs que vous voyez sont dues au fait que **les tables de téléconsultation n'existent pas** dans votre base de données Supabase.

```
Error: Could not find the table 'public.teleconsultations' in the schema cache
Code: PGRST205
```

## ✅ SOLUTION IMMÉDIATE - 2 MÉTHODES

### MÉTHODE 1 : Via l'interface web (LA PLUS SIMPLE)

1. **Ouvrez votre application** : http://localhost:8080
2. **Une alerte rouge s'affiche en haut** : "Module Téléconsultation non configuré"
3. **Cliquez sur le bouton "Configurer"**
4. Vous serez redirigé vers `/admin/teleconsult-setup`
5. **Cliquez sur "Ouvrir SQL Editor"** - cela ouvre votre dashboard Supabase
6. **Cliquez sur "Copier le SQL"** - le script est copié dans votre presse-papier
7. **Collez le SQL** dans l'éditeur Supabase
8. **Cliquez sur "Run"**
9. **Revenez sur la page** et cliquez sur "Re-vérifier"
10. ✅ Les 6 tables sont maintenant créées !

### MÉTHODE 2 : Via le fichier SQL directement

1. **Ouvrez Supabase Dashboard** : https://supabase.com/dashboard
2. **Sélectionnez votre projet** : `pjtbjegyrbtysgemwcmg`
3. **Allez dans SQL Editor** (menu gauche)
4. **Cliquez sur "New query"**
5. **Ouvrez le fichier** : `supabase/migrations/EXECUTE_THIS_FIRST_teleconsultation_essential.sql`
6. **Copiez TOUT le contenu** du fichier
7. **Collez dans SQL Editor** Supabase
8. **Cliquez sur "Run"**
9. ✅ Terminé !

## 📋 VÉRIFICATION

Après avoir exécuté le SQL, vérifiez que ces 6 tables existent :

```
✅ teleconsultations
✅ teleconsultation_sessions
✅ teleconsultation_events
✅ teleconsultation_documents
✅ teleconsultation_notes
✅ teleconsultation_recordings
```

Vous pouvez les voir dans :
- **Table Editor** dans Supabase Dashboard
- Ou sur la page `/admin/teleconsult-setup` de votre application

## 🎯 RÉSULTAT ATTENDU

Une fois les tables créées :

1. ✅ **Plus d'erreur PGRST205**
2. ✅ **Création de RDV + téléconsultation fonctionne**
3. ✅ **Liens patient/praticien générés automatiquement**
4. ✅ **Formulaire unique opérationnel à 100%**
5. ✅ **L'alerte rouge disparaît**

## ⚙️ DÉTAILS TECHNIQUES

### Tables créées

- `teleconsultations` : Table principale (room_token, liens, statut)
- `teleconsultation_sessions` : Sessions WebRTC
- `teleconsultation_events` : Journal d'événements
- `teleconsultation_documents` : Documents partagés
- `teleconsultation_notes` : Notes médicales
- `teleconsultation_recordings` : Enregistrements vidéo

### Sécurité

- ✅ Row Level Security (RLS) activé
- ✅ Politiques d'accès par praticien
- ✅ Tokens sécurisés (32 bytes random)
- ✅ Expiration automatique (24h)

### Index

- ✅ Index sur appointment_id, patient_id, practitioner_id
- ✅ Index sur status pour filtrage rapide
- ✅ Index sur room_token pour validation d'accès

## 🔍 DÉPANNAGE

### Si l'erreur persiste après exécution du SQL :

1. **Vérifiez que le SQL s'est exécuté sans erreur**
2. **Rafraîchissez la page** de l'application (F5)
3. **Videz le cache** du navigateur (Ctrl+Shift+R)
4. **Redémarrez le serveur** de développement

### Si vous voyez "Perhaps you meant the table 'public.consultations'" :

Cela signifie que la table `teleconsultations` n'existe toujours pas. Répétez la méthode 1 ou 2.

## 📞 SUPPORT

Si vous rencontrez des difficultés :
1. Vérifiez les logs dans la console du navigateur (F12)
2. Vérifiez les logs dans le terminal où tourne `npm run dev`
3. Partagez les messages d'erreur complets

---

**IMPORTANT** : Sans ces tables, la téléconsultation ne peut PAS fonctionner. C'est l'étape obligatoire n°1.
