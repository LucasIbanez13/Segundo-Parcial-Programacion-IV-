// Tabla detalles_venta (renglones del comprobante). Ver docs/03-base-de-datos.md
import { sql } from "drizzle-orm";
import { check, integer, pgTable, serial, text, unique } from "drizzle-orm/pg-core";
import { productos } from "./productos.js";
import { ventas } from "./ventas.js";

export const detallesVenta = pgTable(
  "detalles_venta",
  {
    id: serial("id").primaryKey(),
    ventaId: integer("venta_id")
      .notNull()
      .references(() => ventas.id),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
    // Copias históricas: el comprobante no cambia si después se edita el producto.
    descripcion: text("descripcion").notNull(),
    cantidad: integer("cantidad").notNull(),
    precioUnitarioCentavos: integer("precio_unitario_centavos").notNull(),
    subtotalCentavos: integer("subtotal_centavos").notNull(),
  },
  (tabla) => [
    // Los productos repetidos se agrupan: un solo renglón por producto en cada venta.
    unique("detalles_venta_venta_producto_unico").on(tabla.ventaId, tabla.productoId),
    check("detalles_venta_cantidad_positiva", sql`${tabla.cantidad} > 0`),
    check("detalles_venta_precio_positivo", sql`${tabla.precioUnitarioCentavos} > 0`),
    check(
      "detalles_venta_subtotal_correcto",
      sql`${tabla.subtotalCentavos} = ${tabla.cantidad} * ${tabla.precioUnitarioCentavos}`,
    ),
  ],
);
