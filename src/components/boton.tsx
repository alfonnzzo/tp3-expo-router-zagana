import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type BotonProps = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  disabled?: boolean;
};

export function Boton({ titulo, onPress, variante = 'primario', disabled = false }: BotonProps) {
  const theme = useTheme();
  const esPrimario = variante === 'primario';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.boton,
        {
          backgroundColor: esPrimario ? theme.primario : theme.backgroundElement,
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        },
      ]}>
      <ThemedText
        type="smallBold"
        style={{ color: esPrimario ? theme.textoPrimario : theme.text }}>
        {titulo}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
