// Tabla ventas (comprobantes). Ver docs/03-base-de-datos.md
// La deuda en cuenta corriente es la propia venta: no existe una tabla de deudas.
import { sql } from "drizzle-orm";
import { check, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { clientes } from "./clientes.js";
import { usuarios } from "./usuarios.js";

export const ventas = pgTable(
  "ventas",
  {
    id: serial("id").primaryKey(),
    // Número de comprobante generado por la base (identity): único aun con ventas simultáneas.
    numero: integer("numero").notNull().unique("ventas_numero_unico").generatedAlwaysAsIdentity(),
    fecha: timestamp("fecha", { withTimezone: true }).notNull().defaultNow(),
    // null = consumidor final.
    clienteId: integer("cliente_id").references(() => clientes.id),
    usuarioId: integer("usuario_id")
      .notNull()
      .references(() => usuarios.id),
    // Copias históricas: el comprobante no cambia si después se edita el cliente.
    clienteNombre: text("cliente_nombre").notNull(),
    clienteDocumento: text("cliente_documento"),
    formaPago: text("forma_pago").notNull(),
    totalCentavos: integer("total_centavos").notNull(),
  },
  (tabla) => [
    check("ventas_forma_pago_valida", sql`${tabla.formaPago} IN ('CONTADO', 'TARJETA', 'CUENTA_CORRIENTE')`),
    // Una venta en cuenta corriente exige un cliente registrado.
    check(
      "ventas_cuenta_corriente_con_cliente",
      sql`${tabla.formaPago} <> 'CUENTA_CORRIENTE' OR ${tabla.clienteId} IS NOT NULL`,
    ),
    check("ventas_total_positivo", sql`${tabla.totalCentavos} > 0`),
  ],
);
