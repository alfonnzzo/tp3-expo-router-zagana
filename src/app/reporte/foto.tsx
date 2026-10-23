import { launchCameraAsync, launchImageLibraryAsync, type ImagePickerResult } from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { TEXTOS } from '@/lib/permisos';
import { actualizarBorrador, useBorrador } from '@/lib/reportes';

export default function FotoReporte() {
  const borrador = useBorrador();
  const { estado, abrirAjustes } = usePermiso('camara');
  const [intentoBloqueado, setIntentoBloqueado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function guardarResultado(resultado: ImagePickerResult) {
    if (!resultado.canceled) {
      actualizarBorrador({ fotoUri: resultado.assets[0].uri });
    }
  }

  async function sacarFoto() {
    setError(null);
    if (estado === 'cargando') {
      return;
    }
    if (estado === 'preguntable') {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } });
      return;
    }
    if (estado === 'bloqueado') {
      setIntentoBloqueado(true);
      return;
    }
    try {
      const resultado = await launchCameraAsync({ mediaTypes: ['images'] });
      guardarResultado(resultado);
    } catch {
      setError('No se pudo abrir la cámara. Probá elegir una foto de la galería.');
    }
  }

  async function elegirDeGaleria() {
    setError(null);
    try {
      const resultado = await launchImageLibraryAsync({ mediaTypes: ['images'] });
      guardarResultado(resultado);
    } catch {
      setError('No se pudo abrir la galería.');
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      {borrador.fotoUri ? (
        <Image source={{ uri: borrador.fotoUri }} style={styles.foto} />
      ) : (
        <ThemedText themeColor="textSecondary">Todavía no elegiste una foto.</ThemedText>
      )}
      <Boton titulo="Sacar foto" onPress={sacarFoto} />
      {intentoBloqueado && estado === 'bloqueado' ? (
        <ThemedView type="backgroundElement" style={styles.aviso}>
          <ThemedText>
            La cámara está bloqueada. Activala en Ajustes o elegí una foto de la galería.
          </ThemedText>
          <ThemedText type="small">Android: {TEXTOS.camara.rutaAjustesAndroid}</ThemedText>
          <ThemedText type="small">iOS: {TEXTOS.camara.rutaAjustesIos}</ThemedText>
          <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
        </ThemedView>
      ) : null}
      <Boton titulo="Elegir de la galería" variante="secundario" onPress={elegirDeGaleria} />
      {error ? (
        <ThemedText type="small" themeColor="peligro">
          {error}
        </ThemedText>
      ) : null}
      {borrador.fotoUri ? (
        <Boton
          titulo="Quitar foto"
          variante="secundario"
          onPress={() => actualizarBorrador({ fotoUri: null })}
        />
      ) : null}
      <Boton titulo="Listo" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  foto: {
    width: '100%',
    height: 280,
    borderRadius: Spacing.three,
  },
  aviso: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
});
