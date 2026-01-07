import { useState, useCallback, useRef, useEffect } from 'react';
import { Appointment } from '@/types';

interface PreviewData {
  appointment: Appointment | null;
  type: 'appointment' | 'opening' | 'absence' | null;
}

interface UseHoverPreviewReturn {
  previewData: PreviewData;
  isPreviewVisible: boolean;
  showPreview: (appointment: Appointment, type?: 'appointment' | 'opening' | 'absence') => void;
  hidePreview: () => void;
  handleMouseEnter: (appointment: Appointment) => void;
  handleMouseLeave: () => void;
  handleFocus: (appointment: Appointment) => void;
  handleBlur: () => void;
}

const DEBOUNCE_DELAY = 100; // ms
const GRACE_PERIOD = 300; // ms

export function useHoverPreview(): UseHoverPreviewReturn {
  const [previewData, setPreviewData] = useState<PreviewData>({
    appointment: null,
    type: null,
  });
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const graceRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveringRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (graceRef.current) clearTimeout(graceRef.current);
    };
  }, []);

  const showPreview = useCallback((appointment: Appointment, type: 'appointment' | 'opening' | 'absence' = 'appointment') => {
    // Clear any pending hide
    if (graceRef.current) {
      clearTimeout(graceRef.current);
      graceRef.current = null;
    }
    
    setPreviewData({ appointment, type });
    setIsPreviewVisible(true);
  }, []);

  const hidePreview = useCallback(() => {
    setIsPreviewVisible(false);
    // Delay clearing data for smooth transitions
    setTimeout(() => {
      setPreviewData({ appointment: null, type: null });
    }, 200);
  }, []);

  const handleMouseEnter = useCallback((appointment: Appointment) => {
    isHoveringRef.current = true;
    
    // Clear any pending hide
    if (graceRef.current) {
      clearTimeout(graceRef.current);
      graceRef.current = null;
    }
    
    // Debounce the show
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (isHoveringRef.current) {
        showPreview(appointment);
      }
    }, DEBOUNCE_DELAY);
  }, [showPreview]);

  const handleMouseLeave = useCallback(() => {
    isHoveringRef.current = false;
    
    // Clear pending show
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    // Start grace period before hiding
    graceRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        hidePreview();
      }
    }, GRACE_PERIOD);
  }, [hidePreview]);

  // Keyboard support
  const handleFocus = useCallback((appointment: Appointment) => {
    showPreview(appointment);
  }, [showPreview]);

  const handleBlur = useCallback(() => {
    graceRef.current = setTimeout(() => {
      hidePreview();
    }, GRACE_PERIOD);
  }, [hidePreview]);

  return {
    previewData,
    isPreviewVisible,
    showPreview,
    hidePreview,
    handleMouseEnter,
    handleMouseLeave,
    handleFocus,
    handleBlur,
  };
}
