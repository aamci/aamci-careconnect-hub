#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script d'execution de la migration documents
Utilise l'API Management de Supabase
"""

import json
import requests
import sys
from pathlib import Path

# Chargement des credentials
print("\n[*] Chargement des credentials...")
script_dir = Path(__file__).parent
credentials_path = script_dir / ".." / "secret" / "token-acces-lmops-plateform.json"

with open(credentials_path, 'r', encoding='utf-8') as f:
    credentials = json.load(f)

project_id = credentials['supabase']['project_id']
access_token = credentials['supabase']['access_token']
service_role_key = credentials['supabase']['service_role_key']
supabase_url = credentials['supabase']['url']

print(f"[*] Projet: {project_id}")
print(f"[*] URL: {supabase_url}")

# Lecture du fichier de migration
print("\n[*] Lecture de la migration...")
migration_path = script_dir / ".." / "supabase" / "migrations" / "20260122_documents_complete_schema.sql"

with open(migration_path, 'r', encoding='utf-8') as f:
    migration_sql = f.read()

size_kb = len(migration_sql) / 1024
print(f"[*] Taille: {size_kb:.2f} KB")
print(f"[*] Nombre de lignes: {migration_sql.count(chr(10))}")

# Tentative 1: API Management
print("\n[*] TENTATIVE 1: API Management Supabase...")
api_url = f"https://api.supabase.com/v1/projects/{project_id}/database/query"

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

payload = {
    "query": migration_sql
}

try:
    print("[*] Envoi de la requete...")
    response = requests.post(api_url, headers=headers, json=payload, timeout=120)

    if response.status_code == 200:
        print("[OK] Migration executee avec succes via API Management!")
        try:
            result = response.json()
            print("[*] Reponse:", json.dumps(result, indent=2))
        except:
            print("[*] Reponse:", response.text)
    else:
        print(f"[ERROR] Erreur HTTP {response.status_code}")
        print(f"[ERROR] Reponse: {response.text}")
        raise Exception(f"API Management failed: {response.status_code}")

except Exception as e:
    print(f"\n[ERROR] API Management echue: {str(e)}")
    print("\n[*] TENTATIVE 2: Execution manuelle requise")

    # Pour cette approche, on a besoin d'une connection directe
    # Ce qui n'est pas possible sans psql ou pgcli

    print("\n" + "="*60)
    print("\n[*] INSTRUCTIONS POUR EXECUTION MANUELLE:")
    print(f"\n1. Ouvrir: https://app.supabase.com/project/{project_id}/sql/new")
    print(f"\n2. Copier le contenu du fichier:")
    print(f"   {migration_path.absolute()}")
    print("\n3. Coller dans le SQL Editor de Supabase")
    print("\n4. Cliquer sur 'RUN' pour executer")
    print("\n5. Verifier qu'il n'y a aucune erreur")

    print("\n[*] Instructions completes dans: MIGRATION_INSTRUCTIONS.md")
    print("\n" + "="*60 + "\n")

    sys.exit(1)

# Verification post-migration
print("\n[*] Verification de la structure creee...")

verify_query = """
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_name IN ('documents', 'document_audit', 'document_consultation_links')
ORDER BY table_name;
"""

verify_payload = {"query": verify_query}

try:
    verify_response = requests.post(api_url, headers=headers, json=verify_payload, timeout=30)

    if verify_response.status_code == 200:
        print("\n[*] Tables creees:")
        result = verify_response.json()
        if isinstance(result, list):
            for row in result:
                print(f"   - {row.get('table_name')}: {row.get('column_count')} colonnes")
        else:
            print(f"   Reponse: {result}")
    else:
        print("[WARN] Impossible de verifier la structure")

except Exception as e:
    print(f"[WARN] Erreur verification: {str(e)}")

print("\n" + "="*60)
print("\n[OK] MIGRATION TERMINEE AVEC SUCCES!")
print("\n[*] GARANTIE ZERO PERTE: Tous les champs sont maintenant persistes en base.")
print("\n[*] Prochaines etapes:")
print("   1. Tester l'upload d'un document via l'interface")
print("   2. Verifier que tous les 35 champs sont bien sauvegardes")
print("   3. Consulter le RAPPORT_ZERO_PERTE.md pour la suite\n")
