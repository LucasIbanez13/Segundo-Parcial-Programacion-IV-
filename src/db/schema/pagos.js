// Tabla pagos de cuenta corriente. Ver docs/03-base-de-datos.md
import { sql } from "drizzle-orm";
import { check, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { clientes } from "./clientes.js";
import { usuarios } from "./usuarios.js";

export const pagos = pgTable(
  "pagos",
  {
    id: serial("id").primaryKey(),
    clienteId: integer("cliente_id")
      .notNull()
      .references(() => clientes.id),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    // Que no sea futura lo valida el service: depende del momento de la carga.
    fecha: timestamp("fecha", { withTimezone: true }).notNull(),
    importeCentavos: integer("importe_centavos").notNull(),
    observacion: text("observacion"),
  },
  (tabla) => [check("pagos_importe_positivo", sql`${tabla.importeCentavos} > 0`)],
);
