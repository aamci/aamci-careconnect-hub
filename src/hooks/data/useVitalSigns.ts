import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface VitalSign {
  id: string;
  patient_id: string;
  consultation_id: string | null;
  recorded_at: string;
  recorded_by: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  bmi: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  heart_rate: number | null;
  temperature_c: number | null;
  respiratory_rate: number | null;
  oxygen_saturation: number | null;
  blood_glucose: number | null;
  notes: string | null;
  created_at: string;
}

// Fetch vital signs for a patient
export function usePatientVitalSigns(patientId: string) {
  return useQuery({
    queryKey: ['patient-vital-signs', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false });

      if (error) throw error;
      return data as VitalSign[];
    },
    enabled: !!patientId,
  });
}

// Fetch latest vital signs
export function useLatestVitalSigns(patientId: string) {
  return useQuery({
    queryKey: ['latest-vital-signs', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vital_signs')
        .select('*')
        .eq('patient_id', patientId)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as VitalSign | null;
    },
    enabled: !!patientId,
  });
}

// Create vital signs record
export function useCreateVitalSigns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vitalSigns: {
      patient_id: string;
      consultation_id?: string | null;
      recorded_at?: string;
      weight_kg?: number | null;
      height_cm?: number | null;
      systolic_bp?: number | null;
      diastolic_bp?: number | null;
      heart_rate?: number | null;
      temperature_c?: number | null;
      respiratory_rate?: number | null;
      oxygen_saturation?: number | null;
      blood_glucose?: number | null;
      notes?: string | null;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Calculate BMI if weight and height are provided
      let bmi: number | null = null;
      if (vitalSigns.weight_kg && vitalSigns.height_cm) {
        const heightM = vitalSigns.height_cm / 100;
        bmi = Math.round((vitalSigns.weight_kg / (heightM * heightM)) * 10) / 10;
      }

      const { data, error } = await supabase
        .from('vital_signs')
        .insert({
          patient_id: vitalSigns.patient_id,
          consultation_id: vitalSigns.consultation_id || null,
          recorded_at: vitalSigns.recorded_at || new Date().toISOString(),
          recorded_by: user.user?.id || null,
          weight_kg: vitalSigns.weight_kg || null,
          height_cm: vitalSigns.height_cm || null,
          bmi,
          systolic_bp: vitalSigns.systolic_bp || null,
          diastolic_bp: vitalSigns.diastolic_bp || null,
          heart_rate: vitalSigns.heart_rate || null,
          temperature_c: vitalSigns.temperature_c || null,
          respiratory_rate: vitalSigns.respiratory_rate || null,
          oxygen_saturation: vitalSigns.oxygen_saturation || null,
          blood_glucose: vitalSigns.blood_glucose || null,
          notes: vitalSigns.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as VitalSign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-vital-signs', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['latest-vital-signs', data.patient_id] });
      toast.success('Constantes enregistrées');
    },
    onError: (error) => {
      toast.error('Erreur lors de l\'enregistrement');
      console.error(error);
    },
  });
}
