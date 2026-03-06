-- =====================================================================
-- CareConnect Hub - COMPLETE DATABASE SEED
-- =====================================================================
-- This script populates the Supabase database with real, coherent data.
-- Run this in Supabase Dashboard > SQL Editor (runs as postgres superuser).
--
-- Password for ALL users: CareConnect2026!
--
-- Created by: Armand AMOUSSOU
-- =====================================================================

BEGIN;

-- =====================================================================
-- 0. CLEANUP: Remove any leftover mock/partial data
-- =====================================================================
DELETE FROM public.teleconsultation_notes WHERE id LIKE 'note-tc%';
DELETE FROM public.teleconsultation_documents WHERE id LIKE 'doc-share%';
DELETE FROM public.teleconsultation_events WHERE teleconsultation_id LIKE 'tc-%';
DELETE FROM public.teleconsultation_sessions WHERE teleconsultation_id LIKE 'tc-%';
DELETE FROM public.teleconsultations WHERE id LIKE 'tc-%';
DELETE FROM public.consultations WHERE id LIKE 'consult-%';
DELETE FROM public.appointments WHERE id LIKE 'apt-%';
DELETE FROM public.tasks WHERE id LIKE 'task-%';
DELETE FROM public.notes WHERE id LIKE 'note-%';
DELETE FROM public.patient_alerts WHERE id LIKE 'alert-%';
DELETE FROM public.patients WHERE id LIKE 'pat-%';
DELETE FROM public.practitioners WHERE id LIKE 'pract-%';
DELETE FROM public.appointment_motifs WHERE id LIKE 'motif-%';
DELETE FROM public.rooms WHERE id LIKE 'room-%';
DELETE FROM public.sites WHERE id LIKE 'site-%';

-- =====================================================================
-- 1. AUTH USERS (5 users)
-- =====================================================================
-- Uses Supabase auth.users + auth.identities for email/password login
-- Password: CareConnect2026!

-- Delete existing auth users if they exist (by email)
DELETE FROM auth.identities WHERE provider_id IN (
  'dr.martin@medisync.fr', 'dr.dubois@medisync.fr', 'dr.laurent@medisync.fr',
  'secretariat@medisync.fr', 'admin@medisync.fr'
);
DELETE FROM auth.users WHERE email IN (
  'dr.martin@medisync.fr', 'dr.dubois@medisync.fr', 'dr.laurent@medisync.fr',
  'secretariat@medisync.fr', 'admin@medisync.fr'
);

-- Dr Sophie Martin
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud, confirmation_token
) VALUES (
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  '00000000-0000-0000-0000-000000000000',
  'dr.martin@medisync.fr',
  crypt('CareConnect2026!', gen_salt('bf')),
  NOW(), '2025-06-15T08:00:00Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dr Sophie Martin","role":"practitioner"}'::jsonb,
  false, 'authenticated', 'authenticated', ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  '{"sub":"a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d","email":"dr.martin@medisync.fr"}'::jsonb,
  'email', 'dr.martin@medisync.fr', NOW(), '2025-06-15T08:00:00Z', NOW()
);

-- Dr Pierre Dubois
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud, confirmation_token
) VALUES (
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  '00000000-0000-0000-0000-000000000000',
  'dr.dubois@medisync.fr',
  crypt('CareConnect2026!', gen_salt('bf')),
  NOW(), '2025-09-01T09:00:00Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dr Pierre Dubois","role":"practitioner"}'::jsonb,
  false, 'authenticated', 'authenticated', ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  '{"sub":"b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e","email":"dr.dubois@medisync.fr"}'::jsonb,
  'email', 'dr.dubois@medisync.fr', NOW(), '2025-09-01T09:00:00Z', NOW()
);

-- Dr Marie Laurent
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud, confirmation_token
) VALUES (
  'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  '00000000-0000-0000-0000-000000000000',
  'dr.laurent@medisync.fr',
  crypt('CareConnect2026!', gen_salt('bf')),
  NOW(), '2025-11-10T10:00:00Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Dr Marie Laurent","role":"practitioner"}'::jsonb,
  false, 'authenticated', 'authenticated', ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
  '{"sub":"c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f","email":"dr.laurent@medisync.fr"}'::jsonb,
  'email', 'dr.laurent@medisync.fr', NOW(), '2025-11-10T10:00:00Z', NOW()
);

-- Marie Dupont (Secretary)
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud, confirmation_token
) VALUES (
  'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80',
  '00000000-0000-0000-0000-000000000000',
  'secretariat@medisync.fr',
  crypt('CareConnect2026!', gen_salt('bf')),
  NOW(), '2025-05-20T08:30:00Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Marie Dupont","role":"secretary"}'::jsonb,
  false, 'authenticated', 'authenticated', ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80',
  '{"sub":"d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80","email":"secretariat@medisync.fr"}'::jsonb,
  'email', 'secretariat@medisync.fr', NOW(), '2025-05-20T08:30:00Z', NOW()
);

-- Admin
INSERT INTO auth.users (
  id, instance_id, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, role, aud, confirmation_token
) VALUES (
  'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091',
  '00000000-0000-0000-0000-000000000000',
  'admin@medisync.fr',
  crypt('CareConnect2026!', gen_salt('bf')),
  NOW(), '2025-01-10T07:00:00Z', NOW(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Administrateur","role":"admin"}'::jsonb,
  true, 'authenticated', 'authenticated', ''
);

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) VALUES (
  gen_random_uuid(),
  'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091',
  '{"sub":"e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091","email":"admin@medisync.fr"}'::jsonb,
  'email', 'admin@medisync.fr', NOW(), '2025-01-10T07:00:00Z', NOW()
);

-- =====================================================================
-- 2. USER ROLES
-- =====================================================================
INSERT INTO public.user_roles (user_id, role) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'user'),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'user'),
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'user'),
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80', 'moderator'),
  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

