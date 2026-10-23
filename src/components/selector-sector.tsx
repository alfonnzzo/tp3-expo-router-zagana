import { SelectorOpciones } from '@/components/selector-opciones';
import { SECTORES } from '@/lib/reportes';

type SelectorSectorProps = {
  seleccionado: string | null;
  onSeleccionar: (sector: string) => void;
};

export function SelectorSector({ seleccionado, onSeleccionar }: SelectorSectorProps) {
  const opciones = SECTORES.map((sector) => ({ valor: sector, etiqueta: sector }));

  return (
    <SelectorOpciones
      etiqueta="Sector"
      opciones={opciones}
      seleccionado={seleccionado}
      onSeleccionar={onSeleccionar}
    />
  );
}
