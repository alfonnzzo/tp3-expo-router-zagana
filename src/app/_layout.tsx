import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

import { configurarNotificaciones } from '@/lib/notificaciones';

configurarNotificaciones();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="permisos/[recurso]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="ajustes-app" />
        <Stack.Screen name="reporte/nuevo" />
        <Stack.Screen name="reporte/escanear" />
        <Stack.Screen name="reporte/foto" />
        <Stack.Screen name="reporte/ubicacion" />
        <Stack.Screen name="reporte/[id]" />
      </Stack>
    </ThemeProvider>
  );
}
