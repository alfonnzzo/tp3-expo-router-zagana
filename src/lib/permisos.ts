import type { PermissionResponse } from 'expo';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { prepararCanalReportes } from '@/lib/notificaciones';

export type Recurso = 'camara' | 'ubicacion' | 'notificaciones';
export type Estado = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export type InfoPermiso = {
  estado: Estado;
  /** Fotos limitadas, ubicación aproximada o notificaciones provisionales. */
  parcial: boolean;
  /** Matiz para mostrar en el panel (accuracy, accessPrivileges, ...). */
  detalle: string | null;
};

export const RECURSOS: Recurso[] = ['camara', 'ubicacion', 'notificaciones'];

export function esRecurso(valor: unknown): valor is Recurso {
  return typeof valor === 'string' && (RECURSOS as string[]).includes(valor);
}

type TextosRecurso = {
  titulo: string;
  /** Una frase con el molde "Usamos tu [dato] para [beneficio concreto]". */
  beneficio: string;
  /** Qué puede hacer la persona si no da el permiso. */
  alternativa: string;
  ajustesAndroid: string;
  ajustesIos: string;
};

export const TEXTOS: Record<Recurso, TextosRecurso> = {
  camara: {
    titulo: 'Cámara',
    beneficio: 'Usamos tu cámara para leer el QR de la puerta del aula y sacar la foto del desperfecto.',
    alternativa: 'Podés escribir el código del aula a mano y elegir la foto desde tu galería.',
    ajustesAndroid: 'Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Cámara',
    ajustesIos: 'Ajustes > Mantenimiento IPF > Cámara',
  },
  ubicacion: {
    titulo: 'Ubicación',
    beneficio: 'Usamos tu ubicación para marcar dónde está el desperfecto dentro del instituto.',
    alternativa: 'Podés elegir el sector (patio, estacionamiento, pasillo) a mano.',
    ajustesAndroid: 'Ajustes > Aplicaciones > Mantenimiento IPF > Permisos > Ubicación',
    ajustesIos: 'Ajustes > Mantenimiento IPF > Ubicación',
  },
  notificaciones: {
    titulo: 'Notificaciones',
    beneficio: 'Usamos las notificaciones para avisarte cuando se resuelva tu reporte.',
    alternativa: 'Los avisos te esperan igual en la pestaña Avisos.',
    ajustesAndroid: 'Ajustes > Aplicaciones > Mantenimiento IPF > Notificaciones',
    ajustesIos: 'Ajustes > Mantenimiento IPF > Notificaciones',
  },
};

type Respuesta = PermissionResponse & {
  accessPrivileges?: 'all' | 'limited' | 'none';
  android?: { accuracy?: 'fine' | 'coarse' | 'none'; importance?: number };
  ios?: { accuracy?: 'full' | 'reduced'; status?: number };
};

/** Traduce lo que devuelve Expo (status + canAskAgain) a nuestros cuatro estados. */
export function traducir(recurso: Recurso, r: Respuesta): InfoPermiso {
  if (!r.granted) {
    const bloqueado = r.status === 'denied' && !r.canAskAgain;
    return { estado: bloqueado ? 'bloqueado' : 'preguntable', parcial: false, detalle: null };
  }

  if (r.accessPrivileges === 'limited') {
    return { estado: 'concedido', parcial: true, detalle: 'Acceso limitado (accessPrivileges: limited)' };
  }
  if (recurso === 'ubicacion') {
    if (r.android?.accuracy === 'coarse' || r.ios?.accuracy === 'reduced') {
      const dato = r.android?.accuracy ?? r.ios?.accuracy;
      return { estado: 'concedido', parcial: true, detalle: `Aproximada (accuracy: ${dato})` };
    }
    const dato = r.android?.accuracy ?? r.ios?.accuracy;
    return { estado: 'concedido', parcial: false, detalle: dato ? `Precisa (accuracy: ${dato})` : null };
  }
  if (recurso === 'notificaciones' && r.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return { estado: 'concedido', parcial: true, detalle: 'Provisional: se entregan en silencio' };
  }
  return { estado: 'concedido', parcial: false, detalle: null };
}

/* ---- Estado compartido: todas las pantallas ven el mismo permiso ---- */

const INICIAL: InfoPermiso = { estado: 'cargando', parcial: false, detalle: null };
let guardado: Record<Recurso, InfoPermiso> = {
  camara: INICIAL,
  ubicacion: INICIAL,
  notificaciones: INICIAL,
};
const oyentes = new Set<() => void>();

export function suscribirPermisos(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function leerPermiso(recurso: Recurso) {
  return guardado[recurso];
}

function guardar(recurso: Recurso, info: InfoPermiso) {
  const actual = guardado[recurso];
  if (
    actual.estado === info.estado &&
    actual.parcial === info.parcial &&
    actual.detalle === info.detalle
  ) {
    return info;
  }
  guardado = { ...guardado, [recurso]: info };
  oyentes.forEach((oyente) => oyente());
  return info;
}

/* ---- Consultar y pedir: get… nunca muestra diálogo, request… sí puede ---- */

async function leer(recurso: Recurso): Promise<Respuesta> {
  switch (recurso) {
    case 'camara':
      return Camera.getCameraPermissionsAsync();
    case 'ubicacion':
      return Location.getForegroundPermissionsAsync();
    case 'notificaciones':
      return Notifications.getPermissionsAsync();
  }
}

async function solicitar(recurso: Recurso): Promise<Respuesta> {
  switch (recurso) {
    case 'camara':
      return Camera.requestCameraPermissionsAsync();
    case 'ubicacion':
      return Location.requestForegroundPermissionsAsync();
    case 'notificaciones':
      // Android 13+: sin canal creado, el diálogo no aparece.
      await prepararCanalReportes();
      return Notifications.requestPermissionsAsync();
  }
}

export async function consultarPermiso(recurso: Recurso) {
  return guardar(recurso, traducir(recurso, await leer(recurso)));
}

export async function pedirPermiso(recurso: Recurso) {
  return guardar(recurso, traducir(recurso, await solicitar(recurso)));
}

export function abrirAjustes() {
  return Linking.openSettings();
}

export function rutaEnAjustes(recurso: Recurso) {
  return Platform.OS === 'ios' ? TEXTOS[recurso].ajustesIos : TEXTOS[recurso].ajustesAndroid;
}
