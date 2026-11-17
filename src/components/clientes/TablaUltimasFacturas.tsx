// Últimas facturas del cliente en su ficha (RF-C3), con enlace al comprobante. Las anuladas quedan visibles
// con el total tachado (regla 5).
import Link from "next/link";
import { EstadoVacio } from "@/components/comunes/Estados";
import { InsigniaEstadoFactura, InsigniaFormaPago } from "@/components/ventas/InsigniasFactura";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { formatearFecha, formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FacturaResumen } from "@/services/clientes.service";

export function TablaUltimasFacturas({ facturas }: { facturas: FacturaResumen[] }) {
  if (facturas.length === 0) {
    return <EstadoVacio titulo="Sin facturas" descripcion="Las ventas que se le hagan a este cliente van a aparecer acá." />;
  }

  return (
    <Table>
      <TableBody>
        {facturas.map((factura) => {
          const anulada = factura.estado === "anulada";
          return (
            <TableRow key={factura.id}>
              <TableCell>
                <Link href={`/ventas/${factura.id}`} className="font-mono hover:underline">
                  {factura.numeroFormateado}
                </Link>
              </TableCell>
              <TableCell className="tabular-nums">{formatearFecha(factura.fecha)}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <InsigniaFormaPago forma={factura.forma} />
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <InsigniaEstadoFactura estado={factura.estado} />
              </TableCell>
              <TableCell className={cn("text-right tabular-nums", anulada && "text-muted-foreground line-through")}>
                {formatearMoneda(factura.total)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
