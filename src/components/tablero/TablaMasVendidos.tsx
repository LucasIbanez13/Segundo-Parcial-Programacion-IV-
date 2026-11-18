// Los 5 productos más vendidos del mes por unidades (RF-T3), con el importe que generaron.
import Link from "next/link";
import { EstadoVacio } from "@/components/comunes/Estados";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearMoneda } from "@/lib/format";
import type { Tablero } from "@/services/tablero.service";

export function TablaMasVendidos({ productos }: { productos: Tablero["masVendidos"] }) {
  if (productos.length === 0) {
    return <EstadoVacio titulo="Todavía no hay ventas este mes" descripcion="Los productos más vendidos van a aparecer acá." />;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">#</TableHead>
          <TableHead>Producto</TableHead>
          <TableHead className="text-right">Unidades</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Importe</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productos.map((producto, indice) => (
          <TableRow key={producto.productoId}>
            <TableCell className="text-muted-foreground tabular-nums">{indice + 1}</TableCell>
            <TableCell className="whitespace-normal">
              <Link href={`/productos/${producto.productoId}`} className="hover:underline">
                {producto.descripcion}
              </Link>
              <p className="font-mono text-xs text-muted-foreground">{producto.codigo}</p>
            </TableCell>
            <TableCell className="text-right tabular-nums">{producto.unidades}</TableCell>
            <TableCell className="hidden text-right tabular-nums sm:table-cell">{formatearMoneda(producto.importe)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
