"use server";

// Server Actions del módulo Productos (sección 10.3). Llaman a los mismos servicios que la API REST:
// la verificación de rol y las reglas viven en los servicios, no acá.
import { revalidatePath } from "next/cache";
import { accion } from "@/lib/http/accion";
import { crearCategoria, editarCategoria } from "@/services/categorias.service";
import { crearProducto, editarProducto } from "@/services/productos.service";
import { registrarMovimientoManual } from "@/services/stock.service";

// Todo el módulo cuelga de /productos: se revalida el layout completo (catálogo, fichas, categorías, movimientos).
function refrescar() {
  revalidatePath("/productos", "layout");
}

export const crearProductoAccion = accion(async (usuario, datos: unknown) => {
  const nuevo = await crearProducto(usuario, datos);
  refrescar();
  return nuevo;
});

export const editarProductoAccion = accion(async (usuario, id: number, datos: unknown) => {
  const editado = await editarProducto(usuario, id, datos);
  refrescar();
  return editado;
});

export const registrarMovimientoAccion = accion(async (usuario, productoId: number, datos: unknown) => {
  const movimiento = await registrarMovimientoManual(usuario, productoId, datos);
  refrescar();
  return movimiento;
});

export const crearCategoriaAccion = accion(async (usuario, datos: unknown) => {
  const nueva = await crearCategoria(usuario, datos);
  refrescar();
  return nueva;
});

export const editarCategoriaAccion = accion(async (usuario, id: number, datos: unknown) => {
  const editada = await editarCategoria(usuario, id, datos);
  refrescar();
  return editada;
});
