import { Link, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Platform, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { Insignia } from '@/components/insignia';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Acento, Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { RECURSOS, TEXTOS, type Estado, type Recurso } from '@/lib/permisos';

const ETIQUETA: Record<Estado, string> = {
  cargando: 'Cargando',
  concedido: 'Concedido',
  preguntable: 'Preguntable',
  bloqueado: 'Bloqueado',
};

const COLOR: Record<Estado, string> = {
  cargando: '#8a8f98',
  concedido: Acento.exito,
  preguntable: Acento.aviso,
  bloqueado: Acento.error,
};

function FilaPermiso({ recurso }: { recurso: Recurso }) {
  const router = useRouter();
  const { estado, parcial, detalle, actualizar, abrirAjustes } = usePermiso(recurso);

  // Al cambiar de pestaña o volver de un modal, se vuelve a leer el estado real.
  useFocusEffect(useCallback(actualizar, [actualizar]));

  return (
    <ThemedView type="backgroundElement" style={styles.fila}>
      <ThemedText type="smallBold">{TEXTOS[recurso].titulo}</ThemedText>
      <Insignia
        texto={parcial ? `${ETIQUETA[estado]} · parcial` : ETIQUETA[estado]}
        color={parcial ? Acento.aviso : COLOR[estado]}
      />
      <ThemedText type="small" themeColor="textSecondary">
        Plataforma: {Platform.OS}
        {detalle ? ` · ${detalle}` : ''}
      </ThemedText>

      {estado === 'preguntable' && (
        <Boton titulo="Pedir permiso" onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso } })} />
      )}
      {estado === 'bloqueado' && <Boton titulo="Abrir Ajustes" onPress={() => abrirAjustes()} />}
      {estado === 'concedido' && parcial && (
        <Boton titulo="Cambiar en Ajustes" variante="secundario" onPress={() => abrirAjustes()} />
      )}
    </ThemedView>
  );
}

export default function Permisos() {
  return (
    <Pantalla conPestanas>
      <ThemedText type="subtitle">Permisos</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        Estado real de cada permiso. Si lo cambiás desde Ajustes, se actualiza al volver a la app.
      </ThemedText>

      {RECURSOS.map((recurso) => (
        <FilaPermiso key={recurso} recurso={recurso} />
      ))}

      <ThemedView type="backgroundElement" style={styles.fila}>
        <ThemedText type="smallBold">Galería de fotos</ThemedText>
        <Insignia texto="No necesita permiso" color={Acento.primario} />
        <ThemedText type="small" themeColor="textSecondary">
          Usamos el selector del sistema: solo vemos la foto que elegís.
        </ThemedText>
      </ThemedView>

      <Link href="/ajustes-app" style={styles.enlace}>
        <ThemedText type="linkPrimary">Ajustes de la app</ThemedText>
      </Link>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: { gap: Spacing.two, padding: Spacing.three, borderRadius: Spacing.three },
  enlace: { alignSelf: 'center' },
});
