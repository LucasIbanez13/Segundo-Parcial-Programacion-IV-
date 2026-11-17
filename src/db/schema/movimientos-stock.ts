// Tabla movimientos_stock (enunciado, sección 7): tipo, cantidad con signo, existencia resultante, motivo y fecha.
// Producto, usuario y factura opcional. Regla 2: todo cambio de stock deja un movimiento.
import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { TIPOS_MOVIMIENTO_STOCK } from "@/lib/constants";
import { facturas } from "./facturas";
import { productos } from "./productos";
import { usuarios } from "./usuarios";

export const movimientosStock = sqliteTable(
  "movimientos_stock",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    productoId: integer("producto_id")
      .notNull()
      .references(() => productos.id),
    // Trazabilidad (regla 11): quién hizo el movimiento.
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    // Factura de origen en ventas y anulaciones; null en ingresos y egresos manuales.
    facturaId: integer("factura_id").references(() => facturas.id),
    tipo: text("tipo", { enum: TIPOS_MOVIMIENTO_STOCK }).notNull(),
    // Con signo: negativa en ventas y egresos, positiva en ingresos y anulaciones.
    cantidad: integer("cantidad").notNull(),
    existenciaResultante: integer("existencia_resultante").notNull(),
    motivo: text("motivo").notNull(),
    observacion: text("observacion"),
    fecha: integer("fecha", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    // Historial de un producto del más nuevo al más viejo (RF-P6).
    index("movimientos_stock_producto_fecha_idx").on(tabla.productoId, tabla.fecha),
    index("movimientos_stock_fecha_idx").on(tabla.fecha),
    check("movimientos_stock_tipo_valido", sql`${tabla.tipo} IN ('venta', 'anulacion', 'ingreso', 'egreso')`),
    check("movimientos_stock_cantidad_distinta_de_cero", sql`${tabla.cantidad} <> 0`),
    // El signo tiene que corresponder al tipo: así la suma de movimientos da siempre la existencia.
    check(
      "movimientos_stock_signo_segun_tipo",
      sql`(${tabla.tipo} IN ('venta', 'egreso') AND ${tabla.cantidad} < 0) OR (${tabla.tipo} IN ('ingreso', 'anulacion') AND ${tabla.cantidad} > 0)`,
    ),
    check("movimientos_stock_existencia_no_negativa", sql`${tabla.existenciaResultante} >= 0`),
  ],
);

export type MovimientoStockFila = typeof movimientosStock.$inferSelect;
export type MovimientoStockNuevo = typeof movimientosStock.$inferInsert;
