import { CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { AvisoBloqueado } from '@/components/aviso-bloqueado';
import { Boton } from '@/components/boton';
import { Explicacion } from '@/components/explicacion';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAlmacen } from '@/hooks/useAlmacen';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador } from '@/lib/almacen';

export default function Foto() {
  const router = useRouter();
  const fotoActual = useAlmacen((e) => e.borrador.fotoUri);
  const [modo, setModo] = useState<'menu' | 'camara'>('menu');
  const [error, setError] = useState<string | null>(null);

  const guardar = (uri: string) => {
    actualizarBorrador({ fotoUri: uri });
    router.back();
  };

  // El selector del sistema no necesita ningún permiso de galería (ni READ_MEDIA_IMAGES).
  const elegirDeGaleria = async () => {
    setError(null);
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!resultado.canceled) guardar(resultado.assets[0].uri);
    } catch {
      setError('No pudimos abrir la galería. Probá de nuevo.');
    }
  };

  if (modo === 'camara') {
    return <SacarFoto alGuardar={guardar} alVolver={() => setModo('menu')} />;
  }

  return (
    <Pantalla>
      {fotoActual ? (
        <Image source={{ uri: fotoActual }} style={styles.foto} contentFit="cover" />
      ) : null}
      <Boton titulo="Sacar foto" onPress={() => setModo('camara')} />
      <Boton titulo="Elegir de la galería" variante="secundario" onPress={elegirDeGaleria} />
      <ThemedText type="small" themeColor="textSecondary">
        Para elegir de la galería no hace falta ningún permiso: el sistema te muestra sus fotos y
        nosotros solo recibimos la que elijas.
      </ThemedText>
      {error ? <ThemedText type="small">{error}</ThemedText> : null}
    </Pantalla>
  );
}

function SacarFoto({ alGuardar, alVolver }: { alGuardar: (uri: string) => void; alVolver: () => void }) {
  const { estado, pedir } = usePermiso('camara');
  const camara = useRef<CameraView>(null);
  const [sacando, setSacando] = useState(false);

  if (estado === 'cargando') {
    return (
      <Pantalla centrado>
        <ActivityIndicator />
      </Pantalla>
    );
  }

  if (estado === 'preguntable') {
    return (
      <Pantalla centrado>
        <Explicacion
          recurso="camara"
          onContinuar={async () => {
            const respuesta = await pedir();
            if (respuesta.estado !== 'concedido') alVolver();
          }}
        />
      </Pantalla>
    );
  }

  if (estado === 'bloqueado') {
    return (
      <Pantalla>
        <AvisoBloqueado recurso="camara" />
        <Boton titulo="Elegir de la galería en su lugar" variante="secundario" onPress={alVolver} />
      </Pantalla>
    );
  }

  return (
    <ThemedView style={styles.camara}>
      <CameraView ref={camara} style={styles.camara} facing="back" />
      <ThemedView style={styles.obturador}>
        <Boton
          titulo="Sacar foto"
          cargando={sacando}
          onPress={async () => {
            setSacando(true);
            try {
              const foto = await camara.current?.takePictureAsync({ quality: 0.7 });
              if (foto) alGuardar(foto.uri);
            } finally {
              setSacando(false);
            }
          }}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  foto: { width: '100%', height: 220, borderRadius: Spacing.three },
  camara: { flex: 1 },
  obturador: {
    position: 'absolute',
    bottom: Spacing.five,
    left: Spacing.four,
    right: Spacing.four,
    backgroundColor: 'transparent',
  },
});
