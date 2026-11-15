// Tabla usuarios (enunciado, sección 7): email único, nombre, hash de contraseña, rol y activo.
import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { ROLES } from "@/lib/constants";

export const usuarios = sqliteTable(
  "usuarios",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    // Se guarda normalizado (sin espacios y en minúsculas): así el UNIQUE no distingue mayúsculas.
    email: text("email").notNull().unique("usuarios_email_unico"),
    nombre: text("nombre").notNull(),
    // Hash bcrypt. Nunca sale de la capa de servicios.
    passwordHash: text("password_hash").notNull(),
    rol: text("rol", { enum: ROLES }).notNull().default("vendedor"),
    activo: integer("activo", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    check("usuarios_rol_valido", sql`${tabla.rol} IN ('admin', 'vendedor')`),
    check("usuarios_email_normalizado", sql`${tabla.email} = lower(trim(${tabla.email}))`),
  ],
);

export type UsuarioFila = typeof usuarios.$inferSelect;
export type UsuarioNuevo = typeof usuarios.$inferInsert;
