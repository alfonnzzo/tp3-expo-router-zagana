import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FilaPermiso } from '@/components/fila-permiso';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

export default function PermisosScreen() {
  return (
    <ThemedView style={styles.contenedor}>
      <SafeAreaView style={styles.areaSegura} edges={['top']}>
        <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
          <ThemedText type="subtitle">Permisos</ThemedText>
          <ThemedText themeColor="textSecondary">
            La app funciona aunque no concedas ninguno. Podés cambiarlos cuando quieras en Ajustes.
          </ThemedText>
          <FilaPermiso recurso="camara" />
          <FilaPermiso recurso="ubicacion" />
          <FilaPermiso recurso="notificaciones" />
          <FilaPermiso recurso="microfono" />
          <ThemedView type="backgroundElement" style={styles.galeria}>
            <ThemedText type="smallBold">Galería de fotos</ThemedText>
            <ThemedText type="small">
              No requiere permiso. La app usa el selector del sistema y solo recibe la foto que
              elegís.
            </ThemedText>
          </ThemedView>
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
  galeria: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
});
