"use client";

// Renglones de la Nueva venta (RF-V3): descripción, cantidad, precio unitario y subtotal, que se pueden
// modificar o quitar. La cantidad no puede superar la existencia disponible (RF-V4).
// Los precios son solo para mostrar: el servidor los vuelve a leer del catálogo al confirmar.
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatearMoneda } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductoVenta } from "./BuscadorProductos";

export type ItemVenta = ProductoVenta & { cantidad: number };

export function TablaItems({
  items,
  onCambiarCantidad,
  onQuitar,
}: {
  items: ItemVenta[];
  onCambiarCantidad: (productoId: number, cantidad: number) => void;
  onQuitar: (productoId: number) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Buscá un producto y presioná Enter para agregarlo a la venta.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descripción</TableHead>
          <TableHead className="text-center">Cantidad</TableHead>
          <TableHead className="hidden text-right sm:table-cell">Precio unit.</TableHead>
          <TableHead className="text-right">Subtotal</TableHead>
          <TableHead className="w-10">
            <span className="sr-only">Quitar</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const excede = item.cantidad > item.existencia;
          return (
            <TableRow key={item.id}>
              <TableCell className="whitespace-normal">
                <p>{item.descripcion}</p>
                <p className={cn("text-xs", excede ? "text-destructive" : "text-muted-foreground")}>
                  <span className="font-mono">{item.codigo}</span> · Disponible: {item.existencia}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={`Restar uno de ${item.descripcion}`}
                    disabled={item.cantidad <= 1}
                    onClick={() => onCambiarCantidad(item.id, item.cantidad - 1)}
                  >
                    <Minus />
                  </Button>
                  <Input
                    aria-label={`Cantidad de ${item.descripcion}`}
                    aria-invalid={excede || undefined}
                    inputMode="numeric"
                    className="h-8 w-14 text-center"
                    value={item.cantidad}
                    onChange={(e) => {
                      const valor = Number(e.target.value.replace(/\D/g, ""));
                      // RF-V4: nunca más que la existencia disponible.
                      onCambiarCantidad(item.id, Math.min(Math.max(valor, 1), item.existencia));
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={`Sumar uno de ${item.descripcion}`}
                    disabled={item.cantidad >= item.existencia}
                    onClick={() => onCambiarCantidad(item.id, item.cantidad + 1)}
                  >
                    <Plus />
                  </Button>
                </div>
              </TableCell>
              <TableCell className="hidden text-right tabular-nums sm:table-cell">{formatearMoneda(item.precio)}</TableCell>
              <TableCell className="text-right tabular-nums">{formatearMoneda(item.precio * item.cantidad)}</TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive"
                  aria-label={`Quitar ${item.descripcion}`}
                  onClick={() => onQuitar(item.id)}
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
