import Link from "next/link";
import { TIPOS_MOVIMIENTO_CUENTA } from "@/lib/constants";
import { ENLACE, formatearComprobante, formatearFecha, formatearMoneda, TABLA, TD, TH } from "./base";

// Historial de la cuenta corriente: la venta suma (+) y el pago resta (−).
export default function MovimientosCuentaTable({ movimientos }) {
  return (
    <table className={TABLA}>
      <thead>
        <tr>
          <th className={TH}>Fecha</th>
          <th className={TH}>Concepto</th>
          <th className={`${TH} text-right`}>Importe</th>
        </tr>
      </thead>
      <tbody>
        {movimientos.map((movimiento) => {
          const esVenta = movimiento.tipo === TIPOS_MOVIMIENTO_CUENTA.VENTA;
          return (
            <tr key={esVenta ? `venta-${movimiento.ventaId}` : `pago-${movimiento.pagoId}`}>
              <td className={TD}>{formatearFecha(movimiento.fecha)}</td>
              <td className={TD}>
                {esVenta ? (
                  <Link href={`/ventas/${movimiento.ventaId}`} className={ENLACE}>
                    Venta {formatearComprobante(movimiento.numeroComprobante)}
                  </Link>
                ) : (
                  <>
                    Pago recibido
                    {movimiento.observacion && (
                      <span className="block text-xs whitespace-normal text-muted">{movimiento.observacion}</span>
                    )}
                  </>
                )}
              </td>
              <td className={`${TD} text-right`}>
                {esVenta ? "+" : "−"} {formatearMoneda(movimiento.importeCentavos)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
