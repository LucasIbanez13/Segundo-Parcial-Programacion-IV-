// Tabla de movimientos de stock (RF-P6): fecha, tipo, cantidad, existencia resultante, motivo, usuario y
// referencia a la factura cuando la hay. Se usa en la ficha del producto y en el listado general.
import Link from "next/link";
import { Pila, Texto } from "@/components/base/primitivas";
import { EstadoVacio } from "@/components/comunes/Estados";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearFecha, formatearHora } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MovimientoStockPublico } from "@/services/stock.service";
import { InsigniaTipoMovimiento } from "./InsigniasProducto";

export function TablaMovimientos({
  movimientos,
  mostrarProducto = false,
  textoVacio,
}: {
  movimientos: MovimientoStockPublico[];
  mostrarProducto?: boolean;
  textoVacio: { titulo: string; descripcion?: string };
}) {
  if (movimientos.length === 0) return <EstadoVacio {...textoVacio} />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          {mostrarProducto && <TableHead>Producto</TableHead>}
          <TableHead>Tipo</TableHead>
          <TableHead className="text-right">Cantidad</TableHead>
          <TableHead className="text-right">Existencia</TableHead>
          <TableHead className="hidden lg:table-cell">Motivo</TableHead>
          <TableHead className="hidden xl:table-cell">Usuario</TableHead>
          <TableHead className="hidden xl:table-cell">Referencia</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movimientos.map((movimiento) => (
          <TableRow key={movimiento.id}>
            <TableCell>
              <Pila espacio={0}>
                <Texto>{formatearFecha(movimiento.fecha)}</Texto>
                <Texto variante="chico">{formatearHora(movimiento.fecha)}</Texto>
              </Pila>
            </TableCell>
            {mostrarProducto && (
              <TableCell>
                <Link href={`/productos/${movimiento.producto.id}`} className="font-mono text-xs hover:underline">
                  {movimiento.producto.codigo}
                </Link>
              </TableCell>
            )}
            <TableCell>
              <Pila espacio={1} className="items-start">
                <InsigniaTipoMovimiento tipo={movimiento.tipo} />
                {/* En el teléfono el motivo va debajo del tipo. */}
                <Texto variante="chico" className="lg:hidden">
                  {movimiento.motivo}
                </Texto>
              </Pila>
            </TableCell>
            <TableCell
              className={cn("text-right font-medium tabular-nums", movimiento.cantidad > 0 ? "text-exito" : "text-destructive")}
            >
              {movimiento.cantidad > 0 ? `+${movimiento.cantidad}` : movimiento.cantidad}
            </TableCell>
            <TableCell className="text-right tabular-nums">{movimiento.existenciaResultante}</TableCell>
            <TableCell className="hidden max-w-64 whitespace-normal lg:table-cell">
              <Pila espacio={0}>
                <Texto>{movimiento.motivo}</Texto>
                {movimiento.observacion && <Texto variante="chico">{movimiento.observacion}</Texto>}
              </Pila>
            </TableCell>
            <TableCell className="hidden text-muted-foreground xl:table-cell">{movimiento.usuario.nombre}</TableCell>
            <TableCell className="hidden xl:table-cell">
              {movimiento.referencia ? (
                <Link href={`/ventas/${movimiento.referencia.facturaId}`} className="font-mono text-xs hover:underline">
                  {movimiento.referencia.numero}
                </Link>
              ) : (
                <Texto variante="chico">—</Texto>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
