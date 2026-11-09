// Tabla usuarios. Ver docs/03-base-de-datos.md
import { sql } from "drizzle-orm";
import { boolean, check, pgTable, serial, text } from "drizzle-orm/pg-core";

export const usuarios = pgTable(
  "usuarios",
  {
    id: serial("id").primaryKey(),
    nombre: text("nombre").notNull(),
    acceso: text("acceso").notNull().unique("usuarios_acceso_unico"),
    // Hash bcrypt. Nunca se devuelve en la API.
    claveHash: text("clave_hash").notNull(),
    activo: boolean("activo").notNull().default(true),
    administrador: boolean("administrador").notNull().default(false),
  },
  (tabla) => [
    // El acceso se guarda normalizado: sin espacios en los extremos y en minúsculas.
    check("usuarios_acceso_normalizado", sql`${tabla.acceso} = lower(btrim(${tabla.acceso}))`),
  ],
);
