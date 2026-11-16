// Tabla del catálogo (RF-P1): código, descripción, categoría, precio y existencia, con marca de bajo mínimo.
import { Eye, Pencil } from "lucide-react";
import Link from "next/link";
import { Fila, Pila, Texto } from "@/components/base/primitivas";
import { EstadoVacio } from "@/components/comunes/Estados";
import { InsigniaActivo } from "@/components/comunes/InsigniaEstado";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearMoneda } from "@/lib/format";
import type { ProductoPublico } from "@/services/productos.service";
import { InsigniaBajoMinimo } from "./InsigniasProducto";

export function TablaProductos({
  productos,
  esAdmin,
  mostrarEstado,
  hayFiltros,
}: {
  productos: ProductoPublico[];
  esAdmin: boolean;
  mostrarEstado: boolean;
  hayFiltros: boolean;
}) {
  if (productos.length === 0) {
    return (
      <EstadoVacio
        titulo={hayFiltros ? "No hay productos que coincidan" : "Todavía no hay productos"}
        descripcion={
          hayFiltros
            ? "Probá con otra búsqueda o cambiá los filtros."
            : esAdmin
              ? "Cargá el primero con “Nuevo producto”."
              : undefined
        }
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead className="hidden md:table-cell">Categoría</TableHead>
          <TableHead className="text-right">Precio</TableHead>
          <TableHead className="text-right">Existencia</TableHead>
          {mostrarEstado && <TableHead className="hidden sm:table-cell">Estado</TableHead>}
          {/* En el teléfono no entra: el código y la descripción ya llevan a la ficha, y desde ahí se edita. */}
          <TableHead className="hidden text-right sm:table-cell">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {productos.map((producto) => (
          <TableRow key={producto.id}>
            <TableCell className="max-w-72 whitespace-normal">
              <Pila espacio={0}>
                <Link href={`/productos/${producto.id}`} className="font-mono text-xs text-muted-foreground hover:underline">
                  {producto.codigo}
                </Link>
                <Link href={`/productos/${producto.id}`} className="font-medium hover:underline">
                  {producto.descripcion}
                </Link>
                <Texto variante="chico" className="md:hidden">
                  {producto.categoria.nombre}
                </Texto>
              </Pila>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{producto.categoria.nombre}</TableCell>
            <TableCell className="text-right tabular-nums">{formatearMoneda(producto.precio)}</TableCell>
            <TableCell className="text-right">
              <Pila espacio={1} className="items-end">
                <Texto variante="fuerte" className="tabular-nums">
                  {producto.existencia}
                </Texto>
                {producto.bajoMinimo && <InsigniaBajoMinimo />}
              </Pila>
            </TableCell>
            {mostrarEstado && (
              <TableCell className="hidden sm:table-cell">
                <InsigniaActivo activo={producto.activo} />
              </TableCell>
            )}
            <TableCell className="hidden sm:table-cell">
              <Fila espacio={0} justificar="fin">
                <Button variant="ghost" size="icon" className="size-8" asChild>
                  <Link href={`/productos/${producto.id}`} aria-label={`Ver ficha de ${producto.codigo}`}>
                    <Eye />
                  </Link>
                </Button>
                {esAdmin && (
                  <Button variant="ghost" size="icon" className="size-8" asChild>
                    <Link href={`/productos/${producto.id}/editar`} aria-label={`Editar ${producto.codigo}`}>
                      <Pencil />
                    </Link>
                  </Button>
                )}
              </Fila>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
