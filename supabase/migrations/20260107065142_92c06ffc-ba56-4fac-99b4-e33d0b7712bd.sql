-- 1. Insert sites first
INSERT INTO public.sites (id, name, address, city, postal_code, phone, email) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Cabinet Principal', '15 rue de la Santé', 'Paris', '75014', '01 45 67 89 00', 'contact@cabinet-principal.fr'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Centre Médical Sud', '42 avenue du Général Leclerc', 'Paris', '75015', '01 45 67 89 01', 'contact@centre-sud.fr')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert rooms (depends on sites)
INSERT INTO public.rooms (id, site_id, name, capacity) VALUES
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Salle de consultation 1', 2),
  ('d4e5f6a7-b8c9-0123-def0-234567890123', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Salle de consultation 2', 2),
  ('e5f6a7b8-c9d0-1234-ef01-345678901234', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Salle A', 3)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert practitioners
INSERT INTO public.practitioners (id, title, first_name, last_name, specialty, email, phone, color, site_ids) VALUES
  ('f6a7b8c9-d0e1-2345-f012-456789012345', 'Dr', 'Sophie', 'Martin', 'Médecine générale', 'sophie.martin@cabinet.fr', '06 12 34 56 78', '#3B82F6', ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890']::uuid[]),
  ('a7b8c9d0-e1f2-3456-0123-567890123456', 'Dr', 'Pierre', 'Dubois', 'Cardiologie', 'pierre.dubois@cabinet.fr', '06 23 45 67 89', '#10B981', ARRAY['a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'b2c3d4e5-f6a7-8901-bcde-f12345678901']::uuid[]),
  ('b8c9d0e1-f2a3-4567-1234-678901234567', 'Dr', 'Marie', 'Laurent', 'Dermatologie', 'marie.laurent@cabinet.fr', '06 34 56 78 90', '#F59E0B', ARRAY['b2c3d4e5-f6a7-8901-bcde-f12345678901']::uuid[])
ON CONFLICT (id) DO NOTHING;

-- 4. Insert appointment motifs with valid types (consultation, followup, emergency, procedure, checkup)
INSERT INTO public.appointment_motifs (id, name, short_name, type, duration, color, is_online_bookable, requires_room, instructions) VALUES
  ('c9d0e1f2-a3b4-5678-2345-789012345678', 'Consultation générale', 'Consult', 'consultation', 20, '#3B82F6', true, true, 'Veuillez apporter votre carte vitale'),
  ('d0e1f2a3-b4c5-6789-3456-890123456789', 'Suivi cardiologique', 'Cardio', 'followup', 30, '#EF4444', true, true, 'Apporter les résultats d''examens récents'),
  ('e1f2a3b4-c5d6-7890-4567-901234567890', 'Première consultation', '1ère Consult', 'checkup', 45, '#10B981', true, true, 'Consultation initiale - prévoir 45 minutes'),
  ('f2a3b4c5-d6e7-8901-5678-012345678901', 'Urgence', 'Urgent', 'emergency', 15, '#F59E0B', false, true, 'Consultation d''urgence'),
  ('a3b4c5d6-e7f8-9012-6789-123456789012', 'Acte médical', 'Acte', 'procedure', 20, '#8B5CF6', true, false, 'Acte médical spécialisé')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert patients with correct gender values (male, female, other)
INSERT INTO public.patients (id, first_name, last_name, used_first_name, date_of_birth, gender, phone, email, address, city, postal_code, insurance_provider, insurance_number, referring_doctor) VALUES
  ('b4c5d6e7-f8a9-0123-7890-234567890123', 'Jean', 'Dupont', NULL, '1985-03-15', 'male', '06 11 22 33 44', 'jean.dupont@email.fr', '10 rue des Lilas', 'Paris', '75011', 'CPAM Paris', '1 85 03 75 123 456 78', 'Dr Martin'),
  ('c5d6e7f8-a9b0-1234-8901-345678901234', 'Marie', 'Leroy', NULL, '1992-07-22', 'female', '06 22 33 44 55', 'marie.leroy@email.fr', '25 avenue Victor Hugo', 'Paris', '75016', 'MGEN', '2 92 07 75 234 567 89', NULL),
  ('d6e7f8a9-b0c1-2345-9012-456789012345', 'Pierre', 'Bernard', NULL, '1978-11-08', 'male', '06 33 44 55 66', 'pierre.bernard@email.fr', '5 boulevard Haussmann', 'Paris', '75009', 'Harmonie Mutuelle', '1 78 11 75 345 678 90', 'Dr Dubois'),
  ('e7f8a9b0-c1d2-3456-0123-567890123456', 'Sophie', 'Petit', NULL, '1965-01-30', 'female', '06 44 55 66 77', 'sophie.petit@email.fr', '18 rue de Rivoli', 'Paris', '75004', 'CPAM Paris', '2 65 01 75 456 789 01', NULL),
  ('f8a9b0c1-d2e3-4567-1234-678901234567', 'Lucas', 'Moreau', NULL, '2010-05-12', 'male', '06 55 66 77 88', NULL, '30 rue du Commerce', 'Paris', '75015', 'CPAM Paris', '1 10 05 75 567 890 12', 'Dr Laurent')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert patient alerts with correct type/severity values
INSERT INTO public.patient_alerts (id, patient_id, type, severity, message, is_active) VALUES
  ('a9b0c1d2-e3f4-5678-2345-789012345678', 'b4c5d6e7-f8a9-0123-7890-234567890123', 'medical', 'critical', 'Allergie à la pénicilline', true),
  ('b0c1d2e3-f4a5-6789-3456-890123456789', 'd6e7f8a9-b0c1-2345-9012-456789012345', 'medical', 'warning', 'Diabète type 2 - surveillance glycémie', true),
  ('c1d2e3f4-a5b6-7890-4567-901234567890', 'e7f8a9b0-c1d2-3456-0123-567890123456', 'payment', 'info', 'Facture en attente de paiement', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Insert appointments for this week
INSERT INTO public.appointments (id, patient_id, practitioner_id, motif_id, room_id, start_time, end_time, duration, type, status, is_first_visit, notes) VALUES
  (gen_random_uuid(), 'b4c5d6e7-f8a9-0123-7890-234567890123', 'f6a7b8c9-d0e1-2345-f012-456789012345', 'c9d0e1f2-a3b4-5678-2345-789012345678', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 
   (date_trunc('week', now()) + interval '1 day' + interval '9 hours'), 
   (date_trunc('week', now()) + interval '1 day' + interval '9 hours 20 minutes'), 
   20, 'consultation', 'scheduled', false, 'Consultation de routine'),
  (gen_random_uuid(), 'c5d6e7f8-a9b0-1234-8901-345678901234', 'a7b8c9d0-e1f2-3456-0123-567890123456', 'd0e1f2a3-b4c5-6789-3456-890123456789', 'd4e5f6a7-b8c9-0123-def0-234567890123',
   (date_trunc('week', now()) + interval '1 day' + interval '10 hours'),
   (date_trunc('week', now()) + interval '1 day' + interval '10 hours 30 minutes'),
   30, 'followup', 'scheduled', false, 'Suivi cardiologique mensuel'),
  (gen_random_uuid(), 'd6e7f8a9-b0c1-2345-9012-456789012345', 'f6a7b8c9-d0e1-2345-f012-456789012345', 'e1f2a3b4-c5d6-7890-4567-901234567890', 'c3d4e5f6-a7b8-9012-cdef-123456789012',
   (date_trunc('week', now()) + interval '2 days' + interval '14 hours'),
   (date_trunc('week', now()) + interval '2 days' + interval '14 hours 45 minutes'),
   45, 'checkup', 'scheduled', true, 'Première consultation'),
  (gen_random_uuid(), 'e7f8a9b0-c1d2-3456-0123-567890123456', 'b8c9d0e1-f2a3-4567-1234-678901234567', 'c9d0e1f2-a3b4-5678-2345-789012345678', 'e5f6a7b8-c9d0-1234-ef01-345678901234',
   (date_trunc('week', now()) + interval '3 days' + interval '11 hours'),
   (date_trunc('week', now()) + interval '3 days' + interval '11 hours 20 minutes'),
   20, 'consultation', 'scheduled', false, 'Consultation dermatologique'),
  (gen_random_uuid(), 'f8a9b0c1-d2e3-4567-1234-678901234567', 'f6a7b8c9-d0e1-2345-f012-456789012345', 'c9d0e1f2-a3b4-5678-2345-789012345678', 'c3d4e5f6-a7b8-9012-cdef-123456789012',
   (date_trunc('week', now()) + interval '4 days' + interval '15 hours'),
   (date_trunc('week', now()) + interval '4 days' + interval '15 hours 20 minutes'),
   20, 'consultation', 'scheduled', false, 'Consultation pédiatrique');

-- 8. Insert notes
INSERT INTO public.notes (id, patient_id, content, is_urgent, send_to_secretariat, author_name) VALUES
  (gen_random_uuid(), 'b4c5d6e7-f8a9-0123-7890-234567890123', 'Patient à recontacter pour résultats d''analyse', false, true, 'Dr Martin'),
  (gen_random_uuid(), 'd6e7f8a9-b0c1-2345-9012-456789012345', 'Surveillance glycémie à renforcer', true, false, 'Dr Dubois'),
  (gen_random_uuid(), 'e7f8a9b0-c1d2-3456-0123-567890123456', 'Rappeler pour facture impayée', false, true, 'Secrétariat');

-- 9. Insert tasks
INSERT INTO public.tasks (id, title, description, type, priority, status, patient_id, due_date, assignee_name) VALUES
  (gen_random_uuid(), 'Appeler patient Dupont', 'Rappeler pour résultats d''analyse sanguine', 'call', 'high', 'todo', 'b4c5d6e7-f8a9-0123-7890-234567890123', now() + interval '1 day', 'Secrétariat'),
  (gen_random_uuid(), 'Préparer dossier Bernard', 'Rassembler les documents pour la première consultation', 'document', 'medium', 'todo', 'd6e7f8a9-b0c1-2345-9012-456789012345', now() + interval '2 days', 'Secrétariat'),
  (gen_random_uuid(), 'Relance facturation', 'Contacter patiente Petit pour facture impayée', 'administrative', 'low', 'todo', 'e7f8a9b0-c1d2-3456-0123-567890123456', now() + interval '5 days', 'Comptabilité');