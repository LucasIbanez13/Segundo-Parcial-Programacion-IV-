// Tabla sesiones (infraestructura de autenticación). Ver docs/03-base-de-datos.md
// Cerrar sesión = borrar la fila. Desactivar un usuario = borrar sus sesiones.
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usuarios } from "./usuarios.js";

export const sesiones = pgTable("sesiones", {
  // Token aleatorio generado por el servidor.
  id: text("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id),
  expiraEn: timestamp("expira_en", { withTimezone: true }).notNull(),
  creadaEn: timestamp("creada_en", { withTimezone: true }).notNull().defaultNow(),
});
