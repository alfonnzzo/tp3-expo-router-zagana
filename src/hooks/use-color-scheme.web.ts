import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

function suscribir() {
  return () => {};
}

export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(suscribir, () => true, () => false);
  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
