import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Settings, X, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Composant d'alerte automatique qui détecte si les tables de téléconsultation existent
 * Affiche une alerte prominente si elles sont manquantes
 */
export function TeleconsultationSetupAlert() {
  const navigate = useNavigate();
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkTables();
  }, []);

  const checkTables = async () => {
    try {
      // Vérifier si la table principale existe
      const { error } = await supabase
        .from('teleconsultations')
        .select('id')
        .limit(1);

      // Si erreur PGRST205, la table n'existe pas
      setTablesExist(!error || error.code !== 'PGRST205');
    } catch (err) {
      setTablesExist(false);
    }
  };

  const goToSetup = () => {
    navigate('/admin/teleconsult-setup');
  };

  const forceRefresh = () => {
    // Hard refresh: clear cache and reload
    window.location.reload();
  };

  // Ne rien afficher si :
  // - encore en train de vérifier
  // - les tables existent
  // - l'alerte a été fermée
  if (tablesExist === null || tablesExist || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 animate-in slide-in-from-top-4">
      <Alert variant="destructive" className="shadow-xl border-2">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <AlertTitle className="text-base font-bold mb-2">
              Module Téléconsultation non configuré
            </AlertTitle>
            <AlertDescription className="text-sm space-y-2">
              <p>
                Les tables de téléconsultation ne sont pas détectées dans votre base de données.
              </p>
              <p className="font-medium">
                Si vous venez d'exécuter la migration SQL, cliquez sur "Rafraîchir" pour vider le cache.
                Sinon, cliquez sur "Configurer" pour installer les tables.
              </p>
            </AlertDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              onClick={forceRefresh}
              size="sm"
              variant="default"
              className="gap-2 bg-green-600 text-white hover:bg-green-700"
            >
              <RefreshCw className="h-4 w-4" />
              Rafraîchir
            </Button>
            <Button
              onClick={goToSetup}
              size="sm"
              variant="default"
              className="gap-2 bg-white text-red-900 hover:bg-gray-100"
            >
              <Settings className="h-4 w-4" />
              Configurer
            </Button>
            <Button
              onClick={() => setDismissed(true)}
              size="sm"
              variant="ghost"
              className="gap-2 text-white hover:bg-red-800/50"
            >
              <X className="h-4 w-4" />
              Fermer
            </Button>
          </div>
        </div>
      </Alert>
    </div>
  );
}
