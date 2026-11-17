// Tabla del listado de facturas (RF-V8): número, fecha, cliente, vendedor, forma de pago, total y estado.
// Las anuladas siguen visibles con el total tachado (regla 5). En el teléfono pasan datos debajo del número.
import Link from "next/link";
import { Pila, Texto } from "@/components/base/primitivas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearFecha, formatearHora, formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FacturaResumenPublica } from "@/services/facturas.service";
import { InsigniaEstadoFactura, InsigniaFormaPago } from "./InsigniasFactura";

export function TablaFacturas({ facturas }: { facturas: FacturaResumenPublica[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Número</TableHead>
          <TableHead className="hidden md:table-cell">Fecha</TableHead>
          <TableHead className="hidden sm:table-cell">Cliente</TableHead>
          <TableHead className="hidden lg:table-cell">Vendedor</TableHead>
          <TableHead className="hidden md:table-cell">Forma de pago</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="hidden sm:table-cell">Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {facturas.map((factura) => {
          const anulada = factura.estado === "anulada";
          return (
            <TableRow key={factura.id}>
              <TableCell>
                <Pila espacio={0}>
                  <Link href={`/ventas/${factura.id}`} className="font-mono hover:underline">
                    {factura.numeroFormateado}
                  </Link>
                  <Texto variante="chico" className="md:hidden">
                    {formatearFecha(factura.fecha)} · {factura.cliente?.nombre ?? "Consumidor final"}
                  </Texto>
                </Pila>
              </TableCell>
              <TableCell className="hidden whitespace-nowrap tabular-nums md:table-cell">
                {formatearFecha(factura.fecha)}{" "}
                <span className="text-xs text-muted-foreground">{formatearHora(factura.fecha)}</span>
              </TableCell>
              <TableCell className={cn("hidden sm:table-cell", !factura.cliente && "text-muted-foreground")}>
                {factura.cliente ? (
                  <Link href={`/clientes/${factura.cliente.id}`} className="hover:underline">
                    {factura.cliente.nombre}
                  </Link>
                ) : (
                  "Consumidor final"
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">{factura.vendedor.nombre}</TableCell>
              <TableCell className="hidden md:table-cell">
                <InsigniaFormaPago forma={factura.forma} />
              </TableCell>
              <TableCell className={cn("text-right tabular-nums", anulada && "text-muted-foreground line-through")}>
                {formatearMoneda(factura.total)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <InsigniaEstadoFactura estado={factura.estado} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