-- =====================================================================
-- 3. SITES
-- =====================================================================
INSERT INTO public.sites (id, name, address, city, postal_code, phone, is_active) VALUES
  ('site-1', 'Centre Medical Saint-Michel', '45 Avenue de la Liberte', 'Paris', '75011', '01 42 55 67 89', true),
  ('site-2', 'Cabinet Republique', '12 Place de la Republique', 'Paris', '75003', '01 43 22 11 00', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 4. ROOMS
-- =====================================================================
INSERT INTO public.rooms (id, name, site_id, equipment, is_active) VALUES
  ('room-1', 'Salle 1', 'site-1', '[]'::jsonb, true),
  ('room-2', 'Salle 2', 'site-1', '[]'::jsonb, true),
  ('room-3', 'Salle Imagerie', 'site-1', '["Echographe", "ECG"]'::jsonb, true),
  ('room-4', 'Cabinet A', 'site-2', '[]'::jsonb, true),
  ('room-5', 'Cabinet B', 'site-2', '[]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 5. PRACTITIONERS (linked to auth users)
-- =====================================================================
INSERT INTO public.practitioners (id, first_name, last_name, title, specialty, email, phone, color, site_ids, is_active, user_id) VALUES
  ('pract-1', 'Sophie', 'Martin', 'Dr', 'Medecine Generale', 'dr.martin@medisync.fr', '06 12 34 56 78', '#0D9488', ARRAY['site-1', 'site-2'], true, 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
  ('pract-2', 'Pierre', 'Dubois', 'Dr', 'Cardiologie', 'dr.dubois@medisync.fr', '06 98 76 54 32', '#3B82F6', ARRAY['site-1'], true, 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'),
  ('pract-3', 'Marie', 'Laurent', 'Dr', 'Dermatologie', 'dr.laurent@medisync.fr', NULL, '#8B5CF6', ARRAY['site-2'], true, 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f')
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- =====================================================================
-- 6. APPOINTMENT MOTIFS
-- =====================================================================
INSERT INTO public.appointment_motifs (id, name, short_name, duration, color, type, requires_room, is_online_bookable, is_active) VALUES
  ('motif-1', 'Consultation generale', 'Consultation', 20, '#F59E0B', 'consultation', false, true, true),
  ('motif-2', 'Premiere consultation', '1ere consult.', 30, '#EC4899', 'consultation', false, true, true),
  ('motif-3', 'Suivi de traitement', 'Suivi', 15, '#3B82F6', 'followup', false, true, true),
  ('motif-4', 'Urgence', 'Urgence', 30, '#EF4444', 'emergency', false, false, true),
  ('motif-5', 'Bilan annuel', 'Bilan', 45, '#10B981', 'checkup', false, true, true),
  ('motif-6', 'Acte technique', 'Acte', 30, '#8B5CF6', 'procedure', true, false, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 7. PATIENTS (6 patients, registered at different dates for stats)
-- =====================================================================
INSERT INTO public.patients (id, first_name, last_name, used_first_name, used_last_name, gender, date_of_birth, phone, phone_secondary, email, address, city, postal_code, birth_place, insurance_provider, is_active, created_at, updated_at) VALUES
  ('pat-1', 'Maud', 'PENNANEACH', 'Maud', NULL, 'female', '1990-12-23', '06 12 34 56 78', NULL, 'maud.p@email.fr', '15 Rue de la Paix', 'Paris', '75002', 'France', NULL, true, '2022-04-15T09:30:00Z', '2026-02-28T14:00:00Z'),
  ('pat-2', 'David', 'CHICHEPORTICHE', NULL, NULL, 'male', '1965-06-04', '06 60 08 45 00', '01 55 93 14 00', 'dchichepo@gmail.com', '83 Avenue Andre Morizet', 'Boulogne', '92100', NULL, 'Mutuelle Generale', true, '2020-02-10T11:15:00Z', '2026-03-01T10:20:00Z'),
  ('pat-3', 'Pablo', 'MORENO', 'Pablo', NULL, 'male', '2001-07-02', '+33 6 34 89 67 26', NULL, 'pablo.moreno@email.fr', '27 Rue du Commerce', 'Arcachon', '33120', 'France', 'CPAM Gironde', true, '2023-01-05T14:00:00Z', '2026-02-25T16:30:00Z'),
  ('pat-4', 'Marc', 'LEFEBVRE', NULL, NULL, 'male', '1990-01-01', '06 55 44 33 22', NULL, 'marc.lefebvre@email.fr', '8 Rue des Lilas', 'Lyon', '69003', 'France', 'MGEN', true, '2021-06-20T10:00:00Z', '2026-02-20T09:15:00Z'),
  ('pat-5', 'Camille', 'BEAUMONT', NULL, NULL, 'female', '1985-04-15', '06 77 88 99 00', NULL, 'camille.beaumont@email.fr', '42 Boulevard Voltaire', 'Paris', '75011', 'France', 'Harmonie Mutuelle', true, '2022-09-01T08:45:00Z', '2026-03-01T11:00:00Z'),
  ('pat-6', 'Luca', 'GAVIRAGHI', NULL, NULL, 'male', '1992-08-11', '06 11 22 33 44', NULL, 'luca.gaviraghi@email.fr', '5 Via Roma', 'Nice', '06000', 'Italie', NULL, true, '2023-05-10T15:20:00Z', '2026-02-15T13:45:00Z')
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone;

-- =====================================================================
-- 8. PATIENT ALERTS
-- =====================================================================
INSERT INTO public.patient_alerts (id, patient_id, type, message, severity, is_active, created_at) VALUES
  ('alert-1', 'pat-2', 'vip', 'VIP - lui doubler les RDV si complet', 'info', true, '2020-02-10T11:20:00Z'),
  ('alert-2', 'pat-1', 'allergy', 'Allergie penicilline confirmee', 'high', true, '2022-05-20T09:00:00Z'),
  ('alert-3', 'pat-3', 'medical', 'Asthme - toujours verifier ventoline', 'medium', true, '2023-03-15T14:30:00Z')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 9. REGULAR APPOINTMENTS (current week - dynamic dates)
-- =====================================================================
DO $$
DECLARE
  ws DATE := date_trunc('week', CURRENT_DATE)::DATE;
BEGIN
  -- Delete old generated appointments for this week to avoid duplicates
  DELETE FROM public.appointments
    WHERE start_time >= ws
    AND start_time < ws + INTERVAL '7 days'
    AND id NOT LIKE 'apt-tc-%';

  -- Monday
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit, created_at, created_by) VALUES
    (gen_random_uuid(), 'pat-1', 'pract-1', 'motif-1', ws + INTERVAL '9 hours', ws + INTERVAL '9 hours 20 minutes', 20, 'completed', 'consultation', false, ws - INTERVAL '7 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    (gen_random_uuid(), 'pat-2', 'pract-1', 'motif-3', ws + INTERVAL '9 hours 30 minutes', ws + INTERVAL '9 hours 45 minutes', 15, 'completed', 'followup', false, ws - INTERVAL '6 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    (gen_random_uuid(), 'pat-3', 'pract-1', 'motif-1', ws + INTERVAL '10 hours', ws + INTERVAL '10 hours 20 minutes', 20, 'completed', 'consultation', false, ws - INTERVAL '5 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    (gen_random_uuid(), 'pat-4', 'pract-1', 'motif-2', ws + INTERVAL '10 hours 30 minutes', ws + INTERVAL '11 hours', 30, 'in-progress', 'consultation', true, ws - INTERVAL '4 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    (gen_random_uuid(), 'pat-5', 'pract-1', 'motif-1', ws + INTERVAL '11 hours', ws + INTERVAL '11 hours 20 minutes', 20, 'scheduled', 'consultation', false, ws - INTERVAL '3 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    (gen_random_uuid(), 'pat-6', 'pract-1', 'motif-4', ws + INTERVAL '14 hours', ws + INTERVAL '14 hours 30 minutes', 30, 'scheduled', 'emergency', false, ws - INTERVAL '1 day', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    (gen_random_uuid(), 'pat-3', 'pract-2', 'motif-5', ws + INTERVAL '9 hours', ws + INTERVAL '9 hours 45 minutes', 45, 'completed', 'checkup', false, ws - INTERVAL '7 days', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e');

  -- Tuesday
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit, created_at, created_by) VALUES
    (gen_random_uuid(), 'pat-5', 'pract-1', 'motif-1', ws + INTERVAL '1 day 9 hours', ws + INTERVAL '1 day 9 hours 20 minutes', 20, 'scheduled', 'consultation', false, ws - INTERVAL '5 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    (gen_random_uuid(), 'pat-6', 'pract-1', 'motif-2', ws + INTERVAL '1 day 9 hours 30 minutes', ws + INTERVAL '1 day 10 hours', 30, 'scheduled', 'consultation', true, ws - INTERVAL '3 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    (gen_random_uuid(), 'pat-1', 'pract-1', 'motif-6', ws + INTERVAL '1 day 10 hours 30 minutes', ws + INTERVAL '1 day 11 hours', 30, 'scheduled', 'procedure', false, ws - INTERVAL '2 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    (gen_random_uuid(), 'pat-5', 'pract-2', 'motif-1', ws + INTERVAL '1 day 9 hours', ws + INTERVAL '1 day 9 hours 20 minutes', 20, 'scheduled', 'consultation', false, ws - INTERVAL '4 days', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e');

  -- Wednesday
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit, created_at, created_by) VALUES
    (gen_random_uuid(), 'pat-1', 'pract-1', 'motif-1', ws + INTERVAL '2 days 9 hours', ws + INTERVAL '2 days 9 hours 20 minutes', 20, 'scheduled', 'consultation', false, ws - INTERVAL '6 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    (gen_random_uuid(), 'pat-2', 'pract-1', 'motif-4', ws + INTERVAL '2 days 9 hours 30 minutes', ws + INTERVAL '2 days 10 hours', 30, 'scheduled', 'emergency', false, ws - INTERVAL '1 day', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    (gen_random_uuid(), 'pat-1', 'pract-3', 'motif-1', ws + INTERVAL '2 days 9 hours 30 minutes', ws + INTERVAL '2 days 9 hours 50 minutes', 20, 'scheduled', 'consultation', false, ws - INTERVAL '5 days', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f'),
    (gen_random_uuid(), 'pat-2', 'pract-3', 'motif-6', ws + INTERVAL '2 days 10 hours', ws + INTERVAL '2 days 10 hours 30 minutes', 30, 'scheduled', 'procedure', false, ws - INTERVAL '3 days', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f');

  -- Thursday
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit, created_at, created_by) VALUES
    (gen_random_uuid(), 'pat-3', 'pract-1', 'motif-1', ws + INTERVAL '3 days 9 hours', ws + INTERVAL '3 days 9 hours 20 minutes', 20, 'scheduled', 'consultation', false, ws - INTERVAL '4 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    (gen_random_uuid(), 'pat-4', 'pract-1', 'motif-5', ws + INTERVAL '3 days 9 hours 45 minutes', ws + INTERVAL '3 days 10 hours 30 minutes', 45, 'scheduled', 'checkup', false, ws - INTERVAL '6 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    (gen_random_uuid(), 'pat-4', 'pract-2', 'motif-1', ws + INTERVAL '3 days 9 hours', ws + INTERVAL '3 days 9 hours 20 minutes', 20, 'scheduled', 'consultation', false, ws - INTERVAL '5 days', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e');

  -- Friday
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit, created_at, created_by) VALUES
    (gen_random_uuid(), 'pat-6', 'pract-1', 'motif-1', ws + INTERVAL '4 days 9 hours', ws + INTERVAL '4 days 9 hours 20 minutes', 20, 'scheduled', 'consultation', false, ws - INTERVAL '3 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    (gen_random_uuid(), 'pat-1', 'pract-1', 'motif-3', ws + INTERVAL '4 days 9 hours 30 minutes', ws + INTERVAL '4 days 9 hours 45 minutes', 15, 'scheduled', 'followup', false, ws - INTERVAL '5 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    (gen_random_uuid(), 'pat-2', 'pract-1', 'motif-1', ws + INTERVAL '4 days 10 hours', ws + INTERVAL '4 days 10 hours 20 minutes', 20, 'scheduled', 'consultation', false, ws - INTERVAL '2 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    (gen_random_uuid(), 'pat-6', 'pract-1', 'motif-5', ws + INTERVAL '4 days 14 hours 30 minutes', ws + INTERVAL '4 days 15 hours 15 minutes', 45, 'scheduled', 'checkup', false, ws - INTERVAL '6 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d');
END $$;

-- =====================================================================
-- 10. TELECONSULTATION APPOINTMENTS (fixed IDs for linking)
-- =====================================================================
DO $$
DECLARE
  today TIMESTAMP := CURRENT_DATE + INTERVAL '0 hours';
BEGIN
  -- Delete any previous teleconsultation appointments
  DELETE FROM public.appointments WHERE id LIKE 'apt-tc-%';

  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit, created_at, created_by) VALUES
    -- TC-1: In progress - today 09:30
    ('apt-tc-1', 'pat-1', 'pract-1', 'motif-3', today + INTERVAL '9 hours 30 minutes', today + INTERVAL '9 hours 50 minutes', 20, 'in-progress', 'teleconsultation', false, today - INTERVAL '5 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    -- TC-2: Waiting - today 10:00
    ('apt-tc-2', 'pat-2', 'pract-1', 'motif-1', today + INTERVAL '10 hours', today + INTERVAL '10 hours 20 minutes', 20, 'scheduled', 'teleconsultation', false, today - INTERVAL '4 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    -- TC-3: Ready - today 10:30
    ('apt-tc-3', 'pat-5', 'pract-1', 'motif-3', today + INTERVAL '10 hours 30 minutes', today + INTERVAL '10 hours 45 minutes', 15, 'scheduled', 'teleconsultation', false, today - INTERVAL '3 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    -- TC-4: Scheduled - today 14:00
    ('apt-tc-4', 'pat-3', 'pract-1', 'motif-2', today + INTERVAL '14 hours', today + INTERVAL '14 hours 30 minutes', 30, 'scheduled', 'teleconsultation', true, today - INTERVAL '7 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    -- TC-5: Scheduled - today 16:30
    ('apt-tc-5', 'pat-4', 'pract-1', 'motif-3', today + INTERVAL '16 hours 30 minutes', today + INTERVAL '16 hours 50 minutes', 20, 'scheduled', 'teleconsultation', false, today - INTERVAL '6 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    -- TC-6: Scheduled - tomorrow 11:00
    ('apt-tc-6', 'pat-1', 'pract-1', 'motif-3', today + INTERVAL '1 day 11 hours', today + INTERVAL '1 day 11 hours 15 minutes', 15, 'scheduled', 'teleconsultation', false, today - INTERVAL '4 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    -- TC-7: Scheduled - in 3 days 09:00
    ('apt-tc-7', 'pat-2', 'pract-1', 'motif-5', today + INTERVAL '3 days 9 hours', today + INTERVAL '3 days 9 hours 30 minutes', 30, 'scheduled', 'teleconsultation', false, today - INTERVAL '5 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    -- TC-8: Completed - yesterday 15:00
    ('apt-tc-8', 'pat-3', 'pract-1', 'motif-1', today - INTERVAL '1 day' + INTERVAL '15 hours', today - INTERVAL '1 day' + INTERVAL '15 hours 22 minutes', 22, 'completed', 'teleconsultation', false, today - INTERVAL '8 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    -- TC-9: Completed - 3 days ago 10:30
    ('apt-tc-9', 'pat-5', 'pract-1', 'motif-3', today - INTERVAL '3 days' + INTERVAL '10 hours 30 minutes', today - INTERVAL '3 days' + INTERVAL '10 hours 47 minutes', 17, 'completed', 'teleconsultation', false, today - INTERVAL '10 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
    -- TC-10: Completed - 7 days ago 14:00
    ('apt-tc-10', 'pat-4', 'pract-1', 'motif-2', today - INTERVAL '7 days' + INTERVAL '14 hours', today - INTERVAL '7 days' + INTERVAL '14 hours 30 minutes', 30, 'completed', 'teleconsultation', false, today - INTERVAL '14 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),
    -- TC-11: Cancelled - 5 days ago 11:00
    ('apt-tc-11', 'pat-1', 'pract-1', 'motif-3', today - INTERVAL '5 days' + INTERVAL '11 hours', today - INTERVAL '5 days' + INTERVAL '11 hours 15 minutes', 15, 'cancelled', 'teleconsultation', false, today - INTERVAL '12 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80');
END $$;

-- =====================================================================
-- 11. CONSULTATIONS (for completed teleconsultations)
-- =====================================================================
DO $$
DECLARE
  today TIMESTAMP := CURRENT_DATE + INTERVAL '0 hours';
BEGIN
  INSERT INTO public.consultations (id, patient_id, practitioner_id, appointment_id, status, start_time, end_time, chief_complaint, history_of_present_illness, diagnosis, physical_examination, treatment_plan, follow_up_instructions, notes, created_at, created_by) VALUES
    -- Consultation for TC-8 (completed yesterday)
    ('consult-8', 'pat-3', 'pract-1', 'apt-tc-8', 'completed',
     today - INTERVAL '1 day' + INTERVAL '15 hours 2 minutes',
     today - INTERVAL '1 day' + INTERVAL '15 hours 24 minutes',
     'Eruption cutanee bras gauche',
     'Plaques rouges prurigineuses apparues il y a 5 jours. Pas de fievre. Pas de contact avec irritant connu.',
     '{"text":"Dermatite de contact probable","code":"L25.9"}'::jsonb,
     '{"text":"Plaques erythemateuses bien delimitees sur face anterieure bras gauche. Pas de vesicules. Pas d''adenopathie axillaire."}'::jsonb,
     'Dermocorticoide classe II - application 1x/j pendant 7 jours. Emollient quotidien.',
     'Controle dans 10 jours si pas d''amelioration. Eviter contact avec produits menagers sans gants.',
     'Teleconsultation - bonne qualite video. Patient cooperant.',
     today - INTERVAL '1 day' + INTERVAL '15 hours 2 minutes',
     'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

    -- Consultation for TC-9 (completed 3 days ago)
    ('consult-9', 'pat-5', 'pract-1', 'apt-tc-9', 'completed',
     today - INTERVAL '3 days' + INTERVAL '10 hours 31 minutes',
     today - INTERVAL '3 days' + INTERVAL '10 hours 48 minutes',
     'Suivi anxiete generalisee',
     'Crises d''angoisse nocturnes frequentes depuis 1 mois. Troubles du sommeil associes. Traitement actuel: Sertraline 50mg/j.',
     '{"text":"Trouble anxieux generalise - aggravation","code":"F41.1"}'::jsonb,
     '{"text":"Patiente tendue, legere tachycardie (92 bpm rapportee). Pas de signes somatiques inquietants."}'::jsonb,
     'Augmentation Sertraline a 75mg/j. Ajout Hydroxyzine 25mg au coucher si besoin. Orientation vers psychologue TCC.',
     'Consultation de suivi dans 3 semaines. Appeler si aggravation des crises.',
     'Teleconsultation - patiente a l''aise avec le format video.',
     today - INTERVAL '3 days' + INTERVAL '10 hours 31 minutes',
     'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

    -- Consultation for TC-10 (completed 7 days ago)
    ('consult-10', 'pat-4', 'pract-1', 'apt-tc-10', 'completed',
     today - INTERVAL '7 days' + INTERVAL '14 hours 5 minutes',
     today - INTERVAL '7 days' + INTERVAL '14 hours 35 minutes',
     'Consultation pre-operatoire genou droit',
     'Preparation arthroscopie genou droit programmee dans 10 jours. Bilan pre-operatoire complet realise.',
     '{"text":"Gonarthrose interne genou droit - bilan pre-op","code":"M17.1"}'::jsonb,
     '{"text":"Genou droit: epanchement modere. Flexion limitee a 110 degres. Bilan sanguin normal. ECG normal."}'::jsonb,
     'Arret AINS 7 jours avant intervention. Bilan pre-anesthesique ok. Jeune 6h avant bloc.',
     'Intervention prevue le 03/03. Rappeler consignes pre-op 48h avant.',
     'Teleconsultation pre-operatoire - toutes les consignes ont ete transmises et comprises.',
     today - INTERVAL '7 days' + INTERVAL '14 hours 5 minutes',
     'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- =====================================================================
-- 12. TELECONSULTATIONS (11 entries linked to real appointments)
-- =====================================================================
DO $$
DECLARE
  today TIMESTAMP := CURRENT_DATE + INTERVAL '0 hours';
BEGIN
  INSERT INTO public.teleconsultations (
    id, appointment_id, consultation_id, patient_id, practitioner_id,
    room_token, patient_link, practitioner_link, room_expires_at,
    status, scheduled_start, actual_start, actual_end, duration_minutes,
    consultation_reason, chief_complaint, technical_check_done,
    settings, metadata, created_at, created_by
  ) VALUES
    -- TC-1: In progress
    ('tc-1', 'apt-tc-1', NULL, 'pat-1', 'pract-1',
     'tok-abc123def456',
     'https://app.careconnect.fr/visio/waiting/tc-1?token=pat-tok-1&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-1?token=pract-tok-1&type=practitioner',
     today + INTERVAL '1 day',
     'in_progress', today + INTERVAL '9 hours 30 minutes',
     today + INTERVAL '9 hours 32 minutes', NULL, 20,
     'Suivi douleurs lombaires chroniques',
     'Douleurs persistantes depuis 3 semaines malgre anti-inflammatoires',
     true,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '5 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),

    -- TC-2: Waiting
    ('tc-2', 'apt-tc-2', NULL, 'pat-2', 'pract-1',
     'tok-ghi789jkl012',
     'https://app.careconnect.fr/visio/waiting/tc-2?token=pat-tok-2&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-2?token=pract-tok-2&type=practitioner',
     today + INTERVAL '1 day',
     'waiting', today + INTERVAL '10 hours',
     NULL, NULL, 20,
     'Controle tension arterielle',
     'Malaises recurrents, vertiges au lever',
     true,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '4 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),

    -- TC-3: Ready
    ('tc-3', 'apt-tc-3', NULL, 'pat-5', 'pract-1',
     'tok-mno345pqr678',
     'https://app.careconnect.fr/visio/waiting/tc-3?token=pat-tok-3&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-3?token=pract-tok-3&type=practitioner',
     today + INTERVAL '1 day',
     'ready', today + INTERVAL '10 hours 30 minutes',
     NULL, NULL, 15,
     'Renouvellement ordonnance contraception',
     NULL, true,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '3 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),

    -- TC-4: Scheduled today 14:00
    ('tc-4', 'apt-tc-4', NULL, 'pat-3', 'pract-1',
     'tok-stu901vwx234',
     'https://app.careconnect.fr/visio/waiting/tc-4?token=pat-tok-4&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-4?token=pract-tok-4&type=practitioner',
     today + INTERVAL '1 day',
     'scheduled', today + INTERVAL '14 hours',
     NULL, NULL, 30,
     'Premiere consultation - bilan general',
     'Fatigue chronique et troubles du sommeil depuis 2 mois',
     false,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '7 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),

    -- TC-5: Scheduled today 16:30
    ('tc-5', 'apt-tc-5', NULL, 'pat-4', 'pract-1',
     'tok-yza567bcd890',
     'https://app.careconnect.fr/visio/waiting/tc-5?token=pat-tok-5&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-5?token=pract-tok-5&type=practitioner',
     today + INTERVAL '1 day',
     'scheduled', today + INTERVAL '16 hours 30 minutes',
     NULL, NULL, 20,
     'Suivi post-operatoire genou droit',
     NULL, false,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '6 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

    -- TC-6: Scheduled tomorrow 11:00
    ('tc-6', 'apt-tc-6', NULL, 'pat-1', 'pract-1',
     'tok-efg123hij456',
     'https://app.careconnect.fr/visio/waiting/tc-6?token=pat-tok-6&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-6?token=pract-tok-6&type=practitioner',
     today + INTERVAL '2 days',
     'scheduled', today + INTERVAL '1 day 11 hours',
     NULL, NULL, 15,
     'Resultats analyses sanguines',
     NULL, false,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '4 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

    -- TC-7: Scheduled in 3 days
    ('tc-7', 'apt-tc-7', NULL, 'pat-2', 'pract-1',
     'tok-klm789nop012',
     'https://app.careconnect.fr/visio/waiting/tc-7?token=pat-tok-7&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-7?token=pract-tok-7&type=practitioner',
     today + INTERVAL '4 days',
     'scheduled', today + INTERVAL '3 days 9 hours',
     NULL, NULL, 30,
     'Bilan cardiologique annuel',
     NULL, false,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '5 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),

    -- TC-8: Completed yesterday
    ('tc-8', 'apt-tc-8', 'consult-8', 'pat-3', 'pract-1',
     'tok-qrs345tuv678',
     'https://app.careconnect.fr/visio/waiting/tc-8?token=pat-tok-8&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-8?token=pract-tok-8&type=practitioner',
     today - INTERVAL '12 hours',
     'completed', today - INTERVAL '1 day' + INTERVAL '15 hours',
     today - INTERVAL '1 day' + INTERVAL '15 hours 2 minutes',
     today - INTERVAL '1 day' + INTERVAL '15 hours 24 minutes',
     22,
     'Eruption cutanee bras gauche',
     'Plaques rouges prurigineuses apparues il y a 5 jours',
     true,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '8 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

    -- TC-9: Completed 3 days ago
    ('tc-9', 'apt-tc-9', 'consult-9', 'pat-5', 'pract-1',
     'tok-wxy901zab234',
     'https://app.careconnect.fr/visio/waiting/tc-9?token=pat-tok-9&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-9?token=pract-tok-9&type=practitioner',
     today - INTERVAL '2 days 12 hours',
     'completed', today - INTERVAL '3 days' + INTERVAL '10 hours 30 minutes',
     today - INTERVAL '3 days' + INTERVAL '10 hours 31 minutes',
     today - INTERVAL '3 days' + INTERVAL '10 hours 48 minutes',
     17,
     'Suivi anxiete generalisee',
     'Crises d''angoisse nocturnes frequentes',
     true,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '10 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),

    -- TC-10: Completed 7 days ago
    ('tc-10', 'apt-tc-10', 'consult-10', 'pat-4', 'pract-1',
     'tok-cde567fgh890',
     'https://app.careconnect.fr/visio/waiting/tc-10?token=pat-tok-10&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-10?token=pract-tok-10&type=practitioner',
     today - INTERVAL '6 days 12 hours',
     'completed', today - INTERVAL '7 days' + INTERVAL '14 hours',
     today - INTERVAL '7 days' + INTERVAL '14 hours 5 minutes',
     today - INTERVAL '7 days' + INTERVAL '14 hours 35 minutes',
     30,
     'Consultation pre-operatoire',
     'Preparation arthroscopie genou droit',
     true,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '14 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'),

    -- TC-11: Cancelled
    ('tc-11', 'apt-tc-11', NULL, 'pat-1', 'pract-1',
     'tok-ijk123lmn456',
     'https://app.careconnect.fr/visio/waiting/tc-11?token=pat-tok-11&type=patient',
     'https://app.careconnect.fr/visio/waiting/tc-11?token=pract-tok-11&type=practitioner',
     today - INTERVAL '4 days',
     'cancelled', today - INTERVAL '5 days' + INTERVAL '11 hours',
     NULL, NULL, NULL,
     'Suivi traitement',
     NULL, false,
     '{"video_enabled":true,"audio_enabled":true,"screen_share_enabled":true,"recording_enabled":false,"quality":"auto"}'::jsonb,
     '{}'::jsonb,
     today - INTERVAL '12 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80')
  ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    consultation_id = EXCLUDED.consultation_id,
    actual_start = EXCLUDED.actual_start,
    actual_end = EXCLUDED.actual_end;
END $$;

-- =====================================================================
-- 13. TELECONSULTATION NOTES (clinical notes during sessions)
-- =====================================================================
DO $$
DECLARE
  today TIMESTAMP := CURRENT_DATE + INTERVAL '0 hours';
BEGIN
  INSERT INTO public.teleconsultation_notes (id, teleconsultation_id, practitioner_id, content, note_type, tags, icd10_codes, is_private, created_at, updated_at) VALUES
    -- TC-1 notes (in progress - 3 notes)
    ('note-tc1-1', 'tc-1', 'pract-1',
     'Patient se plaint de douleurs thoraciques intermittentes depuis 3 jours. Pas de dyspnee associee. Antecedents familiaux de cardiopathie (pere). ECG de controle a envisager.',
     'clinical_observation', ARRAY['douleur-thoracique','cardiologie','antecedents'], ARRAY['R07.9'], true,
     today + INTERVAL '9 hours 35 minutes', today + INTERVAL '9 hours 35 minutes'),

    ('note-tc1-2', 'tc-1', 'pract-1',
     'Tension arterielle rapportee par le patient : 14/9. Recommande auto-mesure tensionnelle sur 3 jours et retour par messagerie.',
     'vital_signs', ARRAY['tension-arterielle','auto-mesure'], ARRAY[]::text[], false,
     today + INTERVAL '9 hours 42 minutes', today + INTERVAL '9 hours 42 minutes'),

    ('note-tc1-3', 'tc-1', 'pract-1',
     'Prescription : Paracetamol 1g x3/j si douleur. Controle en cabinet dans 1 semaine si persistance des symptomes.',
     'prescription_note', ARRAY['prescription','suivi'], ARRAY[]::text[], false,
     today + INTERVAL '9 hours 47 minutes', today + INTERVAL '9 hours 47 minutes'),

    -- TC-2 notes (waiting - 1 pre-consultation note)
    ('note-tc2-1', 'tc-2', 'pract-1',
     'Patient en salle d''attente virtuelle. Motif : renouvellement traitement hypertension. Derniere consultation il y a 3 mois.',
     'pre_consultation', ARRAY['renouvellement','hypertension'], ARRAY['I10'], true,
     today + INTERVAL '9 hours 55 minutes', today + INTERVAL '9 hours 55 minutes'),

    -- TC-8 notes (completed yesterday - 2 notes)
    ('note-tc8-1', 'tc-8', 'pract-1',
     'Consultation de suivi post-operatoire. Cicatrisation satisfaisante. Patient rapporte diminution progressive de la douleur. Mobilite retrouvee a 80%.',
     'clinical_observation', ARRAY['suivi-post-op','cicatrisation','mobilite'], ARRAY['Z09.9'], false,
     today - INTERVAL '1 day' + INTERVAL '15 hours 5 minutes', today - INTERVAL '1 day' + INTERVAL '15 hours 5 minutes'),

    ('note-tc8-2', 'tc-8', 'pract-1',
     'Arret de travail prolonge de 2 semaines. Kinesitherapie prescrite : 10 seances. Prochain controle en presentiel dans 15 jours.',
     'care_plan', ARRAY['arret-travail','kinesitherapie','suivi'], ARRAY[]::text[], false,
     today - INTERVAL '1 day' + INTERVAL '15 hours 15 minutes', today - INTERVAL '1 day' + INTERVAL '15 hours 15 minutes'),

    -- TC-9 notes (completed 3 days ago)
    ('note-tc9-1', 'tc-9', 'pract-1',
     'Dermatose prurigineuse diffuse. Photos transmises par le patient avant la consultation. Aspect compatible avec eczema atopique. Traitement dermocorticoide prescrit.',
     'clinical_observation', ARRAY['dermatologie','eczema','photos'], ARRAY['L20.9'], false,
     today - INTERVAL '3 days' + INTERVAL '10 hours 35 minutes', today - INTERVAL '3 days' + INTERVAL '10 hours 35 minutes'),

    -- TC-10 notes (completed 7 days ago)
    ('note-tc10-1', 'tc-10', 'pract-1',
     'Bilan annuel. Resultats biologiques dans les normes. HbA1c 6.2% stable. Poursuite du traitement actuel. Prochain bilan dans 6 mois.',
     'clinical_observation', ARRAY['bilan-annuel','diabete','biologie'], ARRAY['E11.9','Z00.0'], false,
     today - INTERVAL '7 days' + INTERVAL '14 hours 15 minutes', today - INTERVAL '7 days' + INTERVAL '14 hours 15 minutes')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- =====================================================================
-- 14. DOCUMENTS (referenced by teleconsultation_documents)
-- =====================================================================
INSERT INTO public.documents (id, patient_id, name, type, category, file_path, file_size, mime_type, created_at) VALUES
  ('doc-ecg-1', 'pat-1', 'ECG de reference - 15/01/2026', 'medical', 'examination', '/documents/ecg-reference-2026.pdf', 245000, 'application/pdf', '2026-01-15T10:00:00Z'),
  ('doc-ordo-1', 'pat-1', 'Ordonnance - Paracetamol 1g', 'prescription', 'prescription', '/documents/ordonnance-paracetamol.pdf', 52000, 'application/pdf', CURRENT_DATE::text || 'T09:45:00Z'),
  ('doc-cr-1', 'pat-3', 'Compte-rendu post-operatoire', 'medical', 'report', '/documents/cr-post-op.pdf', 180000, 'application/pdf', (CURRENT_DATE - INTERVAL '1 day')::text || 'T15:20:00Z'),
  ('doc-arret-1', 'pat-3', 'Certificat arret de travail - 2 semaines', 'administrative', 'certificate', '/documents/arret-travail.pdf', 68000, 'application/pdf', (CURRENT_DATE - INTERVAL '1 day')::text || 'T15:15:00Z'),
  ('doc-kine-1', 'pat-3', 'Prescription kinesitherapie - 10 seances', 'prescription', 'prescription', '/documents/prescription-kine.pdf', 45000, 'application/pdf', (CURRENT_DATE - INTERVAL '1 day')::text || 'T15:18:00Z'),
  ('doc-photo-1', 'pat-5', 'Photos lesions cutanees (patient)', 'medical', 'image', '/documents/photos-dermato.jpg', 1250000, 'image/jpeg', (CURRENT_DATE - INTERVAL '3 days')::text || 'T10:00:00Z'),
  ('doc-ordo-derm-1', 'pat-5', 'Ordonnance dermocorticoide', 'prescription', 'prescription', '/documents/ordonnance-dermato.pdf', 55000, 'application/pdf', (CURRENT_DATE - INTERVAL '3 days')::text || 'T10:50:00Z')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 15. TELECONSULTATION DOCUMENTS (shared during sessions)
-- =====================================================================
DO $$
DECLARE
  today TIMESTAMP := CURRENT_DATE + INTERVAL '0 hours';
BEGIN
  INSERT INTO public.teleconsultation_documents (id, teleconsultation_id, document_id, shared_by, shared_by_id, shared_at, visible_to_patient, visible_to_practitioner, share_type, viewed_by_patient, viewed_by_practitioner, status, created_at) VALUES
    -- TC-1 documents (in progress)
    ('doc-share-tc1-1', 'tc-1', 'doc-ecg-1', 'practitioner', 'pract-1',
     today + INTERVAL '9 hours 40 minutes', true, true, 'during_consultation', true, true, 'viewed',
     today + INTERVAL '9 hours 40 minutes'),
    ('doc-share-tc1-2', 'tc-1', 'doc-ordo-1', 'practitioner', 'pract-1',
     today + INTERVAL '9 hours 45 minutes', true, true, 'during_consultation', false, true, 'shared',
     today + INTERVAL '9 hours 45 minutes'),

    -- TC-8 documents (completed yesterday)
    ('doc-share-tc8-1', 'tc-8', 'doc-cr-1', 'practitioner', 'pract-1',
     today - INTERVAL '1 day' + INTERVAL '15 hours 20 minutes', true, true, 'post_consultation', true, true, 'viewed',
     today - INTERVAL '1 day' + INTERVAL '15 hours 20 minutes'),
    ('doc-share-tc8-2', 'tc-8', 'doc-arret-1', 'practitioner', 'pract-1',
     today - INTERVAL '1 day' + INTERVAL '15 hours 15 minutes', true, true, 'post_consultation', true, true, 'viewed',
     today - INTERVAL '1 day' + INTERVAL '15 hours 15 minutes'),
    ('doc-share-tc8-3', 'tc-8', 'doc-kine-1', 'practitioner', 'pract-1',
     today - INTERVAL '1 day' + INTERVAL '15 hours 18 minutes', true, true, 'post_consultation', false, true, 'shared',
     today - INTERVAL '1 day' + INTERVAL '15 hours 18 minutes'),

    -- TC-9 documents (completed 3 days ago)
    ('doc-share-tc9-1', 'tc-9', 'doc-photo-1', 'patient', 'pat-5',
     today - INTERVAL '3 days' + INTERVAL '10 hours', true, true, 'pre_consultation', true, true, 'viewed',
     today - INTERVAL '3 days' + INTERVAL '10 hours'),
    ('doc-share-tc9-2', 'tc-9', 'doc-ordo-derm-1', 'practitioner', 'pract-1',
     today - INTERVAL '3 days' + INTERVAL '10 hours 50 minutes', true, true, 'during_consultation', true, true, 'viewed',
     today - INTERVAL '3 days' + INTERVAL '10 hours 50 minutes')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- =====================================================================
-- 16. CLINICAL NOTES (general notes, not teleconsultation-specific)
-- =====================================================================
INSERT INTO public.notes (id, content, patient_id, author_id, author_name, is_urgent, send_to_secretariat, created_at) VALUES
  ('note-1', 'N''a pas recupere son ordonnance pour le kine, passe mercredi pour la recuperer.', 'pat-1', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Dr Martin', false, true, '2026-02-07T14:30:00Z'),
  ('note-2', 'Resultats de labo a verifier avant prochaine consultation. Bilan hepatique legerement perturbe.', 'pat-2', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Dr Dubois', true, false, '2026-02-20T10:15:00Z'),
  ('note-3', 'Patient demande attestation pour son employeur. A preparer pour sa prochaine visite.', 'pat-4', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80', 'Secretariat', false, true, '2026-02-25T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 17. TASKS
-- =====================================================================
INSERT INTO public.tasks (id, title, description, type, priority, status, assignee_id, assignee_name, patient_id, due_date, completed_at, created_at, created_by) VALUES
  ('task-1', 'Appeler patient LEFEBVRE Marc', 'Rappeler pour confirmer le RDV de suivi post-operatoire', 'call', 'high', 'todo', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80', 'Secretariat', 'pat-4', CURRENT_DATE + INTERVAL '1 day', NULL, NOW() - INTERVAL '2 days', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
  ('task-2', 'Preparer dossier CHICHEPORTICHE', 'Imprimer les derniers resultats pour la consultation de mercredi', 'preparation', 'medium', 'in-progress', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80', 'Secretariat', 'pat-2', CURRENT_DATE, NULL, NOW() - INTERVAL '1 day', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80'),
  ('task-3', 'Demander resultats examens PENNANEACH', 'Recuperer les resultats du bilan sanguin aupres du laboratoire', 'document', 'low', 'done', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Dr Martin', 'pat-1', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 days', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d')
ON CONFLICT (id) DO NOTHING;

-- =====================================================================
-- 18. RLS POLICIES - Allow all authenticated users (development)
-- =====================================================================

-- Patients: ensure authenticated users can read
DO $$
BEGIN
  -- Drop existing restrictive policies and create permissive ones
  DROP POLICY IF EXISTS "patients_select_authenticated" ON public.patients;
  DROP POLICY IF EXISTS "patients_insert_authenticated" ON public.patients;
  DROP POLICY IF EXISTS "patients_update_authenticated" ON public.patients;

  CREATE POLICY "patients_select_all_authenticated"
    ON public.patients FOR SELECT TO authenticated USING (true);
  CREATE POLICY "patients_insert_all_authenticated"
    ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
  CREATE POLICY "patients_update_all_authenticated"
    ON public.patients FOR UPDATE TO authenticated USING (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Patient policies: some already exist, skipping';
END $$;

-- Appointments
DO $$
BEGIN
  DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
  DROP POLICY IF EXISTS "appointments_delete" ON public.appointments;

  CREATE POLICY "appointments_all_authenticated"
    ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Appointment policies: some already exist, skipping';
END $$;

-- Consultations
DO $$
BEGIN
  DROP POLICY IF EXISTS "consultations_select" ON public.consultations;
  DROP POLICY IF EXISTS "consultations_insert" ON public.consultations;
  DROP POLICY IF EXISTS "consultations_update" ON public.consultations;

  CREATE POLICY "consultations_all_authenticated"
    ON public.consultations FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Consultation policies: some already exist, skipping';
END $$;

-- Practitioners
DO $$
BEGIN
  DROP POLICY IF EXISTS "practitioners_select" ON public.practitioners;
  DROP POLICY IF EXISTS "practitioners_select_authenticated" ON public.practitioners;

  CREATE POLICY "practitioners_all_authenticated"
    ON public.practitioners FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Practitioner policies: some already exist, skipping';
END $$;

-- Patient alerts
DO $$
BEGIN
  CREATE POLICY "patient_alerts_all_authenticated"
    ON public.patient_alerts FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Patient alert policies: already exist, skipping';
END $$;

-- Notes
DO $$
BEGIN
  CREATE POLICY "notes_all_authenticated"
    ON public.notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Notes policies: already exist, skipping';
END $$;

-- Tasks
DO $$
BEGIN
  CREATE POLICY "tasks_all_authenticated"
    ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Tasks policies: already exist, skipping';
END $$;

-- Documents
DO $$
BEGIN
  CREATE POLICY "documents_all_authenticated"
    ON public.documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Documents policies: already exist, skipping';
END $$;

-- Appointment motifs
DO $$
BEGIN
  CREATE POLICY "appointment_motifs_all_authenticated"
    ON public.appointment_motifs FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Motifs policies: already exist, skipping';
END $$;

-- Sites
DO $$
BEGIN
  CREATE POLICY "sites_all_authenticated"
    ON public.sites FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Sites policies: already exist, skipping';
END $$;

-- Rooms
DO $$
BEGIN
  CREATE POLICY "rooms_all_authenticated"
    ON public.rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Rooms policies: already exist, skipping';
END $$;

-- User roles
DO $$
BEGIN
  CREATE POLICY "user_roles_all_authenticated"
    ON public.user_roles FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'User roles policies: already exist, skipping';
END $$;

-- Vital signs
DO $$
BEGIN
  CREATE POLICY "vital_signs_all_authenticated"
    ON public.vital_signs FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Vital signs policies: already exist, skipping';
END $$;

-- Patient allergies
DO $$
BEGIN
  CREATE POLICY "patient_allergies_all_authenticated"
    ON public.patient_allergies FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Patient allergies policies: already exist, skipping';
END $$;

-- Patient antecedents
DO $$
BEGIN
  CREATE POLICY "patient_antecedents_all_authenticated"
    ON public.patient_antecedents FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Patient antecedents policies: already exist, skipping';
END $$;

-- Patient conditions
DO $$
BEGIN
  CREATE POLICY "patient_conditions_all_authenticated"
    ON public.patient_conditions FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Patient conditions policies: already exist, skipping';
END $$;

-- Invoices
DO $$
BEGIN
  CREATE POLICY "invoices_all_authenticated"
    ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Invoices policies: already exist, skipping';
END $$;

-- Payments
DO $$
BEGIN
  CREATE POLICY "payments_all_authenticated"
    ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Payments policies: already exist, skipping';
END $$;

-- Conversations
DO $$
BEGIN
  CREATE POLICY "conversations_all_authenticated"
    ON public.conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Conversations policies: already exist, skipping';
END $$;

-- Messages
DO $$
BEGIN
  CREATE POLICY "messages_all_authenticated"
    ON public.messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Messages policies: already exist, skipping';
END $$;

-- Patient memos
DO $$
BEGIN
  CREATE POLICY "patient_memos_all_authenticated"
    ON public.patient_memos FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Patient memos policies: already exist, skipping';
END $$;

-- Lab results
DO $$
BEGIN
  CREATE POLICY "lab_results_all_authenticated"
    ON public.lab_results FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Lab results policies: already exist, skipping';
END $$;

-- Vaccinations
DO $$
BEGIN
  CREATE POLICY "vaccinations_all_authenticated"
    ON public.vaccinations FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Vaccinations policies: already exist, skipping';
END $$;

-- Practitioner openings
DO $$
BEGIN
  CREATE POLICY "practitioner_openings_all_authenticated"
    ON public.practitioner_openings FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Openings policies: already exist, skipping';
END $$;

-- Opening series
DO $$
BEGIN
  CREATE POLICY "opening_series_all_authenticated"
    ON public.opening_series FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Opening series policies: already exist, skipping';
END $$;

-- Opening motifs
DO $$
BEGIN
  CREATE POLICY "opening_motifs_all_authenticated"
    ON public.opening_motifs FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Opening motifs policies: already exist, skipping';
END $$;

-- Timeline events
DO $$
BEGIN
  CREATE POLICY "timeline_events_all_authenticated"
    ON public.timeline_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Timeline events policies: already exist, skipping';
END $$;

-- Teleconsultation tables (ensure FIX_RLS_SIMPLE is applied)
DO $$
BEGIN
  DROP POLICY IF EXISTS teleconsultations_insert_authenticated ON public.teleconsultations;
  DROP POLICY IF EXISTS teleconsultations_select_authenticated ON public.teleconsultations;
  DROP POLICY IF EXISTS teleconsultations_update_authenticated ON public.teleconsultations;
  DROP POLICY IF EXISTS teleconsultations_delete_authenticated ON public.teleconsultations;

  CREATE POLICY teleconsultations_all_auth ON public.teleconsultations FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Teleconsultation RLS already set';
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS teleconsultation_sessions_all ON public.teleconsultation_sessions;
  CREATE POLICY teleconsultation_sessions_all_auth ON public.teleconsultation_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS teleconsultation_events_all ON public.teleconsultation_events;
  CREATE POLICY teleconsultation_events_all_auth ON public.teleconsultation_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS teleconsultation_documents_all ON public.teleconsultation_documents;
  CREATE POLICY teleconsultation_documents_all_auth ON public.teleconsultation_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS teleconsultation_notes_all_authenticated ON public.teleconsultation_notes;
  CREATE POLICY teleconsultation_notes_all_auth ON public.teleconsultation_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS teleconsultation_recordings_all_authenticated ON public.teleconsultation_recordings;
  CREATE POLICY teleconsultation_recordings_all_auth ON public.teleconsultation_recordings FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

COMMIT;

-- =====================================================================
-- VERIFICATION COUNTS
-- =====================================================================
SELECT 'Auth Users: ' || COUNT(*) FROM auth.users WHERE email LIKE '%@medisync.fr';
SELECT 'Practitioners: ' || COUNT(*) FROM public.practitioners;
SELECT 'Patients: ' || COUNT(*) FROM public.patients;
SELECT 'Appointments: ' || COUNT(*) FROM public.appointments;
SELECT 'Teleconsultations: ' || COUNT(*) FROM public.teleconsultations;
SELECT 'Consultations: ' || COUNT(*) FROM public.consultations;
SELECT 'TC Notes: ' || COUNT(*) FROM public.teleconsultation_notes;
SELECT 'TC Documents: ' || COUNT(*) FROM public.teleconsultation_documents;
SELECT 'Documents: ' || COUNT(*) FROM public.documents;
SELECT 'Notes: ' || COUNT(*) FROM public.notes;
SELECT 'Tasks: ' || COUNT(*) FROM public.tasks;

-- =====================================================================
-- LOGIN CREDENTIALS
-- =====================================================================
-- dr.martin@medisync.fr    / CareConnect2026!  (Dr Sophie Martin - Generaliste)
-- dr.dubois@medisync.fr    / CareConnect2026!  (Dr Pierre Dubois - Cardiologue)
-- dr.laurent@medisync.fr   / CareConnect2026!  (Dr Marie Laurent - Dermatologue)
-- secretariat@medisync.fr  / CareConnect2026!  (Marie Dupont - Secretariat)
-- admin@medisync.fr        / CareConnect2026!  (Administrateur)
-- =====================================================================
