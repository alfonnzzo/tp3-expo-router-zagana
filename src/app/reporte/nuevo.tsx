import { router } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { CampoTexto } from '@/components/campo-texto';
import { NotaVoz } from '@/components/nota-voz';
import { SelectorOpciones } from '@/components/selector-opciones';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  actualizarBorrador,
  CATEGORIAS,
  crearReporte,
  ETIQUETAS_CATEGORIA,
  useBorrador,
} from '@/lib/reportes';
import type { Categoria, UbicacionReporte } from '@/lib/tipos';

function describirUbicacion(ubicacion: UbicacionReporte | null) {
  if (ubicacion === null) {
    return 'Sin ubicación. Es opcional.';
  }
  if (ubicacion.tipo === 'sector') {
    return 'Sector: ' + ubicacion.sector;
  }
  if (ubicacion.aproximada) {
    return 'Ubicación aproximada';
  }
  return 'Latitud ' + ubicacion.latitud.toFixed(3) + ', longitud ' + ubicacion.longitud.toFixed(3);
}

export default function NuevoReporte() {
  const borrador = useBorrador();
  const [errorTitulo, setErrorTitulo] = useState<string | null>(null);

  const opciones = CATEGORIAS.map((categoria) => ({
    valor: categoria,
    etiqueta: ETIQUETAS_CATEGORIA[categoria],
  }));

  function cambiarTitulo(titulo: string) {
    actualizarBorrador({ titulo });
    setErrorTitulo(null);
  }

  function guardar() {
    if (borrador.titulo.trim() === '') {
      setErrorTitulo('Escribí un título para el reporte.');
      return;
    }
    const reporte = crearReporte(borrador);
    router.replace({ pathname: '/reporte/[id]', params: { id: reporte.id } });
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <CampoTexto
        etiqueta="Título"
        valor={borrador.titulo}
        onChangeText={cambiarTitulo}
        placeholder="Por ejemplo: luz quemada"
        error={errorTitulo}
      />
      <CampoTexto
        etiqueta="Descripción"
        valor={borrador.descripcion}
        onChangeText={(descripcion) => actualizarBorrador({ descripcion })}
        placeholder="Contanos qué pasa"
        multilinea
      />
      <NotaVoz
        uri={borrador.notaVozUri}
        onGrabada={(notaVozUri) => actualizarBorrador({ notaVozUri })}
      />
      <CampoTexto
        etiqueta="Lugar"
        valor={borrador.aula}
        onChangeText={(aula) => actualizarBorrador({ aula })}
        placeholder="Por ejemplo: Aula 4"
      />
      <Boton
        titulo="Escanear QR del aula"
        variante="secundario"
        onPress={() => router.push('/reporte/escanear')}
      />
      <SelectorOpciones
        etiqueta="Categoría"
        opciones={opciones}
        seleccionado={borrador.categoria}
        onSeleccionar={(valor) => actualizarBorrador({ categoria: valor as Categoria })}
      />
      <ThemedView style={styles.bloque}>
        <ThemedText type="smallBold">Foto</ThemedText>
        {borrador.fotoUri ? (
          <Image source={{ uri: borrador.fotoUri }} style={styles.foto} />
        ) : (
          <ThemedText type="small" themeColor="textSecondary">
            Sin foto. Es opcional.
          </ThemedText>
        )}
        <Boton
          titulo="Adjuntar foto"
          variante="secundario"
          onPress={() => router.push('/reporte/foto')}
        />
      </ThemedView>
      <ThemedView style={styles.bloque}>
        <ThemedText type="smallBold">Ubicación</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {describirUbicacion(borrador.ubicacion)}
        </ThemedText>
        <Boton
          titulo="Marcar ubicación"
          variante="secundario"
          onPress={() => router.push('/reporte/ubicacion')}
        />
      </ThemedView>
      <Boton titulo="Guardar reporte" onPress={guardar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: {
    padding: Spacing.three,
    gap: Spacing.three,
  },
  bloque: {
    gap: Spacing.two,
  },
  foto: {
    width: '100%',
    height: 200,
    borderRadius: Spacing.three,
  },
});
