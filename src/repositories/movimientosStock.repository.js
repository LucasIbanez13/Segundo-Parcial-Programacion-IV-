// Consultas a la tabla movimientos_stock y actualizaciones atómicas de productos.stock_actual.
// Sin reglas de negocio. Todas aceptan `ejecutor`: se pasa `tx` para participar de una transacción.
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { detallesVenta, movimientosStock, productos } from "@/db/schema";

export async function listarMovimientos({ productoId } = {}, ejecutor = db) {
  return ejecutor
    .select({
      id: movimientosStock.id,
      fecha: movimientosStock.fecha,
      productoId: movimientosStock.productoId,
      productoNombre: productos.nombre,
      detalleVentaId: movimientosStock.detalleVentaId,
      tipo: movimientosStock.tipo,
      cantidad: movimientosStock.cantidad,
      motivo: movimientosStock.motivo,
      origen: movimientosStock.origen,
      // No se guarda en el movimiento: se obtiene a través del detalle (null si no es de una venta).
      ventaId: detallesVenta.ventaId,
      usuarioId: movimientosStock.usuarioId,
    })
    .from(movimientosStock)
    .innerJoin(productos, eq(movimientosStock.productoId, productos.id))
    .leftJoin(detallesVenta, eq(movimientosStock.detalleVentaId, detallesVenta.id))
    .where(productoId === undefined ? undefined : eq(movimientosStock.productoId, productoId))
    .orderBy(desc(movimientosStock.fecha), desc(movimientosStock.id));
}

export async function crearMovimiento(datos, ejecutor = db) {
  const [movimiento] = await ejecutor.insert(movimientosStock).values(datos).returning();
  return movimiento;
}

// Devuelve el producto actualizado, o null si no existe.
export async function sumarStock(productoId, cantidad, ejecutor = db) {
  const [producto] = await ejecutor
    .update(productos)
    .set({ stockActual: sql`${productos.stockActual} + ${cantidad}` })
    .where(eq(productos.id, productoId))
    .returning();
  return producto ?? null;
}

// Descuento atómico: la condición se evalúa dentro del UPDATE, que toma el bloqueo de la fila.
// Dos operaciones simultáneas no pueden dejar el stock negativo, porque la segunda espera
// a la primera y vuelve a evaluar la condición con el valor ya actualizado.
// Devuelve el producto actualizado, o null si no existe o no alcanza el stock.
export async function descontarStock(productoId, cantidad, ejecutor = db) {
  const [producto] = await ejecutor
    .update(productos)
    .set({ stockActual: sql`${productos.stockActual} - ${cantidad}` })
    .where(and(eq(productos.id, productoId), gte(productos.stockActual, cantidad)))
    .returning();
  return producto ?? null;
}
