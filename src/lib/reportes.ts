import { useSyncExternalStore } from 'react';

import type { Aviso, Borrador, Categoria, Reporte } from '@/lib/tipos';

export const SECTORES = ['Patio', 'Estacionamiento', 'Pasillo'];

export const CATEGORIAS: Categoria[] = ['electricidad', 'agua', 'mobiliario', 'equipos'];

export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  electricidad: 'Electricidad',
  agua: 'Agua',
  mobiliario: 'Mobiliario',
  equipos: 'Equipos',
};

type Almacen = {
  reportes: Reporte[];
  avisos: Aviso[];
  borrador: Borrador;
  avisosActivos: boolean;
};

const BORRADOR_VACIO: Borrador = {
  titulo: '',
  descripcion: '',
  aula: '',
  categoria: null,
  fotoUri: null,
  notaVozUri: null,
  ubicacion: null,
};

let almacen: Almacen = {
  reportes: [
    {
      id: 'r1',
      titulo: 'Luz quemada en el pasillo',
      descripcion: 'La luz del pasillo del primer piso no enciende.',
      aula: 'Aula 4',
      categoria: 'electricidad',
      estado: 'pendiente',
      fotoUri: null,
      notaVozUri: null,
      ubicacion: { tipo: 'sector', sector: 'Pasillo' },
      creado: '2026-10-19T09:30:00.000Z',
    },
    {
      id: 'r2',
      titulo: 'Canilla que pierde',
      descripcion: 'La canilla del baño del patio pierde agua todo el día.',
      aula: 'Aula 2',
      categoria: 'agua',
      estado: 'en curso',
      fotoUri: null,
      notaVozUri: null,
      ubicacion: { tipo: 'sector', sector: 'Patio' },
      creado: '2026-10-16T14:10:00.000Z',
    },
    {
      id: 'r3',
      titulo: 'Proyector roto',
      descripcion: 'El proyector no muestra imagen.',
      aula: 'Aula 7',
      categoria: 'equipos',
      estado: 'resuelto',
      fotoUri: null,
      notaVozUri: null,
      ubicacion: null,
      creado: '2026-10-09T11:00:00.000Z',
    },
  ],
  avisos: [
    {
      id: 'a1',
      titulo: 'Reporte resuelto',
      mensaje: 'El reporte Proyector roto fue resuelto.',
      fecha: '2026-10-12T10:00:00.000Z',
      leido: false,
    },
  ],
  borrador: BORRADOR_VACIO,
  avisosActivos: false,
};

let contadorReportes = 3;
let contadorAvisos = 1;

const oyentes = new Set<() => void>();

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

function cambiar(parcial: Partial<Almacen>) {
  almacen = { ...almacen, ...parcial };
  oyentes.forEach((oyente) => oyente());
}

export function obtenerReporte(id: string): Reporte | null {
  if (typeof id !== 'string' || !/^r[0-9]+$/.test(id)) {
    return null;
  }
  return almacen.reportes.find((reporte) => reporte.id === id) ?? null;
}

export function useReportes() {
  return useSyncExternalStore(suscribir, () => almacen.reportes, () => almacen.reportes);
}

export function useReporte(id: string) {
  return useSyncExternalStore(suscribir, () => obtenerReporte(id), () => obtenerReporte(id));
}

export function crearReporte(borrador: Borrador): Reporte {
  contadorReportes = contadorReportes + 1;
  const reporte: Reporte = {
    id: 'r' + contadorReportes,
    titulo: borrador.titulo.trim(),
    descripcion: borrador.descripcion.trim(),
    aula: borrador.aula.trim(),
    categoria: borrador.categoria ?? 'mobiliario',
    estado: 'pendiente',
    fotoUri: borrador.fotoUri,
    notaVozUri: borrador.notaVozUri,
    ubicacion: borrador.ubicacion,
    creado: new Date().toISOString(),
  };
  cambiar({ reportes: [reporte, ...almacen.reportes], borrador: BORRADOR_VACIO });
  return reporte;
}

export function simularResolucion(id: string): Reporte | null {
  const reporte = obtenerReporte(id);
  if (reporte === null) {
    return null;
  }
  if (reporte.estado === 'resuelto') {
    return reporte;
  }
  const resuelto: Reporte = { ...reporte, estado: 'resuelto' };
  contadorAvisos = contadorAvisos + 1;
  const aviso: Aviso = {
    id: 'a' + contadorAvisos,
    titulo: 'Reporte resuelto',
    mensaje: 'El reporte ' + reporte.titulo + ' fue resuelto.',
    fecha: new Date().toISOString(),
    leido: false,
  };
  cambiar({
    reportes: almacen.reportes.map((item) => (item.id === id ? resuelto : item)),
    avisos: [aviso, ...almacen.avisos],
  });
  return resuelto;
}

export function useBorrador() {
  return useSyncExternalStore(suscribir, () => almacen.borrador, () => almacen.borrador);
}

export function actualizarBorrador(parcial: Partial<Borrador>) {
  cambiar({ borrador: { ...almacen.borrador, ...parcial } });
}

export function limpiarBorrador() {
  cambiar({ borrador: BORRADOR_VACIO });
}

export function useAvisos() {
  return useSyncExternalStore(suscribir, () => almacen.avisos, () => almacen.avisos);
}

export function marcarAvisosLeidos() {
  if (almacen.avisos.every((aviso) => aviso.leido)) {
    return;
  }
  cambiar({ avisos: almacen.avisos.map((aviso) => ({ ...aviso, leido: true })) });
}

export function useAvisosActivos() {
  return useSyncExternalStore(suscribir, () => almacen.avisosActivos, () => almacen.avisosActivos);
}

export function cambiarAvisosActivos(valor: boolean) {
  cambiar({ avisosActivos: valor });
}
