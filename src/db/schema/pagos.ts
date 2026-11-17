// Tabla pagos (enunciado, sección 7; RF-C5): cada pago es un recibo numerado.
import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { MEDIOS_PAGO } from "@/lib/constants";
import { clientes } from "./clientes";
import { usuarios } from "./usuarios";

export const pagos = sqliteTable(
  "pagos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // Recibo "R 0001-00000001": punto de venta y número correlativo sin huecos (regla 4).
    puntoVenta: integer("punto_venta").notNull(),
    numero: integer("numero").notNull(),
    fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
    // Centavos (regla 10).
    importe: integer("importe").notNull(),
    medio: text("medio", { enum: MEDIOS_PAGO }).notNull(),
    observacion: text("observacion"),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id),
    // Quién cobró (regla 11).
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    unique("pagos_recibo_unico").on(tabla.puntoVenta, tabla.numero),
    check("pagos_importe_positivo", sql`${tabla.importe} > 0`),
    check("pagos_medio_valido", sql`${tabla.medio} IN ('efectivo', 'transferencia', 'tarjeta_debito')`),
  ],
);

export type PagoFila = typeof pagos.$inferSelect;
export type PagoNuevo = typeof pagos.$inferInsert;
