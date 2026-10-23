import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch } from 'react-native';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { TEXTOS } from '@/lib/permisos';
import { cambiarAvisosActivos, useAvisosActivos } from '@/lib/reportes';

export default function AjustesAppScreen() {
  const avisosActivos = useAvisosActivos();
  const { estado, abrirAjustes } = usePermiso('notificaciones');
  const [intento, setIntento] = useState(false);

  const encendido = avisosActivos && estado === 'concedido';

  useEffect(() => {
    if (intento && estado === 'concedido') {
      cambiarAvisosActivos(true);
    }
  }, [intento, estado]);

  const mostrarBloqueo = intento && estado === 'bloqueado';

  function cambiar(valor: boolean) {
    if (!valor) {
      cambiarAvisosActivos(false);
      setIntento(false);
      return;
    }
    if (estado === 'concedido') {
      cambiarAvisosActivos(true);
    } else if (estado === 'preguntable') {
      setIntento(true);
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones' } });
    } else if (estado === 'bloqueado') {
      setIntento(true);
    }
  }

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedView type="backgroundElement" style={styles.fila}>
        <ThemedText style={styles.textoFila}>Avisarme cuando se resuelva mi reporte</ThemedText>
        <Switch
          accessibilityLabel="Avisarme cuando se resuelva mi reporte"
          value={encendido}
          onValueChange={cambiar}
        />
      </ThemedView>
      {mostrarBloqueo ? (
        <ThemedView type="backgroundElement" style={styles.aviso}>
          <ThemedText type="smallBold">Las notificaciones están bloqueadas</ThemedText>
          <ThemedText type="small">Android: {TEXTOS.notificaciones.rutaAjustesAndroid}</ThemedText>
          <ThemedText type="small">iOS: {TEXTOS.notificaciones.rutaAjustesIos}</ThemedText>
          <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
        </ThemedView>
      ) : null}
      <ThemedText type="small" themeColor="textSecondary">
        Si no activás los avisos, igual vas a verlos en la pestaña Avisos.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  textoFila: {
    flex: 1,
  },
  aviso: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
});
