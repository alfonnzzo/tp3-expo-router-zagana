import {
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { TEXTOS } from '@/lib/permisos';

type NotaVozProps = {
  uri: string | null;
  onGrabada: (uri: string | null) => void;
};

export function NotaVoz({ uri, onGrabada }: NotaVozProps) {
  const { estado, abrirAjustes } = usePermiso('microfono');
  const grabador = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const estadoGrabador = useAudioRecorderState(grabador);
  const [intentoBloqueado, setIntentoBloqueado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function empezar() {
    setError(null);
    if (estado === 'cargando') {
      return;
    }
    if (estado === 'preguntable') {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'microfono' } });
      return;
    }
    if (estado === 'bloqueado') {
      setIntentoBloqueado(true);
      return;
    }
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await grabador.prepareToRecordAsync();
      grabador.record();
    } catch {
      setError('No se pudo empezar a grabar. Escribí la descripción a mano.');
    }
  }

  async function terminar() {
    try {
      await grabador.stop();
      await setAudioModeAsync({ allowsRecording: false });
      onGrabada(grabador.uri);
    } catch {
      setError('No se pudo guardar la nota de voz.');
    }
  }

  return (
    <ThemedView style={styles.bloque}>
      <ThemedText type="smallBold">Nota de voz</ThemedText>
      {uri ? (
        <EscucharNota uri={uri} />
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          Sin nota de voz. Es opcional.
        </ThemedText>
      )}
      {estadoGrabador.isRecording ? (
        <Boton titulo="Terminar grabación" onPress={terminar} />
      ) : (
        <Boton titulo="Grabar nota de voz" variante="secundario" onPress={empezar} />
      )}
      {uri && !estadoGrabador.isRecording ? (
        <Boton titulo="Quitar nota de voz" variante="secundario" onPress={() => onGrabada(null)} />
      ) : null}
      {intentoBloqueado && estado === 'bloqueado' ? (
        <ThemedView type="backgroundElement" style={styles.aviso}>
          <ThemedText>
            El micrófono está bloqueado. Activalo en Ajustes o escribí la descripción a mano.
          </ThemedText>
          <ThemedText type="small">Android: {TEXTOS.microfono.rutaAjustesAndroid}</ThemedText>
          <ThemedText type="small">iOS: {TEXTOS.microfono.rutaAjustesIos}</ThemedText>
          <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
        </ThemedView>
      ) : null}
      {error ? (
        <ThemedText type="small" themeColor="peligro">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

export function EscucharNota({ uri }: { uri: string }) {
  const reproductor = useAudioPlayer(uri);

  function escuchar() {
    reproductor.seekTo(0);
    reproductor.play();
  }

  return <Boton titulo="Escuchar nota de voz" variante="secundario" onPress={escuchar} />;
}

const styles = StyleSheet.create({
  bloque: {
    gap: Spacing.two,
  },
  aviso: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
});
