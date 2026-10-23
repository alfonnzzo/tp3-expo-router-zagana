import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { Pressable, View, StyleSheet } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

import { Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs style={styles.contenedor}>
      <TabSlot style={styles.contenido} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="index" href="/" asChild>
            <TabButton>Reportes</TabButton>
          </TabTrigger>
          <TabTrigger name="avisos" href="/avisos" asChild>
            <TabButton>Avisos</TabButton>
          </TabTrigger>
          <TabTrigger name="permisos" href="/permisos" asChild>
            <TabButton>Permisos</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ref, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.boton, pressed && styles.presionado]}>
      <ThemedView
        type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
        style={styles.botonInterior}>
        <ThemedText type="smallBold" themeColor={isFocused ? 'primario' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.barra}>
      <ThemedView type="backgroundElement" style={styles.barraInterior}>
        {props.children}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    overflow: 'hidden',
  },
  contenido: {
    flex: 1,
  },
  barra: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.three,
    alignItems: 'center',
  },
  barraInterior: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 400,
    padding: Spacing.one,
    borderRadius: Spacing.five,
    gap: Spacing.one,
  },
  boton: {
    flex: 1,
  },
  presionado: {
    opacity: 0.7,
  },
  botonInterior: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.five,
  },
});
