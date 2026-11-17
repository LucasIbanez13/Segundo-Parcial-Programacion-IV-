// Tabla clientes (enunciado, sección 7; RF-C2). El saldo NO se guarda: sale de movimientos_cuenta (regla 7).
import { sql } from "drizzle-orm";
import { check, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { TIPOS_DOC } from "@/lib/constants";

export const clientes = sqliteTable(
  "clientes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tipoDoc: text("tipo_doc", { enum: TIPOS_DOC }).notNull(),
    // Como se muestra: "28.456.123" o "20-28456123-4".
    nroDoc: text("nro_doc").notNull(),
    // Solo los dígitos. El UNIQUE va acá: "28.456.123" y "28456123" son el mismo documento.
    nroDocNormalizado: text("nro_doc_normalizado").notNull().unique("clientes_nro_doc_unico"),
    nombre: text("nombre").notNull(),
    // Nombre sin acentos, en minúsculas y sin espacios, puntos ni guiones: para buscar con LIKE (RF-C1).
    // SQLite no tiene una función para ignorar acentos, por eso se guarda ya normalizado.
    nombreBusqueda: text("nombre_busqueda").notNull(),
    domicilio: text("domicilio"),
    telefono: text("telefono"),
    email: text("email"),
    cuentaCorriente: integer("cuenta_corriente", { mode: "boolean" }).notNull().default(false),
    // Centavos. null = sin límite.
    limiteCredito: integer("limite_credito"),
    activo: integer("activo", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (tabla) => [
    check("clientes_tipo_doc_valido", sql`${tabla.tipoDoc} IN ('DNI', 'CUIT')`),
    check("clientes_limite_positivo", sql`${tabla.limiteCredito} IS NULL OR ${tabla.limiteCredito} > 0`),
  ],
);

export type ClienteFila = typeof clientes.$inferSelect;
export type ClienteNuevo = typeof clientes.$inferInsert;
