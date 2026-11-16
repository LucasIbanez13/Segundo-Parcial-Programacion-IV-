"use client";

// Acciones del administrador en la ficha: editar, ingreso/egreso de stock y baja lógica (RF-P2 a RF-P5).
// La baja pide confirmación (sección 8). productos.service y stock.service vuelven a verificar el rol.
import { Pencil, Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { editarProductoAccion } from "@/app/(app)/productos/acciones";
import { ConfirmarAccion } from "@/components/comunes/ConfirmarAccion";
import { Button } from "@/components/ui/button";
import type { ProductoPublico } from "@/services/productos.service";
import { DialogoMovimiento } from "./DialogoMovimiento";

export function AccionesProducto({ producto }: { producto: ProductoPublico }) {
  async function cambiarEstado() {
    const resultado = await editarProductoAccion(producto.id, { activo: !producto.activo });
    if (!resultado.ok) {
      // Por ejemplo, al reactivar un producto cuya categoría está inactiva: se muestra el motivo del campo.
      const detalle = Array.isArray(resultado.error.details)
        ? (resultado.error.details[0] as { mensaje?: string } | undefined)?.mensaje
        : undefined;
      toast.error(detalle ?? resultado.error.message);
      return false;
    }
    toast.success(resultado.data.activo ? "Producto reactivado." : "Producto dado de baja.");
  }

  return (
    <>
      <DialogoMovimiento producto={producto} />
      <Button variant="outline" asChild>
        <Link href={`/productos/${producto.id}/editar`}>
          <Pencil /> Editar
        </Link>
      </Button>
      <ConfirmarAccion
        disparador={
          <Button variant="outline" className={producto.activo ? "text-destructive hover:text-destructive" : undefined}>
            {producto.activo ? <PowerOff /> : <Power />}
            {producto.activo ? "Dar de baja" : "Reactivar"}
          </Button>
        }
        titulo={producto.activo ? `¿Dar de baja ${producto.codigo}?` : `¿Reactivar ${producto.codigo}?`}
        descripcion={
          producto.activo
            ? "Deja de ofrecerse en las ventas, pero conserva su historial de movimientos. Lo podés reactivar cuando quieras."
            : "Vuelve a ofrecerse en las ventas."
        }
        textoConfirmar={producto.activo ? "Dar de baja" : "Reactivar"}
        peligrosa={producto.activo}
        onConfirmar={cambiarEstado}
      />
    </>
  );
}
