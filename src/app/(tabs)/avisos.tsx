import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { marcarAvisosLeidos, useAvisos } from '@/lib/reportes';

export default function AvisosScreen() {
  const avisos = useAvisos();

  useFocusEffect(
    useCallback(() => {
      marcarAvisosLeidos();
    }, []),
  );

  return (
    <ThemedView style={styles.contenedor}>
      <SafeAreaView style={styles.areaSegura} edges={['top']}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle">Avisos</ThemedText>
          {avisos.length === 0 ? (
            <ThemedText themeColor="textSecondary">
              No tenés avisos. Vas a verlos acá cuando se resuelva un reporte.
            </ThemedText>
          ) : null}
          {avisos.map((aviso) => (
            <ThemedView key={aviso.id} type="backgroundElement" style={styles.aviso}>
              <ThemedText type="smallBold">{aviso.titulo}</ThemedText>
              <ThemedText>{aviso.mensaje}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(aviso.fecha).toLocaleString('es-AR')}
              </ThemedText>
            </ThemedView>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
  },
  areaSegura: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  contenido: {
    padding: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.four,
    gap: Spacing.three,
  },
  aviso: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
});
