import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

function resolveBreakpoint(width: number): Breakpoint {
  if (width >= BREAKPOINTS.wide) return 'wide';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}

export function useBreakpoint() {
  const [width, setWidth] = useState(() => Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWidth(window.width);
    });
    return () => subscription.remove();
  }, []);

  const breakpoint = resolveBreakpoint(width);

  return {
    width,
    breakpoint,
    isWeb: Platform.OS === 'web',
    isDesktopWeb: Platform.OS === 'web' && width >= BREAKPOINTS.desktop,
    isMobileLayout: Platform.OS !== 'web' || width < BREAKPOINTS.desktop,
  };
}
