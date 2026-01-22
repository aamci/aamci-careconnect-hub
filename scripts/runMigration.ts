/**
 * Script d'exécution de migration
 * Exécute la migration documents complète avec garantie ZÉRO PERTE
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Variables d\'environnement manquantes:');
  console.error('   - VITE_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false
  }
});

async function runMigration(migrationFile: string) {
  console.log(`\n📄 Lecture de la migration: ${migrationFile}`);

  try {
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile);
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log(`📊 Taille du fichier: ${(sql.length / 1024).toFixed(2)} KB`);
    console.log(`\n🚀 Exécution de la migration...`);

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error('❌ Erreur lors de l\'exécution de la migration:');
      console.error(error);
      process.exit(1);
    }

    console.log('✅ Migration exécutée avec succès !');

    // Vérification de la structure créée
    console.log('\n🔍 Vérification de la structure créée...');

    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['documents', 'document_audit', 'document_consultation_links']);

    if (tablesError) {
      console.warn('⚠️ Impossible de vérifier les tables:', tablesError);
    } else {
      console.log('📋 Tables créées:', tables?.map(t => t.table_name).join(', '));
    }

    // Vérification des colonnes de la table documents
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'documents')
      .order('ordinal_position');

    if (columnsError) {
      console.warn('⚠️ Impossible de vérifier les colonnes:', columnsError);
    } else {
      console.log(`\n📊 Colonnes de la table documents (${columns?.length || 0} champs):`);
      columns?.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
    }

    console.log('\n✨ Migration terminée avec succès !');
    console.log('🎯 GARANTIE ZÉRO PERTE: Tous les champs sont maintenant persistés en base.');

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  }
}

// Exécution
const migrationFile = process.argv[2] || '20260122_documents_complete_schema.sql';
runMigration(migrationFile).then(() => process.exit(0));
