import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { AppState, Linking, Platform } from 'react-native';

import { consultarPermiso, solicitarPermiso, type RespuestaPermiso } from '@/lib/permisos';
import type { EstadoPermiso, Recurso } from '@/lib/tipos';

const INICIAL: RespuestaPermiso = { estado: 'cargando', parcial: false, detalle: null };

const almacen: Record<Recurso, RespuestaPermiso> = {
  camara: INICIAL,
  ubicacion: INICIAL,
  notificaciones: INICIAL,
  microfono: INICIAL,
};

const oyentes = new Set<() => void>();

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

function guardar(recurso: Recurso, respuesta: RespuestaPermiso) {
  const actual = almacen[recurso];
  const sinCambios =
    actual.estado === respuesta.estado &&
    actual.parcial === respuesta.parcial &&
    actual.detalle === respuesta.detalle;
  if (sinCambios) {
    return;
  }
  almacen[recurso] = respuesta;
  oyentes.forEach((oyente) => oyente());
}

export function usePermiso(recurso: Recurso) {
  const datos = useSyncExternalStore(
    suscribir,
    () => almacen[recurso],
    () => almacen[recurso]
  );
  const anterior = useRef(AppState.currentState);

  const revisar = useCallback(async () => {
    guardar(recurso, await consultarPermiso(recurso));
  }, [recurso]);

  const pedir = useCallback(async (): Promise<EstadoPermiso> => {
    const respuesta = await solicitarPermiso(recurso);
    guardar(recurso, respuesta);
    return respuesta.estado;
  }, [recurso]);

  const abrirAjustes = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  useEffect(() => {
    revisar();
  }, [revisar]);

  useEffect(() => {
    const suscripcion = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = anterior.current === 'background' || anterior.current === 'inactive';
      if (estabaAfuera && nuevo === 'active') {
        revisar();
      }
      anterior.current = nuevo;
    });
    return () => suscripcion.remove();
  }, [revisar]);

  return {
    estado: datos.estado,
    parcial: datos.parcial,
    detalle: datos.detalle,
    plataforma: Platform.OS as string,
    pedir,
    abrirAjustes,
    revisar,
  };
}
