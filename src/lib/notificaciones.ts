import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const CANAL_REPORTES = 'reportes';

let configurado = false;

/** Cómo se muestran las notificaciones cuando la app está abierta. */
export function configurarNotificaciones() {
  if (configurado) return;
  configurado = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * En Android 13+ el diálogo de POST_NOTIFICATIONS solo aparece si la app ya
 * creó al menos un canal: por eso se crea antes de pedir el permiso.
 */
export async function prepararCanalReportes() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL_REPORTES, {
    name: 'Reportes',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Programa la notificación local. Devuelve false si no hay permiso (el aviso queda en /avisos). */
export async function programarAvisoResolucion(titulo: string, segundos: number) {
  const permiso = await Notifications.getPermissionsAsync();
  if (!permiso.granted) return false;

  await prepararCanalReportes();
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Reporte resuelto', body: `Se resolvió: ${titulo}` },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: segundos,
      channelId: CANAL_REPORTES,
    },
  });
  return true;
}
