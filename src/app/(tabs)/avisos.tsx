import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAlmacen } from '@/hooks/useAlmacen';
import { marcarAvisosLeidos } from '@/lib/almacen';

export default function Avisos() {
  const avisos = useAlmacen((e) => e.avisos);

  // Los avisos nuevos se muestran como tales y se marcan leídos al salir de la pestaña.
  useFocusEffect(useCallback(() => marcarAvisosLeidos, []));

  return (
    <Pantalla conPestanas>
      <ThemedText type="subtitle">Avisos</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Acá llegan los avisos aunque no hayas dado permiso de notificaciones.
      </ThemedText>

      {avisos.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Todavía no hay avisos. Aparecen cuando se resuelve uno de tus reportes.
        </ThemedText>
      ) : (
        avisos.map((aviso) => (
          <ThemedView key={aviso.id} type="backgroundElement" style={styles.tarjeta}>
            <ThemedText type="smallBold">
              {aviso.leido ? '' : '● '}
              {aviso.titulo}
            </ThemedText>
            <ThemedText type="small">{aviso.texto}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {new Date(aviso.fecha).toLocaleString('es-AR')}
            </ThemedText>
          </ThemedView>
        ))
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: { gap: Spacing.one, padding: Spacing.three, borderRadius: Spacing.three },
});
