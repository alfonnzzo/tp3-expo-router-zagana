import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/** Ejecuta `revisar` cada vez que la app vuelve a primer plano (por ejemplo, desde Ajustes). */
export function useRevisarAlVolver(revisar: () => void) {
  const anterior = useRef(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nuevo) => {
      const estabaAfuera = /inactive|background/.test(anterior.current);
      if (estabaAfuera && nuevo === 'active') revisar();
      anterior.current = nuevo;
    });
    return () => sub.remove();
  }, [revisar]);
}
