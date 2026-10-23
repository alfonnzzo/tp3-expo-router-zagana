import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, type ThemeColor } from '@/constants/theme';

type EstadoEtiquetaProps = {
  texto: string;
  color: ThemeColor;
};

export function EstadoEtiqueta({ texto, color }: EstadoEtiquetaProps) {
  return (
    <ThemedView type="backgroundSelected" style={styles.etiqueta}>
      <ThemedText type="smallBold" themeColor={color}>
        {texto}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.two,
  },
});
