import { useCallback, useEffect, useSyncExternalStore } from 'react';

import { useRevisarAlVolver } from '@/hooks/useRevisarAlVolver';
import {
  abrirAjustes,
  consultarPermiso,
  leerPermiso,
  pedirPermiso,
  suscribirPermisos,
  type Recurso,
} from '@/lib/permisos';

/**
 * Hook unificado para cámara, ubicación y notificaciones.
 *
 * - `estado`: 'cargando' | 'concedido' | 'preguntable' | 'bloqueado'
 * - `parcial`: fotos limitadas, ubicación aproximada o notificaciones provisionales
 * - `pedir()`: muestra el diálogo del sistema (solo si el estado es 'preguntable')
 * - `abrirAjustes()`: lleva a los ajustes de la app
 *
 * El estado se comparte entre pantallas y se vuelve a leer al volver de Ajustes.
 */
export function usePermiso(recurso: Recurso) {
  const info = useSyncExternalStore(
    suscribirPermisos,
    () => leerPermiso(recurso),
    () => leerPermiso(recurso),
  );

  const actualizar = useCallback(() => {
    consultarPermiso(recurso).catch(() => {});
  }, [recurso]);

  useEffect(actualizar, [actualizar]);
  useRevisarAlVolver(actualizar);

  const pedir = useCallback(() => pedirPermiso(recurso), [recurso]);

  return { ...info, pedir, abrirAjustes, actualizar };
}
