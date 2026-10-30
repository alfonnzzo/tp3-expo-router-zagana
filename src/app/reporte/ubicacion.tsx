import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AvisoBloqueado } from '@/components/aviso-bloqueado';
import { Boton } from '@/components/boton';
import { Explicacion } from '@/components/explicacion';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { actualizarBorrador } from '@/lib/almacen';
import { SECTORES } from '@/lib/catalogo';
import { obtenerUbicacion } from '@/lib/ubicacion';

export default function Ubicacion() {
  const router = useRouter();
  const { estado, pedir } = usePermiso('ubicacion');
  // La pantalla previa solo aparece cuando la persona toca "Usar mi ubicación actual".
  const [mostrarPrevia, setMostrarPrevia] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const usarUbicacion = async () => {
    setBuscando(true);
    setMensaje(null);
    const ubicacion = await obtenerUbicacion();
    setBuscando(false);

    if (!ubicacion) {
      setMensaje('No pudimos obtener tu ubicación. Elegí el sector a mano.');
      return;
    }
    actualizarBorrador({
      // Si es aproximada no guardamos coordenadas: se muestra "Ubicación aproximada".
      ubicacion: ubicacion.aproximada
        ? { tipo: 'gps', aproximada: true }
        : { tipo: 'gps', aproximada: false, latitud: ubicacion.latitud, longitud: ubicacion.longitud },
    });
    router.back();
  };

  const alTocarUbicacion = () => {
    if (estado === 'concedido') usarUbicacion();
    else if (estado === 'preguntable') setMostrarPrevia(true);
    else if (estado === 'bloqueado') setMensaje('El permiso está bloqueado: mirá cómo habilitarlo abajo.');
  };

  const elegirSector = (sector: string) => {
    actualizarBorrador({ ubicacion: { tipo: 'sector', sector } });
    router.back();
  };

  if (mostrarPrevia && estado === 'preguntable') {
    return (
      <Pantalla centrado>
        <Explicacion
          recurso="ubicacion"
          onContinuar={async () => {
            const respuesta = await pedir();
            setMostrarPrevia(false);
            if (respuesta.estado === 'concedido') usarUbicacion();
            else setMensaje('Sin permiso de ubicación: elegí el sector a mano.');
          }}
        />
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <ThemedText>Marcá dónde está el problema usando tu ubicación actual.</ThemedText>
      <Boton
        titulo="Usar mi ubicación actual"
        onPress={alTocarUbicacion}
        cargando={buscando}
        deshabilitado={estado === 'cargando'}
      />
      {mensaje ? <ThemedText type="small">{mensaje}</ThemedText> : null}
      {estado === 'bloqueado' ? <AvisoBloqueado recurso="ubicacion" /> : null}

      <ThemedText type="smallBold">O elegí el sector a mano</ThemedText>
      <View style={styles.sectores}>
        {SECTORES.map((sector) => (
          <Pressable
            key={sector}
            accessibilityRole="button"
            onPress={() => elegirSector(sector)}>
            <ThemedView type="backgroundElement" style={styles.sector}>
              <ThemedText type="small">{sector}</ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </View>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  sectores: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  sector: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
});
