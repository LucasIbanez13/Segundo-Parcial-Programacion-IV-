// Movimientos de la cuenta corriente en orden cronológico, con el saldo acumulado en cada renglón (RF-C4).
// Si hay filtro "desde", el primer renglón es el saldo anterior a ese día. Al pie, el saldo al cierre.
import Link from "next/link";
import { EstadoVacio } from "@/components/comunes/Estados";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearFecha, formatearHora, formatearMoneda } from "@/lib/format";
import type { CuentaCorriente, MovimientoCuentaPublico } from "@/services/clientes.service";

// La factura lleva a su comprobante y el pago a su recibo.
function enlace(movimiento: MovimientoCuentaPublico): string | null {
  if (movimiento.facturaId) return `/ventas/${movimiento.facturaId}`;
  if (movimiento.pagoId) return `/clientes/recibos/${movimiento.pagoId}`;
  return null;
}

export function TablaCuentaCorriente({ cuenta, conDesde }: { cuenta: CuentaCorriente; conDesde: boolean }) {
  if (cuenta.movimientos.length === 0 && !conDesde) {
    return <EstadoVacio titulo="Sin movimientos" descripcion="Las ventas en cuenta corriente y los pagos van a aparecer acá." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Concepto</TableHead>
          <TableHead className="text-right">Débito</TableHead>
          <TableHead className="text-right">Crédito</TableHead>
          <TableHead className="text-right">Saldo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {conDesde && (
          <TableRow className="bg-muted/40">
            <TableCell colSpan={4} className="font-medium">
              Saldo anterior
            </TableCell>
            <TableCell className="text-right font-medium tabular-nums">{formatearMoneda(cuenta.saldoAnterior)}</TableCell>
          </TableRow>
        )}
        {cuenta.movimientos.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
              No hay movimientos en ese período.
            </TableCell>
          </TableRow>
        )}
        {cuenta.movimientos.map((movimiento, indice) => {
          const href = enlace(movimiento);
          return (
            <TableRow key={`${movimiento.facturaId ?? ""}-${movimiento.pagoId ?? ""}-${indice}`}>
              <TableCell className="whitespace-nowrap tabular-nums">
                {formatearFecha(movimiento.fecha)}{" "}
                <span className="text-xs text-muted-foreground">{formatearHora(movimiento.fecha)}</span>
              </TableCell>
              <TableCell>
                {href ? (
                  <Link href={href} className="text-primary hover:underline">
                    {movimiento.descripcion}
                  </Link>
                ) : (
                  movimiento.descripcion
                )}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {movimiento.tipo === "debito" ? formatearMoneda(movimiento.importe) : ""}
              </TableCell>
              <TableCell className="text-right text-exito tabular-nums">
                {movimiento.tipo === "credito" ? formatearMoneda(movimiento.importe) : ""}
              </TableCell>
              <TableCell className="text-right tabular-nums">{formatearMoneda(movimiento.saldo)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5} className="text-right">
            <span className="mr-4 font-normal text-muted-foreground">Saldo al cierre</span>
            <span className="font-semibold tabular-nums">{formatearMoneda(cuenta.saldo)}</span>
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
