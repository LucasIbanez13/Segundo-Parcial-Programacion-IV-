import Link from "next/link";
import { ENLACE, formatearComprobante, formatearFecha, formatearMoneda, TABLA, TD, TH } from "@/components/clientes/base";
import BadgeFormaPago from "./BadgeFormaPago";

// Listado de ventas registradas.
export default function VentasTable({ ventas }) {
  return (
    <table className={TABLA}>
      <thead>
        <tr>
          <th className={TH}>Número</th>
          <th className={TH}>Fecha</th>
          <th className={TH}>Cliente</th>
          <th className={TH}>Pago</th>
          <th className={`${TH} text-right`}>Total</th>
          <th className={TH} aria-label="Acciones" />
        </tr>
      </thead>
      <tbody>
        {ventas.map((venta) => (
          <tr key={venta.id}>
            <td className={`${TD} font-bold`}>{formatearComprobante(venta.numero)}</td>
            <td className={TD}>{formatearFecha(venta.fecha)}</td>
            <td className={TD}>{venta.clienteNombre}</td>
            <td className={TD}>
              <BadgeFormaPago formaPago={venta.formaPago} />
            </td>
            <td className={`${TD} text-right`}>{formatearMoneda(venta.totalCentavos)}</td>
            <td className={TD}>
              <Link href={`/ventas/${venta.id}`} className={ENLACE}>
                Ver detalle
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
