import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { SelectorSector } from '@/components/selector-sector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { TEXTOS } from '@/lib/permisos';
import { actualizarBorrador, useBorrador } from '@/lib/reportes';
import { obtenerUbicacion } from '@/lib/ubicacion';

export default function UbicacionReporte() {
  const borrador = useBorrador();
  const { estado, abrirAjustes } = usePermiso('ubicacion');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ubicacion = borrador.ubicacion;

  async function usarUbicacionActual() {
    setError(null);
    if (estado === 'cargando') {
      return;
    }
    if (estado === 'preguntable') {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'ubicacion' } });
      return;
    }
    if (estado === 'bloqueado') {
      return;
    }
    setBuscando(true);
    const obtenida = await obtenerUbicacion();
    setBuscando(false);
    if (obtenida === null) {
      setError('No pudimos obtener tu ubicación. Elegí el sector a mano.');
      return;
    }
    actualizarBorrador({
      ubicacion: {
        tipo: 'gps',
        latitud: obtenida.latitud,
        longitud: obtenida.longitud,
        aproximada: obtenida.aproximada,
      },
    });
  }

  function describir() {
    if (ubicacion === null) {
      return 'Todavía no marcaste una ubicación.';
    }
    if (ubicacion.tipo === 'sector') {
      return 'Sector elegido: ' + ubicacion.sector;
    }
    if (ubicacion.aproximada) {
      return 'Ubicación aproximada';
    }
    return 'Latitud ' + ubicacion.latitud.toFixed(3) + ', longitud ' + ubicacion.longitud.toFixed(3);
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <ThemedView type="backgroundElement" style={styles.caja}>
        <ThemedText type="smallBold">Ubicación marcada</ThemedText>
        <ThemedText>{describir()}</ThemedText>
      </ThemedView>
      <Boton titulo="Usar mi ubicación actual" onPress={usarUbicacionActual} disabled={buscando} />
      {buscando ? <ActivityIndicator size="large" /> : null}
      {estado === 'bloqueado' ? (
        <ThemedView type="backgroundElement" style={styles.caja}>
          <ThemedText>
            La ubicación está bloqueada. Activala en Ajustes o elegí el sector a mano.
          </ThemedText>
          <ThemedText type="small">Android: {TEXTOS.ubicacion.rutaAjustesAndroid}</ThemedText>
          <ThemedText type="small">iOS: {TEXTOS.ubicacion.rutaAjustesIos}</ThemedText>
          <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
        </ThemedView>
      ) : null}
      {error ? (
        <ThemedText type="small" themeColor="peligro">
          {error}
        </ThemedText>
      ) : null}
      <ThemedText type="small" themeColor="textSecondary">
        También podés elegir el sector a mano.
      </ThemedText>
      <SelectorSector
        seleccionado={ubicacion !== null && ubicacion.tipo === 'sector' ? ubicacion.sector : null}
        onSeleccionar={(sector) => actualizarBorrador({ ubicacion: { tipo: 'sector', sector } })}
      />
      <Boton titulo="Listo" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  caja: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
});
