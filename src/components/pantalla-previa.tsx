import { ActivityIndicator, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { TEXTOS } from '@/lib/permisos';
import type { Recurso } from '@/lib/tipos';

type PantallaPreviaProps = {
  recurso: Recurso;
  onContinuar?: () => void;
};

export function PantallaPrevia({ recurso, onContinuar }: PantallaPreviaProps) {
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);
  const textos = TEXTOS[recurso];

  async function continuar() {
    if (estado === 'preguntable') {
      await pedir();
    }
    onContinuar?.();
  }

  if (estado === 'cargando') {
    return (
      <ThemedView style={[styles.contenedor, styles.centrado]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (estado === 'bloqueado') {
    return (
      <ThemedView style={styles.contenedor}>
        <ThemedText type="subtitle">{textos.titulo}</ThemedText>
        <ThemedText>
          Este permiso está bloqueado. El sistema ya no muestra el diálogo. Debés activarlo en Ajustes.
        </ThemedText>
        <ThemedView type="backgroundElement" style={styles.caja}>
          <ThemedText type="smallBold">En Android</ThemedText>
          <ThemedText type="small">{textos.rutaAjustesAndroid}</ThemedText>
        </ThemedView>
        <ThemedView type="backgroundElement" style={styles.caja}>
          <ThemedText type="smallBold">En iOS</ThemedText>
          <ThemedText type="small">{textos.rutaAjustesIos}</ThemedText>
        </ThemedView>
        <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="subtitle">{textos.titulo}</ThemedText>
      <ThemedText>{textos.beneficio}</ThemedText>
      {estado === 'concedido' ? (
        <ThemedText type="small" themeColor="exito">
          Este permiso ya está concedido.
        </ThemedText>
      ) : null}
      <ThemedText type="small" themeColor="textSecondary">
        Podés cambiar esta decisión cuando quieras en Ajustes.
      </ThemedText>
      <Boton titulo="Continuar" onPress={continuar} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  centrado: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  caja: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
});
