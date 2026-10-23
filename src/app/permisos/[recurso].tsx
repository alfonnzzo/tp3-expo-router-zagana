import { router, useLocalSearchParams } from 'expo-router';

import { PantallaPrevia } from '@/components/pantalla-previa';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { Recurso } from '@/lib/tipos';

const RECURSOS: Recurso[] = ['camara', 'ubicacion', 'notificaciones', 'microfono'];

export default function PermisoScreen() {
  const { recurso } = useLocalSearchParams<{ recurso: string }>();
  const valido = RECURSOS.find((item) => item === recurso);

  if (valido === undefined) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.four }}>
        <ThemedText>Ese permiso no existe.</ThemedText>
      </ThemedView>
    );
  }

  return <PantallaPrevia recurso={valido} onContinuar={() => router.back()} />;
}
