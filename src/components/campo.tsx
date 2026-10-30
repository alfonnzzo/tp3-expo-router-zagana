import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = TextInputProps & { etiqueta: string; ayuda?: string };

export function Campo({ etiqueta, ayuda, style, multiline, ...resto }: Props) {
  const theme = useTheme();

  return (
    <ThemedView style={styles.grupo}>
      <ThemedText type="smallBold">{etiqueta}</ThemedText>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        style={[
          styles.entrada,
          { color: theme.text, backgroundColor: theme.backgroundElement },
          multiline && styles.multilinea,
          style,
        ]}
        {...resto}
      />
      {ayuda ? (
        <ThemedText type="small" themeColor="textSecondary">
          {ayuda}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  grupo: { gap: Spacing.one },
  entrada: {
    minHeight: 48,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  multilinea: { minHeight: 96, textAlignVertical: 'top' },
});
