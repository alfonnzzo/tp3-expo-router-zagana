import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CampoTextoProps = {
  etiqueta: string;
  valor: string;
  onChangeText: (texto: string) => void;
  placeholder?: string;
  multilinea?: boolean;
  error?: string | null;
  autoCapitalize?: TextInputProps['autoCapitalize'];
};

export function CampoTexto({
  etiqueta,
  valor,
  onChangeText,
  placeholder,
  multilinea = false,
  error = null,
  autoCapitalize = 'sentences',
}: CampoTextoProps) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.contenedor}>
      <ThemedText type="smallBold">{etiqueta}</ThemedText>
      <TextInput
        accessibilityLabel={etiqueta}
        value={valor}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        multiline={multilinea}
        autoCapitalize={autoCapitalize}
        textAlignVertical={multilinea ? 'top' : 'center'}
        style={[
          styles.entrada,
          multilinea ? styles.multilinea : null,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: error ? theme.peligro : theme.backgroundSelected,
          },
        ]}
      />
      {error ? (
        <ThemedText type="small" themeColor="peligro">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    gap: Spacing.one,
  },
  entrada: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
    fontSize: 16,
  },
  multilinea: {
    minHeight: 96,
  },
});
