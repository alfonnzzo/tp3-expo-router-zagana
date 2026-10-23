import { CameraView } from 'expo-camera';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const [camaraAbierta, setCamaraAbierta] = useState(false);
  const [capturando, setCapturando] = useState(false);
  const camara = useRef<CameraView>(null);

  async function capturar() {
    if (camara.current === null) {
      return;
    }
    setCapturando(true);
    try {
      const foto = await camara.current.takePictureAsync();
      actualizarBorrador({ fotoUri: foto.uri });
      setCamaraAbierta(false);
    } catch {
      setError('No se pudo sacar la foto. Probá de nuevo o elegí una de la galería.');
      setCamaraAbierta(false);
    }
    setCapturando(false);
  }

  function falloCamara() {
    setError(
      'No pudimos abrir la cámara. Puede estar en uso por otra app. Probá elegir una foto de la galería.',
    );
    setCamaraAbierta(false);
  }

  function sacarFoto() {
    setError(null);
    if (estado === 'cargando') {
      return;
    }
    if (estado === 'preguntable') {
      router.push({
        pathname: '/permisos/[recurso]',
        params: { recurso: 'camara' },
      });
      return;
    }
    if (estado === 'bloqueado') {
      setIntentoBloqueado(true);
      return;
    }
    setCamaraAbierta(true);
  }

  async function elegirDeGaleria() {
    setError(null);
    try {
      const resultado = await launchImageLibraryAsync({
        mediaTypes: ['images'],
      });
      if (!resultado.canceled) {
        actualizarBorrador({ fotoUri: resultado.assets[0].uri });
      }
    } catch {
      setError('No se pudo abrir la galería.');
    }
  }

  if (camaraAbierta && estado === 'concedido') {
    return (
      <SafeAreaView style={styles.pantalla} edges={['top', 'bottom']}>
        <CameraView ref={camara} style={styles.pantalla} facing="back" onMountError={falloCamara} />
        <ThemedView style={styles.botonesCamara}>
          <Boton
            titulo={capturando ? 'Guardando...' : 'Capturar'}
            onPress={capturar}
            disabled={capturando}
          />
          <Boton titulo="Cancelar" variante="secundario" onPress={() => setCamaraAbierta(false)} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.pantalla} edges={['top']}>
      <ScrollView contentContainerStyle={styles.contenido} showsVerticalScrollIndicator={false}>
        <ThemedText type="subtitle">Foto del desperfecto</ThemedText>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
  },
  contenido: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  foto: {
    width: '100%',
    height: 280,
    borderRadius: Spacing.three,
  },
  botonesCamara: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  aviso: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
});
