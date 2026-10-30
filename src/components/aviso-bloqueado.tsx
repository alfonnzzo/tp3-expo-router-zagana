import { Platform, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { abrirAjustes, rutaEnAjustes, TEXTOS, type Recurso } from '@/lib/permisos';

/**
 * Permiso bloqueado: el sistema ya no muestra el diálogo, así que explicamos
 * el camino exacto en Ajustes (distinto en Android y en iOS) y mostramos la alternativa.
 */
export function AvisoBloqueado({ recurso }: { recurso: Recurso }) {
  const textos = TEXTOS[recurso];

  return (
    <ThemedView type="backgroundElement" style={styles.contenedor}>
      <ThemedText type="smallBold">Permiso de {textos.titulo.toLowerCase()} bloqueado</ThemedText>
      <ThemedText type="small">
        El sistema ya no nos deja preguntar. Para habilitarlo andá a{' '}
        {Platform.OS === 'ios' ? 'iPhone' : 'Android'}: {rutaEnAjustes(recurso)}.
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Mientras tanto: {textos.alternativa}
      </ThemedText>
      <Boton titulo="Abrir Ajustes" onPress={() => abrirAjustes()} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignSelf: 'stretch',
  },
});
