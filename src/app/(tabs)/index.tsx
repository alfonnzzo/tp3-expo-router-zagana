import { router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/boton';
import { TarjetaReporte } from '@/components/tarjeta-reporte';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useReportes } from '@/lib/reportes';

export default function InicioScreen() {
  const reportes = useReportes();

  return (
    <ThemedView style={styles.contenedor}>
      <SafeAreaView style={styles.areaSegura} edges={['top']}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle">Mis reportes</ThemedText>
          <Boton titulo="Nuevo reporte" onPress={() => router.push('/reporte/nuevo')} />
          <Boton
            titulo="Ajustes de la app"
            variante="secundario"
            onPress={() => router.push('/ajustes-app')}
          />
          {reportes.length === 0 ? (
            <ThemedText themeColor="textSecondary">Todavía no hiciste ningún reporte.</ThemedText>
          ) : null}
          {reportes.map((reporte) => (
            <TarjetaReporte key={reporte.id} reporte={reporte} />
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
});
