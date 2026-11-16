// Tabla productos (enunciado, sección 7): código único, descripción, precio, existencia, stock mínimo y activo.
// Pertenece a una categoría.
import { sql } from "drizzle-orm";
import { check, index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { categorias } from "./categorias";

export const productos = sqliteTable(
  "productos",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    codigo: text("codigo").notNull(),
    descripcion: text("descripcion").notNull(),
    categoriaId: integer("categoria_id")
      .notNull()
      .references(() => categorias.id),
    // Precio de venta final en centavos (regla 10).
    precio: integer("precio").notNull(),
    // Campo calculado: solo lo cambia moverStock() y siempre coincide con la suma de movimientos (regla 2).
    existencia: integer("existencia").notNull().default(0),
    stockMinimo: integer("stock_minimo").notNull().default(0),
    // Baja lógica (RF-P3, regla 12): conserva su historial.
    activo: integer("activo", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    // Código único sin distinguir mayúsculas (RF-P2).
    uniqueIndex("productos_codigo_unico").on(sql`lower(${tabla.codigo})`),
    index("productos_categoria_idx").on(tabla.categoriaId),
    check("productos_precio_positivo", sql`${tabla.precio} > 0`),
    // Regla 1: la existencia nunca es negativa (última barrera, además de moverStock()).
    check("productos_existencia_no_negativa", sql`${tabla.existencia} >= 0`),
    check("productos_stock_minimo_no_negativo", sql`${tabla.stockMinimo} >= 0`),
  ],
);

export type ProductoFila = typeof productos.$inferSelect;
export type ProductoNuevo = typeof productos.$inferInsert;
