import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { EscucharNota } from '@/components/nota-voz';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { programarAvisoResolucion } from '@/lib/notificaciones';
import {
  ETIQUETAS_CATEGORIA,
  simularResolucion,
  useAvisosActivos,
  useReporte,
} from '@/lib/reportes';
import type { EstadoReporte, UbicacionReporte } from '@/lib/tipos';

const COLOR_ESTADO: Record<EstadoReporte, ThemeColor> = {
  pendiente: 'aviso',
  'en curso': 'primario',
  resuelto: 'exito',
};

function describirUbicacion(ubicacion: UbicacionReporte | null) {
  if (ubicacion === null) {
    return 'Sin ubicación';
  }
  if (ubicacion.tipo === 'sector') {
    return 'Sector: ' + ubicacion.sector;
  }
  if (ubicacion.aproximada) {
    return 'Ubicación aproximada';
  }
  return 'Latitud ' + ubicacion.latitud.toFixed(3) + ', longitud ' + ubicacion.longitud.toFixed(3);
}

export default function DetalleReporte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const idLimpio = Array.isArray(id) ? id[0] : id;
  const reporte = useReporte(idLimpio ?? '');
  const notificaciones = usePermiso('notificaciones');
  const avisosActivos = useAvisosActivos();
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function simular() {
    if (reporte === null || reporte.estado === 'resuelto') {
      return;
    }
    const resuelto = simularResolucion(reporte.id);
    if (resuelto === null) {
      return;
    }
    if (notificaciones.estado === 'concedido' && avisosActivos) {
      try {
        await programarAvisoResolucion(resuelto);
        setMensaje('Te enviaremos una notificación en 10 segundos. El aviso también está en Avisos.');
      } catch {
        setMensaje('No pudimos programar la notificación. El aviso quedó en la bandeja de Avisos.');
      }
      return;
    }
    setMensaje('El aviso quedó en la bandeja de Avisos.');
  }

  if (reporte === null) {
    return (
      <ThemedView style={styles.contenido}>
        <ThemedText type="subtitle">Reporte no encontrado</ThemedText>
        <ThemedText>El reporte que buscás no existe o el enlace no es válido.</ThemedText>
        <Boton titulo="Volver al inicio" onPress={() => router.replace('/')} />
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <ThemedText type="subtitle">{reporte.titulo}</ThemedText>
      <ThemedText type="smallBold" themeColor={COLOR_ESTADO[reporte.estado]}>
        Estado: {reporte.estado}
      </ThemedText>
      <ThemedView type="backgroundElement" style={styles.caja}>
        <ThemedText type="smallBold">Descripción</ThemedText>
        <ThemedText>{reporte.descripcion === '' ? 'Sin descripción' : reporte.descripcion}</ThemedText>
        <ThemedText type="smallBold">Aula</ThemedText>
        <ThemedText>{reporte.aula === '' ? 'Sin aula' : reporte.aula}</ThemedText>
        <ThemedText type="smallBold">Categoría</ThemedText>
        <ThemedText>{ETIQUETAS_CATEGORIA[reporte.categoria]}</ThemedText>
        <ThemedText type="smallBold">Ubicación</ThemedText>
        <ThemedText>{describirUbicacion(reporte.ubicacion)}</ThemedText>
      </ThemedView>
      {reporte.fotoUri ? <Image source={{ uri: reporte.fotoUri }} style={styles.foto} /> : null}
      {reporte.notaVozUri ? <EscucharNota uri={reporte.notaVozUri} /> : null}
      <Boton
        titulo="Simular resolución"
        onPress={simular}
        disabled={reporte.estado === 'resuelto'}
      />
      {mensaje ? <ThemedText themeColor="exito">{mensaje}</ThemedText> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    flexGrow: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  caja: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  foto: {
    width: '100%',
    height: 240,
    borderRadius: Spacing.three,
  },
});
