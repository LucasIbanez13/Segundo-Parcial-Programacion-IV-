import { ORIGENES_MOVIMIENTO, TIPOS_MOVIMIENTO } from "@/lib/constants";
import { TABLA, TD, TH } from "./base/estilos";
import { formatearComprobante, formatearFecha } from "./formato";

function textoOrigen(movimiento) {
  if (movimiento.origen === ORIGENES_MOVIMIENTO.VENTA) return `Venta ${formatearComprobante(movimiento.ventaId)}`;
  return movimiento.origen === ORIGENES_MOVIMIENTO.INICIAL ? "Inicial" : "Manual";
}

// Tabla de movimientos de stock. El signo usa "−" (U+2212), como el mockup.
export default function MovimientosStockTable({ movimientos }) {
  return (
    <table className={TABLA}>
      <thead>
        <tr>
          <th className={TH}>Fecha</th>
          <th className={TH}>Producto</th>
          <th className={TH}>Origen</th>
          <th className={TH}>Motivo</th>
          <th className={`${TH} text-right`}>Cantidad</th>
        </tr>
      </thead>
      <tbody>
        {movimientos.map((movimiento) => (
          <tr key={movimiento.id}>
            <td className={TD}>{formatearFecha(movimiento.fecha)}</td>
            <td className={`${TD} font-bold`}>{movimiento.productoNombre}</td>
            <td className={TD}>{textoOrigen(movimiento)}</td>
            <td className={TD}>{movimiento.motivo}</td>
            <td className={`${TD} text-right`}>
              {movimiento.tipo === TIPOS_MOVIMIENTO.ENTRADA ? "+" : "−"}
              {movimiento.cantidad}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
