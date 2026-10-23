import { StyleSheet } from 'react-native';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

type Opcion = {
  valor: string;
  etiqueta: string;
};

type SelectorOpcionesProps = {
  etiqueta: string;
  opciones: Opcion[];
  seleccionado: string | null;
  onSeleccionar: (valor: string) => void;
};

export function SelectorOpciones({
  etiqueta,
  opciones,
  seleccionado,
  onSeleccionar,
}: SelectorOpcionesProps) {
  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="smallBold">{etiqueta}</ThemedText>
      <ThemedView style={styles.fila}>
        {opciones.map((opcion) => (
          <ThemedView key={opcion.valor} style={styles.opcion}>
            <Boton
              titulo={opcion.etiqueta}
              variante={opcion.valor === seleccionado ? 'primario' : 'secundario'}
              onPress={() => onSeleccionar(opcion.valor)}
            />
          </ThemedView>
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: Spacing.two,
  },
  fila: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  opcion: {
    minWidth: '47%',
    flexGrow: 1,
  },
});
