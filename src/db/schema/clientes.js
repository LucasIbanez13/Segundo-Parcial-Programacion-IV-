// Tabla clientes. Ver docs/03-base-de-datos.md
// No tiene columna de saldo: se calcula a partir de ventas en cuenta corriente y pagos.
import { sql } from "drizzle-orm";
import { check, pgTable, serial, text } from "drizzle-orm/pg-core";

export const clientes = pgTable(
  "clientes",
  {
    id: serial("id").primaryKey(),
    // Nombre y apellido o razón social.
    nombre: text("nombre").notNull(),
    documento: text("documento").notNull(),
    telefono: text("telefono"),
    correo: text("correo"),
  },
  (tabla) => [
    // Todo cliente debe tener al menos un dato de contacto.
    check("clientes_al_menos_un_contacto", sql`${tabla.telefono} IS NOT NULL OR ${tabla.correo} IS NOT NULL`),
  ],
);
