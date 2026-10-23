import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { Camera } from 'expo-camera';
import {
  getForegroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  type LocationPermissionResponse,
} from 'expo-location';
import {
  getPermissionsAsync,
  IosAuthorizationStatus,
  requestPermissionsAsync,
  type NotificationPermissionsStatus,
} from 'expo-notifications';
import { Platform } from 'react-native';

import { crearCanalReportes } from '@/lib/notificaciones';
import type { EstadoPermiso, Recurso } from '@/lib/tipos';

export type RespuestaPermiso = {
  estado: EstadoPermiso;
  parcial: boolean;
  detalle: string | null;
};

type TextosRecurso = {
  titulo: string;
  beneficio: string;
  rutaAjustesAndroid: string;
  rutaAjustesIos: string;
};

export const TEXTOS: Record<Recurso, TextosRecurso> = {
  camara: {
    titulo: 'Cámara',
    beneficio:
      'Usamos tu cámara para leer el código QR de la puerta del aula y sacar fotos del desperfecto.',
    rutaAjustesAndroid:
      'Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Cámara > Permitir solo mientras la app está en uso.',
    rutaAjustesIos: 'Ajustes > Mantenimiento IPF > Cámara > activar.',
  },
  ubicacion: {
    titulo: 'Ubicación',
    beneficio: 'Usamos tu ubicación para marcar en qué parte del edificio está el desperfecto.',
    rutaAjustesAndroid:
      'Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Ubicación > Permitir solo mientras la app está en uso.',
    rutaAjustesIos: 'Ajustes > Mantenimiento IPF > Ubicación > Mientras se usa la app.',
  },
  notificaciones: {
    titulo: 'Notificaciones',
    beneficio: 'Usamos tus notificaciones para avisarte cuando se resuelva tu reporte.',
    rutaAjustesAndroid:
      'Ajustes > Aplicaciones > Mantenimiento IPF > Notificaciones > Permitir notificaciones.',
    rutaAjustesIos: 'Ajustes > Mantenimiento IPF > Notificaciones > Permitir notificaciones.',
  },
  microfono: {
    titulo: 'Micrófono',
    beneficio: 'Usamos tu micrófono para grabar una nota de voz que describa el desperfecto.',
    rutaAjustesAndroid:
      'Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Micrófono > Permitir solo mientras la app está en uso.',
    rutaAjustesIos: 'Ajustes > Mantenimiento IPF > Micrófono > activar.',
  },
};

const RESPUESTA_ERROR: RespuestaPermiso = { estado: 'preguntable', parcial: false, detalle: null };

function calcularEstado(respuesta: {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}): EstadoPermiso {
  if (respuesta.granted) {
    return 'concedido';
  }
  if (Platform.OS === 'web' && respuesta.status === 'denied') {
    return 'bloqueado';
  }
  if (respuesta.canAskAgain) {
    return 'preguntable';
  }
  return 'bloqueado';
}

function respuestaUbicacion(respuesta: LocationPermissionResponse): RespuestaPermiso {
  const aproximada =
    respuesta.granted &&
    (respuesta.ios?.accuracy === 'reduced' || respuesta.android?.accuracy === 'coarse');
  return {
    estado: calcularEstado(respuesta),
    parcial: aproximada,
    detalle: aproximada ? 'Ubicación aproximada' : null,
  };
}

function respuestaNotificaciones(respuesta: NotificationPermissionsStatus): RespuestaPermiso {
  const provisional =
    respuesta.granted && respuesta.ios?.status === IosAuthorizationStatus.PROVISIONAL;
  return {
    estado: calcularEstado(respuesta),
    parcial: provisional,
    detalle: provisional ? 'Notificaciones provisionales' : null,
  };
}

export async function consultarPermiso(recurso: Recurso): Promise<RespuestaPermiso> {
  try {
    if (recurso === 'camara') {
      const respuesta = await Camera.getCameraPermissionsAsync();
      return { estado: calcularEstado(respuesta), parcial: false, detalle: null };
    }
    if (recurso === 'ubicacion') {
      return respuestaUbicacion(await getForegroundPermissionsAsync());
    }
    if (recurso === 'microfono') {
      const respuesta = await getRecordingPermissionsAsync();
      return { estado: calcularEstado(respuesta), parcial: false, detalle: null };
    }
    return respuestaNotificaciones(await getPermissionsAsync());
  } catch {
    return RESPUESTA_ERROR;
  }
}

export async function solicitarPermiso(recurso: Recurso): Promise<RespuestaPermiso> {
  try {
    if (recurso === 'camara') {
      const respuesta = await Camera.requestCameraPermissionsAsync();
      return { estado: calcularEstado(respuesta), parcial: false, detalle: null };
    }
    if (recurso === 'ubicacion') {
      return respuestaUbicacion(await requestForegroundPermissionsAsync());
    }
    if (recurso === 'microfono') {
      const respuesta = await requestRecordingPermissionsAsync();
      return { estado: calcularEstado(respuesta), parcial: false, detalle: null };
    }
    await crearCanalReportes();
    return respuestaNotificaciones(await requestPermissionsAsync());
  } catch {
    return RESPUESTA_ERROR;
  }
}
