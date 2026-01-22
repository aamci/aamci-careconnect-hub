#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de verification de l'etat actuel de la base de donnees
"""

import json
import requests
from pathlib import Path

# Chargement des credentials
print("\n[*] Chargement des credentials...")
script_dir = Path(__file__).parent
credentials_path = script_dir / ".." / "secret" / "token-acces-lmops-plateform.json"

with open(credentials_path, 'r', encoding='utf-8') as f:
    credentials = json.load(f)

project_id = credentials['supabase']['project_id']
access_token = credentials['supabase']['access_token']

api_url = f"https://api.supabase.com/v1/projects/{project_id}/database/query"

headers = {
    "Authorization": f"Bearer {access_token}",
    "Content-Type": "application/json"
}

print("[*] Verification de l'etat de la base de donnees...")
print("=" * 60)

# 1. Verifier les tables documents
print("\n1. TABLES DOCUMENTS:")
query1 = """
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = t.table_name) as nb_colonnes
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE 'document%'
ORDER BY table_name;
"""

response1 = requests.post(api_url, headers=headers, json={"query": query1}, timeout=30)
if response1.status_code == 200:
    result = response1.json()
    if isinstance(result, list) and len(result) > 0:
        for row in result:
            print(f"   - {row.get('table_name')}: {row.get('nb_colonnes')} colonnes")
    else:
        print("   [!] Aucune table 'document*' trouvee")
else:
    print(f"   [ERROR] {response1.status_code}: {response1.text}")

# 2. Verifier les colonnes de la table documents
print("\n2. COLONNES DE LA TABLE 'documents':")
query2 = """
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'documents'
ORDER BY ordinal_position;
"""

response2 = requests.post(api_url, headers=headers, json={"query": query2}, timeout=30)
if response2.status_code == 200:
    result = response2.json()
    if isinstance(result, list) and len(result) > 0:
        print(f"   Total: {len(result)} colonnes")
        for row in result[:10]:  # Afficher les 10 premieres
            print(f"   - {row.get('column_name')}: {row.get('data_type')}")
        if len(result) > 10:
            print(f"   ... et {len(result) - 10} autres colonnes")
    else:
        print("   [!] Table 'documents' n'existe pas ou vide")
else:
    print(f"   [ERROR] {response2.status_code}: {response2.text}")

# 3. Verifier les index
print("\n3. INDEX SUR LA TABLE 'documents':")
query3 = """
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'documents'
ORDER BY indexname;
"""

response3 = requests.post(api_url, headers=headers, json={"query": query3}, timeout=30)
if response3.status_code == 200:
    result = response3.json()
    if isinstance(result, list) and len(result) > 0:
        for row in result:
            print(f"   - {row.get('indexname')}")
    else:
        print("   [!] Aucun index trouve")
else:
    print(f"   [ERROR] {response3.status_code}: {response3.text}")

# 4. Verifier les triggers
print("\n4. TRIGGERS SUR LA TABLE 'documents':")
query4 = """
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'documents'
ORDER BY trigger_name;
"""

response4 = requests.post(api_url, headers=headers, json={"query": query4}, timeout=30)
if response4.status_code == 200:
    result = response4.json()
    if isinstance(result, list) and len(result) > 0:
        for row in result:
            print(f"   - {row.get('trigger_name')}: {row.get('event_manipulation')}")
    else:
        print("   [!] Aucun trigger trouve")
else:
    print(f"   [ERROR] {response4.status_code}: {response4.text}")

# 5. Verifier les policies RLS
print("\n5. POLICIES RLS SUR LA TABLE 'documents':")
query5 = """
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'documents'
ORDER BY policyname;
"""

response5 = requests.post(api_url, headers=headers, json={"query": query5}, timeout=30)
if response5.status_code == 200:
    result = response5.json()
    if isinstance(result, list) and len(result) > 0:
        for row in result:
            print(f"   - {row.get('policyname')}: {row.get('cmd')}")
    else:
        print("   [!] Aucune policy RLS trouvee")
else:
    print(f"   [ERROR] {response5.status_code}: {response5.text}")

# 6. Compter les documents existants
print("\n6. DOCUMENTS EXISTANTS:")
query6 = """
SELECT COUNT(*) as total
FROM documents;
"""

response6 = requests.post(api_url, headers=headers, json={"query": query6}, timeout=30)
if response6.status_code == 200:
    result = response6.json()
    if isinstance(result, list) and len(result) > 0:
        total = result[0].get('total', 0)
        print(f"   Total: {total} documents")
    else:
        print("   [!] Impossible de compter")
else:
    print(f"   [!] Table documents n'existe pas ou vide")

print("\n" + "=" * 60)
print("\n[*] Verification terminee\n")
