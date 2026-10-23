export type Recurso = 'camara' | 'ubicacion' | 'notificaciones' | 'microfono';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export type Categoria = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';

export type EstadoReporte = 'pendiente' | 'en curso' | 'resuelto';

export type UbicacionReporte =
  | { tipo: 'gps'; latitud: number; longitud: number; aproximada: boolean }
  | { tipo: 'sector'; sector: string };

export type Reporte = {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria;
  estado: EstadoReporte;
  fotoUri: string | null;
  notaVozUri: string | null;
  ubicacion: UbicacionReporte | null;
  creado: string;
};

export type Aviso = {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  leido: boolean;
};

export type Borrador = {
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria | null;
  fotoUri: string | null;
  notaVozUri: string | null;
  ubicacion: UbicacionReporte | null;
};
