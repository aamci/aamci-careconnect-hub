/**
 * Hook pour détecter le breakpoint responsive actuel
 */

import { useState, useEffect } from 'react';
import { Breakpoint, getCurrentBreakpoint } from '@/constants/responsive';

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    getCurrentBreakpoint(window.innerWidth)
  );

  useEffect(() => {
    const handleResize = () => {
      const newBreakpoint = getCurrentBreakpoint(window.innerWidth);
      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return breakpoint;
}
