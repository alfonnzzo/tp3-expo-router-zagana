import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function Insignia({ texto, color }: { texto: string; color: string }) {
  return (
    <View style={[styles.insignia, { backgroundColor: color }]}>
      <ThemedText type="smallBold" style={styles.texto}>
        {texto}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  insignia: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.three,
  },
  texto: { color: '#ffffff' },
});
