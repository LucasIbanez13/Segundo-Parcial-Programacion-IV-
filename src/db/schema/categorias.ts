// Tabla categorias (enunciado, sección 7): nombre único y activa. RF-P7.
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const categorias = sqliteTable(
  "categorias",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    nombre: text("nombre").notNull(),
    // Nombre en minúsculas, calculado en TypeScript por el repository. El lower() de SQLite solo convierte
    // letras sin acento: con él, "PINTURERÍA" y "Pinturería" serían distintas.
    nombreNormalizado: text("nombre_normalizado").notNull(),
    // Baja lógica (RF-P7): una categoría inactiva no se ofrece para productos nuevos.
    activa: integer("activa", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    // Único sin distinguir mayúsculas, también en letras con acento: "Pinturería" = "PINTURERÍA".
    uniqueIndex("categorias_nombre_unico").on(tabla.nombreNormalizado),
  ],
);

export type CategoriaFila = typeof categorias.$inferSelect;
export type CategoriaNueva = typeof categorias.$inferInsert;
