import type { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type Props = {
  children: ReactNode;
  /** Pantallas de las pestañas: sin encabezado y con la barra de pestañas abajo. */
  conPestanas?: boolean;
  centrado?: boolean;
};

export function Pantalla({ children, conPestanas = false, centrado = false }: Props) {
  return (
    <ThemedView style={styles.raiz}>
      <SafeAreaView
        style={styles.segura}
        edges={conPestanas ? ['top', 'left', 'right'] : ['bottom', 'left', 'right']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.contenido,
            centrado && styles.centrado,
            conPestanas && { paddingBottom: BottomTabInset + Spacing.three },
          ]}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1, alignItems: 'center' },
  segura: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  contenido: {
    flexGrow: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  centrado: { justifyContent: 'center', alignItems: 'center' },
});
