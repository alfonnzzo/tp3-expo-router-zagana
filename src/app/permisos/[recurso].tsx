import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { AvisoBloqueado } from '@/components/aviso-bloqueado';
import { Boton } from '@/components/boton';
import { Explicacion } from '@/components/explicacion';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { usePermiso } from '@/hooks/usePermiso';
import { esRecurso, type Recurso } from '@/lib/permisos';

export default function PermisoPrevio() {
  const { recurso } = useLocalSearchParams<{ recurso: string }>();

  if (!esRecurso(recurso)) {
    return (
      <Pantalla centrado>
        <ThemedText>No existe el permiso “{String(recurso)}”.</ThemedText>
      </Pantalla>
    );
  }
  return <Contenido recurso={recurso} />;
}

function Contenido({ recurso }: { recurso: Recurso }) {
  const router = useRouter();
  const { estado, pedir } = usePermiso(recurso);

  return (
    <Pantalla centrado>
      {estado === 'cargando' && <ActivityIndicator />}

      {estado === 'preguntable' && (
        <Explicacion
          recurso={recurso}
          onContinuar={async () => {
            await pedir();
            // Sea cual sea la respuesta, volvemos: no insistimos con otro pedido.
            router.back();
          }}
        />
      )}

      {estado === 'bloqueado' && <AvisoBloqueado recurso={recurso} />}

      {estado === 'concedido' && (
        <>
          <ThemedText style={styles.centro}>Este permiso ya está concedido.</ThemedText>
          <Boton titulo="Continuar" onPress={() => router.back()} />
        </>
      )}
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  centro: { textAlign: 'center' },
});
