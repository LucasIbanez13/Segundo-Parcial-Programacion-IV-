// Tabla numeradores: último número asignado de cada serie (regla 4: numeración correlativa y sin huecos).
// Una fila por serie, por ejemplo "factura-0001" o "recibo". La usan ventas y pagos: el número se toma
// incrementando ultimo_numero dentro de la misma transacción que graba el comprobante.
import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const numeradores = sqliteTable(
  "numeradores",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    clave: text("clave").notNull().unique("numeradores_clave_unica"),
    ultimoNumero: integer("ultimo_numero").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [check("numeradores_ultimo_numero_no_negativo", sql`${tabla.ultimoNumero} >= 0`)],
);

export type NumeradorFila = typeof numeradores.$inferSelect;
