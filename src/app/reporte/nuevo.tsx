import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { Campo } from '@/components/campo';
import { Pantalla } from '@/components/pantalla';
import { ThemedText } from '@/components/themed-text';
import { Acento, Spacing } from '@/constants/theme';
import { useAlmacen } from '@/hooks/useAlmacen';
import { useTheme } from '@/hooks/use-theme';
import { actualizarBorrador, crearReporte, textoUbicacion } from '@/lib/almacen';
import { CATEGORIAS } from '@/lib/catalogo';

export default function NuevoReporte() {
  const router = useRouter();
  const theme = useTheme();
  const borrador = useAlmacen((e) => e.borrador);
  const [error, setError] = useState<string | null>(null);

  // Ningún permiso se pide acá: cada uno se pide recién al tocar su botón.
  const enviar = () => {
    if (!borrador.titulo.trim() || !borrador.aula.trim()) {
      setError('Completá al menos el título y el aula.');
      return;
    }
    const reporte = crearReporte();
    router.replace({ pathname: '/reporte/[id]', params: { id: reporte.id } });
  };

  return (
    <Pantalla>
      <Campo
        etiqueta="Título"
        value={borrador.titulo}
        onChangeText={(titulo) => actualizarBorrador({ titulo })}
        placeholder="Ej.: Luz quemada en el pasillo"
      />
      <Campo
        etiqueta="Descripción"
        multiline
        value={borrador.descripcion}
        onChangeText={(descripcion) => actualizarBorrador({ descripcion })}
      />
      <Campo
        etiqueta="Aula"
        value={borrador.aula}
        onChangeText={(aula) => actualizarBorrador({ aula })}
        placeholder="Ej.: AULA-12"
        autoCapitalize="characters"
        ayuda="Escaneá el QR de la puerta o escribilo a mano."
      />
      <Boton
        titulo="Escanear QR del aula"
        variante="secundario"
        onPress={() => router.push('/reporte/escanear')}
      />

      <ThemedText type="smallBold">Categoría</ThemedText>
      <View style={styles.chips}>
        {CATEGORIAS.map((categoria) => {
          const activa = borrador.categoria === categoria.id;
          return (
            <Pressable
              key={categoria.id}
              accessibilityRole="button"
              accessibilityState={{ selected: activa }}
              onPress={() => actualizarBorrador({ categoria: categoria.id })}
              style={[
                styles.chip,
                { backgroundColor: activa ? Acento.primario : theme.backgroundElement },
              ]}>
              <ThemedText type="small" style={activa ? styles.textoActivo : undefined}>
                {categoria.nombre}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {borrador.fotoUri ? (
        <Image source={{ uri: borrador.fotoUri }} style={styles.foto} contentFit="cover" />
      ) : null}
      <Boton
        titulo={borrador.fotoUri ? 'Cambiar foto' : 'Adjuntar foto'}
        variante="secundario"
        onPress={() => router.push('/reporte/foto')}
      />

      <ThemedText type="small" themeColor="textSecondary">
        {textoUbicacion(borrador.ubicacion)}
      </ThemedText>
      <Boton
        titulo="Marcar ubicación"
        variante="secundario"
        onPress={() => router.push('/reporte/ubicacion')}
      />

      {error ? (
        <ThemedText type="small" style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      <Boton titulo="Enviar reporte" onPress={enviar} />
    </Pantalla>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.four,
  },
  textoActivo: { color: '#ffffff' },
  foto: { width: '100%', height: 200, borderRadius: Spacing.three },
  error: { color: Acento.error },
});
