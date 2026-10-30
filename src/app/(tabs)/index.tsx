import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { Insignia } from '@/components/insignia';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAlmacen } from '@/hooks/useAlmacen';
import { limpiarBorrador } from '@/lib/almacen';
import { COLOR_ESTADO, nombreCategoria } from '@/lib/catalogo';

export default function Reportes() {
  const router = useRouter();
  const reportes = useAlmacen((e) => e.reportes);

  return (
    <Pantalla conPestanas>
      <ThemedText type="subtitle">Reportes</ThemedText>
      <Boton
        titulo="Nuevo reporte"
        onPress={() => {
          limpiarBorrador();
          router.push('/reporte/nuevo');
        }}
      />

      {reportes.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Todavía no reportaste nada. Tocá “Nuevo reporte” para avisar de un desperfecto del edificio.
        </ThemedText>
      ) : (
        reportes.map((reporte) => (
          <Pressable
            key={reporte.id}
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/reporte/[id]', params: { id: reporte.id } })}>
            <ThemedView type="backgroundElement" style={styles.tarjeta}>
              <ThemedText type="smallBold">{reporte.titulo}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {nombreCategoria(reporte.categoria)} · Aula {reporte.aula}
              </ThemedText>
              <Insignia texto={reporte.estado} color={COLOR_ESTADO[reporte.estado]} />
            </ThemedView>
          </Pressable>
        ))
      )}

      <Link href="/ajustes-app" style={styles.enlace}>
        <ThemedText type="linkPrimary">Ajustes de avisos</ThemedText>
      </Link>
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  tarjeta: { gap: Spacing.one, padding: Spacing.three, borderRadius: Spacing.three },
  enlace: { alignSelf: 'center' },
});
