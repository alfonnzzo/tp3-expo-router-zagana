import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { Insignia } from '@/components/insignia';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useAlmacen } from '@/hooks/useAlmacen';
import {
  SEGUNDOS_SIMULACION,
  simularResolucion,
  textoUbicacion,
} from '@/lib/almacen';
import { COLOR_ESTADO, nombreCategoria } from '@/lib/catalogo';

export default function DetalleReporte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reporte = useAlmacen((e) => e.reportes.find((r) => r.id === id));
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Se valida el id: si no existe, se avisa en lugar de mostrar una pantalla vacía.
  if (!reporte) {
    return (
      <Pantalla centrado>
        <ThemedText type="subtitle">Reporte no encontrado</ThemedText>
        <ThemedText themeColor="textSecondary">No existe un reporte con el id “{String(id)}”.</ThemedText>
        <Link href="/">
          <ThemedText type="linkPrimary">Volver a Reportes</ThemedText>
        </Link>
      </Pantalla>
    );
  }

  const simular = async () => {
    const via = await simularResolucion(reporte);
    setMensaje(
      via === 'notificacion'
        ? `En ${SEGUNDOS_SIMULACION} segundos te llega una notificación (y el aviso queda en Avisos).`
        : `En ${SEGUNDOS_SIMULACION} segundos el aviso aparece en la pestaña Avisos.`,
    );
  };

  return (
    <Pantalla>
      <ThemedText type="subtitle">{reporte.titulo}</ThemedText>
      <Insignia texto={reporte.estado} color={COLOR_ESTADO[reporte.estado]} />
      <ThemedText type="small" themeColor="textSecondary">
        {nombreCategoria(reporte.categoria)} · Aula {reporte.aula}
      </ThemedText>
      {reporte.descripcion ? <ThemedText>{reporte.descripcion}</ThemedText> : null}
      <ThemedText type="small">{textoUbicacion(reporte.ubicacion)}</ThemedText>
      {reporte.fotoUri ? (
        <Image source={{ uri: reporte.fotoUri }} style={styles.foto} contentFit="cover" />
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          Sin foto
        </ThemedText>
      )}

      <Boton
        titulo="Simular resolución"
        deshabilitado={reporte.estado !== 'pendiente'}
        onPress={simular}
      />
      {mensaje ? <ThemedText type="small">{mensaje}</ThemedText> : null}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', height: 220, borderRadius: Spacing.three },
});
