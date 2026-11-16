// Insignias propias del módulo: bajo mínimo (RF-P1) y tipo de movimiento de stock (RF-P6).
import { Insignia, type TonoInsignia } from "@/components/comunes/InsigniaEstado";
import { ETIQUETAS_TIPO_MOVIMIENTO, type TipoMovimientoStock } from "@/lib/constants";

export function InsigniaBajoMinimo() {
  return <Insignia tono="advertencia">Bajo mínimo</Insignia>;
}

const TONOS_MOVIMIENTO: Record<TipoMovimientoStock, TonoInsignia> = {
  ingreso: "exito",
  anulacion: "principal",
  egreso: "peligro",
  venta: "neutro",
};

export function InsigniaTipoMovimiento({ tipo }: { tipo: TipoMovimientoStock }) {
  return <Insignia tono={TONOS_MOVIMIENTO[tipo]}>{ETIQUETAS_TIPO_MOVIMIENTO[tipo]}</Insignia>;
}
