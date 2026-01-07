-- ============================================
-- MediSync Pro - Seed Data (Backfill mockData)
-- ============================================
-- Ce script insère les données de développement
-- Exécuter via: Supabase Dashboard > SQL Editor
-- ============================================

-- Désactiver les triggers temporairement pour éviter les conflits
-- (à réactiver après insertion)

-- ============================================
-- 1. SITES
-- ============================================
INSERT INTO public.sites (id, name, address, city, postal_code, phone, is_active) VALUES
  ('site-1', 'Centre Médical Saint-Michel', '45 Avenue de la Liberté', 'Paris', '75011', '01 42 55 67 89', true),
  ('site-2', 'Cabinet République', '12 Place de la République', 'Paris', '75003', '01 43 22 11 00', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. ROOMS
-- ============================================
INSERT INTO public.rooms (id, name, site_id, equipment, is_active) VALUES
  ('room-1', 'Salle 1', 'site-1', '[]'::jsonb, true),
  ('room-2', 'Salle 2', 'site-1', '[]'::jsonb, true),
  ('room-3', 'Salle Imagerie', 'site-1', '["Échographe", "ECG"]'::jsonb, true),
  ('room-4', 'Cabinet A', 'site-2', '[]'::jsonb, true),
  ('room-5', 'Cabinet B', 'site-2', '[]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. PRACTITIONERS
-- ============================================
INSERT INTO public.practitioners (id, first_name, last_name, title, specialty, email, phone, color, site_ids, is_active) VALUES
  ('pract-1', 'Sophie', 'Martin', 'Dr', 'Médecine Générale', 'dr.martin@medisync.fr', '06 12 34 56 78', '#0D9488', ARRAY['site-1', 'site-2']::uuid[], true),
  ('pract-2', 'Pierre', 'Dubois', 'Dr', 'Cardiologie', 'dr.dubois@medisync.fr', '06 98 76 54 32', '#3B82F6', ARRAY['site-1']::uuid[], true),
  ('pract-3', 'Marie', 'Laurent', 'Dr', 'Dermatologie', 'dr.laurent@medisync.fr', NULL, '#8B5CF6', ARRAY['site-2']::uuid[], true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. APPOINTMENT MOTIFS
-- ============================================
INSERT INTO public.appointment_motifs (id, name, short_name, duration, color, type, requires_room, is_online_bookable, is_active) VALUES
  ('motif-1', 'Consultation générale', 'Consultation', 20, '#F59E0B', 'consultation', false, true, true),
  ('motif-2', 'Première consultation', '1ère consult.', 30, '#EC4899', 'consultation', false, true, true),
  ('motif-3', 'Suivi de traitement', 'Suivi', 15, '#3B82F6', 'followup', false, true, true),
  ('motif-4', 'Urgence', 'Urgence', 30, '#EF4444', 'emergency', false, false, true),
  ('motif-5', 'Bilan annuel', 'Bilan', 45, '#10B981', 'checkup', false, true, true),
  ('motif-6', 'Acte technique', 'Acte', 30, '#8B5CF6', 'procedure', true, false, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. PATIENTS
-- ============================================
INSERT INTO public.patients (id, first_name, last_name, used_first_name, used_last_name, gender, date_of_birth, phone, phone_secondary, email, address, city, postal_code, birth_place, insurance_provider, is_active, created_at, updated_at) VALUES
  ('pat-1', 'Maud', 'PENNANEACH', 'Maud', NULL, 'female', '1990-12-23', '06 12 34 56 78', NULL, 'maud.p@email.fr', '15 Rue de la Paix', 'Paris', '75002', 'France', NULL, true, '2022-04-15', NOW()),
  ('pat-2', 'David', 'CHICHEPORTICHE', NULL, NULL, 'male', '1965-06-04', '06 60 08 45 00', '01 55 93 14 00', 'dchichepo@gmail.com', '83 Avenue André Morizet', 'Boulogne', '92100', NULL, 'Mutuelle', true, '2020-02-10', NOW()),
  ('pat-3', 'Pablo', 'DEMO', 'Pablo', 'DEMO', 'male', '2001-07-02', '+33 6 34 89 67 26', NULL, 'pablo.demo@email.fr', NULL, 'Arcachon', '33', 'France', 'Assurance', true, '2023-01-05', NOW()),
  ('pat-4', 'Marc', 'DEMO', NULL, NULL, 'male', '1990-01-01', '06 55 44 33 22', NULL, 'marc.demo@email.fr', NULL, NULL, NULL, NULL, NULL, true, '2021-06-20', NOW()),
  ('pat-5', 'Camille', 'DEMO', NULL, NULL, 'female', '1985-04-15', '06 77 88 99 00', NULL, 'camille.demo@email.fr', NULL, NULL, NULL, NULL, NULL, true, '2022-09-01', NOW()),
  ('pat-6', 'Luca', 'GAVIRAGHI', NULL, NULL, 'male', '1992-08-11', '06 11 22 33 44', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '2023-05-10', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. PATIENT ALERTS (for pat-2 VIP)
-- ============================================
INSERT INTO public.patient_alerts (id, patient_id, type, message, severity, is_active) VALUES
  ('alert-1', 'pat-2', 'vip', 'VIP - lui doubler les RDV si complet', 'info', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. APPOINTMENTS (Cette semaine)
-- ============================================
-- Les appointments sont générés dynamiquement dans mockData
-- Ici on génère des exemples pour la semaine courante

DO $$
DECLARE
  week_start DATE := date_trunc('week', CURRENT_DATE)::DATE;
  apt_id UUID;
BEGIN
  -- Monday appointments
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit)
  VALUES
    (gen_random_uuid(), 'pat-1', 'pract-1', 'motif-1', week_start + INTERVAL '9 hours', week_start + INTERVAL '9 hours 20 minutes', 20, 'completed', 'consultation', false),
    (gen_random_uuid(), 'pat-2', 'pract-1', 'motif-3', week_start + INTERVAL '9 hours 30 minutes', week_start + INTERVAL '9 hours 45 minutes', 15, 'completed', 'followup', false),
    (gen_random_uuid(), 'pat-3', 'pract-1', 'motif-1', week_start + INTERVAL '10 hours', week_start + INTERVAL '10 hours 20 minutes', 20, 'completed', 'consultation', false),
    (gen_random_uuid(), 'pat-4', 'pract-1', 'motif-2', week_start + INTERVAL '10 hours 30 minutes', week_start + INTERVAL '11 hours', 30, 'in-progress', 'consultation', true),
    (gen_random_uuid(), 'pat-5', 'pract-1', 'motif-1', week_start + INTERVAL '11 hours', week_start + INTERVAL '11 hours 20 minutes', 20, 'scheduled', 'consultation', false),
    (gen_random_uuid(), 'pat-6', 'pract-1', 'motif-4', week_start + INTERVAL '14 hours', week_start + INTERVAL '14 hours 30 minutes', 30, 'scheduled', 'emergency', false),
    (gen_random_uuid(), 'pat-3', 'pract-2', 'motif-5', week_start + INTERVAL '9 hours', week_start + INTERVAL '9 hours 45 minutes', 45, 'completed', 'checkup', false);

  -- Tuesday appointments
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit)
  VALUES
    (gen_random_uuid(), 'pat-5', 'pract-1', 'motif-1', week_start + INTERVAL '1 day 9 hours', week_start + INTERVAL '1 day 9 hours 20 minutes', 20, 'scheduled', 'consultation', false),
    (gen_random_uuid(), 'pat-6', 'pract-1', 'motif-2', week_start + INTERVAL '1 day 9 hours 30 minutes', week_start + INTERVAL '1 day 10 hours', 30, 'scheduled', 'consultation', true),
    (gen_random_uuid(), 'pat-1', 'pract-1', 'motif-6', week_start + INTERVAL '1 day 10 hours 30 minutes', week_start + INTERVAL '1 day 11 hours', 30, 'scheduled', 'procedure', false),
    (gen_random_uuid(), 'pat-5', 'pract-2', 'motif-1', week_start + INTERVAL '1 day 9 hours', week_start + INTERVAL '1 day 9 hours 20 minutes', 20, 'scheduled', 'consultation', false);

  -- Wednesday appointments
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit)
  VALUES
    (gen_random_uuid(), 'pat-1', 'pract-1', 'motif-1', week_start + INTERVAL '2 days 9 hours', week_start + INTERVAL '2 days 9 hours 20 minutes', 20, 'scheduled', 'consultation', false),
    (gen_random_uuid(), 'pat-2', 'pract-1', 'motif-4', week_start + INTERVAL '2 days 9 hours 30 minutes', week_start + INTERVAL '2 days 10 hours', 30, 'scheduled', 'emergency', false),
    (gen_random_uuid(), 'pat-1', 'pract-3', 'motif-1', week_start + INTERVAL '2 days 9 hours 30 minutes', week_start + INTERVAL '2 days 9 hours 50 minutes', 20, 'scheduled', 'consultation', false),
    (gen_random_uuid(), 'pat-2', 'pract-3', 'motif-6', week_start + INTERVAL '2 days 10 hours', week_start + INTERVAL '2 days 10 hours 30 minutes', 30, 'scheduled', 'procedure', false);

  -- Thursday appointments
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit)
  VALUES
    (gen_random_uuid(), 'pat-3', 'pract-1', 'motif-1', week_start + INTERVAL '3 days 9 hours', week_start + INTERVAL '3 days 9 hours 20 minutes', 20, 'scheduled', 'consultation', false),
    (gen_random_uuid(), 'pat-4', 'pract-1', 'motif-5', week_start + INTERVAL '3 days 9 hours 45 minutes', week_start + INTERVAL '3 days 10 hours 30 minutes', 45, 'scheduled', 'checkup', false),
    (gen_random_uuid(), 'pat-4', 'pract-2', 'motif-1', week_start + INTERVAL '3 days 9 hours', week_start + INTERVAL '3 days 9 hours 20 minutes', 20, 'scheduled', 'consultation', false);

  -- Friday appointments
  INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, start_time, end_time, duration, status, type, is_first_visit)
  VALUES
    (gen_random_uuid(), 'pat-6', 'pract-1', 'motif-1', week_start + INTERVAL '4 days 9 hours', week_start + INTERVAL '4 days 9 hours 20 minutes', 20, 'scheduled', 'consultation', false),
    (gen_random_uuid(), 'pat-1', 'pract-1', 'motif-3', week_start + INTERVAL '4 days 9 hours 30 minutes', week_start + INTERVAL '4 days 9 hours 45 minutes', 15, 'scheduled', 'followup', false),
    (gen_random_uuid(), 'pat-2', 'pract-1', 'motif-1', week_start + INTERVAL '4 days 10 hours', week_start + INTERVAL '4 days 10 hours 20 minutes', 20, 'scheduled', 'consultation', false),
    (gen_random_uuid(), 'pat-6', 'pract-1', 'motif-5', week_start + INTERVAL '4 days 14 hours 30 minutes', week_start + INTERVAL '4 days 15 hours 15 minutes', 45, 'scheduled', 'checkup', false);
END $$;

-- ============================================
-- 8. NOTES
-- ============================================
INSERT INTO public.notes (id, content, patient_id, author_name, is_urgent, send_to_secretariat, created_at) VALUES
  ('note-1', 'N''a pas récupéré son ordonnance pour le kiné, passe mercredi pour la récupérer.', 'pat-1', 'Dr Martin', false, true, '2024-06-07'),
  ('note-2', 'Résultats de labo à vérifier avant prochaine consultation.', 'pat-2', 'Dr Dubois', true, false, '2024-11-01')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. TASKS
-- ============================================
INSERT INTO public.tasks (id, title, description, type, priority, status, assignee_name, patient_id, due_date, created_at) VALUES
  ('task-1', 'Appeler patient DEMO Marc', 'Rappeler pour confirmer le RDV de suivi', 'call', 'high', 'todo', 'Secrétariat', 'pat-4', CURRENT_DATE + INTERVAL '1 day', NOW()),
  ('task-2', 'Préparer dossier CHICHEPORTICHE', 'Imprimer les derniers résultats pour la consultation', 'preparation', 'medium', 'in-progress', 'Secrétariat', 'pat-2', CURRENT_DATE, NOW() - INTERVAL '1 day'),
  ('task-3', 'Demander résultats examens', 'Récupérer les résultats du bilan sanguin', 'document', 'low', 'done', 'Dr Martin', 'pat-1', NULL, NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Vérification
-- ============================================
SELECT 'Sites: ' || COUNT(*) FROM public.sites;
SELECT 'Rooms: ' || COUNT(*) FROM public.rooms;
SELECT 'Practitioners: ' || COUNT(*) FROM public.practitioners;
SELECT 'Motifs: ' || COUNT(*) FROM public.appointment_motifs;
SELECT 'Patients: ' || COUNT(*) FROM public.patients;
SELECT 'Appointments: ' || COUNT(*) FROM public.appointments;
SELECT 'Notes: ' || COUNT(*) FROM public.notes;
SELECT 'Tasks: ' || COUNT(*) FROM public.tasks;

-- ============================================
-- Seed data complete!
-- ============================================
