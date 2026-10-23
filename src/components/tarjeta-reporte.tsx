import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { EstadoEtiqueta } from '@/components/estado-etiqueta';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { ETIQUETAS_CATEGORIA } from '@/lib/reportes';
import type { EstadoReporte, Reporte } from '@/lib/tipos';

const COLORES_ESTADO: Record<EstadoReporte, ThemeColor> = {
  pendiente: 'aviso',
  'en curso': 'primario',
  resuelto: 'exito',
};

type TarjetaReporteProps = {
  reporte: Reporte;
};

export function TarjetaReporte({ reporte }: TarjetaReporteProps) {
  function abrir() {
    router.push({ pathname: '/reporte/[id]', params: { id: reporte.id } });
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={'Abrir reporte ' + reporte.titulo}
      onPress={abrir}>
      <ThemedView type="backgroundElement" style={styles.tarjeta}>
        <EstadoEtiqueta texto={reporte.estado} color={COLORES_ESTADO[reporte.estado]} />
        <ThemedText type="smallBold">{reporte.titulo}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {reporte.aula} - {ETIQUETAS_CATEGORIA[reporte.categoria]}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
});
