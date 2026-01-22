#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Correction de la policy de lecture
"""

import json
import requests
from pathlib import Path

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

print("\n[*] Correction de la policy de lecture...")

# Policy de lecture simplifiee
policy = """
DROP POLICY IF EXISTS "Documents viewable by authenticated users" ON public.documents;
CREATE POLICY "Documents viewable by authenticated users"
ON public.documents FOR SELECT
TO authenticated
USING (
    deleted_at IS NULL
);
"""

response = requests.post(api_url, headers=headers, json={"query": policy}, timeout=60)
if response.status_code in [200, 201]:
    print("[OK] Policy de lecture corrigee")
else:
    print(f"[ERROR] {response.status_code}: {response.text}")

print("\n[*] Verification finale...")

verify = """
SELECT COUNT(*) as total
FROM pg_policies
WHERE tablename = 'documents';
"""

response_verify = requests.post(api_url, headers=headers, json={"query": verify}, timeout=30)
if response_verify.status_code in [200, 201]:
    result = response_verify.json()
    if isinstance(result, list) and len(result) > 0:
        total = result[0].get('total', 0)
        print(f"[OK] {total} policies actives sur table documents")

print("\n[OK] CONFIGURATION FINALE COMPLETE !\n")
