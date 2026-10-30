import { useSyncExternalStore } from 'react';

import { leerAlmacen, suscribirAlmacen, type EstadoAlmacen } from '@/lib/almacen';

/** Lee una parte del almacén en memoria; el selector tiene que devolver referencias estables. */
export function useAlmacen<T>(selector: (estado: EstadoAlmacen) => T): T {
  return useSyncExternalStore(
    suscribirAlmacen,
    () => selector(leerAlmacen()),
    () => selector(leerAlmacen()),
  );
}
