import { router } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { EstadoEtiqueta } from '@/components/estado-etiqueta';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, type ThemeColor } from '@/constants/theme';
import { usePermiso } from '@/hooks/usePermiso';
import { TEXTOS } from '@/lib/permisos';
import type { Recurso } from '@/lib/tipos';

type FilaPermisoProps = {
  recurso: Recurso;
};

export function FilaPermiso({ recurso }: FilaPermisoProps) {
  const { estado, parcial, detalle, plataforma, abrirAjustes } = usePermiso(recurso);

  let texto = 'Revisando';
  let color: ThemeColor = 'textSecondary';

  if (estado === 'concedido' && parcial) {
    texto = 'Parcial';
    color = 'aviso';
  } else if (estado === 'concedido') {
    texto = 'Concedido';
    color = 'exito';
  } else if (estado === 'preguntable') {
    texto = 'Preguntable';
    color = 'primario';
  } else if (estado === 'bloqueado') {
    texto = 'Bloqueado';
    color = 'peligro';
  }

  function abrirPantallaPrevia() {
    router.push({ pathname: '/permisos/[recurso]', params: { recurso } });
  }

  return (
    <ThemedView type="backgroundElement" style={styles.fila}>
      <ThemedText type="smallBold">{TEXTOS[recurso].titulo}</ThemedText>
      <EstadoEtiqueta texto={texto} color={color} />
      <ThemedText type="small" themeColor="textSecondary">
        Plataforma: {plataforma}
      </ThemedText>
      {detalle !== null ? <ThemedText type="small">{detalle}</ThemedText> : null}
      {estado === 'preguntable' ? (
        <Boton titulo="Pedir permiso" onPress={abrirPantallaPrevia} />
      ) : null}
      {estado === 'bloqueado' && plataforma === 'web' ? (
        <ThemedText type="small">
          En el navegador: tocá el ícono a la izquierda de la dirección, activá{' '}
          {TEXTOS[recurso].titulo} y recargá la página.
        </ThemedText>
      ) : null}
      {estado === 'bloqueado' && plataforma !== 'web' ? (
        <Boton titulo="Abrir Ajustes" onPress={abrirAjustes} />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fila: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
});
