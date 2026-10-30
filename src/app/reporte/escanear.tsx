import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { AvisoBloqueado } from '@/components/aviso-bloqueado';
import { Boton } from '@/components/boton';
import { Campo } from '@/components/campo';
import { Explicacion } from '@/components/explicacion';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador } from '@/lib/almacen';

export default function Escanear() {
  const router = useRouter();
  const { estado, pedir } = usePermiso('camara');
  const [codigo, setCodigo] = useState('');
  const leido = useRef(false);

  const usarCodigo = (valor: string) => {
    actualizarBorrador({ aula: valor.trim().slice(0, 40) });
    router.back();
  };

  // 1) cargando
  if (estado === 'cargando') {
    return (
      <Pantalla centrado>
        <ActivityIndicator />
        <ThemedText themeColor="textSecondary">Revisando el permiso de cámara…</ThemedText>
      </Pantalla>
    );
  }

  // 2) concedido
  if (estado === 'concedido') {
    return (
      <ThemedView style={styles.camara}>
        <CameraView
          style={styles.camara}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => {
            if (leido.current) return;
            leido.current = true;
            usarCodigo(data);
          }}
        />
        <ThemedText type="smallBold" style={styles.ayuda}>
          Apuntá al QR de la puerta del aula
        </ThemedText>
      </ThemedView>
    );
  }

  // 3) preguntable: pantalla previa; si no lo da, volvemos al formulario sin insistir.
  if (estado === 'preguntable') {
    return (
      <Pantalla centrado>
        <Explicacion
          recurso="camara"
          onContinuar={async () => {
            const respuesta = await pedir();
            if (respuesta.estado !== 'concedido') router.back();
          }}
        />
      </Pantalla>
    );
  }

  // 4) bloqueado: camino a Ajustes y alternativa (código a mano).
  return (
    <Pantalla>
      <AvisoBloqueado recurso="camara" />
      <Campo
        etiqueta="Código del aula"
        value={codigo}
        onChangeText={setCodigo}
        autoCapitalize="characters"
        placeholder="Ej.: AULA-12"
      />
      <Boton titulo="Usar este código" deshabilitado={!codigo.trim()} onPress={() => usarCodigo(codigo)} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  camara: { flex: 1 },
  ayuda: {
    position: 'absolute',
    bottom: Spacing.five,
    alignSelf: 'center',
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
});
