// Tabla categorias (enunciado, sección 7): nombre único y activa. RF-P7.
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const categorias = sqliteTable(
  "categorias",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nombre: text("nombre").notNull(),
    // Baja lógica (RF-P7): una categoría inactiva no se ofrece para productos nuevos.
    activa: integer("activa", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    // Único sin distinguir mayúsculas: "Herramientas" y "HERRAMIENTAS" son la misma categoría.
    uniqueIndex("categorias_nombre_unico").on(sql`lower(${tabla.nombre})`),
  ],
);

export type CategoriaFila = typeof categorias.$inferSelect;
export type CategoriaNueva = typeof categorias.$inferInsert;
