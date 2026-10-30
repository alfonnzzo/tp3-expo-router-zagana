import type { CategoriaId } from '@/lib/catalogo';
import { programarAvisoResolucion } from '@/lib/notificaciones';

export type EstadoReporte = 'pendiente' | 'en curso' | 'resuelto';

export type Ubicacion =
  | { tipo: 'gps'; aproximada: true }
  | { tipo: 'gps'; aproximada: false; latitud: number; longitud: number }
  | { tipo: 'sector'; sector: string };

export function textoUbicacion(ubicacion: Ubicacion | null) {
  if (!ubicacion) return 'Sin ubicación';
  if (ubicacion.tipo === 'sector') return `Sector: ${ubicacion.sector}`;
  if (ubicacion.aproximada) return 'Ubicación aproximada';
  return `Ubicación: ${ubicacion.latitud.toFixed(5)}, ${ubicacion.longitud.toFixed(5)}`;
}

export type Reporte = {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: CategoriaId;
  fotoUri: string | null;
  ubicacion: Ubicacion | null;
  estado: EstadoReporte;
  creado: number;
};

export type Aviso = {
  id: string;
  titulo: string;
  texto: string;
  fecha: number;
  leido: boolean;
};

export type Borrador = Pick<
  Reporte,
  'titulo' | 'descripcion' | 'aula' | 'categoria' | 'fotoUri' | 'ubicacion'
>;

export type EstadoAlmacen = {
  reportes: Reporte[];
  avisos: Aviso[];
  borrador: Borrador;
  avisarResolucion: boolean;
};

const BORRADOR_VACIO: Borrador = {
  titulo: '',
  descripcion: '',
  aula: '',
  categoria: 'electricidad',
  fotoUri: null,
  ubicacion: null,
};

// Todo vive en memoria: se pierde al cerrar la app (el TP no pide persistencia).
let estado: EstadoAlmacen = {
  reportes: [],
  avisos: [],
  borrador: BORRADOR_VACIO,
  avisarResolucion: false,
};
const oyentes = new Set<() => void>();
let secuencia = 0;

function cambiar(parcial: Partial<EstadoAlmacen>) {
  estado = { ...estado, ...parcial };
  oyentes.forEach((oyente) => oyente());
}

const nuevoId = (prefijo: string) => `${prefijo}${Date.now().toString(36)}${(secuencia++).toString(36)}`;

export function suscribirAlmacen(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export const leerAlmacen = () => estado;

export function actualizarBorrador(parcial: Partial<Borrador>) {
  cambiar({ borrador: { ...estado.borrador, ...parcial } });
}

export function limpiarBorrador() {
  cambiar({ borrador: BORRADOR_VACIO });
}

export function crearReporte() {
  const reporte: Reporte = {
    ...estado.borrador,
    titulo: estado.borrador.titulo.trim(),
    descripcion: estado.borrador.descripcion.trim(),
    aula: estado.borrador.aula.trim(),
    id: nuevoId('r'),
    estado: 'pendiente',
    creado: Date.now(),
  };
  cambiar({ reportes: [reporte, ...estado.reportes], borrador: BORRADOR_VACIO });
  return reporte;
}

function cambiarEstadoReporte(id: string, nuevo: EstadoReporte) {
  cambiar({
    reportes: estado.reportes.map((r) => (r.id === id ? { ...r, estado: nuevo } : r)),
  });
}

export function agregarAviso(titulo: string, texto: string) {
  const aviso: Aviso = { id: nuevoId('a'), titulo, texto, fecha: Date.now(), leido: false };
  cambiar({ avisos: [aviso, ...estado.avisos] });
}

export function marcarAvisosLeidos() {
  if (estado.avisos.every((a) => a.leido)) return;
  cambiar({ avisos: estado.avisos.map((a) => ({ ...a, leido: true })) });
}

export function activarAvisos(valor: boolean) {
  cambiar({ avisarResolucion: valor });
}

export const SEGUNDOS_SIMULACION = 10;

/**
 * "Simular resolución": el reporte pasa a "en curso" y a los 10 segundos a "resuelto".
 * Si el interruptor está activo y hay permiso, se programa una notificación local;
 * si no, el aviso queda igual en la bandeja (/avisos).
 */
export async function simularResolucion(reporte: Reporte) {
  cambiarEstadoReporte(reporte.id, 'en curso');

  const notificado = estado.avisarResolucion
    ? await programarAvisoResolucion(reporte.titulo, SEGUNDOS_SIMULACION).catch(() => false)
    : false;

  setTimeout(() => {
    cambiarEstadoReporte(reporte.id, 'resuelto');
    agregarAviso('Reporte resuelto', `Se resolvió: ${reporte.titulo}`);
  }, SEGUNDOS_SIMULACION * 1000);

  return notificado ? ('notificacion' as const) : ('bandeja' as const);
}
