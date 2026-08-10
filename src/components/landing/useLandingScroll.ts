import { useCallback, useRef, useState } from 'react';
import type { LayoutChangeEvent, ScrollView } from 'react-native';

export function useLandingScroll() {
  const scrollRef = useRef<ScrollView>(null);
  const [offsets, setOffsets] = useState<Record<string, number>>({});
  const [scrollY, setScrollY] = useState(0);

  const registerSection = useCallback((id: string) => {
    return (e: LayoutChangeEvent) => {
      const y = e.nativeEvent.layout.y;
      setOffsets((prev) => (prev[id] === y ? prev : { ...prev, [id]: y }));
    };
  }, []);

  const scrollToSection = useCallback(
    (id: string) => {
      const y = offsets[id];
      if (y != null) {
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 72), animated: true });
      }
    },
    [offsets],
  );

  return { scrollRef, scrollY, setScrollY, registerSection, scrollToSection, navScrolled: scrollY > 24 };
}
