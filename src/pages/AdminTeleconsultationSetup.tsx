import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const REQUIRED_TABLES = [
  'teleconsultations',
  'teleconsultation_sessions',
  'teleconsultation_events',
  'teleconsultation_documents',
  'teleconsultation_notes',
  'teleconsultation_recordings',
];

const SQL_MIGRATION = `-- TÉLÉCONSULTATION - SCHEMA ESSENTIEL
-- Copier-coller ce SQL dans Supabase SQL Editor

-- TABLE 1: TELECONSULTATIONS
CREATE TABLE IF NOT EXISTS public.teleconsultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE REFERENCES public.appointments(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    practitioner_id UUID NOT NULL REFERENCES public.practitioners(id) ON DELETE RESTRICT,
    room_token VARCHAR(255) NOT NULL UNIQUE,
    patient_link TEXT NOT NULL,
    practitioner_link TEXT NOT NULL,
    room_expires_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'waiting', 'ready', 'in_progress', 'paused', 'completed', 'cancelled', 'failed')),
    scheduled_start TIMESTAMPTZ NOT NULL,
    actual_start TIMESTAMPTZ,
    actual_end TIMESTAMPTZ,
    duration_minutes INTEGER,
    consultation_reason TEXT,
    chief_complaint TEXT,
    technical_check_done BOOLEAN DEFAULT false,
    settings JSONB DEFAULT '{"video_enabled": true, "audio_enabled": true}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_teleconsultations_appointment ON public.teleconsultations(appointment_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_patient ON public.teleconsultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultations_practitioner ON public.teleconsultations(practitioner_id);

-- TABLE 2-6: Autres tables...
-- (Voir le fichier complet : supabase/migrations/EXECUTE_THIS_FIRST_teleconsultation_essential.sql)

-- RLS
ALTER TABLE public.teleconsultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY teleconsultations_practitioner_select ON public.teleconsultations FOR SELECT
    USING (practitioner_id IN (SELECT id FROM public.practitioners WHERE user_id = auth.uid()));

-- ... (autres politiques)
`;

export default function AdminTeleconsultationSetup() {
  const [checking, setChecking] = useState(true);
  const [tablesStatus, setTablesStatus] = useState<Record<string, boolean>>({});
  const [allTablesExist, setAllTablesExist] = useState(false);

  useEffect(() => {
    checkTables();
  }, []);

  const checkTables = async () => {
    setChecking(true);
    const status: Record<string, boolean> = {};

    for (const table of REQUIRED_TABLES) {
      try {
        const { error } = await supabase.from(table).select('id').limit(1);

        // Si pas d'erreur PGRST205, la table existe
        status[table] = !error || error.code !== 'PGRST205';
      } catch (err) {
        status[table] = false;
      }
    }

    setTablesStatus(status);
    setAllTablesExist(Object.values(status).every(exists => exists));
    setChecking(false);
  };

  const copySQL = () => {
    // Lire le fichier SQL complet depuis le fichier de migration
    fetch('/supabase/migrations/EXECUTE_THIS_FIRST_teleconsultation_essential.sql')
      .then(res => res.text())
      .then(sql => {
        navigator.clipboard.writeText(sql);
        toast.success('SQL copié dans le presse-papier');
      })
      .catch(() => {
        // Fallback: copier le SQL partiel
        navigator.clipboard.writeText(SQL_MIGRATION);
        toast.success('SQL copié (version simplifiée)');
      });
  };

  const openSupabaseDashboard = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      toast.error('URL Supabase introuvable');
      return;
    }

    // Extraire le project ID depuis l'URL
    const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (projectId) {
      const dashboardUrl = `https://supabase.com/dashboard/project/${projectId}/sql/new`;
      window.open(dashboardUrl, '_blank');
    } else {
      toast.error('Impossible de déterminer l\'URL du dashboard');
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-4xl mx-auto py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuration Téléconsultation</h1>
          <p className="text-muted-foreground mt-2">
            Vérification et installation des tables requises pour le module de téléconsultation
          </p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {checking ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : allTablesExist ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              État des tables de base de données
            </CardTitle>
            <CardDescription>
              {checking ? (
                'Vérification en cours...'
              ) : allTablesExist ? (
                'Toutes les tables sont correctement installées'
              ) : (
                'Des tables sont manquantes - La téléconsultation ne peut pas fonctionner'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {REQUIRED_TABLES.map((table) => (
                <div key={table} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    {checking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : tablesStatus[table] ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="font-mono text-sm">{table}</span>
                  </div>
                  <Badge variant={tablesStatus[table] ? 'default' : 'destructive'}>
                    {checking ? 'Vérification...' : tablesStatus[table] ? 'Installée' : 'Manquante'}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={checkTables} variant="outline" disabled={checking}>
                {checking && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Re-vérifier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Installation Guide */}
        {!checking && !allTablesExist && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Action requise : Installation des tables</AlertTitle>
            <AlertDescription className="mt-2 space-y-4">
              <p>
                Les tables de téléconsultation n'existent pas dans votre base de données Supabase.
                Vous devez exécuter le fichier de migration SQL pour les créer.
              </p>

              <div className="flex flex-col gap-2">
                <p className="font-semibold">Méthode 1 : Via Supabase Dashboard (Recommandé)</p>
                <ol className="list-decimal list-inside space-y-1 text-sm pl-2">
                  <li>Cliquez sur le bouton "Ouvrir SQL Editor" ci-dessous</li>
                  <li>Cliquez sur "Copier le SQL" pour copier le script dans le presse-papier</li>
                  <li>Collez le SQL dans l'éditeur Supabase</li>
                  <li>Cliquez sur "Run" pour exécuter le script</li>
                  <li>Revenez ici et cliquez sur "Re-vérifier"</li>
                </ol>

                <div className="flex gap-2 mt-2">
                  <Button onClick={openSupabaseDashboard} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Ouvrir SQL Editor
                  </Button>
                  <Button onClick={copySQL} variant="outline" className="gap-2">
                    <Copy className="h-4 w-4" />
                    Copier le SQL
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t">
                <p className="font-semibold">Méthode 2 : Via fichier de migration</p>
                <p className="text-sm">
                  Le fichier SQL complet se trouve ici :<br />
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    supabase/migrations/EXECUTE_THIS_FIRST_teleconsultation_essential.sql
                  </code>
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {!checking && allTablesExist && (
          <Alert className="border-green-600 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">✅ Installation réussie</AlertTitle>
            <AlertDescription className="text-green-800 space-y-3">
              <p>
                Toutes les tables de téléconsultation sont correctement installées.
                Le module de téléconsultation est maintenant opérationnel à 100%.
              </p>
              <div className="pt-2 border-t border-green-300">
                <p className="font-semibold mb-2">Si vous voyez encore l'alerte rouge sur la page Agenda:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Appuyez sur <strong>Ctrl+Shift+R</strong> pour vider le cache du navigateur</li>
                  <li>Ou fermez et rouvrez l'application</li>
                  <li>L'alerte disparaîtra automatiquement</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  );
}
