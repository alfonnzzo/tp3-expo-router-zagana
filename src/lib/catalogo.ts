import { Acento } from '@/constants/theme';

export const CATEGORIAS = [
  { id: 'electricidad', nombre: 'Electricidad' },
  { id: 'agua', nombre: 'Agua' },
  { id: 'mobiliario', nombre: 'Mobiliario' },
  { id: 'equipos', nombre: 'Equipos' },
] as const;

export type CategoriaId = (typeof CATEGORIAS)[number]['id'];

export function nombreCategoria(id: CategoriaId) {
  return CATEGORIAS.find((c) => c.id === id)?.nombre ?? id;
}

export const SECTORES = [
  'Patio',
  'Estacionamiento',
  'Pasillo',
  'Hall de entrada',
  'Biblioteca',
  'Sanitarios',
] as const;

export const COLOR_ESTADO = {
  pendiente: Acento.aviso,
  'en curso': Acento.primario,
  resuelto: Acento.exito,
} as const;
