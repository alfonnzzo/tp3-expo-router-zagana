import { Accuracy, getCurrentPositionAsync } from 'expo-location';

import { consultarPermiso } from '@/lib/permisos';

export type UbicacionObtenida = {
  latitud: number;
  longitud: number;
  aproximada: boolean;
};

export async function obtenerUbicacion(): Promise<UbicacionObtenida | null> {
  try {
    const permiso = await consultarPermiso('ubicacion');
    if (permiso.estado !== 'concedido') {
      return null;
    }
    const posicion = await getCurrentPositionAsync({
      accuracy: Accuracy.Balanced,
    });
    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      aproximada: permiso.parcial,
    };
  } catch {
    return null;
  }
}
