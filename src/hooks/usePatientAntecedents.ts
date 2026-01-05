import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AntecedentCategory, AntecedentFormData } from '@/components/patients/dossier/AntecedentFormModal';

export interface Antecedent {
  id: string;
  patient_id: string;
  category: AntecedentCategory;
  title: string;
  description: string | null;
  occurrence_date: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientMemo {
  id: string;
  patient_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export function usePatientAntecedents(patientId: string) {
  const [antecedents, setAntecedents] = useState<Antecedent[]>([]);
  const [memo, setMemo] = useState<PatientMemo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAntecedents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('patient_antecedents')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAntecedents(data || []);
    } catch (error) {
      console.error('Error fetching antecedents:', error);
      toast.error('Erreur lors du chargement des antécédents');
    }
  }, [patientId]);

  const fetchMemo = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('patient_memos')
        .select('*')
        .eq('patient_id', patientId)
        .maybeSingle();

      if (error) throw error;
      setMemo(data);
    } catch (error) {
      console.error('Error fetching memo:', error);
      toast.error('Erreur lors du chargement du mémo');
    }
  }, [patientId]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchAntecedents(), fetchMemo()]);
    setIsLoading(false);
  }, [fetchAntecedents, fetchMemo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addAntecedent = async (
    category: AntecedentCategory,
    data: AntecedentFormData
  ): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patient_antecedents')
        .insert({
          patient_id: patientId,
          category,
          title: data.title,
          description: data.description || null,
          occurrence_date: data.occurrence_date 
            ? data.occurrence_date.toISOString().split('T')[0] 
            : null,
          severity: data.severity,
          notes: data.notes || null,
        });

      if (error) throw error;

      toast.success('Antécédent ajouté avec succès');
      await fetchAntecedents();
      return true;
    } catch (error) {
      console.error('Error adding antecedent:', error);
      toast.error("Erreur lors de l'ajout de l'antécédent");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAntecedent = async (id: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('patient_antecedents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Antécédent supprimé');
      await fetchAntecedents();
      return true;
    } catch (error) {
      console.error('Error deleting antecedent:', error);
      toast.error("Erreur lors de la suppression de l'antécédent");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveMemo = async (content: string): Promise<boolean> => {
    setIsSaving(true);
    try {
      if (memo) {
        // Update existing memo
        const { error } = await supabase
          .from('patient_memos')
          .update({ content })
          .eq('id', memo.id);

        if (error) throw error;
      } else {
        // Create new memo
        const { error } = await supabase
          .from('patient_memos')
          .insert({
            patient_id: patientId,
            content,
          });

        if (error) throw error;
      }

      toast.success('Mémo enregistré');
      await fetchMemo();
      return true;
    } catch (error) {
      console.error('Error saving memo:', error);
      toast.error('Erreur lors de la sauvegarde du mémo');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const getAntecedentsByCategory = (category: AntecedentCategory): Antecedent[] => {
    return antecedents.filter(a => a.category === category);
  };

  return {
    antecedents,
    memo,
    isLoading,
    isSaving,
    addAntecedent,
    deleteAntecedent,
    saveMemo,
    getAntecedentsByCategory,
    refetch: loadData,
  };
}
