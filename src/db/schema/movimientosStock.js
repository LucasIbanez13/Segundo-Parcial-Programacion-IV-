// Tabla movimientos_stock. Ver docs/03-base-de-datos.md
import { sql } from "drizzle-orm";
import { check, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { detallesVenta } from "./detallesVenta.js";
import { productos } from "./productos.js";
import { usuarios } from "./usuarios.js";

export const movimientosStock = pgTable(
  "movimientos_stock",
  {
    id: serial("id").primaryKey(),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    // Solo en origen VENTA. Cada detalle genera como máximo una salida.
    detalleVentaId: integer("detalle_venta_id")
      .unique("movimientos_stock_detalle_venta_unico")
      .references(() => detallesVenta.id),
    fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
    tipo: text("tipo").notNull(),
    cantidad: integer("cantidad").notNull(),
    motivo: text("motivo").notNull(),
    origen: text("origen").notNull(),
  },
  (tabla) => [
    check("movimientos_stock_tipo_valido", sql`${tabla.tipo} IN ('ENTRADA', 'SALIDA')`),
    check("movimientos_stock_origen_valido", sql`${tabla.origen} IN ('INICIAL', 'MANUAL', 'VENTA')`),
    check("movimientos_stock_cantidad_positiva", sql`${tabla.cantidad} > 0`),
    // INICIAL: siempre entrada y sin detalle.
    check(
      "movimientos_stock_regla_inicial",
      sql`${tabla.origen} <> 'INICIAL' OR (${tabla.tipo} = 'ENTRADA' AND ${tabla.detalleVentaId} IS NULL)`,
    ),
    // MANUAL: sin detalle.
    check("movimientos_stock_regla_manual", sql`${tabla.origen} <> 'MANUAL' OR ${tabla.detalleVentaId} IS NULL`),
    // VENTA: siempre salida y con detalle.
    check(
      "movimientos_stock_regla_venta",
      sql`${tabla.origen} <> 'VENTA' OR (${tabla.tipo} = 'SALIDA' AND ${tabla.detalleVentaId} IS NOT NULL)`,
    ),
  ],
);
