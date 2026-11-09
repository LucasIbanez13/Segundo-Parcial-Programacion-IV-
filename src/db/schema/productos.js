// Tabla productos. Ver docs/03-base-de-datos.md
import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, serial, text, uniqueIndex } from "drizzle-orm/pg-core";

export const productos = pgTable(
  "productos",
  {
    id: serial("id").primaryKey(),
    codigo: text("codigo").notNull(),
    nombre: text("nombre").notNull(),
    precioVentaCentavos: integer("precio_venta_centavos").notNull(),
    // Solo cambia junto con un movimiento de stock, nunca editando el producto.
    stockActual: integer("stock_actual").notNull().default(0),
    activo: boolean("activo").notNull().default(true),
  },
  (tabla) => [
    // El código es único sin distinguir mayúsculas: "caf-001" y "CAF-001" son el mismo.
    uniqueIndex("productos_codigo_lower_unico").on(sql`lower(${tabla.codigo})`),
    check("productos_precio_positivo", sql`${tabla.precioVentaCentavos} > 0`),
    // Última barrera para que el stock nunca quede negativo.
    check("productos_stock_no_negativo", sql`${tabla.stockActual} >= 0`),
  ],
);
