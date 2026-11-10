// Consultas a las tablas ventas y detalles_venta. Sin reglas de negocio.
// Todas aceptan `ejecutor`: se pasa `tx` para participar de una transacción.
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { detallesVenta, productos, ventas } from "@/db/schema";

const columnasListado = {
  id: ventas.id,
  numero: ventas.numero,
  clienteId: ventas.clienteId,
  fecha: ventas.fecha,
  clienteNombre: ventas.clienteNombre,
  formaPago: ventas.formaPago,
  totalCentavos: ventas.totalCentavos,
};

export async function listarVentas(ejecutor = db) {
  return ejecutor.select(columnasListado).from(ventas).orderBy(desc(ventas.fecha), desc(ventas.id));
}

export async function obtenerVentaPorId(id, ejecutor = db) {
  const [venta] = await ejecutor.select().from(ventas).where(eq(ventas.id, id));
  return venta ?? null;
}

export async function listarDetallesDeVenta(ventaId, ejecutor = db) {
  return ejecutor
    .select({
      productoId: detallesVenta.productoId,
      descripcion: detallesVenta.descripcion,
      cantidad: detallesVenta.cantidad,
      precioUnitarioCentavos: detallesVenta.precioUnitarioCentavos,
      subtotalCentavos: detallesVenta.subtotalCentavos,
    })
    .from(detallesVenta)
    .where(eq(detallesVenta.ventaId, ventaId))
    .orderBy(asc(detallesVenta.id));
}

// Lee los productos de la venta con SELECT ... FOR UPDATE: precio, nombre y estado no pueden
// cambiar hasta que termine la transacción. Se bloquean ordenados por id para evitar deadlocks.
export async function bloquearProductos(ids, tx) {
  return tx
    .select({
      id: productos.id,
      nombre: productos.nombre,
      precioVentaCentavos: productos.precioVentaCentavos,
      stockActual: productos.stockActual,
      activo: productos.activo,
    })
    .from(productos)
    .where(inArray(productos.id, ids))
    .orderBy(asc(productos.id))
    .for("update");
}

// El número de comprobante lo asigna la base (identity), nunca se calcula acá.
export async function crearVenta(datos, ejecutor = db) {
  const [venta] = await ejecutor.insert(ventas).values(datos).returning();
  return venta;
}

export async function crearDetalles(detalles, ejecutor = db) {
  return ejecutor.insert(detallesVenta).values(detalles).returning();
}
