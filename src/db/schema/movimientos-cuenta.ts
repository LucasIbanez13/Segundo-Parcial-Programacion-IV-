// Tabla movimientos_cuenta (enunciado, sección 7; RF-C4). Única fuente del saldo del cliente:
// saldo = Σ débitos − Σ créditos (regla 7). Débitos: ventas a cuenta. Créditos: pagos y anulaciones.
import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { TIPOS_MOVIMIENTO_CUENTA } from "@/lib/constants";
import { clientes } from "./clientes";
import { facturas } from "./facturas";
import { pagos } from "./pagos";

export const movimientosCuenta = sqliteTable(
  "movimientos_cuenta",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tipo: text("tipo", { enum: TIPOS_MOVIMIENTO_CUENTA }).notNull(),
    // Siempre positivo: `tipo` indica si suma o resta (centavos, regla 10).
    importe: integer("importe").notNull(),
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    // "Factura 0001-00001223" o "Recibo R 0001-00000340".
    descripcion: text("descripcion").notNull(),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id),
    // Factura de origen (venta o anulación).
    facturaId: integer("factura_id").references(() => facturas.id),
    // Pago de origen.
    pagoId: integer("pago_id").references(() => pagos.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    check("movimientos_cuenta_tipo_valido", sql`${tabla.tipo} IN ('debito', 'credito')`),
    check("movimientos_cuenta_importe_positivo", sql`${tabla.importe} > 0`),
    index("movimientos_cuenta_cliente_fecha").on(tabla.clienteId, tabla.fecha),
  ],
);

export type MovimientoCuentaFila = typeof movimientosCuenta.$inferSelect;
export type MovimientoCuentaNuevo = typeof movimientosCuenta.$inferInsert;
