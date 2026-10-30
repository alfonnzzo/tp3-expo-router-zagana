import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Acento, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario';
  deshabilitado?: boolean;
  cargando?: boolean;
};

export function Boton({ titulo, onPress, variante = 'primario', deshabilitado, cargando }: Props) {
  const theme = useTheme();
  const primario = variante === 'primario';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!deshabilitado }}
      disabled={deshabilitado || cargando}
      onPress={onPress}
      style={({ pressed }) => [
        styles.boton,
        { backgroundColor: primario ? Acento.primario : theme.backgroundSelected },
        (pressed || deshabilitado) && styles.atenuado,
      ]}>
      {cargando ? (
        <ActivityIndicator color={primario ? '#ffffff' : theme.text} />
      ) : (
        <ThemedText type="smallBold" style={primario ? styles.textoPrimario : undefined}>
          {titulo}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  atenuado: { opacity: 0.55 },
  textoPrimario: { color: '#ffffff' },
});
