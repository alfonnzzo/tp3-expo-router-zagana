import * as Location from 'expo-location';

export type UbicacionActual = {
  latitud: number;
  longitud: number;
  /** true si la persona dio solo ubicación aproximada: no hay que mostrar coordenadas exactas. */
  aproximada: boolean;
};

/** Por encima de este radio (en metros) iOS está entregando una posición reducida. */
const UMBRAL_APROXIMADA_METROS = 1000;

/**
 * Devuelve la posición actual o null si no hay permiso o falla el GPS.
 * No muestra ningún diálogo: el permiso se pide antes, con la pantalla previa.
 */
export async function obtenerUbicacion(): Promise<UbicacionActual | null> {
  try {
    const permiso = await Location.getForegroundPermissionsAsync();
    if (!permiso.granted) return null;

    const posicion = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const aproximadaAndroid = permiso.android?.accuracy === 'coarse';
    const aproximadaIos =
      permiso.ios?.accuracy === 'reduced' ||
      (posicion.coords.accuracy ?? 0) > UMBRAL_APROXIMADA_METROS;

    return {
      latitud: posicion.coords.latitude,
      longitud: posicion.coords.longitude,
      aproximada: aproximadaAndroid || aproximadaIos,
    };
  } catch {
    return null;
  }
}
