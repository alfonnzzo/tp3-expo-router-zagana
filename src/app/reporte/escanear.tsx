import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { PantallaPrevia } from '@/components/pantalla-previa';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { TEXTOS } from '@/lib/permisos';
import { actualizarBorrador } from '@/lib/reportes';

export default function EscanearAula() {
  const { estado, abrirAjustes } = usePermiso('camara');
  const yaLeido = useRef(false);
  const [codigo, setCodigo] = useState('');
  const [rechazado, setRechazado] = useState(false);

  function guardarAula(aula: string) {
    actualizarBorrador({ aula });
    router.back();
  }

  function alLeer(resultado: { data: string }) {
    if (yaLeido.current) {
      return;
    }
    yaLeido.current = true;
    guardarAula(resultado.data);
  }

  function usarCodigo() {
    if (codigo.trim() === '') {
      return;
    }
    guardarAula(codigo.trim());
  }

  if (estado === 'cargando') {
    return (
      <ThemedView style={styles.centrado}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (estado === 'concedido') {
    return (
      <ThemedView style={styles.camara}>
        <CameraView
          style={styles.camara}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={alLeer}
        />
        <ThemedText type="small" style={styles.ayuda}>
          Apuntá al código QR pegado en la puerta del aula.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      {estado === 'preguntable' && !rechazado ? (
        <PantallaPrevia recurso="camara" onContinuar={() => setRechazado(true)} />
      ) : null}
      {estado === 'preguntable' && rechazado ? (
        <ThemedView style={styles.bloque}>
          <ThemedText>
            No diste permiso a la cámara. Escribí el código del aula o tocá Intentar de nuevo.
          </ThemedText>
          <Boton titulo="Intentar de nuevo" variante="secundario" onPress={() => setRechazado(false)} />
        </ThemedView>
      ) : null}
      {estado === 'bloqueado' ? (
        <ThemedView style={styles.bloque}>
          <ThemedText type="subtitle">Cámara bloqueada</ThemedText>
          <ThemedText>
            No podemos abrir la cámara. Activala en Ajustes o escribí el código del aula.
          </ThemedText>
          <ThemedText type="small">Android: {TEXTOS.camara.rutaAjustesAndroid}</ThemedText>
          <ThemedText type="small">iOS: {TEXTOS.camara.rutaAjustesIos}</ThemedText>
          <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
        </ThemedView>
      ) : null}
      <ThemedView style={styles.bloque}>
        <CampoTexto
          etiqueta="Código del aula"
          valor={codigo}
          onChangeText={setCodigo}
          placeholder="Por ejemplo: Aula 4"
        />
        <Boton titulo="Usar este código" variante="secundario" onPress={usarCodigo} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camara: {
    flex: 1,
  },
  ayuda: {
    padding: Spacing.three,
    textAlign: 'center',
  },
  contenido: {
    padding: Spacing.three,
    gap: Spacing.four,
  },
  bloque: {
    gap: Spacing.three,
  },
});
