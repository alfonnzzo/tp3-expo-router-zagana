import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Switch } from 'react-native';

import { AvisoBloqueado } from '@/components/aviso-bloqueado';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Acento, Spacing } from '@/constants/theme';
import { useAlmacen } from '@/hooks/useAlmacen';
import { usePermiso } from '@/hooks/usePermiso';
import { activarAvisos } from '@/lib/almacen';

export default function AjustesApp() {
  const router = useRouter();
  const avisar = useAlmacen((e) => e.avisarResolucion);
  const { estado } = usePermiso('notificaciones');
  const pendiente = useRef(false);
  const estadoActual = useRef(estado);

  useEffect(() => {
    estadoActual.current = estado;
  }, [estado]);

  // Si la persona volvió de la pantalla previa con el permiso concedido, se enciende el interruptor.
  useFocusEffect(
    useCallback(() => {
      if (pendiente.current && estadoActual.current === 'concedido') activarAvisos(true);
      pendiente.current = false;
    }, []),
  );

  const alCambiar = (valor: boolean) => {
    if (!valor) return activarAvisos(false);

    // El permiso se pide recién acá, al activar el interruptor.
    if (estado === 'concedido') return activarAvisos(true);
    if (estado === 'preguntable') {
      pendiente.current = true;
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones' } });
    }
  };

  const activo = avisar && estado === 'concedido';

  return (
    <Pantalla>
      <ThemedView type="backgroundElement" style={styles.fila}>
        <ThemedText type="smallBold" style={styles.texto}>
          Avisarme cuando se resuelva mi reporte
        </ThemedText>
        <Switch
          accessibilityLabel="Avisarme cuando se resuelva mi reporte"
          value={activo}
          disabled={estado === 'cargando' || estado === 'bloqueado'}
          onValueChange={alCambiar}
          trackColor={{ true: Acento.primario }}
        />
      </ThemedView>

      {estado === 'bloqueado' ? (
        <AvisoBloqueado recurso="notificaciones" />
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          {avisar && estado !== 'concedido'
            ? 'Las notificaciones están desactivadas en el sistema: los avisos te esperan en la pestaña Avisos.'
            : 'Al activarlo te vamos a pedir permiso para enviar notificaciones. Si no lo das, los avisos llegan igual a la pestaña Avisos.'}
        </ThemedText>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  texto: { flex: 1 },
});
