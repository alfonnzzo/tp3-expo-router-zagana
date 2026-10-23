import {
  AndroidImportance,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reporte } from '@/lib/tipos';

export const CANAL_REPORTES = 'reportes';

export function configurarNotificaciones() {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function crearCanalReportes() {
  if (Platform.OS !== 'android') {
    return;
  }
  await setNotificationChannelAsync(CANAL_REPORTES, {
    name: 'Reportes',
    importance: AndroidImportance.DEFAULT,
  });
}

export async function programarAvisoResolucion(reporte: Reporte) {
  await scheduleNotificationAsync({
    content: {
      title: 'Reporte resuelto',
      body: 'El reporte ' + reporte.titulo + ' fue resuelto.',
      data: { reporteId: reporte.id },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      channelId: CANAL_REPORTES,
    },
  });
}
